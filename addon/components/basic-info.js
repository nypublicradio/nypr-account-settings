import Component from 'ember-component';
import layout from '../templates/components/basic-info';
import RSVP from 'rsvp';
import computed from 'ember-computed';

const { all, Promise } = RSVP;

export default Component.extend({
  layout,
  
  activeChangesets: computed('isEditingPassword', function() {
    let changesets = [this.get('basicChangeset')];
    if (this.get('isEditingPassword')) {
      changesets.push(this.get('pwChangeset'));
    }
    return changesets;
  }),

  validateChangesets() {
    let changesets = this.get('activeChangesets');
    return new Promise((resolve, reject) => {
      all(changesets.map(c => c.validate()))
        .then(() => {
          if (changesets.map(c => c.get('isValid')).every(r => r)) {
            resolve();
          } else {
            reject();
          }
        });
    });
  },
  
  saveChangesets() {
    let changesets = this.get('activeChangesets');
    return all(changesets.map(c => c.save()));
  },
  
  resetForm() {
    this.setProperties({
      isEditing: false,
      isEditingEmail: false,
      isEditingPassword: false
    });
  },
  
  rollbackEmailField() {
    // work around to rollback specific fields
    let basicChangeset = this.get('basicChangeset');
    let snapshot = basicChangeset.snapshot();
    basicChangeset.rollback();
    delete snapshot.changes.email;
    delete snapshot.changes.confirmEmail;
    basicChangeset.restore(snapshot);
  },

  actions: {
    save() {
      let verifyEmail = this.get('isEditingEmail');

      if (!verifyEmail) {
        let basicChangeset = this.get('basicChangeset');
        // if we're not editing email, manually confirm it so changeset passes
        basicChangeset.set('confirmEmail', basicChangeset.get('email'));
      }
      return this.validateChangesets().then(() => {
        if (verifyEmail) {
          return this.get('emailRequirement')()
            .then(() => {
              this.resetForm();
              return this.saveChangesets();
            })
            .catch(() => {
              this.rollbackEmailField();
              this.set('isEditingEmail', false);
            });
        } else {
          this.resetForm();
          return this.saveChangesets();
        }
      })
      .catch(() => {
        this.get('activeChangesets').map(c => c.get('errors'));
      });
    },
    rollback() {
      this.get('activeChangesets').forEach(c => c.rollback());
      this.resetForm();
    }
  }
});
