import Ember from 'ember';
import computed from 'ember-computed';
import layout from '../../../templates/components/nypr-accounts/membership-card';

export default Ember.Component.extend({
  layout,
  orderDateSorting: ['orderDate:desc'],
  sortedPledges: computed.sort('pledges', 'orderDateSorting'),
  mostRecentPledge: computed('sortedPledges', function() {
    return this.get('sortedPledges').get('firstObject');
  }),
  activePledges: computed.filterBy('sortedPledges', 'isActive', true),
  activeSustainingPledges: computed.filterBy('activePledges', 'orderType', 'sustainer'),
  activeOneTimePledges: computed.filterBy('activePledges', 'orderType', 'onetime'),
  isLapsedOneTimeMember: computed('pledges', 'activePledges', function() {
    return this.get('sortedPledges').length > 0 && this.get('activePledges').length === 0;
  }),
});
