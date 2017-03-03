import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

moduleForComponent('nypr-account-forms/forgot', 'Integration | Component | account forgot password form', {
  integration: true,
  beforeEach() {
    this.requests = [];
    this.xhr = sinon.useFakeXMLHttpRequest();
    this.xhr.onCreate = $.proxy(function(xhr) {
        this.requests.push(xhr);
    }, this);
  },
  afterEach() {
    this.xhr.restore();
  }
});

test('it renders', function(assert) {
  this.render(hbs`{{nypr-account-forms/forgot}}`);
  assert.equal(this.$('.account-form').length, 1);
});

test('submitting the form sends the correct values to the correct endpoint', function(assert) {
  let authAPI = 'http://example.com';
  this.set('authAPI', authAPI);
  this.render(hbs`{{nypr-account-forms/forgot authAPI=authAPI}}`);

  let testEmail = 'test@example.com';
  this.$('label:contains(Email) + input').val(testEmail);
  this.$('label:contains(Email) + input').blur();
  this.$('button:contains(Submit)').click();

  const request = this.requests[0];

  const expectedUrl = `${authAPI}/v1/password/forgot?email=${testEmail}`;
  const expectedMethod = 'GET';

  assert.equal(expectedUrl, request.url);
  assert.equal(expectedMethod, request.method);
});
