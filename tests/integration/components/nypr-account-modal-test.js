import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | account modal', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{nypr-account-modal}}`);

    assert.equal(find('.nypr-account-wrapper').textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#nypr-account-modal as |m|}}
        {{#m.body}}
          body
        {{/m.body}}
        {{#m.footer}}
          footer
        {{/m.footer}}
      {{/nypr-account-modal}}
    `);

    assert.equal(find('.nypr-account-modal-body').textContent.trim(), 'body');
    assert.equal(find('.nypr-account-modal-footer').textContent.trim(), 'footer');
  });

  test('it accepts other params', async function(assert) {
    assert.expect(2);

    this.set('close', () => assert.ok('close was called'));
    await render(hbs`
      {{#nypr-account-modal closeAction=(action close) title="foo" as |m|}}
        {{#m.body}}
          body
        {{/m.body}}
        {{#m.footer}}
          footer
        {{/m.footer}}
      {{/nypr-account-modal}}
    `);

    assert.equal(find('.nypr-account-modal-title').textContent.trim(), 'foo');

    await click('.nypr-account-modal-close');
  });
});
