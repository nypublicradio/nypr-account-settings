import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  membershipStartDate: faker.date.past,
  freakonomicsActive: faker.random.boolean,
  freakonomicsActiveSustaining: faker.random.boolean,
  jonathanChannelActive: faker.random.boolean,
  jonathanChannelActiveSustaining: faker.random.boolean,
  radiolabActive: faker.random.boolean,
  radiolabActiveSustaining: faker.random.boolean,
  wnycActive: faker.random.boolean,
  wnycActiveSustaining: faker.random.boolean,
  wqxrActive: faker.random.boolean,
  wqxrActiveSustaining: faker.random.boolean
});
