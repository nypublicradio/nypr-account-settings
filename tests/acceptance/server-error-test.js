import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { Response } from 'ember-cli-mirage';

let adapterException;
const EXPECTED_EXCEPTION = `Ember Data Request PATCH /users/1 returned a 401
Payload (application/json)
[object Object]`;

moduleForAcceptance('Acceptance | server error', {
  beforeEach() {
    adapterException = Ember.Test.adapter.exception;
    Ember.Test.adapter.exception = arg => {
      if (arg.message !== EXPECTED_EXCEPTION) {
        throw arg;
      }
    };
  },
  
  afterEach() {
    Ember.Test.adapter.exception = adapterException;
    Ember.run(this.application, 'destroy');
  }
});

test('server errors when updating user model', function(assert) {
  const EMAIL = 'foo@foo.com';
  const SECOND_EMAIL = 'bar@bar.com';
  const PASSWORD = '1234567890';
  const ERROR_MESSAGE = 'Account with email exists. Please try another.';
  
  server.create('user');
  server.patch('/v1/user', () => new Response(401, {}, {
    "errors": {
      "code": "AccountExists", 
      "message": ERROR_MESSAGE
    }
  }));
  
  visit('/');
  
  andThen(() => {
    click('[data-test-selector=nypr-card-button]');
    click('input[name=email]');
    fillIn('input[name=email]', EMAIL);
  });
  
  andThen(() => {
    fillIn('input[name=confirmEmail]', EMAIL);
    click('button[data-test-selector=save]');
  });
  
  andThen(() => {
    fillIn('.ember-modal-wrapper input', PASSWORD);
    click('[data-test-selector=check-pw]');
  });
  
  andThen(() => {
    assert.equal(find('.nypr-input-error').text().trim(), ERROR_MESSAGE);
    click('input[name=email]');
    fillIn('input[name=email]', SECOND_EMAIL);
  });
  
  andThen(() => {
    fillIn('input[name=confirmEmail]', SECOND_EMAIL);
  });
  
  andThen(() => {
    fillIn('input[name=email]', EMAIL);
  });
  
  andThen(() => {
    assert.equal(find('input[name=confirmEmail]').length, 1, 'confirm email should be visible after editing email field to match invalid address');
  });
  
  andThen(() => {
    click('[data-test-selector="rollback"]');
  });
  
  andThen(() => {
    assert.notEqual(find('input[name=email]').val(), EMAIL, 'should not maintian old value');
  });
});
