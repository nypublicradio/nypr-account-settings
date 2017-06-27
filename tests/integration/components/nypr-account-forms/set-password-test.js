import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage }  from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';

moduleForComponent('nypr-account-forms/set-password', 'Integration | Component | account set password form', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
    this.session = { authorize(_, cb) { cb('authorization', 'foo');} };
  },
  afterEach() {
    this.server.shutdown();
  }
});

const testEmail = 'test@example.com';
const testCode = 'QWERTYUIOP';
const testUsername = 'name';
const testPassword = 'password123';
const testSiteName = 'WNYC';
const authAPI = 'http://example.com';

test('it renders', function(assert) {
  this.render(hbs`{{nypr-account-forms/set-password}}`);
  assert.equal(this.$('.account-form').length, 1);
});

test('it shows the correct message', function(assert) {
  this.set('siteName', testSiteName);
  this.set('email', testEmail);
  this.render(hbs`{{nypr-account-forms/set-password siteName=siteName email=email}}`);
  assert.equal(this.$('.account-form-description').text().trim(), `Create a ${testSiteName} password for ${testEmail}.`);
});

test('submitting the form sends the correct values to the correct endpoint', function(assert) {
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
  this.render(hbs`{{nypr-account-forms/set-password
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
  this.$('label:contains(New Password) + input').val(testPassword);
  this.$('label:contains(New Password) + input').blur();
  this.$('button:contains(Create password)').click();

  return wait().then(() => {
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
});

test('submitting the form calls the afterSetPassword action', function(assert) {
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

  this.render(hbs`{{nypr-account-forms/set-password
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
  this.$('label:contains(New Password) + input').val(testPassword);
  this.$('label:contains(New Password) + input').blur();
  this.$('button:contains(Create password)').click();

  return wait().then(() => {
    assert.equal(afterSetPasswordCalls, 1);
  });
});


test("it shows the 'oops' page when api returns an unauthorized error", function(assert) {
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
  this.render(hbs`{{nypr-account-forms/set-password
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

  this.$('label:contains(New Password) + input').val(testPassword);
  this.$('label:contains(New Password) + input').blur();
  this.$('button:contains(Create password)').click();

  return wait().then(() => {
    assert.equal(requests, 2, 'it should call the api set password url');
    assert.equal(this.$('.account-form-heading:contains(Oops!)').length, 1, 'the heading should say oops');
  });
});
