import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | account reset password form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let testEmail = 'test@example.com';
    let testConfirmation = 'QWERTYUIOP';
    this.set('email', testEmail);
    this.set('confirmation', testConfirmation);

    await render(hbs`{{nypr-account-forms/reset email=email confirmation=confirmation}}`);
    assert.ok(find('.account-form'));
  });

  test('submitting the form sends the correct values to the correct endpoint', async function(assert) {
    let testEmail = 'test@example.com';
    let testConfirmation = 'QWERTYUIOP';
    let authAPI = 'http://example.com';
    this.set('authAPI', authAPI);
    this.set('email', testEmail);
    this.set('confirmation', testConfirmation);

    await render(hbs`{{nypr-account-forms/reset email=email confirmation=confirmation authAPI=authAPI}}`);

    let requests = [];
    let url = `${authAPI}/v1/confirm/password-reset`;
    this.server.post(url, (schema, request) => {
      requests.push(request);
      return {};
    }, 200);
    let testPassword = 'password123';

    await fillIn('input[name="password"]', testPassword);
    await click('button[type="submit"]');

    assert.equal(requests.length, 1);
    assert.deepEqual(JSON.parse(requests[0].requestBody), {email: testEmail, confirmation: testConfirmation, new_password: testPassword});
  });

  test("it shows the 'oops' page when api returns an expired error", async function(assert) {
    let testEmail = 'test@example.com';
    let testConfirmation = 'QWERTYUIOP';
    let authAPI = 'http://example.com';
    this.set('authAPI', authAPI);
    this.set('email', testEmail);
    this.set('confirmation', testConfirmation);

    await render(hbs`{{nypr-account-forms/reset email=email confirmation=confirmation authAPI=authAPI}}`);

    let requests = [];
    let url = `${authAPI}/v1/confirm/password-reset`;
    this.server.post(url, (schema, request) => {
      requests.push(request);
      return {
        "errors": {
          "code": "ExpiredCodeException",
          "message": "Invalid code provided, please request a code again."
        }
      };
    }, 400);

    let testPassword = 'password123';
    await fillIn('input[name="password"]', testPassword);
    await click('button[type="submit"]');

    assert.equal(requests.length, 1, 'it should call the api reset url');
    assert.equal(find('.account-form-heading').textContent.trim(), 'Oops!', 'the heading should say oops');
  });
});
