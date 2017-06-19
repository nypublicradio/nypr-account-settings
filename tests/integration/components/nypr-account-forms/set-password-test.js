import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage }  from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';

moduleForComponent('nypr-account-forms/set-password', 'Integration | Component | account set password form', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
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
  this.set('authAPI', authAPI);
  this.set('username', testUsername);
  this.set('code', testCode);
  this.render(hbs`{{nypr-account-forms/set-password username=username code=code authAPI=authAPI}}`);

  let requests = [];
  let url = `${authAPI}/v1/password/change-temp`;
  this.server.post(url, (schema, request) => {
    requests.push(request);
    return {};
  }, 200);
  this.$('label:contains(New Password) + input').val(testPassword);
  this.$('label:contains(New Password) + input').blur();
  this.$('button:contains(Create password)').click();

  return wait().then(() => {
    assert.equal(requests.length, 1);
    assert.deepEqual(JSON.parse(requests[0].requestBody), {username: testUsername, temp: testCode, new: testPassword});
  });
});


test("it shows the 'oops' page when api returns an unauthorized error", function(assert) {
  this.set('authAPI', authAPI);
  this.set('username', testUsername);
  this.set('code', testCode);
  this.render(hbs`{{nypr-account-forms/set-password username=username code=code authAPI=authAPI}}`);

  let requests = [];
  let url = `${authAPI}/v1/password/change-temp`;
  this.server.post(url, (schema, request) => {
    requests.push(request);
    return {
      "errors": {
        "code": "UnauthorizedAccess",
        "message": "Incorrect username or password."
      }
    };
  }, 401);

  this.$('label:contains(New Password) + input').val(testPassword);
  this.$('label:contains(New Password) + input').blur();
  this.$('button:contains(Create password)').click();

  return wait().then(() => {
    assert.equal(requests.length, 1, 'it should call the api set password url');
    assert.equal(this.$('.account-form-heading:contains(Oops!)').length, 1, 'the heading should say oops');
  });
});

