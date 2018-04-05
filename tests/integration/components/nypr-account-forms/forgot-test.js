import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import * as fetch from 'fetch';

module('Integration | Component | account forgot password form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{nypr-account-forms/forgot}}`);
    assert.equal(findAll('.account-form').length, 1);
  });

  test('submitting the form sends the correct values to the correct endpoint', async function(assert) {
    let fetchSpy = sinon.stub(fetch, 'default').resolves({});

    let authAPI = 'http://example.com';
    this.set('authAPI', authAPI);
    await render(hbs`{{nypr-account-forms/forgot authAPI=authAPI}}`);

    let testEmail = 'test@example.com';
    await fillIn('input[type="email"]', testEmail);
    await click('button[type="submit"]');

    assert.ok(fetchSpy.calledOnce);
    assert.ok(fetchSpy.calledWith(`${authAPI}/v1/password/forgot?email=${testEmail}`, {method: 'GET', mode: 'cors'}))
    fetchSpy.restore();
  });
});
