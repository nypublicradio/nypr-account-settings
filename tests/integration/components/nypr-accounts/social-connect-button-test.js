import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nypr-accounts/social-connect-button', 'Integration | Component | nypr accounts/social connect button', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{nypr-accounts/social-connect-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#nypr-accounts/social-connect-button}}
      template block text
    {{/nypr-accounts/social-connect-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
