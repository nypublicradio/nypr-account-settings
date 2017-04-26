import Ember from "ember";
import computed from "ember-computed";
import { getCookie } from "nypr-account-settings/utils/cookies";
import layout from "../../templates/components/nypr-accounts/membership-card";

export default Ember.Component.extend({
  layout,
  orderDateSorting: ["orderDate:desc"],
  sortedPledges: computed.sort("pledges", "orderDateSorting"),
  sortedSustainingPledges: computed.filterBy(
    "sortedPledges",
    "orderType",
    "sustainer"
  ),
  sortedOneTimePledges: computed.filterBy(
    "sortedPledges",
    "orderType",
    "onetime"
  ),
  mostRecentPledge: computed.reads("sortedPledges.firstObject"),
  activePledges: computed.filterBy("sortedPledges", "isActiveMember", true),
  activeSustainingPledges: computed.filterBy(
    "activePledges",
    "orderType",
    "sustainer"
  ),
  activeOneTimePledges: computed.filterBy(
    "activePledges",
    "orderType",
    "onetime"
  ),
  isLapsedOneTimeMember: computed("sortedPledges", "activePledges", function() {
    return (
      this.get("sortedPledges.length") > 0 &&
      this.get("activePledges.length") === 0
    );
  }),
  isLapsedSustainer: computed(
    "sortedSustainingPledges",
    "activeSustainingPledges",
    function() {
      return (
        this.get("sortedSustainingPledges.length") > 0 &&
        this.get("activeSustainingPledges.length") === 0
      );
    }
  ),
  showPaymentHistory: false,
  mostRecentSustainingPledgesPerOrderCode: computed(
    "activeSustainingPledges",
    function() {
      let orderCodes = [];
      let latestPledgePerOrderCode = [];
      this.get("activeSustainingPledges").forEach(pledge => {
        let pledgeOrderCode = Ember.get(pledge, "orderCode");
        if (!orderCodes.includes(pledgeOrderCode)) {
          orderCodes.push(pledgeOrderCode);
          latestPledgePerOrderCode.push(pledge);
        }
      });
      return latestPledgePerOrderCode;
    }
  ),
  hasMadeRecentPledge: computed(function() {
    return getCookie("recentPledge") === "true";
  })
});
