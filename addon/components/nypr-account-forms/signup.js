import layout from '../../templates/components/nypr-account-forms/signup';
import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { next } from 'ember-runloop';
import Changeset from 'ember-changeset';
import SignupValidations from 'nypr-account-settings/validations/nypr-accounts/signup';
import messages from 'nypr-account-settings/validations/nypr-accounts/custom-messages';
import lookupValidator from 'ember-changeset-validations';
import service from 'ember-service/inject';
import fetch from 'fetch';
import { rejectUnsuccessfulResponses } from 'nypr-account-settings/utils/fetch-utils';

export default Component.extend({
  layout,
  store: service(),
  flashMessages: service(),
  showSocialSignup: false,
  authApi: null,
  session: null,
  allowedKeys: ['email','emailConfirmation','givenName','familyName','typedPassword'],

  init() {
    this._super(...arguments);
    set(this, 'newUser', this.get('store').createRecord('user'));
    set(this, 'changeset', new Changeset(get(this, 'newUser'), lookupValidator(SignupValidations), SignupValidations));
    get(this, 'changeset').validate();
  },
  click() {
    get(this, 'flashMessages').clearMessages();
  },
  actions: {
    onSubmit() {
      return this.signUp();
    },
    onFailure(e) {
      if (e) {
        this.applyErrorToChangeset(e.errors, get(this, 'changeset'));
      }
    },
    signupWithFacebook() {
      this.get('session').authenticate('authenticator:torii', 'facebook-connect')
      .then(() => {
        if (this.get('session').get('isNewSocialUser') === true) {
          // because we clear flash messages when clicking this form,
          // wait a tick when we add one in an action that can
          // be triggered with a click
          next(() => {
            this.get('flashMessages').add({
              message: messages.socialAuthSignup,
              type: 'success',
              sticky: true,
            });
          });
        }
      })
      .catch(() => {
        next(() => {
          this.get('flashMessages').add({
            message: messages.socialAuthCancelled,
            type: 'warning',
            sticky: true,
          });
        });
      });
    }
  },
  signUp() {
    return get(this, 'newUser').save();
  },
  onEmailInput() {
    if (get(this, 'changeset.emailConfirmation')) {
      get(this, 'changeset').validate('emailConfirmation');
    }
  },
  applyErrorToChangeset(error, changeset) {
    if (error) {
      changeset.rollback(); // so errors don't stack up
      if (error.code === "AccountExists") {
        changeset.validate('email');
        changeset.pushErrors('email', `An account already exists for the email ${changeset.get('email')}.<br/> <a href="/login">Log in?</a> <a href="/forgot">Forgot password?</a>`);
      } else if (error.message === 'User is disabled') {
        changeset.pushErrors('email', messages.userDisabled);
      }
    }
  },
  resendConfirmationEmail(email) {
    let url = `${get(this, 'authAPI')}/v1/confirm/resend?email=${email}`;
    let method = 'GET';
    let mode = 'cors';
    return fetch(url, {method, mode})
    .then(rejectUnsuccessfulResponses);
  }
});
