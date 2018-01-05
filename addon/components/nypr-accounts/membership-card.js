import Ember from "ember";
import layout from "../../templates/components/nypr-accounts/membership-card";
import computed from "ember-computed";
import moment from "moment";

export default Ember.Component.extend({
  layout,
  taxLetterUrl: computed(function() {
    let config = Ember.getOwner(this).resolveRegistration('config:environment');
    let urlRoot = config.membershipAPI || "https://api.wnyc.org";
    return `${urlRoot}/v1/taxes`;
  }),
  previousYear: computed(function() {
    return moment()
      .subtract(1, "year")
      .year();
  }),
  hasPledgesInPastTaxYear: computed.filter("pledges", function(pledge) {
    let previousYear = moment().subtract(1, "year").year();
    let pledgeYear = pledge.orderDate || pledge.get("orderDate").year();
    return moment(pledgeYear == previousYear);
  })
});
