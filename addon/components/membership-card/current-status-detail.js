import Ember from "ember";
import computed from "ember-computed";
import { getCookie } from "nypr-account-settings/utils/cookies";
import layout
  from "../../templates/components/membership-card/current-status-detail";

export default Ember.Component.extend({
  layout,
  pledgePrefix: computed(function() {
    let { environment } = Ember.getOwner(this).resolveRegistration(
      "config:environment"
    );
    return environment === "development" ? "pledge-demo" : "pledge3";
  }),
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
  activeSustainingPledges: computed("activePledges", function() {
    return this.get("activePledges").filter(pledge => {
      return (
        Ember.get(pledge, "orderType") === "sustainer" &&
        Ember.get(pledge, "isSustainer") === true
      );
    });
  }),
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
  mostRecentSustainingPledgesPerOrderCode: computed.uniqBy(
    "activeSustainingPledges",
    "orderCode"
  ),
  hasMadeRecentPledge: computed(function() {
    return getCookie("recentPledge") === "true";
  })
});
