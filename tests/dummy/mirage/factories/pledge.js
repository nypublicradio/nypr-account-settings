import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  fund: () => faker.random.arrayElement(["WNYC", "WQXR", "Radiolab", "J.Schwartz"]),
  orderPrice: () => faker.random.arrayElement([60, 72, 120, 12, 90, 100]),
  orderDate: faker.date.past,
  orderCode: () => faker.random.arrayElement([1234567,2345678,3456789]),
  orderType: () => faker.random.arrayElement(["onetime", "sustainer"]),
  orderKey: () => faker.random.uuid(),
  premium: () => faker.random.arrayElement(['Brian Lehrer Animated Series', 'BL Mug', 'WNYC Hoodie', '']),
  creditCardType: 'VISA',
  creditCardLast4Digits: '0302',
  isActiveMember: faker.random.boolean,
  isSustainer: faker.random.boolean,
});
