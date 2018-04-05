import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | membership card/help modal', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // Template block usage:
    await render(hbs`
      {{#nypr-accounts/membership-card/help-modal}}
        template block text
      {{/nypr-accounts/membership-card/help-modal}}
    `);

    assert.equal(find('.ember-view').textContent.trim(), 'template block text');
  });
});
