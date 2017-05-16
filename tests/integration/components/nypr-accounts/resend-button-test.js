import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage }  from 'dummy/initializers/ember-cli-mirage';
import RSVP from 'rsvp';
import wait from 'ember-test-helpers/wait';

moduleForComponent('nypr-accounts/resend-button', 'Integration | Component | resend button', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{nypr-accounts/resend-button}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#nypr-accounts/resend-button}}
      template block text
    {{/nypr-accounts/resend-button}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});

test('it sends the given email address to the given endpoint when clicked', function(assert) {
  let fakeEndpoint = 'http://example.com/resender';
  let fakeEmail = 'test@example.com';

  this.set('target', fakeEndpoint);
  this.set('email', fakeEmail);

  this.render(hbs`
    {{#nypr-accounts/resend-button target=target email=email autoReset=false}}
      Resend Email.
    {{/nypr-accounts/resend-button}}
  `);

  let requests = [];
  this.server.get(fakeEndpoint, (schema, request) => {
    requests.push(request.queryParams);
    return {};
  }, 200);

  this.$('button').click();

  return wait().then(() => {
    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0], {email: fakeEmail});
  });
});

test('it changes to the sent message when clicked', function(assert) {
  let fakeEndpoint = 'http://example.com/resender';
  let fakeEmail = 'test@example.com';
  let successMessage = 'Email Sent';

  this.set('target', fakeEndpoint);
  this.set('email', fakeEmail);
  this.set('successMessage', successMessage);

  this.render(hbs`
    {{#nypr-accounts/resend-button target=target email=email successMessage=successMessage autoReset=false }}
      Resend Email.
    {{/nypr-accounts/resend-button}}
  `);

  this.server.get(fakeEndpoint, {}, 200);

  this.$('button').click();

  return wait().then(() => {
    assert.equal(this.$().text().trim(), successMessage);
  });
});

test('it works with a passed in action', function(assert) {
  let resendCalled = 0;
  let resendAction = function() {
    resendCalled++;
    return RSVP.resolve();
  };
  let successMessage = 'Email Sent';

  this.set('resendAction', resendAction);
  this.set('successMessage', successMessage);

  this.render(hbs`
    {{#nypr-accounts/resend-button resendAction=(action resendAction) successMessage=successMessage autoReset=false }}
      Resend Email.
    {{/nypr-accounts/resend-button}}
  `);

  this.$('button').click();

  return wait().then(() => {
    assert.equal(resendCalled, 1, 'it should call the resend function once');
    assert.equal(this.$().text().trim(), successMessage, 'it should display the success message');
  });
});


test('it changes to the error message when clicked and endpoint returns an error', function(assert) {
  let fakeEndpoint = 'http://example.com/resender';
  let fakeEmail = 'test@example.com';
  let errorMessage = 'Email Not Sent';

  this.set('target', fakeEndpoint);
  this.set('email', fakeEmail);
  this.set('errorMessage', errorMessage);

  this.render(hbs`
    {{#nypr-accounts/resend-button target=target email=email errorMessage=errorMessage autoReset=false}}
      Resend Email.
    {{/nypr-accounts/resend-button}}
  `);

  this.server.get(fakeEndpoint, {}, 400);

  this.$('button').click();

  return wait().then(() => {
    assert.equal(this.$().text().trim(), errorMessage);
  });
});

test('it resets to the original message', function(assert) {
  let fakeEndpoint = 'http://example.com/resender';
  let fakeEmail = 'test@example.com';
  let errorMessage = 'Email Not Sent';

  this.set('target', fakeEndpoint);
  this.set('email', fakeEmail);
  this.set('errorMessage', errorMessage);
  this.set('resetDelay', 0);

  this.render(hbs`
    {{#nypr-accounts/resend-button target=target email=email errorMessage=errorMessage resetDelay=resetDelay}}
      Resend Email.
    {{/nypr-accounts/resend-button}}
  `);

  this.server.get(fakeEndpoint, {}, 200);

  this.$('button').click();

  return wait().then(() => {
    assert.equal(this.$().text().trim(), 'Resend Email.');
  });
});
