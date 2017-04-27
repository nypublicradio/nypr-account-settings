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
});
