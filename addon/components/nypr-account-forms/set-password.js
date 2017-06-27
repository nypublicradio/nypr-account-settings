import layout from '../../templates/components/nypr-account-forms/set-password';
import Component from 'ember-component';
import get, { getProperties } from 'ember-metal/get';
import set from 'ember-metal/set';
import computed from 'ember-computed';
import service from 'ember-service/inject';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import PasswordValidations from 'nypr-account-settings/validations/nypr-accounts/password';
import fetch from 'fetch';
import { all, task } from 'ember-concurrency';

export default Component.extend({
  layout,
  store: service(),
  authAPI: null,
  session: null,
  resendUrl: computed('authAPI', function() {
    return `${get(this, 'authAPI')}/v1/password/forgot`;
  }),
  allowedKeys: ['password'],
  passwordExpired: false,
  passwordWasSet: false,
  init() {
    this._super(...arguments);
    set(this, 'fields', {
      password: ''
    });
    set(this, 'changeset', new Changeset(get(this, 'fields'), lookupValidator(PasswordValidations), PasswordValidations));
    get(this, 'changeset').validate();
  },
  setPassword: task(function * (username, email, temp, newPassword) {
    let url = `${get(this, 'authAPI')}/v1/password/change-temp`;
    let method = 'POST';
    let headers = { "Content-Type" : "application/json" };
    let body = JSON.stringify({username, email, temp, new: newPassword});
    let response = yield fetch(url, {method, headers, body});
    if (!response || response && !response.ok) {
      throw yield response.json();
    }
  }),
  claimEmail: task(function * (emailId, token) {
    let url = `${get(this, 'membershipAPI')}/v1/emails/${emailId}/verify/`;
    let method = 'PATCH';
    let body = JSON.stringify({ data: {
      id: Number(emailId),
      type: "EmailAddress",
      attributes: {
        "verification_token": token
      }
    }});
    let headers = {'Content-Type': 'application/vnd.api+json'};
    this.get('session').authorize('authorizer:nypr', (header, value) => {
      headers[header] = value;
    });
    let response = yield fetch(url, {method, headers, body});
    if (!response || response && !response.ok) {
      throw yield response.json();
    }
  }),
  
  doSubmit: task(function * () {
    let changeset = get(this, 'changeset');
    let {
      username,
      email,
      code,
      'fields.password':password,
      emailId,
      verificationToken
    } = getProperties(this, 'username', 'email', 'code', 'fields.password', 'emailId', 'verificationToken');
    try {
      return yield all([
        get(this, 'setPassword').perform(username, email, code, password),
        get(this, 'claimEmail').perform(emailId, verificationToken)
      ]);
    } catch(error) {
      if (get(error, 'errors.code') === 'UnauthorizedAccess') {
        set (this, 'passwordExpired', true);
      } else if (get(error, 'errors.message')) {
        changeset.validate('password');
        changeset.pushErrors('password', get(error, 'errors.message'));
      } else {
        changeset.validate('password');
        changeset.pushErrors('password', 'There was a problem setting your password.');
      }
      throw error;
    }
  }).drop(),
  
  actions: {
    onSubmit() {
      return get(this, 'doSubmit').perform();
    },
    onSuccess() {
      this.set('passwordWasSet', true);
      return this.sendAction('afterSetPassword');
    }
  },
});
