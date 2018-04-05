import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | nypr account forms/thanks', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{nypr-account-forms/thanks}}`);
    assert.equal(findAll('.account-form').length, 1);
  });
});
