import Ember from 'ember';
import Component from 'ember-component';
import { bool } from 'ember-computed';
import layout from '../../templates/components/nypr-accounts/basic-card';
import RSVP from 'rsvp';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import makeValidations from 'nypr-account-settings/validations/nypr-accounts/basic-card';
import validateRemote from 'nypr-account-settings/validators/nypr-accounts/remote';
import messages from 'nypr-account-settings/validations/nypr-accounts/custom-messages';
import getOwner from 'ember-owner/get';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import computed from 'ember-computed';
import { task, timeout, all } from 'ember-concurrency';

export default Component.extend({
  layout,
  tagName: '',
  isShowingModal: bool('resolveModal'),
  user: {},
  emailIsPendingVerification: false,
  emailWasChanged: computed('user.email', 'changeset.email', function() {
    return get(this, 'changeset.email') !== get(this, 'user.email');
  }),

  debounceMs: Ember.testing ? 50 : 250,

  checkForExistingAttribute: task(function * (filterKey, message, value) {
    let validator = validateRemote({
      path: `${this.config.wnycAuthAPI}/v1/user/exists-by-attribute`,
      filterKey,
      message,
    });
    let result = yield validator(filterKey, value);
    return result;
  }),

  asyncChecksBusy: computed.or(
    'checkForExistingEmail.isRunning',
    'checkForExistingUsername.isRunning'),

  checkForExistingEmail: task(function * (value) {
    let validator = get(this, 'checkForExistingAttribute');
    // debounce
    yield timeout(this.get('debounceMs'));
    let result = yield validator.perform('email', messages.emailExists, value);
    if (result === true) {
      return true;
    } else {
      this.changeset.pushErrors('email', result);
    }
  }).restartable(),

  checkForExistingUsername: task(function * (value) {
    let validator = get(this, 'checkForExistingAttribute');
    // debounce
    yield timeout(this.get('debounceMs'));
    let result = yield validator.perform('preferred_username', messages.publicHandleExists, value);
    if (result === true) {
      return true;
    } else {
      this.changeset.pushErrors('preferredUsername', result);
    }
  }).restartable(),

  init() {
    this._super(...arguments);
    this.config = getOwner(this).resolveRegistration('config:environment');
    let validations = makeValidations({validationPath: this.config.wnycAuthAPI});

    let user = get(this, 'user');
    let changeset = new Changeset(user, lookupValidator(validations), validations);
    this.changeset = changeset;
  },

  onEmailChange() {
    if (this.changeset.get('email')) {
      this.changeset.validate('confirmEmail');
    }
  },

  onEmailUpdate() {
    get(this,'checkForExistingEmail').perform(this.changeset.get('email'));
  },

  onUsernameUpdate() {
    get(this,'checkForExistingUsername').perform(this.changeset.get('preferredUsername'));
  },

  emailRequirement() {
    return new RSVP.Promise((resolve, reject) => {
      // resolved by verifyPassword
      // setting resolveModal shows the modal
      this.setProperties({
        resolveModal: resolve,
        rejectModal: reject
      });
    });
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

  commit: task(function * (changeset) {
    let notifyEmail = get(changeset, 'change.email');
    try {
      yield all([
        get(this, 'checkForExistingUsername').perform(changeset.get('preferredUsername')),
        get(this, 'checkForExistingEmail').perform(changeset.get('email')),
      ]);
      yield changeset.save().then(() => {
        set(this, 'isEditing', false);
        if (notifyEmail && this.attrs.emailUpdated) {
          this.attrs.emailUpdated();
        }
      });
    } catch(error) {
      let errorObject;
      if (error.isAdapterError) {
        errorObject = error.errors;
      }
      let { code, message, values = [] } = errorObject;
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
        resolveModal: null,
        rejectModal: null,
        password: null,
        passwordError: null,
        'user.confirmEmail': null
      });
    }
  }),

  actions: {
    save(changeset) {
      let fieldsToValidate;
      let emailWasChanged = get(this, 'emailWasChanged');

      if (emailWasChanged) {
        // defer validating preferredUsername b/c it incurs a UI delay due to
        // waiting on a network call
        fieldsToValidate = ['givenName', 'familyName', 'email', 'confirmEmail'];
      } else {
        // if email hasn't changed, no point verifying it
        // but roll back errors in case confirmEmail is showing an error
        this.rollbackEmailField(changeset);
        fieldsToValidate = ['givenName', 'familyName', 'preferredUsername'];
      }
      let validationPromises = fieldsToValidate.map(field => changeset.validate(field));

      return RSVP.all(validationPromises).then(() => {
        if (emailWasChanged && get(changeset, 'isValid')) {
          return this.emailRequirement()
            .then(() => {
              changeset.validate('preferredUsername').then(() => {
                if (get(changeset, 'isValid')) {
                  return get(this, 'commit').perform(changeset);
                } else {
                  // something's wrong, probably the preferredUsername
                  this.closeModal();
                }
              });
            })
            .catch(() => this.rollbackEmailField(changeset));
        } else if (get(changeset, 'isValid')) {
          // if we're not doing the validate email flow, just commit the changeset
          return get(this, 'commit').perform(changeset);
        }
      });
    },

    rollback(changeset) {
      changeset.rollback();
      set(this, 'isEditing', false);
    },

    verifyPassword() {
      let password = get(this, 'password');
      if (!password) {
        set(this, 'passwordError', ["Password can't be blank."]);
      } else {
        this.attrs.authenticate(password)
          .then(get(this, 'resolveModal'))
          .catch(({error}) => set(this, 'passwordError', [error.message]));
      }
    },
    closeModal() {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      get(this, 'rejectModal')();
      this.setProperties({
        resolveModal: null,
        rejectModal: null,
        password: null
      });
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
