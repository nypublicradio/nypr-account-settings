import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render, find, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | account login form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{nypr-account-forms/login}}`);
    assert.ok(find('.account-form'));
  });

  test('submitting the form passes the login values to the authenticator', async function(assert) {
    let authenticate = sinon.stub().resolves();
    let session = {authenticate};
    this.set('session', session);
    await render(hbs`{{nypr-account-forms/login session=session}}`);

    let testEmail = 'test@email.com';
    let testPassword = 'password123';

    await fillIn('input[name=email]', testEmail);
    await fillIn('input[name=password]', testPassword);
    await click('button[type=submit]');

    assert.equal(authenticate.callCount, 1);
    assert.deepEqual(authenticate.firstCall.args, ['authenticator:nypr', testEmail, testPassword]);
  });
});
