import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  fund: () => faker.random.arrayElement(["WNYC", "WQXR", "Radiolab"]),
  orderPrice: () => faker.random.arrayElement([60, 72, 120, 12, 90, 100]),
  orderDate: faker.date.past,
  orderType: () => faker.random.arrayElement(["onetime", "sustainer"]),
  premium: 'Brian Lehrer Animated Series',
  creditCardType: 'VISA',
  creditCardLast4Digits: '0302',
  isActive: faker.random.boolean
});
