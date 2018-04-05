import { get } from '@ember/object';
import { getOwner } from '@ember/application';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from "../../../templates/components/nypr-accounts/membership-card/current-status-detail";

export default Component.extend({
  layout,
  cookies: service(),

  init() {
    this._super(...arguments);
    this.set('orderDateSorting', ["orderDate:desc"]);
  },

  willRender() {
    // When the tab or window gains focus, re-run the hasMadeRecentPledge
    // computed function to check if, while the tab was unfocused, the user
    // completed a pledge.
    window.onfocus = () => this.notifyPropertyChange("hasMadeRecentPledge");

    this._super(...arguments);
  },
  willClearRender() {
    // Clear the pledge noficiation function from onfocus when component is
    // destroyed.
    window.onfocus = null;
    this._super(...arguments);
  },
  pledgePrefix: computed(function() {
    let { environment } = getOwner(this).resolveRegistration(
      "config:environment"
    );
    return environment === "development" ? "pledge-demo" : "pledge3";
  }),
  orderDateSorting: null,
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
      return get(pledge, "orderType") === "sustainer" &&
      get(pledge, "isSustainer") === true;
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
    let cookieService = this.get('cookies');
    let cookies = cookieService.read();
    return cookies["recentPledge"] === "true";
  })
});
