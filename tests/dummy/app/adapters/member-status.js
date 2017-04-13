import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  pathForType: function (type) {
    return type;
  },
});