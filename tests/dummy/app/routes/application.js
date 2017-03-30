import Route from 'ember-route';

export default Route.extend({
  model() {
    return this.store.queryRecord('user', { me: true }).then(result => {
      return {
        user: result,
        pledge: this.store.findAll('pledge')
      };
    });
  }
});
