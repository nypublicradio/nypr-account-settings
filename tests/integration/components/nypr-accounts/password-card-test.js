import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  find,
  click,
  findAll,
  fillIn,
  triggerEvent
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';
const { Promise } = RSVP;

module('Integration | Component | password card', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    await render(hbs`{{nypr-accounts/password-card}}`);

    assert.ok(find('input'));
  });

  test('renders default values', async function(assert) {
    await render(hbs`{{nypr-accounts/password-card}}`);

    assert.equal(find('input[name=password]').value, '********', 'displays password asterisks');
    assert.ok(find('input[name=password]').hasAttribute('disabled'), 'input is disabled');

    assert.notOk(find('[data-test-selector=rollback]'), 'cancel button should not be visible in default state');
    assert.notOk(find('[data-test-selector=save]'), 'save button should not be visible in default state');
  });

  test('editing states', async function(assert) {
    await render(hbs`{{nypr-accounts/password-card isEditing=true}}`);

    assert.equal(findAll('input').length, 2, 'should see 2 fields');
    assert.notOk(find('input[name=currentPassword]').hasAttribute('disabled'), 'old pw should be editable');
    assert.notOk(find('input[name=newPassword]').hasAttribute('disabled'), 'new pw should be editable');

    assert.ok(find('[data-test-selector=rollback]'), 'cancel button should be visible in editing state');
    assert.ok(find('[data-test-selector=save]'), 'save button should be visible in editing state');
  });

  test('displays error states', async function(assert) {
    await render(hbs`{{nypr-accounts/password-card isEditing=true}}`);

    // trigger error state
    findAll('input').forEach(i => triggerEvent(i, 'blur'));
    await click('button[data-test-selector=save]');

    assert.equal(findAll('.nypr-input-error').length, 2);
    ['currentPassword', 'newPassword'].forEach(name => {
      assert.ok(find(`[name=${name}] + .nypr-input-footer > .nypr-input-error`), `${name} has an error`);
    });
  });

  test('changes to fields are not persisted after a rollback', async function(assert) {
    await render(hbs`{{nypr-accounts/password-card isEditing=true}}`);

    await fillIn('input[name=currentPassword]', 'vvvvvvv');
    await fillIn('input[name=newPassword]', 'uuuuuuu');
    await click('button[data-test-selector=rollback]');

    assert.equal(find('input[name=password]').value, '********', 'displays password asterisks');
    assert.ok(find('input[name=password]').hasAttribute('disabled'), 'input is disabled');

    assert.notOk(find('[data-test-selector=rollback]'), 'cancel button should not be visible in default state');
    assert.notOk(find('[data-test-selector=save]'), 'save button should not be visible in default state');
  });

  test('changes to fields are not persisted after a rollback using toggleEdit', async function(assert) {
    await render(hbs`{{nypr-accounts/password-card isEditing=true}}`);

    await fillIn('input[name=currentPassword]', 'vvvvvvv');
    await fillIn('input[name=newPassword]', 'uuuuuuu');
    await click('button[data-test-selector=nypr-card-button]');

    assert.equal(find('input[name=password]').value, '********', 'displays password asterisks');
    assert.ok(find('input[name=password]').hasAttribute('disabled'), 'input is disabled');

    assert.notOk(find('[data-test-selector=rollback]'), 'cancel button should not be visible in default state');
    assert.notOk(find('[data-test-selector=save]'), 'save button should not be visible in default state');
  });

  test('clicking save with a valid password calls changePassword', async function(assert) {
    const OLD_PW = 'oldvalidpassword1';
    const NEW_PW = 'newvalidpassword1';
    assert.expect(5);

    this.set('changePassword', function(changeset) {
      assert.ok('changePassword was called');
      assert.equal(changeset.get('currentPassword'), OLD_PW);
      assert.equal(changeset.get('newPassword'), NEW_PW);
      assert.ok(find('[data-test-selector=save]'), 'should still be in editing state');
      return Promise.resolve();
    });
    await render(hbs`{{nypr-accounts/password-card
      changePassword=(action changePassword)
      isEditing=true}}`);

    await fillIn('input[name=currentPassword]', OLD_PW);
    await fillIn('input[name=newPassword]', NEW_PW);

    await click('button[data-test-selector=save]');

    assert.notOk(find('[data-test-selector=save]'), 'form should be disabled');
  });

  test('if changePassword rejects, should show an error message', async function(assert) {
    const OLD_PW = 'oldvalidpassword1';
    const NEW_PW = 'newvalidpassword1';

    this.set('changePassword', function(changeset) {
      assert.ok('changePassword was called');
      assert.equal(changeset.get('currentPassword'), OLD_PW);
      assert.equal(changeset.get('newPassword'), NEW_PW);
      assert.ok(find('[data-test-selector=save]'), 'form should be in editing state');
      return Promise.reject();
    });
    await render(hbs`{{nypr-accounts/password-card
      changePassword=(action changePassword)
      helplinkUrl='/forgot'
      helplinkText='Forgot password?'
      isEditing=true}}`);

    await fillIn('input[name=currentPassword]', OLD_PW);
    await triggerEvent('input[name=currentPassword]', 'blur');
    await fillIn('input[name=newPassword]', NEW_PW);

    await click('button[data-test-selector=save]');

    assert.ok(find('[data-test-selector=save]'), 'form should not be in editing state');
    assert.equal(find('.nypr-input-error').textContent.trim(), 'This password is incorrect.');
    assert.equal(find('.nypr-input-helplink').textContent.trim(), 'Forgot password?');
    assert.equal(find('input[name=currentPassword]').value, OLD_PW, 'old password should still be there');
    assert.equal(find('input[name=newPassword]').value, NEW_PW, 'new password should still be there');
  });

  test('if changePassword rejects with an error object, should display the error message from the object', async function(assert) {
    const OLD_PW = 'oldvalidpassword1';
    const NEW_PW = 'newvalidpassword1';
    const ERROR_MESSAGE = 'error message';

    this.set('changePassword', function(changeset) {
      assert.ok('changePassword was called');
      assert.equal(changeset.get('currentPassword'), OLD_PW);
      assert.equal(changeset.get('newPassword'), NEW_PW);
      assert.ok(find('[data-test-selector=save]'), 'form should be in editing state');
      return Promise.reject({errors: {code: "", message: ERROR_MESSAGE}});
    });
    await render(hbs`{{nypr-accounts/password-card
      changePassword=(action changePassword)
      helplinkUrl='/forgot'
      helplinkText='Forgot password?'
      isEditing=true}}`);

    await fillIn('input[name=currentPassword]', OLD_PW);
    await triggerEvent('input[name=currentPassword]', 'blur');
    await fillIn('input[name=newPassword]', NEW_PW);

    await click('button[data-test-selector=save]');

    assert.ok(find('[data-test-selector=save]'), 'form should not be in editing state');
    assert.equal(find('.nypr-input-error').textContent.trim(), ERROR_MESSAGE);
    assert.equal(find('.nypr-input-helplink').textContent.trim(), 'Forgot password?');
    assert.equal(find('input[name=currentPassword]').value, OLD_PW, 'old password should still be there');
    assert.equal(find('input[name=newPassword]').value, NEW_PW, 'new password should still be there');
  });
});
