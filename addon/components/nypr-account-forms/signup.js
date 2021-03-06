import layout from '../../templates/components/nypr-account-forms/signup';
import Component from '@ember/component';
import { get, set } from '@ember/object';
import { next } from '@ember/runloop';
import Changeset from 'ember-changeset';
import SignupValidations from 'nypr-account-settings/validations/nypr-accounts/signup';
import messages from 'nypr-account-settings/validations/nypr-accounts/custom-messages';
import lookupValidator from 'ember-changeset-validations';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import { rejectUnsuccessfulResponses } from 'nypr-account-settings/utils/fetch-utils';
import config from "ember-get-config";

export default Component.extend({
  layout,
  store: service(),
  flashMessages: service(),
  showSocialSignup: false,
  authApi: null,
  session: service(),
  allowedKeys: null,

  init() {
    this._super(...arguments);
    set(this, 'newUser', this.get('store').createRecord('user',
      {
        'givenName': get(this, 'givenName'),
        'familyName': get(this, 'familyName')
      }
    ));
    set(this, 'allowedKeys', ['email','emailConfirmation','givenName','familyName','typedPassword']);
    set(this, 'changeset', new Changeset(get(this, 'newUser'), lookupValidator(SignupValidations), SignupValidations));
    get(this, 'changeset').validate();
    set(this, 'changeset.email', get(this, 'email'));
    set(this, 'changeset.emailConfirmation', get(this, 'email'));

    // Ignore the captcha during testing
    if (config.environment === "test") {
      set(this, 'newUser.captchaKey', "test_captcha_key");
    }
  },
  click() {
    get(this, 'flashMessages').clearMessages();
  },
  actions: {
    onSubmit() {
      set(this, 'signupError', null);
      return this.signUp();
    },
    onFailure(e) {
      if (e) {
        if (e.errors && e.errors.code === 'UserNoPassword') {
          set(this, 'signupError', messages.signupNoPassword);
        } else if (e.errors && e.errors.code === 'BadAccess') {
          set(this, 'signupError', messages.badAccess);
        } else {
          this.applyErrorToChangeset(e.errors, get(this, 'changeset'));
        }
      }
    },
    signupWithFacebook() {
      let authOptions = {};
      if (get(this, 'emailWasDeclined')) {
        //we need to send this option with the fb login request to re-request the email permission
        authOptions = {authType: 'rerequest'};
        //reset emailWasDeclined on a new attempt
        set(this, 'emailWasDeclined', false);
      }
      get(this, 'session').authenticate('authenticator:torii', 'facebook-connect', authOptions)
      .catch((e) => {
        if (e && get(e, 'errors.code') === 'MissingAttributeException') {
          set(this, 'emailWasDeclined', true);
          return this.onFacebookLoginFailure(messages.socialAuthNoEmail);
        } else {
          return this.onFacebookLoginFailure(messages.socialAuthCancelled);
        }
      });
    },
    hasCompletedCaptcha(reCaptchaResponse) {
      set(this, 'newUser.captchaKey', reCaptchaResponse);
    }
  },
  onFacebookLoginFailure(message) {
    // because we clear flash messages when clicking this form,
    // wait a tick when we add one in an action that can
    // be triggered with a click
    next(() => {
      if (message) {
        this.get('flashMessages').add({
          message: message,
          type: 'warning'
        });
      }
    });
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
        changeset.pushErrors('email', messages.signupAccountExists(changeset.get('email')));
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
