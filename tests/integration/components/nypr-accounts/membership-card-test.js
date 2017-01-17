import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nypr-accounts/membership-card', 'Integration | Component | nypr accounts/membership card', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{nypr-accounts/membership-card}}`);

  assert.equal(this.$().text().trim(), 'Membership Info');

  // Template block usage:
  this.render(hbs`
    {{#nypr-accounts/membership-card}}
      template block text
    {{/nypr-accounts/membership-card}}
  `);

  assert.equal(this.$('.nypr-membership-info-body').text().trim(), 'template block text');
});

test('displays membership details if membership active', function(assert) {

});

test('displays renewal message if recent member', function(assert) {

});

test('displays donation callout for non-members', function(assert) {

});

test('displays expiring warning on near-expired membership', function(assert) {

});

test('pledge update link is populated with order_id', function(assert) {

});

test('payment history link works', function(assert) {

});

test('displays full payment history', function(assert) {

});

test('displays help modal when clicked on', function(assert) {

});
