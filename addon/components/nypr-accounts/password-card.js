import Ember from 'ember';
import layout from '../../templates/components/nypr-accounts/password-card';

export default Ember.Component.extend({
  layout,
  tagName: '',
  
  actions: {
    save(changeset) {
      return changeset
        .validate()
        .then(() => {
          if (changeset.get('isValid')) {
            this.set('isEditing', false);
            changeset.save();
            this.get('changePassword')(changeset);
          } else {
            return changeset.get('errors');
          }
        });
    },
    
    rollback(changeset) {
      changeset.rollback();
      this.set('isEditing', false);
    }
  }
});
