import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
  fund: attr('string'),
  orderPrice: attr('number'),
  orderDate: attr('string'),
  orderType: attr('string'),
  premium: attr('string'),
  creditCardType: attr('string'),
  creditCardLast4Digits: attr('string'),
  isActive: attr('boolean'),
});
