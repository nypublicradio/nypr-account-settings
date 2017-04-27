import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('membership-card/help-modal', 'Integration | Component | membership card/help modal', {
  integration: true
});

test('it renders', function(assert) {

  // Template block usage:
  this.render(hbs`
    {{#membership-card/help-modal}}
      template block text
    {{/membership-card/help-modal}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
