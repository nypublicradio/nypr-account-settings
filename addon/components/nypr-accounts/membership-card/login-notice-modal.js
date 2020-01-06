import { getOwner } from '@ember/application';
import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../../../templates/components/nypr-accounts/membership-card/login-notice-modal';

export default Component.extend({
  classNames: ["login-notice"],
  layout,
  pledgeEnv: computed(function() {
    let { environment } = getOwner(this).resolveRegistration('config:environment');
    return environment === 'development' ? 'pledge-demo' : 'pledge3';
  }),
  pledgeLocation: computed(function(){
    let siteDomain= this.get("siteDomain")
    let pledgeEnv = this.get("pledgeEnv")
    return `https://${pledgeEnv}.${siteDomain}.org/campaign/mc-${siteDomain}/sustainer#login`;
  }),
  actions: {
    goToLogin() {
      //redirect to pledge
      window.location = this.get("pledgeLocation");
    }
  },
});
