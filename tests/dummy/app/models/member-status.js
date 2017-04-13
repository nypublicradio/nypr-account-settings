import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({
  membershipStartDate: attr('string'),
  freakonomicsActiveSustaining: attr('boolean'),
  jonathanChannelActiveSustaining: attr('boolean'),
  radiolabActiveSustaining: attr('boolean'),
  wnycActiveSustaining: attr('boolean'),
  wqxrActiveSustaining: attr('boolean'),
  jonathanChannelActive: attr('boolean'),
  radiolabActive: attr('boolean'),
  wnycActive: attr('boolean'),
  wqxrActive: attr('boolean')
});
