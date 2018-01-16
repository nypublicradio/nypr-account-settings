import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nypr-accounts/membership-card/download-tax-link-modal', 'Integration | Component | nypr accounts/membership card/download tax link modal', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{nypr-accounts/membership-card/download-tax-link-modal}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#nypr-accounts/membership-card/download-tax-link-modal}}
      template block text
    {{/nypr-accounts/membership-card/download-tax-link-modal}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
