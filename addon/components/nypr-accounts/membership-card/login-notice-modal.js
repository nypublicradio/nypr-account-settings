import config from "ember-get-config";
import { computed } from '@ember/object';
import Component from '@ember/component';
import layout from '../../../templates/components/nypr-accounts/membership-card/login-notice-modal';

export default Component.extend({
  classNames: ["login-notice"],
  layout,
  pledgeLocation: computed(function(){
    let siteDomain= this.get("siteDomain")
    let pledgeDomain = config.pledgeDomain;
    return `${pledgeDomain}/campaign/mc-${siteDomain}/sustainer#login`;
  })
});
