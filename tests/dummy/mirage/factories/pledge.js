import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  orderPrice: 10.00,
  orderDate: '2017-01-01',
  orderType: 'onetime',
  premium: 'Brian Lehrer Animated Series',
  creditCardType: 'VISA',
  creditCardLast4Digits: '0302',
});
