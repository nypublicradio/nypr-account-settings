import Route from 'ember-route';

export default Route.extend({
  model() {
    return this.store.createRecord('user', {
      givenName: "Jane",
      familyName: "Doe",
      preferredUsername: "janedoe",
      email: "jane@email.com"
    });
  }
});
