import Route from 'ember-route';
import RSVP from 'rsvp';

export default Route.extend({
  model() {
    return RSVP.hash({
      user: this.store.queryRecord('user', { me: true })
    });
  },
  setupController(controller, model) {
    controller.set('pledges', this.store.findAll('pledge'));
    return this._super(controller, model);
  }
});
