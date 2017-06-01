import layout from '../../templates/components/nypr-account-forms/set-password';
import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import computed from 'ember-computed';
import service from 'ember-service/inject';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import PasswordValidations from 'nypr-account-settings/validations/nypr-accounts/password';
import RSVP from 'rsvp';
import fetch from 'fetch';
import { rejectUnsuccessfulResponses } from 'nypr-account-settings/utils/fetch-utils';

const FLASH_MESSAGES = {
  set: 'Your password has been successfully updated.'
};

export default Component.extend({
  layout,
  store: service(),
  authAPI: null,
  session: null,
  resendUrl: computed('authAPI', function() {
    return `${get(this, 'authAPI')}/v1/password/forgot`;
  }),
  allowedKeys: ['password'],
  codeExpired: false,
  passwordWasSet: false,
  init() {
    this._super(...arguments);
    set(this, 'fields', {
      password: ''
    });
    set(this, 'changeset', new Changeset(get(this, 'fields'), lookupValidator(PasswordValidations), PasswordValidations));
    get(this, 'changeset').validate();
  },
  setPassword(username, temp, new_password) {
    let url = `${get(this, 'authAPI')}/v1/password/change-temp`;
    let method = 'POST';
    let headers = { "Content-Type" : "application/json" };
    let body = JSON.stringify({username, temp, "new": new_password});
    return fetch(url, {method, headers, body})
    .then(rejectUnsuccessfulResponses)
    .catch(e => {
      if (get(e, 'errors.code') === 'ExpiredCodeException') {
        set (this, 'codeExpired', true);
      } else {
        get(this, 'changeset').validate('password');
        get(this, 'changeset').pushErrors('password', 'There was a problem setting your password.');
      }
      return RSVP.Promise.reject(e);
    });
  },
  showFlash(type) {
    this.get('flashMessages').add({
      message: FLASH_MESSAGES[type],
      type: 'success',
      sticky: true
    });
  },
  actions: {
    onSubmit() {
      return this.setPassword(get(this, 'username'), get(this, 'code'), get(this, 'fields.password'));
    },
    onSuccess() {
      this.set('passwordWasSet', true);
      return this.showFlash('set');
    }
  },
});
