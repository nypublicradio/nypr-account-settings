import Ember from 'ember';
import get from 'ember-metal/get';
import layout from '../../templates/components/nypr-accounts/password-card';
import validations from 'nypr-account-settings/validations/nypr-accounts/password-change';
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
            .catch((e) => {
              console.log(e);
              if (e && get(e, 'errors.message')) {
                changeset.pushErrors('currentPassword', e.errors.message);
              } else {
                changeset.pushErrors('currentPassword', 'This password is incorrect.');
              }
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
