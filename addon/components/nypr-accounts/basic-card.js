import Component from 'ember-component';
import { bool } from 'ember-computed';
import layout from '../../templates/components/nypr-accounts/basic-card';
import RSVP from 'rsvp';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import makeValidations from 'nypr-account-settings/validations/nypr-accounts/basic-card';
import getOwner from 'ember-owner/get';
import observer from 'ember-metal/observer';
import { debounce } from 'ember-runloop';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import computed from 'ember-computed';

export default Component.extend({
  layout,
  tagName: '',
  isShowingModal: bool('resolveModal'),
  user: {},
  verifyEmail: computed('user.email', 'changeset.email', function() {
    return get(this, 'changeset.email') !== get(this, 'user.email');
  }),

  // until ember-changeset can handle debounce validations
  // https://github.com/DockYard/ember-changeset/issues/102
  // observe updates and debounce updating the changeset
  // so that validations are run less frequently
  // otherwise we get very unpleasant UI hiccups
  usernameObserver: observer('preferredUsername', function() {
    let newName = get(this, 'preferredUsername');
    debounce(this, prefName => set(this, 'changeset.preferredUsername', prefName), newName, 150);
  }),

  init() {
    this._super(...arguments);
    let config = getOwner(this).resolveRegistration('config:environment');
    let validations = makeValidations({usernamePath: config.wnycAuthAPI});

    let user = get(this, 'user');
    let changeset = new Changeset(user, lookupValidator(validations), validations);
    this.changeset = changeset;

    // provide a temporary binding for preferred username on the template
    // so we can do remote async validations before setting to the
    // changeset
    this.preferredUsername = get(user, 'preferredUsername');
  },

  onEmailChange() {
    if (this.changeset.get('email')) {
      this.changeset.validate('confirmEmail');
    }
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
  
  closeModal() {
    this.setProperties({
      resolveModal: null,
      rejectModal: null,
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

  commit(changeset) {
    set(this, 'isLoading', true);
    let notifyEmail = get(changeset, 'change.email');
    return changeset.save().then(() => {
      set(this, 'isEditing', false);
      if (notifyEmail && this.attrs.emailUpdated) {
        this.attrs.emailUpdated();
      }
    })
    .catch(error => {
      get(this, 'user').rollbackAttributes();
      if (error.isAdapterError) {
        error = error.errors;
      }
      let { code, message, values = [] } = error;
      if (values.includes('preferred_username')) {
        changeset.pushErrors('preferredUsername', error.message);
      } else if (code === 'AccountExists') {
        changeset.pushErrors('email', message);
        changeset.set('confirmEmail', null);
        changeset.set('error.confirmEmail', null);
      }
    })
    .finally(() => {
      set(this, 'isLoading', false);
      this.setProperties({
        password: null,
        passwordError: null,
        'user.confirmEmail': null
      });
    });
  },

  actions: {
    save(changeset) {
      let verifyEmail = get(this, 'verifyEmail');
      let validations = [
        changeset.validate('givenName'),
        changeset.validate('familyName')
      ];
      if (verifyEmail) {
        validations.push(
          changeset.validate('email'),
          changeset.validate('confirmEmail')
        );
      }

      return RSVP.all(validations).then(() => {
        if (get(changeset, 'isValid')) {
          if (verifyEmail) {
            return this.emailRequirement()
              .then(() => {
                this.closeModal();
                return this.commit(changeset);
              })
              .catch(() => this.rollbackEmailField(changeset));
          } else {
            // if we're not doing the verify email flow, just commit the changeset
            return this.commit(changeset);
          }
        }
      });
    },

    rollback(changeset) {
      changeset.rollback();
      // manually reset preferredUsername b/c template binds to this
      // value
      set(this, 'preferredUsername', get(changeset, 'preferredUsername'));
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
    cancelModal() {
      get(this, 'rejectModal')();
      this.closeModal();
      this.set('password', null);
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
