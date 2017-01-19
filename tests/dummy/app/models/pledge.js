import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
  orderPrice: attr('number'),
  orderDate: attr('string'),
  orderType: attr('string'),
  premium: attr('string'),
  creditCardType: attr('string'),
  creditCardLast4Digits: attr('number'),
});
