import layout from '../../templates/components/nypr-account-forms/login';
import Component from 'ember-component';
import set from 'ember-metal/set';
import get from 'ember-metal/get';
import { next } from 'ember-runloop';
import computed from 'ember-computed';
import service from 'ember-service/inject';
import Changeset from 'ember-changeset';
import LoginValidations from 'nypr-account-settings/validations/nypr-accounts/login';
import messages from 'nypr-account-settings/validations/nypr-accounts/custom-messages';
import lookupValidator from 'ember-changeset-validations';

export default Component.extend({
  layout,
  messages,
  flashMessages: service(),
  authAPI: null,
  session: null,
  showSocialLogin: false,
  resendUrl: computed('authAPI', function() {
    return `${get(this, 'authAPI')}/v1/confirm/resend`;
  }),
  allowedKeys: ['email', 'password'],
  triedUnverifiedAccount: false,
  showLoginError: false,
  init() {
    this._super(...arguments);
    set(this, 'fields', {
      email: '',
      password: ''
    });
    set(this, 'changeset', new Changeset(get(this, 'fields'), lookupValidator(LoginValidations), LoginValidations));
    get(this, 'changeset').validate();
  },
  click() {
    get(this, 'flashMessages').clearMessages();
  },
  actions: {
    onSubmit() {
      set(this, 'showLoginError', false);
      return this.authenticate(get(this, 'fields.email'), get(this, 'fields.password'));
    },
    onFailure(e) {
      if (e) {
        let errorCode = get(e, 'errors.code');
        switch (errorCode) {
          case 'AccountNotConfirmed':
            set(this, 'triedUnconfirmedAccount', true);
            break;
          case 'UnauthorizedAccess':
            set(this, 'showLoginError', true);
            break;
          default:
            this.applyErrorToChangeset(e.errors, get(this, 'changeset'));
        }
      }
    },
    loginWithFacebook() {
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
          type: 'warning',
          sticky: true,
        });
      }
    });
  },
  authenticate(email, password) {
    return get(this, 'session').authenticate('authenticator:nypr', email, password);
  },
  applyErrorToChangeset(error, changeset) {
    if (error && error.code) {
      changeset.rollback(); // so errors don't stack up
      if (error.message === 'User is disabled') {
        changeset.pushErrors('email', messages.userDisabled);
      } else if (error.code === "UserNotFoundException") {
        changeset.validate('email');
        changeset.pushErrors('password', messages.emailNotFound( changeset.get('email') ));
      }
    }
  }
});
