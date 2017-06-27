import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nypr-accounts/social-card', 'Integration | Component | nypr accounts/social card', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{nypr-accounts/social-card}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#nypr-accounts/social-card}}
      template block text
    {{/nypr-accounts/social-card}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
