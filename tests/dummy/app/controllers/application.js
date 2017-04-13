import Controller from 'ember-controller';
// import fetch from 'fetch';
import computed from 'ember-computed';
import RSVP from 'rsvp';

export default Controller.extend({
  // authenticate(/* pw */) {
  //   return fetch('/check-password', {method: 'POST'})
  //     .then(checkStatus);
  // }
  authenticate: () => RSVP.Promise.resolve(),
  membershipStartDate: computed('model', function() {
    let memberStatusList = this.get('model.memberStatus'),
      joinDates = memberStatusList.map(item => item.get('membershipStartDate')),
      sortedDates = joinDates.sort((a, b) => Date.parse(a) > Date.parse(b)),
      earliestJoinDate = sortedDates[0];
    return earliestJoinDate;
  }),
});

// function checkStatus(response) {
//   return new RSVP.Promise((resolve, reject) => {
//     response.json().then(json => {
//       if (response.status >= 200 && response.status < 300) {
//         resolve(response);
//       } else {
//         reject(json);
//       }
//     });
//   });
// }
