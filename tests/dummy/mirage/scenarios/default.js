export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.

    Make sure to define a factory for each model you want to create.
  */

  // server.createList('post', 10);
  server.create('user');
  // server.createList('member-status', 2);
  server.createList('member-status', 2, {membershipStartDate: null});
  server.createList('pledge', 11, {isActive: false});
}
