import layout from '../../templates/components/nypr-account-forms/thanks';
import Component from '@ember/component';
import { get } from '@ember/object';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  authAPI: null,
  resendUrl: computed('authAPI', function() {
    return `${get(this, 'authAPI')}/v1/confirm/resend`;
  })
});
