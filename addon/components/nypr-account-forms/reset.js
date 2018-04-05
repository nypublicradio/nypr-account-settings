import layout from '../../templates/components/nypr-account-forms/reset';
import Component from '@ember/component';
import { get, set } from '@ember/object';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import PasswordValidations from 'nypr-account-settings/validations/nypr-accounts/password';
import RSVP from 'rsvp';
import fetch from 'fetch';
import { rejectUnsuccessfulResponses } from 'nypr-account-settings/utils/fetch-utils';

const FLASH_MESSAGES = {
  reset: 'Your password has been successfully updated.'
};

export default Component.extend({
  layout,
  store: service(),
  flashMessages: service(),
  authAPI: null,
  session: service(),
  resendUrl: computed('authAPI', function() {
    return `${get(this, 'authAPI')}/v1/password/forgot`;
  }),
  allowedKeys: null,
  codeExpired: false,
  passwordWasReset: false,
  init() {
    this._super(...arguments);
    set(this, 'fields', {
      password: ''
    });
    set(this, 'allowedKeys', ['password']);
    set(this, 'changeset', new Changeset(get(this, 'fields'), lookupValidator(PasswordValidations), PasswordValidations));
    get(this, 'changeset').validate();
  },
  resetPassword(email, newPassword, confirmation) {
    let url = `${get(this, 'authAPI')}/v1/confirm/password-reset`;
    let method = 'POST';
    let headers = { "Content-Type" : "application/json" };
    let body = JSON.stringify({email, new_password: newPassword, confirmation});
    return fetch(url, {method, headers, body})
    .then(rejectUnsuccessfulResponses)
    .catch(e => {
      if (get(e, 'errors.code') === 'ExpiredCodeException') {
        set (this, 'codeExpired', true);
      } else {
        get(this, 'changeset').validate('password');
        get(this, 'changeset').pushErrors('password', 'There was a problem changing your password.');
      }
      return RSVP.Promise.reject(e);
    });
  },
  showFlash(type) {
    this.get('flashMessages').add({
      message: FLASH_MESSAGES[type],
      type: 'success'
    });
  },
  actions: {
    onSubmit() {
      return this.resetPassword(get(this, 'email'), get(this, 'fields.password'), get(this, 'confirmation'));
    },
    onSuccess() {
      this.set('passwordWasReset', true);
      return this.showFlash('reset');
    }
  },
});
