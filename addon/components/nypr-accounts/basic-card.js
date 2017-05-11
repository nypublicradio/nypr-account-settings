import Ember from 'ember';
import Component from 'ember-component';
import layout from '../../templates/components/nypr-accounts/basic-card';
import RSVP from 'rsvp';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import validations from 'nypr-account-settings/validations/nypr-accounts/basic-card';
import messages from 'nypr-account-settings/validations/nypr-accounts/custom-messages';
import getOwner from 'ember-owner/get';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import fetch from 'fetch';
import computed from 'ember-computed';
import { decamelize } from 'ember-string';
import { task, timeout, all, waitForEvent } from 'ember-concurrency';

export default Component.extend({
  layout,
  tagName: '',
  user: {},
  debounceMs: Ember.testing ? 10 : 250,

  init() {
    this._super(...arguments);
    this.config = getOwner(this).resolveRegistration('config:environment');

    let user = get(this, 'user');
    let changeset = new Changeset(user, lookupValidator(validations), validations);
    this.changeset = changeset;
  },

  emailWasChanged: computed('changeset.email', 'user.email', function() {
    return get(this, 'changeset.email') !== get(this, 'user.email');
  }),

  usernameWasChanged: computed('changeset.preferredUsername', 'user.preferredUsername', function() {
    return get(this, 'changeset.preferredUsername') !== get(this, 'user.preferredUsername');
  }),

  onEmailChange() {
    if (get(this, 'emailWasChanged')) {
      this.changeset.validate('confirmEmail');
    } else {
      this.rollbackEmailField();
    }
  },

  onEmailUpdate() {
    let newEmail = this.changeset.get('email');
    if (newEmail && get(this, 'emailWasChanged')) {
      get(this,'checkForExistingEmail').perform(newEmail);
    }
  },

  onUsernameUpdate() {
    let newUsername = this.changeset.get('preferredUsername');
    if (newUsername && get(this, 'usernameWasChanged')) {
      get(this,'checkForExistingUsername').perform(newUsername);
    }
  },

  rollbackEmailField(changeset) {
    // work around to rollback specific fields
    let snapshot = changeset.snapshot();
    changeset.rollback();
    delete snapshot.changes.email;
    delete snapshot.changes.confirmEmail;
    delete snapshot.errors.email;
    delete snapshot.errors.confirmEmail;
    changeset.restore(snapshot);
  },

  checkForExistingAttribute: task(function * ({key, value, errorMessage}) {
    let path = `${this.config.wnycAuthAPI}/v1/user/exists-by-attribute`;
    let serverKey = decamelize(key);
    try {
      let response = yield fetch(`${path}?${serverKey}=${value}`);
      let json = yield response.json();
      if (json[serverKey]) {
        this.changeset.pushErrors(key, errorMessage);
      }
    } catch(e) {
      if (e && get(e, 'errors.message')) {
        this.changeset.pushErrors(key, e.errors.message);
      }
    }
  }),

  checkForExistingEmail: task(function * (value) {
    if (get(this, 'emailWasChanged')) {
      let validator = get(this, 'checkForExistingAttribute');
      yield timeout(this.get('debounceMs'));
      yield validator.perform({
        key: 'email',
        value,
        errorMessage: messages.emailExists
      });
    }
  }).restartable(),

  checkForExistingUsername: task(function * (value) {
    if (get(this, 'usernameWasChanged')) {
      let validator = get(this, 'checkForExistingAttribute');
      yield timeout(this.get('debounceMs'));
      yield validator.perform({
        key: 'preferredUsername',
        value,
        errorMessage: messages.publicHandleExists
      });
    }
  }).restartable(),

  commit: task(function * (changeset) {
    let notifyEmail = get(changeset, 'change.email');
    try {
      // confirm async validations
      yield all([
        get(this, 'checkForExistingUsername').perform(changeset.get('preferredUsername')),
        get(this, 'checkForExistingEmail').perform(changeset.get('email')),
      ]);
      // save
      yield changeset.save();
      set(this, 'isEditing', false);
      if (notifyEmail && this.attrs.emailUpdated) {
        this.attrs.emailUpdated();
      }
    } catch(error) {
      // handle  server errors
      let errorObject;
      if (error.isAdapterError) {
        errorObject = error.errors;
      }
      let { code, message, values = [] } = errorObject || error;
      if (values.includes('preferred_username')) {
        changeset.pushErrors('preferredUsername', message);
      } else if (code === 'AccountExists') {
        get(this, 'user').rollbackAttributes();
        changeset.pushErrors('email', message);
        changeset.set('confirmEmail', null);
        changeset.set('error.confirmEmail', null);
      }
    } finally {
      this.setProperties({
        password: null,
        passwordError: null,
        'user.confirmEmail': null
      });
    }
  }),

  save: task(function * (changeset) {
    let fieldsToValidate;
    let emailWasChanged = get(this, 'emailWasChanged');
    if (emailWasChanged) {
      fieldsToValidate = ['givenName', 'familyName', 'email', 'confirmEmail', 'preferredUsername'];
    } else {
      fieldsToValidate = ['givenName', 'familyName', 'preferredUsername'];
    }
    let validationPromises = fieldsToValidate.map(field => changeset.validate(field));
    yield RSVP.all(validationPromises);

    if (emailWasChanged && get(changeset, 'isValid')) {
      try {
        yield get(this, 'promptForPassword').perform();

        if (get(changeset, 'isValid')) {
          get(this, 'commit').perform(changeset);
        } else {
          // something's wrong
          get(this, 'closeModal')();
        }
      } finally {
        if (get(this, 'promptForPassword.last.isSuccessful') === false) {
          // modal was cancelled;
          this.rollbackEmailField(changeset);
        }
      }
    } else if (get(changeset, 'isValid')) {
      // if we're not doing the validate email flow, just commit the changeset
      get(this, 'commit').perform(changeset);
    }
  }).drop(),

  promptForPassword: task(function * () {
    try {
      yield waitForEvent(this, 'passwordVerified');
    } finally {
      set(this, 'password', null);
    }
  }).drop(),

  verifyPassword: task(function * () {
    let password = get(this, 'password');
    if (!password) {
      set(this, 'passwordError', ["Password can't be blank."]);
    } else {
      try {
        yield this.attrs.authenticate(password);
        this.trigger('passwordVerified');
      } catch({error}) {
        set(this, 'passwordError', [error.message]);
      }
    }
  }),

  actions: {
    rollback(changeset) {
      changeset.rollback();
      set(this, 'isEditing', false);
    },

    closeModal() {
      get(this, 'promptForPassword').cancelAll();
    },

    toggleEdit() {
      if (get(this, 'isEditing')) {
        this.send('rollback', get(this, 'changeset'));
      } else {
        set(this, 'isEditing', true);
      }
    }
  }
});
