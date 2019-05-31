import Component from '@ember/component';
import layout from '../../../templates/components/nypr-accounts/membership-card/giving-history';
import { get } from '@ember/object';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  init() {
    this._super(...arguments);
    this.set('orderDateSorting', ["orderDate:desc"]);
  },
  orderDateSorting: null,
  sortedPledges: computed.sort("pledges", "orderDateSorting"),
  sortedSustainingPledges: computed.filterBy(
    "sortedPledges",
    "orderType",
    "sustainer"
  ),
  sortedSustainingPayments: computed("sortedSustainerPledges", function() {
    return this.get("pledges").filter(pledge => {
      return (get(pledge, "orderType") === "sustainer" &&
              get(pledge, "isPayment") === true);
    });
  }),
  sortedOneTimePledges: computed.filterBy(
    "sortedPledges",
    "orderType",
    "onetime"
  ),
});
