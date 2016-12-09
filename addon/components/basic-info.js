import Component from 'ember-component';
import layout from '../templates/components/basic-info';
import RSVP from 'rsvp';

const { all, Promise } = RSVP;

export default Component.extend({
  layout,
  
  actions: {
    save(basicChangeset, pwChangeset) {
      if (this.get('isEditingPassword')) {
        return all([basicChangeset.validate(), pwChangeset.validate()]).then(() => {
          if (basicChangeset.get('isValid') && pwChangeset.get('isValid')) {
            this.set('isEditing', false);
            this.set('isEditingPassword', false);
            return all([basicChangeset.save(), pwChangeset.save()]);
          } else {
            return Promise.resolve([basicChangeset.get('errors'), pwChangeset.get('errors')]);
          }
        });
      } else {
        return basicChangeset.validate().then(() => {
          if (basicChangeset.get('isValid')) {
            this.set('isEditing', false);
            this.set('isEditingPassword', false);
            return basicChangeset.save();
          } else {
            return basicChangeset.get('errors');
          }
        });
      }
    },
    rollback(basicChangeset, pwChangeset) {
      basicChangeset.rollback();
      pwChangeset.rollback();
      this.set('isEditing', false);
      this.set('isEditingPassword', false);
    }
  }
});
