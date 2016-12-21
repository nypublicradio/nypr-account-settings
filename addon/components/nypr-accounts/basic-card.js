import Component from 'ember-component';
import { bool } from 'ember-computed';
import layout from '../../templates/components/nypr-accounts/basic-card';
import RSVP from 'rsvp';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import validations from 'nypr-account-settings/validators/nypr-accounts/basic-card';

export default Component.extend({
  layout,
  tagName: '',
  isShowingModal: bool('resolveModal'),
  user: {},
  
  init() {
    this._super(...arguments);
    let user = this.get('user');
    let changeset = new Changeset(user, lookupValidator(validations), validations);
    this.changeset = changeset;
  },

  emailRequirement() {
    return new RSVP.Promise((resolve, reject) => {
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

  actions: {
    save(changeset) {
      let stepOne;
      let verifyEmail = changeset.get('change.email');

      if (!verifyEmail) {
        // if we're not editing email, manually confirm it so changeset passes
        changeset.set('confirmEmail', changeset.get('email'));
        stepOne = changeset.validate();
      } else {
        // otherwise do the email requirement first before moving onto the rest
        // of the validations. this lets us show the modal w/o incurring the delay
        // of doing the username remote validation.
        stepOne = this.emailRequirement();
        stepOne.then(() => changeset.validate());
        stepOne.catch(() => {
          this._canceled = true;
          this.rollbackEmailField(changeset);
        });
      }
      return stepOne.then(() => {
        if (changeset.get('isValid')) {
          return changeset.save().then(() => this.set('isEditing', false));
        } else if (!this._canceled){
          return changeset.get('errors');
        } else if (this._canceled){
          this._canceled = null;
        }
      });
    },
    rollback(changeset) {
      changeset.rollback();
      this.set('isEditing', false);
    },

    verifyPassword(password) {
      this.attrs.authenticate(password)
        .then(this.get('resolveModal'))
        .catch(this.get('rejectModal'))
        .finally(() => {
          this.setProperties({
            resolveModal: null,
            rejectModal: null
          });
        });
    },
    closeModal() {
      this.get('rejectModal')();
      this.setProperties({
        resolveModal: null,
        rejectModal: null
      });
    }
  }
});
