import Ember from 'ember';
import layout from '../../templates/components/nypr-accounts/password-card';
import validations from 'nypr-account-settings/validators/nypr-accounts/password';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';

export default Ember.Component.extend({
  layout,
  tagName: '',
  
  init() {
    this._super(...arguments);
    this.changeset = new Changeset({
      currentPassword: '',
      newPassword: ''
    }, lookupValidator(validations), validations);
  },
  
  actions: {
    save(changeset) {
      return changeset
        .validate()
        .then(() => {
          if (changeset.get('isValid')) {
            this.attrs.changePassword(changeset)
            .then(() => {
              changeset.rollback();
              this.set('isEditing', false);
            })
            .catch(() => {
              changeset.pushErrors('currentPassword', 'This password is incorrect.');
            });
          } else {
            return changeset.get('errors');
          }
        });
    },
    
    rollback(changeset) {
      changeset.rollback();
      this.set('isEditing', false);
    },
    
    toggleEdit() {
      if (this.get('isEditing')) {
        this.send('rollback', this.get('changeset'));
      } else {
        this.set('isEditing', true);
      }
    }
  }
});
