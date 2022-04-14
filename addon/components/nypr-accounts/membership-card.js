import Component from '@ember/component';
import layout from "../../templates/components/nypr-accounts/membership-card";
import { computed } from '@ember/object';
import moment from "moment";
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  session: service(),
  pledgeManagerEnabled: true,
  customStatusMessage: null,
  customStatusUrl: null,
  customStatusUrlText: null,
  previousYear: computed(function() {
    return moment()
      .subtract(1, "year")
      .year();
  }),
  pledgesFromLastYear: computed.filter("pledges", function(pledge) {
    let previousYear = moment()
      .subtract(1, "year")
      .year();

    let pledgeYear = null;
    if (pledge["get"] && pledge.get("orderDate")) {
      pledgeYear = moment(pledge.get("orderDate")).year();
    } else if (typeof pledge.orderDate === "object") {
      pledgeYear = moment(pledge.orderDate).year();
    }

    return pledgeYear == previousYear;
  }),
  hasPledgesInPastTaxYear: computed('pledgesFromLastYear', function() {
    let lastYearsPledges = this.get('pledgesFromLastYear');
    return !!lastYearsPledges.length;
  })
});
