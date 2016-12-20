import Controller from 'ember-controller';
import RSVP from 'rsvp';

export default Controller.extend({
  checkPassword(/*pw*/) {
    return RSVP.Promise.resolve();
  }
});
