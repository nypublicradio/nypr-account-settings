import Component from 'ember-component';
import layout from '../templates/components/basic-info';

export default Component.extend({
  layout,
  classNames: ['nypr-basic-info'],
  
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
        if (verifyEmail) {
          return this.get('emailRequirement')()
            .then(() => {
              this.set('isEditing', false);
              return changeset.save();
            })
            .catch(() => {
              this.rollbackEmailField(changeset);
            });
        } else if (changeset.get('isValid')) {
          this.set('isEditing', false);
          return changeset.save();
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
