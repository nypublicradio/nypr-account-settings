import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | account validation form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let authAPI = 'http://example.com';
    this.set('authAPI', authAPI);
    this.server.get(`${authAPI}/v1/confirm/sign-up`, {}, 200);

    await render(hbs`{{nypr-account-forms/validate authAPI=authAPI}}`);
    assert.ok(find('.account-form'));
  });

  test('it sends the correct values to the endpoint to verify the account', async function(assert) {
    const testUser = 'UserName';
    const testConfirmation = 'QWERTYUIOP';
    let authAPI = 'http://example.com';
    this.set('username', testUser);
    this.set('confirmation', testConfirmation);
    this.set('authAPI', authAPI);

    let requests = [];
    let url = `${authAPI}/v1/confirm/sign-up`;
    this.server.get(url, (schema, request) => {
      requests.push(request);
      return {};
    }, 200);

    await render(hbs`{{nypr-account-forms/validate username=username confirmation=confirmation authAPI=authAPI}}`);

    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0].queryParams, {confirmation: testConfirmation, username: testUser});
  });

  test('it shows the login form when verification succeeds', async function(assert) {
    const testUser = 'UserName';
    const testConfirmation = 'QWERTYUIOP';
    let authAPI = 'http://example.com';
    this.set('username', testUser);
    this.set('confirmation', testConfirmation);
    this.set('authAPI', authAPI);

    let requests = [];
    let url = `${authAPI}/v1/confirm/sign-up`;
    this.server.get(url, (schema, request) => {
      requests.push(request);
      return {};
    }, 200);

    await render(hbs`{{nypr-account-forms/validate username=username confirmation=confirmation authAPI=authAPI}}`);

    assert.ok(find('.account-form'), 'it should show an account form');
    assert.ok(find('button[type="submit"]').textContent.trim(), 'it should show a login button');
  });

  test("it shows the 'oops' page when api returns an expired error", async function(assert) {
    const testUser = 'UserName';
    const testConfirmation = 'QWERTYUIOP';
    let authAPI = 'http://example.com';
    this.set('username', testUser);
    this.set('confirmation', testConfirmation);
    this.set('authAPI', authAPI);

    let requests = [];
    let url = `${authAPI}/v1/confirm/sign-up`;
    this.server.get(url, (schema, request) => {
      requests.push(request);
      return {
        "errors": {
          "code": "ExpiredCodeException",
          "message": "Invalid code provided, please request a code again."
        }
      };
    }, 400);

    await render(hbs`{{nypr-account-forms/validate username=username confirmation=confirmation authAPI=authAPI}}`);

    assert.equal(requests.length, 1, 'it should call the api reset url');
    assert.equal(find('.account-form-heading').textContent.trim(), 'Oops!', 'the heading should say oops');
  });
});
