import Ember from 'ember';
import layout from '../../templates/components/membership-card/giving-history';
import computed from "ember-computed";

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
});
