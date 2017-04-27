import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('membership-card/current-status-detail', 'Integration | Component | membership card/current status detail', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{membership-card/current-status-detail}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#membership-card/current-status-detail}}
      template block text
    {{/membership-card/current-status-detail}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
