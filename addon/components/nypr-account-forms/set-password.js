import layout from '../../templates/components/nypr-account-forms/set-password';
import Component from 'ember-component';
import get from 'ember-metal/get';
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
    let body = JSON.stringify({username, email, temp, "new": newPassword});
    let response = yield fetch(url, {method, headers, body});
    if (!response || response && !response.ok) {
      throw yield response.json();
    }
  }),
    let changeset = get(this, 'changeset');
    return fetch(url, {method, headers, body})
    .then(rejectUnsuccessfulResponses)
    .catch(e => {
      if (get(e, 'errors.code') === 'UnauthorizedAccess') {
        set (this, 'passwordExpired', true);
      } else if (get(e, 'errors.message')) {
        changeset.validate('password');
        changeset.pushErrors('password', get(e, 'errors.message'));
      } else {
        changeset.validate('password');
        changeset.pushErrors('password', 'There was a problem setting your password.');
      }
      return RSVP.Promise.reject(e);
    });
  },
  actions: {
    onSubmit() {
      return this.setPassword(get(this, 'username'), get(this, 'email'), get(this, 'code'), get(this, 'fields.password'));
    },
    onSuccess() {
      this.set('passwordWasSet', true);
      return this.sendAction('afterSetPassword');
    }
  },
});
