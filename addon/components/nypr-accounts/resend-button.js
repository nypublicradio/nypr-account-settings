import Component from '@ember/component';
import layout from '../../templates/components/nypr-accounts/resend-button';
import fetch from 'fetch';
import { task, timeout } from 'ember-concurrency';
import { rejectUnsuccessfulResponses } from 'nypr-account-settings/utils/fetch-utils';

export default Component.extend({
  layout,
  tagName: '',
  target: null,
  email: null,
  resendAction: null,
  ready: true,
  success: false,
  error: false,
  autoReset: true,
  resetDelay: 10000,
  successMessage: 'Email resent',
  errorMessage: 'Email not resent. Try again later',
  init() {
    this._super(...arguments);
    if (typeof this.resetDelay === 'undefined') {
      this.set('resetDelay', 10000);
    }

    if (typeof this.autoReset === 'undefined') {
      this.set('autoReset', true);
    }
  },
  actions: {
    resend(target, email) {
      let resendAction = () => fetch(`${target}?email=${email}`, {method: 'GET', mode: 'cors'})
      .then(rejectUnsuccessfulResponses);
      this.get('tryResend').perform(resendAction);
    }
  },
  tryResend: task(function * (resendAction) {
    try {
      yield resendAction();
      this.set('ready', false);
      this.set('success', true);
    } catch(e) {
      this.set('ready', false);
      this.set('error', true);
    } finally {
      if (this.get('autoReset')) {
        yield timeout(this.get('resetDelay'));
        this.reset();
      }
    }
  }).drop(),
  reset() {
    this.set('success', false);
    this.set('error', false);
    this.set('ready', true);
  }
});
