import DS from 'ember-data';
const { Model, attr } = DS;

export default Model.extend({
  givenName:         attr('string'),
  familyName:        attr('string'),
  email:             attr('string'),
  preferredUsername: attr('string')
});
