import Ember from 'ember';
import layout from '../../../templates/components/nypr-accounts/membership-card/donation-button';

export default Ember.Component.extend({
  layout,
  pledgePrefix: Ember.computed(function() {
    let { environment } = Ember.getOwner(this).resolveRegistration('config:environment');
    return environment === 'development' ? 'pledge-demo' : 'pledge3';
  }),
});
