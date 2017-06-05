import layout from '../../templates/components/nypr-account-forms/forgot';
import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import computed from 'ember-computed';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import EmailValidations from 'nypr-account-settings/validations/nypr-accounts/email';
import fetch from 'fetch';
import { rejectUnsuccessfulResponses } from 'nypr-account-settings/utils/fetch-utils';

export default Component.extend({
  layout,
  authAPI: null,
  triedUnverifiedAccount: false,
  resendUrl: computed('authAPI', function() {
    return `${get(this, 'authAPI')}/v1/password/forgot`;
  }),
  allowedKeys: ['email'],
  init() {
    this._super(...arguments);
    set(this, 'fields', {
      email: ''
    });
    set(this, 'changeset', new Changeset(get(this, 'fields'), lookupValidator(EmailValidations), EmailValidations));
    get(this, 'changeset').validate();
  },
  actions: {
    onSubmit() {
      return this.requestPasswordResetEmail(get(this, 'fields.email'));
    },
    onFailure(e) {
      if (e) {
        if (get(e, 'errors.code') === 'UserNotConfirmedException') {
          set(this, 'triedUnverifiedAccount', true);
        } else {
          this.applyErrorToChangeset(e.errors, get(this, 'changeset'));
        }
      }
    },
  },
  requestPasswordResetEmail(email) {
    let url = `${get(this, 'authAPI')}/v1/password/forgot?email=${email}`;
    let method = 'GET';
    let mode = 'cors';
    return fetch(url, {method, mode})
    .then(rejectUnsuccessfulResponses);
  },
  applyErrorToChangeset(error, changeset) {
    if (error) {
      if (error.code === "UserNotFoundException") {
        changeset.validate('email');
        changeset.pushErrors('email', `We cannot find an account for the email ${changeset.get('email')}. <a href="/signup">Sign up?</a>`);
      }
    }
  },
});
