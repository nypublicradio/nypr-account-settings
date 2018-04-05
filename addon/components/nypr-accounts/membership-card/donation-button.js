import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../../../templates/components/nypr-accounts/membership-card/donation-button';

export default Component.extend({
  layout,
  pledgePrefix: computed(function() {
    let { environment } = getOwner(this).resolveRegistration('config:environment');
    return environment === 'development' ? 'pledge-demo' : 'pledge3';
  }),
});
