import Controller from 'ember-controller';
import RSVP from 'rsvp';

export default Controller.extend({
  authenticate(/*pw*/) {
    return RSVP.Promise.resolve();
  }
});
