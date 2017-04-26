import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('membership-card/donation-button', 'Integration | Component | membership card/donation button', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{membership-card/donation-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#membership-card/donation-button}}
      template block text
    {{/membership-card/donation-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
