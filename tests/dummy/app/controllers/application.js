import Controller from 'ember-controller';
// import fetch from 'fetch';
import RSVP from 'rsvp';

export default Controller.extend({
  // authenticate(/* pw */) {
  //   return fetch('/check-password', {method: 'POST'})
  //     .then(checkStatus);
  // }
  authenticate: () => RSVP.Promise.resolve(),
  showFlash() {},
  changePassword() {}
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
