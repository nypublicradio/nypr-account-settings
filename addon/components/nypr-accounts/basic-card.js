import Component from 'ember-component';
import { bool } from 'ember-computed';
import layout from '../../templates/components/nypr-accounts/basic-card';
import RSVP from 'rsvp';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import makeValidations from 'nypr-account-settings/validators/nypr-accounts/basic-card';
import getOwner from 'ember-owner/get';
import get from 'ember-metal/get';
import set from 'ember-metal/set';

export default Component.extend({
  layout,
  tagName: '',
  isShowingModal: bool('resolveModal'),
  user: {},
  
  init() {
    this._super(...arguments);
    let config = getOwner(this).resolveRegistration('config:environment');
    let validations = makeValidations({usernamePath: config.wnycAuthAPI});
    
    let user = get(this, 'user');
    let changeset = new Changeset(user, lookupValidator(validations), validations);
    this.changeset = changeset;
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
    changeset.restore(snapshot);
  },
  
  commit(changeset) {
    let notifyEmail = get(changeset, 'change.email');
    return changeset.save().then(() => {
      set(this, 'isEditing', false);
      if (notifyEmail && this.attrs.emailUpdated) {
        this.attrs.emailUpdated();
      }
    })
    .catch(({ errors }) => {
      if (errors.values === 'preferred_username') {
        changeset.pushErrors('preferredUsername', errors.message);
      }
    });
  },

  actions: {
    save(changeset) {
      let stepOne;
      let verifyEmail = get(changeset, 'change.email');

      if (verifyEmail) {
        // defer validating preferredUsername b/c it incurs a UI delay due to 
        // waiting on a network call
        stepOne = RSVP.all([
          changeset.validate('givenName'),
          changeset.validate('familyName'),
          changeset.validate('email'),
          changeset.validate('confirmEmail'),
        ]);
      } else {
        // if email hasn't changed, no point verifying it
        stepOne = RSVP.all([
          changeset.validate('givenName'),
          changeset.validate('familyName'),
          changeset.validate('preferredUsername'),
        ]);
      }

      return stepOne.then(() => {
        if (verifyEmail && get(changeset, 'isValid')) {
          return this.emailRequirement()
            .then(() => {
              // now that the modal has passed, validate the username
              return changeset.validate('preferredUsername')
                .then(() => {
                  if (get(changeset, 'isValid')) {
                    return this.commit(changeset);
                  } else {
                    // something's wrong, probably the preferredUsername
                    this.closeModal();
                  }
                });
            })
            .catch(() => this.rollbackEmailField(changeset));
        } else if (get(changeset, 'isValid')) {
          // if we're not doing the verify email flow, just commit the changeset
          return this.commit(changeset);
        }
      });
    },
    
    rollback(changeset) {
      changeset.rollback();
      set(this, 'isEditing', false);
    },

    verifyPassword() {
      let password = get(this, 'password');
      this.attrs.authenticate(password)
        .then(get(this, 'resolveModal'))
        .catch(get(this, 'rejectModal'))
        .finally(() => {
          this.setProperties({
            resolveModal: null,
            rejectModal: null,
            password: null
          });
        });
    },
    closeModal() {
      get(this, 'rejectModal')();
      this.setProperties({
        resolveModal: null,
        rejectModal: null,
        password: null
      });
    }
  }
});
