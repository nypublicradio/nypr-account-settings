import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | account set password form', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.session = { authorize(_, cb) { cb('authorization', 'foo');} };
  });

  const testEmail = 'test@example.com';
  const testCode = 'QWERTYUIOP';
  const testUsername = 'name';
  const testPassword = 'password123';
  const testSiteName = 'WNYC';
  const authAPI = 'http://example.com';

  test('it renders', async function(assert) {
    await render(hbs`{{nypr-account-forms/set-password}}`);
    assert.ok(find('.account-form'));
  });

  test('it shows the correct message', async function(assert) {
    this.set('siteName', testSiteName);
    this.set('email', testEmail);
    await render(hbs`{{nypr-account-forms/set-password siteName=siteName email=email}}`);
    assert.equal(find('.account-form-description').textContent.trim(), `Create a ${testSiteName} password for ${testEmail}.`);
  });

  test('submitting the form sends the correct values to the correct endpoint', async function(assert) {
    this.set('session', this.session);

    // membership values
    const testEmailId = '123';
    const testVerification = 'QWERTYUIOP';
    let membershipAPI = 'http://example.com';
    this.set('emailId', testEmailId);
    this.set('verificationToken', testVerification);
    this.set('membershipAPI', membershipAPI);

    // auth values
    this.set('authAPI', authAPI);
    this.set('username', testUsername);
    this.set('email', testEmail);
    this.set('code', testCode);
    await render(hbs`{{nypr-account-forms/set-password
      session=session
      username=username
      email=email
      code=code
      emailId=emailId
      verificationToken=verificationToken
      membershipAPI=membershipAPI
      authAPI=authAPI}}`);

    let requests = {password: null, claimEmail: null};
    let passwordUrl = `${authAPI}/v1/password/change-temp`;
    this.server.post(passwordUrl, (schema, request) => {
      requests.password = request;
      return {};
    }, 200);

    let claimEmailUrl = `${membershipAPI}/v1/emails/${testEmailId}/verify/`;
    this.server.patch(claimEmailUrl, (schema, request) => {
      requests.claimEmail = request;
      return {};
    }, 200);

    await fillIn('input[name="password"]', testPassword);
    await click('button[type="submit"]');

    assert.equal(Object.keys(requests).length, 2);
    assert.deepEqual(JSON.parse(requests.password.requestBody), {username: testUsername, email: testEmail, temp: testCode, new: testPassword});
    assert.deepEqual(JSON.parse(requests.claimEmail.requestBody),{
      data: {
        id: Number(testEmailId),
        type: "EmailAddress",
        attributes: {
          "verification_token": testVerification
        }
      }
    });
  });

  test('submitting the form calls the afterSetPassword action', async function(assert) {
    this.set('session', this.session);

    // membership values
    const testEmailId = '123';
    const testVerification = 'QWERTYUIOP';
    let membershipAPI = 'http://example.com';
    this.set('emailId', testEmailId);
    this.set('verificationToken', testVerification);
    this.set('membershipAPI', membershipAPI);

    // auth values
    this.set('authAPI', authAPI);
    this.set('username', testUsername);
    this.set('email', testEmail);
    this.set('code', testCode);
    let afterSetPasswordCalls = 0;
    this.set('afterSetPassword', () => afterSetPasswordCalls++);

    await render(hbs`{{nypr-account-forms/set-password
      session=session
      username=username
      email=email
      code=code
      emailId=emailId
      verificationToken=verificationToken
      membershipAPI=membershipAPI
      authAPI=authAPI
      afterSetPassword=afterSetPassword}}`);

    let passwordUrl = `${authAPI}/v1/password/change-temp`;
    this.server.post(passwordUrl, {}, 200);
    let claimEmailUrl = `${membershipAPI}/v1/emails/${testEmailId}/verify/`;
    this.server.patch(claimEmailUrl, {}, 200);

    await fillIn('input[name="password"]', testPassword);
    await click('button[type="submit"]');

    assert.equal(afterSetPasswordCalls, 1);
  });


  test("it shows the 'oops' page when api returns an unauthorized error", async function(assert) {
    this.set('session', this.session);

    // membership values
    const testEmailId = '123';
    const testVerification = 'QWERTYUIOP';
    let membershipAPI = 'http://example.com';
    this.set('emailId', testEmailId);
    this.set('verificationToken', testVerification);
    this.set('membershipAPI', membershipAPI);

    // auth values
    this.set('authAPI', authAPI);
    this.set('username', testUsername);
    this.set('code', testCode);
    await render(hbs`{{nypr-account-forms/set-password
      session=session
      username=username
      code=code
      emailId=emailId
      verificationToken=verificationToken
      membershipAPI=membershipAPI
      authAPI=authAPI}}`);

    let requests = 0;
    let passwordUrl = `${authAPI}/v1/password/change-temp`;
    this.server.post(passwordUrl, () => {
      requests++;
      return {
        "errors": {
          "code": "UnauthorizedAccess",
          "message": "Incorrect username or password."
        }
      };
    }, 401);
    let claimEmailUrl = `${membershipAPI}/v1/emails/${testEmailId}/verify/`;
    this.server.patch(claimEmailUrl, () => requests++, 200);

    await fillIn('input[name="password"]', testPassword);
    await click('button[type="submit"]');

    assert.equal(requests, 2, 'it should call the api set password url');
    assert.equal(find('.account-form-heading').textContent.trim(), 'Oops!', 'the heading should say oops');
  });
});
