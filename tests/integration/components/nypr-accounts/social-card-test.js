import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | nypr accounts/social card', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{nypr-accounts/social-card}}`);

    assert.equal(findAll('.nypr-social-card__header').length, 1);
  });


  test('it yields a connect button', async function(assert) {
    await render(hbs`
      {{#nypr-accounts/social-card as |card|}}
        {{card.connect-button}}
      {{/nypr-accounts/social-card}}`);

    assert.equal(findAll('.nypr-social-connect__button').length, 1);
  });

  test('it yields three connect buttons', async function(assert) {
    await render(hbs`
      {{#nypr-accounts/social-card as |card|}}
        {{card.connect-button}}
        {{card.connect-button}}
        {{card.connect-button}}
      {{/nypr-accounts/social-card}}`);

    assert.equal(findAll('.nypr-social-connect__button').length, 3);
  });
});
