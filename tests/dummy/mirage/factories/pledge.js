import { Factory, faker } from 'ember-cli-mirage';
import computed from 'ember-computed';

export default Factory.extend({
  fund: () => faker.random.arrayElement(["WNYC", "WQXR", "Radiolab"]),
  orderPrice: () => faker.random.arrayElement([60, 72, 120, 12, 90, 100]),
  orderDate: faker.date.past,
  orderType: () => faker.random.arrayElement(["onetime", "sustainer"]),
  orderKey: () => faker.random.uuid(),
  premium: 'Brian Lehrer Animated Series',
  creditCardType: 'VISA',
  creditCardLast4Digits: '0302',
  isActive: faker.random.boolean,
  isSustainer() {
    return this.orderType == 'sustainer' ? true : false;
  },
});
