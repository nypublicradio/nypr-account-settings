import Component from 'ember-component';
import get from 'ember-metal/get';
import fetch from 'fetch';
import layout from '../../templates/components/nypr-account-forms/verify';
import messages from 'nypr-account-settings/validations/nypr-accounts/custom-messages';
import { task } from 'ember-concurrency';

export default Component.extend({
  layout,
  session: null,
  verificationToken: null,
  emailId: null,
  membershipAPI: null,
  onFailure: () => {},
  onSuccess: () => {},
  didReceiveAttrs() {
    get(this, 'verifyEmail').perform(get(this, 'emailId'), get(this, 'verificationToken'));
  },

  verifyEmail: task(function * (emailId, verificationToken) {
    let url = `${get(this, 'membershipAPI')}/v1/emails/${get(this, 'emailId')}/verify/`;
    let method = 'PATCH';
    let mode = 'cors';
    let body = JSON.stringify({ data: {
      id: Number(emailId),
      type: "EmailAddress",
      attributes: {
        "verification_token": verificationToken
      }
    }});
    let headers = {'Content-Type': 'application/vnd.api+json'};
    this.get('session').authorize('authorizer:nypr', (header, value) => {
        headers[header] = value;
    });
    try {
      let response = yield fetch(url, {method, mode, headers, body});
      if (response && response.ok) {
        let json = yield response.json();
        if (get(json, ('data.success'))) {
          get(this, 'onSuccess')();
        } else {
          throw messages.genericVerificationError;
        }
      } else {
        let json = yield response.json();
        if (json && get(json, 'errors.message')) {
          throw json.errors.message;
        } else {
          throw messages.genericVerificationError;
        }
      }
    } catch(error) {
      get(this, 'onFailure')(error || messages.genericVerificationError);
    }
  }).drop(),
});
