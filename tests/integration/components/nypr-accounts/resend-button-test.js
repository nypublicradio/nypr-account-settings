import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';

module('Integration | Component | resend button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{nypr-accounts/resend-button}}`);

    assert.equal(find('.resend-button').textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#nypr-accounts/resend-button}}
        template block text
      {{/nypr-accounts/resend-button}}
    `);

    assert.equal(find('.resend-button').textContent.trim(), 'template block text');
  });

  test('it sends the given email address to the given endpoint when clicked', async function(assert) {
    let fakeEndpoint = 'http://example.com/resender';
    let fakeEmail = 'test@example.com';

    this.set('target', fakeEndpoint);
    this.set('email', fakeEmail);

    await render(hbs`
      {{#nypr-accounts/resend-button target=target email=email autoReset=false}}
        Resend Email.
      {{/nypr-accounts/resend-button}}
    `);

    let requests = [];
    this.server.get(fakeEndpoint, (schema, request) => {
      requests.push(request.queryParams);
      return {};
    }, 200);

    await click('button');

    assert.equal(requests.length, 1);
    assert.deepEqual(requests[0], {email: fakeEmail});
  });

  test('it changes to the sent message when clicked', async function(assert) {
    let fakeEndpoint = 'http://example.com/resender';
    let fakeEmail = 'test@example.com';
    let successMessage = 'Email Sent';

    this.set('target', fakeEndpoint);
    this.set('email', fakeEmail);
    this.set('successMessage', successMessage);

    await render(hbs`
      {{#nypr-accounts/resend-button target=target email=email successMessage=successMessage autoReset=false resetDelay=0}}
        Resend Email.
      {{/nypr-accounts/resend-button}}
    `);

    this.server.get(fakeEndpoint, {}, 200);

    await click('.resend-button');

    assert.equal(find('.resend-success').textContent.trim(), successMessage);
  });

  test('it works with a passed in action', async function(assert) {
    let resendCalled = 0;
    let resendAction = function() {
      resendCalled++;
      return RSVP.resolve();
    };
    let successMessage = 'Email Sent';

    this.set('resendAction', resendAction);
    this.set('successMessage', successMessage);

    await render(hbs`
      {{#nypr-accounts/resend-button resendAction=(action resendAction) successMessage=successMessage autoReset=false}}
        Resend Email.
      {{/nypr-accounts/resend-button}}
    `);

    await click('button');

    assert.equal(resendCalled, 1, 'it should call the resend function once');
    assert.equal(find('.resend-success').textContent.trim(), successMessage, 'it should display the success message');
  });


  test('it changes to the error message when clicked and endpoint returns an error', async function(assert) {
    let fakeEndpoint = 'http://example.com/resender';
    let fakeEmail = 'test@example.com';
    let errorMessage = 'Email Not Sent';

    this.set('target', fakeEndpoint);
    this.set('email', fakeEmail);
    this.set('errorMessage', errorMessage);

    await render(hbs`
      {{#nypr-accounts/resend-button target=target email=email errorMessage=errorMessage autoReset=false}}
        Resend Email.
      {{/nypr-accounts/resend-button}}
    `);

    this.server.get(fakeEndpoint, {}, 400);

    await click('button');

    assert.equal(find('.resend-error').textContent.trim(), errorMessage);
  });

  test('it resets to the original message', async function(assert) {
    let fakeEndpoint = 'http://example.com/resender';
    let fakeEmail = 'test@example.com';
    let errorMessage = 'Email Not Sent';

    this.set('target', fakeEndpoint);
    this.set('email', fakeEmail);
    this.set('errorMessage', errorMessage);
    this.set('resetDelay', 0);

    await render(hbs`
      {{#nypr-accounts/resend-button target=target email=email errorMessage=errorMessage resetDelay=resetDelay}}
        Resend Email.
      {{/nypr-accounts/resend-button}}
    `);

    this.server.get(fakeEndpoint, {}, 200);

    await click('button');

    assert.equal(find('.resend-button').textContent.trim(), 'Resend Email.');
  });
});
