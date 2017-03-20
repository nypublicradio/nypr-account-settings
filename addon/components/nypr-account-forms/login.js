import layout from '../../templates/components/nypr-account-forms/login';
import Component from 'ember-component';
import set from 'ember-metal/set';
import get from 'ember-metal/get';
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
        if (get(e, 'errors.code') === 'AccountNotConfirmed') {
          set(this, 'triedUnconfirmedAccount', true);
        } else if (get(e, 'errors.code') === 'UnauthorizedAccess') {
          set(this, 'showLoginError', true);
        } else {
          this.applyErrorToChangeset(e.errors, get(this, 'changeset'));
        }
      }
    },
    loginWithFacebook() {
      get(this, 'session').authenticate('authenticator:torii', 'facebook-connect')
      .catch(() => {
        this.get('flashMessages').add({
          message: messages.socialAuthCancelled,
          type: 'warning',
          sticky: true,
        });
      });
    }
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
