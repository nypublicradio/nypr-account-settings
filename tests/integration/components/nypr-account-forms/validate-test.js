import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage }  from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';

moduleForComponent('nypr-account-forms/validate', 'Integration | Component | account validation form', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it renders', function(assert) {
  this.render(hbs`{{nypr-account-forms/validate}}`);
  assert.equal(this.$('.account-form').length, 1);
});

test('it sends the correct values to the endpoint to verify the account', function(assert) {
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

  this.render(hbs`{{nypr-account-forms/validate username=username confirmation=confirmation authAPI=authAPI}}`);

  return wait().then(() => {
    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0].queryParams, {confirmation: testConfirmation, username: testUser});
  });
});

test('it shows the login form and success alert when verification succeeds', function(assert) {
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

  this.render(hbs`{{nypr-account-forms/validate username=username confirmation=confirmation authAPI=authAPI}}`);

  return wait().then(() => {
    assert.equal(this.$('.account-form').length, 1, 'it should show an account form');
    assert.equal(this.$('button:contains(Log in)').length, 1, 'it should show a login button');
    assert.equal(this.$('.alert-success:contains(Your email has been verified and your online account is now active.)').length, 1, 'it should show a success alert');
  });
});

test("it shows the 'oops' page when api returns an expired error", function(assert) {
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

  this.render(hbs`{{nypr-account-forms/validate username=username confirmation=confirmation authAPI=authAPI}}`);

  return wait().then(() => {
    assert.equal(requests.length, 1, 'it should call the api reset url');
    assert.equal(this.$('.account-form-heading:contains(Oops!)').length, 1, 'the heading should say oops');
  });
});
