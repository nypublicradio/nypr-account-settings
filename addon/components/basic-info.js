import Component from 'ember-component';
import layout from '../templates/components/basic-info';
import RSVP from 'rsvp';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import validations from 'nypr-account-settings/validators/basic-info';

export default Component.extend({
  layout,
  tagName: '',
  isShowingModal: false,
  user: {},
  
  init() {
    this._super(...arguments);
    let user = this.get('user');
    let changeset = new Changeset(user, lookupValidator(validations), validations);
    this.changeset = changeset;
  },

  emailRequirement(component) {
    component.set('isShowingModal', true);
    return new RSVP.Promise((resolve, reject) => {
      component.setProperties({
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
      let verifyEmail = changeset.get('change.email');

      if (!verifyEmail) {
        // if we're not editing email, manually confirm it so changeset passes
        changeset.set('confirmEmail', changeset.get('email'));
      }
      return changeset.validate().then(() => {
        if (changeset.get('isValid') && verifyEmail) {
          return this.get('emailRequirement')(this)
            .then(() => {
              return changeset.save().then(() => this.set('isEditing', false));
            })
            .catch(() => {
              this.rollbackEmailField(changeset);
            });
        } else if (changeset.get('isValid')) {
          return changeset.save().then(() => this.set('isEditing', false));
        } else {
          return changeset.get('errors');
        }
      });
    },
    rollback(changeset) {
      changeset.rollback();
      this.set('isEditing', false);
    },
    
    closeModal() {
      this.set('isShowingModal', false);
      this.set('resolveModal', null);
      this.get('rejectModal')();
    }
  }
});
