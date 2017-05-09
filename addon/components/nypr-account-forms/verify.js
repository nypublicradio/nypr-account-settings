import Component from 'ember-component';
import computed from 'ember-computed';
import get from 'ember-metal/get';
import fetch from 'fetch';
import { rejectUnsuccessfulResponses } from 'nypr-account-settings/utils/fetch-utils';
import layout from '../../templates/components/nypr-account-forms/verify';
import messages from 'nypr-account-settings/validations/nypr-accounts/custom-messages';

export default Component.extend({
  layout,
  session: null,
  verificationCode: null,
  emailId: null,
  membershipAPI: null,
  onFailure: () => {},
  onSuccess: () => {},
  APIUrl: computed('membershipAPI', 'email_id', function() {
    return `${get(this, 'membershipAPI')}/membership/email/${get(this, 'emailId')}/verify`;
  }),
  didReceiveAttrs() {
    this.verifyEmail(get(this, 'APIUrl'), get(this, 'verificationCode'));
  },
  verifyEmail(url, verificationCode) {
    let method = 'PATCH';
    let mode = 'cors';
    let headers = {'Content-Type': 'application/json'};
    this.get('session').authorize('authorizer:nypr', (header, value) => {
        headers[header] = value;
    });
    let body = JSON.stringify({verification_code: verificationCode});
    fetch(url, {method, mode, headers, body})
    .then(rejectUnsuccessfulResponses)
    .then(() => {
      get(this, 'onSuccess')();
    })
    .catch((e) => {
      let errorMessage = messages.genericVerificationError;
      if (e && get(e, 'errors.message')) {
        errorMessage = e.errors.message;
      }
      get(this, 'onFailure')(errorMessage);
    });
  }
});
