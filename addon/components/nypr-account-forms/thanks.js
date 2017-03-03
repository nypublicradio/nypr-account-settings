import layout from '../../templates/components/nypr-account-forms/thanks';
import Component from 'ember-component';
import get from 'ember-metal/get';
import computed from 'ember-computed';

export default Component.extend({
  layout,
  authAPI: null,
  resendUrl: computed('authAPI', function() {
    return `${get(this, 'authAPI')}/v1/confirm/resend`;
  })
});
