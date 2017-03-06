import Ember from 'ember';
import layout from '../../templates/components/nypr-account-forms/validate';
import service from 'ember-service/inject';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import EmailValidations from 'nypr-account-settings/validations/nypr-accounts/email';
import fetch from 'fetch';
import { rejectUnsuccessfulResponses } from 'nypr-account-settings/utils/fetch-utils';

const FLASH_MESSAGES = {
  validated: 'Your email has been verified and your online account is now active.'
};

export default Ember.Component.extend({
  layout,
  flashMessages: service(),
  authAPI: null,
  session: null,
  accountValidated: false,
  codeExpired: false,
  allowedKeys: ['email'],
  init() {
    this._super(...arguments);
    set(this, 'fields', {
      email: ''
    });
    set(this, 'changeset', new Changeset(get(this, 'fields'), lookupValidator(EmailValidations), EmailValidations));
    get(this, 'changeset').validate();
  },
  didReceiveAttrs() {
    this.validateNewAccount(get(this, 'username'), get(this, 'confirmation'))
    .then(() => {
      set(this, 'accountValidated', true);
      this.showFlash('validated');
    })
    .catch((e) => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      if (get(e, 'errors.code') === "AliasExistsException") {
        // Account was already validated
        set(this, 'accountValidated', true);
        this.showFlash('validated');
      } else {
        set(this, 'codeExpired', true);
      }
    });
  },
  validateNewAccount(username, confirmation) {
    let url = `${get(this, 'authAPI')}/v1/confirm/sign-up?confirmation=${confirmation}&username=${username}`;
    let method = 'GET';
    let mode = 'cors';
    return fetch(url, {method, mode})
    .then(rejectUnsuccessfulResponses);
  },
  resendValidationEmail(email) {
    let url = `${get(this, 'authAPI')}/v1/confirm/resend?email=${email}`;
    let method = 'GET';
    let mode = 'cors';
    return fetch(url, {method, mode})
    .then(rejectUnsuccessfulResponses);
  },
  showFlash(type) {
    this.get('flashMessages').add({
      message: FLASH_MESSAGES[type],
      type: 'success',
      sticky: true
    });
  },
  actions: {
    // Form for resending the validation email
    onSubmit() {
      return this.resendValidationEmail(get(this, 'fields.email'));
    },
    onFailure() {
      let changeset = get(this, 'changeset');
      changeset.validate('email');
      changeset.pushErrors('email', 'There was a problem sending a confirmation email to that address.');
    },
  }
});
