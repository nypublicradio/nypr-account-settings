import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage }  from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';

moduleForComponent('nypr-account-forms/reset', 'Integration | Component | account reset password form', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it renders', function(assert) {
  let testEmail = 'test@example.com';
  let testConfirmation = 'QWERTYUIOP';
  this.set('email', testEmail);
  this.set('confirmation', testConfirmation);  this.render(hbs`{{nypr-account-forms/reset email=email confirmation=confirmation}}`);
  assert.equal(this.$('.account-form').length, 1);
});

test('submitting the form sends the correct values to the correct endpoint', function(assert) {
  let testEmail = 'test@example.com';
  let testConfirmation = 'QWERTYUIOP';
  let authAPI = 'http://example.com';
  this.set('authAPI', authAPI);
  this.set('email', testEmail);
  this.set('confirmation', testConfirmation);
  this.render(hbs`{{nypr-account-forms/reset email=email confirmation=confirmation authAPI=authAPI}}`);

  let requests = [];
  let url = `${authAPI}/v1/confirm/password-reset`;
  this.server.post(url, (schema, request) => {
    requests.push(request);
    return {};
  }, 200);
  let testPassword = 'password123';
  this.$('label:contains(New Password) + input').val(testPassword);
  this.$('label:contains(New Password) + input').blur();
  this.$('button:contains(Reset password)').click();

  return wait().then(() => {
    assert.equal(requests.length, 1);
    assert.deepEqual(JSON.parse(requests[0].requestBody), {email: testEmail, confirmation: testConfirmation, new_password: testPassword});
  });
});

test("it shows the 'oops' page when api returns an expired error", function(assert) {
  let testEmail = 'test@example.com';
  let testConfirmation = 'QWERTYUIOP';
  let authAPI = 'http://example.com';
  this.set('authAPI', authAPI);
  this.set('email', testEmail);
  this.set('confirmation', testConfirmation);
  this.render(hbs`{{nypr-account-forms/reset email=email confirmation=confirmation authAPI=authAPI}}`);

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
  this.$('label:contains(New Password) + input').val(testPassword);
  this.$('label:contains(New Password) + input').blur();
  this.$('button:contains(Reset password)').click();

  return wait().then(() => {
    assert.equal(requests.length, 1, 'it should call the api reset url');
    assert.equal(this.$('.account-form-heading:contains(Oops!)').length, 1, 'the heading should say oops');
  });
});
