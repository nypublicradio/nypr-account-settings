import {
  click,
  fillIn,
  find,
  findAll,
  visit
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import sinon from 'sinon';

module('Acceptance | server error', function(hooks) {
  setupApplicationTest(hooks);

  test('server errors when updating user model', async function(assert) {
    const EMAIL = 'foo@foo.com';
    const SECOND_EMAIL = 'bar@bar.com';
    const PASSWORD = '1234567890';
    const ERROR_MESSAGE = 'Account with email exists. Please try another.';

    server.create('user');
    this.owner.lookup('controller:application').set('authenticate', sinon.stub().throws({
      error: {
        code: "AccountExists",
        message: ERROR_MESSAGE
      }
    }));

    await visit('/');

    await click('[data-test-selector=nypr-card-button]');
    await click('input[name=email]');
    await fillIn('input[name=email]', EMAIL);
    await fillIn('input[name=confirmEmail]', EMAIL);
    await click('button[data-test-selector=save]');
    await fillIn('.ember-modal-wrapper input', PASSWORD);
    await click('[data-test-selector=check-pw]');
    assert.equal(find('.nypr-input-error').textContent.trim(), ERROR_MESSAGE);
    await click('input[name=email]');
    await fillIn('input[name=email]', SECOND_EMAIL);
    await fillIn('input[name=confirmEmail]', SECOND_EMAIL);
    await fillIn('input[name=email]', EMAIL);
    assert.equal(findAll('input[name=confirmEmail]').length, 1, 'confirm email should be visible after editing email field to match invalid address');
    await click('[data-test-selector="rollback"]');
    assert.notEqual(find('input[name=email]').value, EMAIL, 'should not maintian old value');
  });
});
