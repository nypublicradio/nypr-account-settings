import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | membership card/donation button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{nypr-accounts/membership-card/donation-button}}`);

    assert.equal(find('.pledge-donate-button').textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#nypr-accounts/membership-card/donation-button}}
        template block text
      {{/nypr-accounts/membership-card/donation-button}}
    `);

    assert.equal(find('.pledge-donate-button').textContent.trim(), 'template block text');
  });
});
