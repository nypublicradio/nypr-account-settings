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
  verificationToken: null,
  emailId: null,
  membershipAPI: null,
  onFailure: () => {},
  onSuccess: () => {},
  APIUrl: computed('membershipAPI', 'email_id', function() {
    return `${get(this, 'membershipAPI')}/v1/emails/${get(this, 'emailId')}/verify`;
  }),
  didReceiveAttrs() {
    this.verifyEmail(get(this, 'APIUrl'), get(this, 'verificationToken'));
  },
  verifyEmail(url, verificationToken) {
    let method = 'PATCH';
    let mode = 'cors';
    let headers = {'Content-Type': 'application/json'};
    this.get('session').authorize('authorizer:nypr', (header, value) => {
        headers[header] = value;
    });
    let body = JSON.stringify({verification_token: verificationToken});
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
