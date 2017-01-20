import Route from 'ember-route';
import RSVP from 'rsvp';

export default Route.extend({
  model() {
    return RSVP.hash({
      user: this.store.queryRecord('user', {me: true}),
      pledge: this.store.findAll('pledge'),
    });
  }
});
