import Ember from 'ember';
import computed from 'ember-computed';
import layout from '../../../templates/components/nypr-accounts/membership-card';

export default Ember.Component.extend({
  layout,
  activePledges: computed('pledges', function() {
    return this.get('pledges').filterBy('isActive', true);
  }),
  numberOfActivePledges: computed('activePledges', function() {
    return this.get('activePledges').length;
  }),
  numberOfTotalPledges: computed('pledges.length', function() {
    return this.get('pledges.length');
  }),
  hasMultipleActivePledges: computed('numberOfActivePledges', function() {
    return this.get('numberOfActivePledges') >= 2;
  }),
  hasSingleActivePledge: computed('numberOfActivePledges', function() {
    return this.get('numberOfActivePledges') === 1;
  }),
  hasExpiredPledges: computed('numberOfTotalPledges', function() {
    return this.get('numberOfTotalPledges');
  }),
});
