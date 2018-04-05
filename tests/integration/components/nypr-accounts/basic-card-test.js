import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  findAll,
  find,
  fillIn,
  triggerEvent,
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import rsvp from 'rsvp';
import card from '../../../../tests/pages/basic-card';

const { Promise } = rsvp;
const { keys } = Object;

const userFields = () => ({
  givenName: 'foo',
  familyName: 'bar',
  preferredUsername: 'foobar',
  email: 'foo@bar.com',
});

module('Integration | Component | nypr-accounts/basic card', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    card.setContext(this);
  });

  hooks.afterEach(function() {
    card.removeContext(this);
  });

  test('it renders', async function(assert) {
    await render(hbs`{{nypr-accounts/basic-card}}`);
    assert.ok(find('input'));
  });

  test('renders default values of passed in model', async function(assert) {
    this.set('user', userFields());

    await render(hbs`{{nypr-accounts/basic-card user=user}}`);

    assert.equal(find('input[name=fullName]').value, 'foo bar', 'displays fullname');
    assert.equal(find('input[name=preferredUsername]').value, 'foobar', 'displays username');
    assert.equal(find('input[name=email]').value, 'foo@bar.com', 'displays email');

    assert.equal(findAll('input').length, 3, 'should see 3 fields');
    findAll('input').forEach(i => assert.ok(i.disabled, `${i.name} should be disabled`));

    assert.notOk(find('[data-test-selector=rollback]'), 'cancel button should not be visible in default state');
    assert.notOk(find('[data-test-selector=save]'), 'save button should not be visible in default state');
  });


  test('editing states', async function(assert) {
    assert.expect(9);
    this.set('user', userFields());

    await render(hbs`{{nypr-accounts/basic-card isEditing=true user=user debounceMs=0}}`);

    assert.equal(findAll('input').length, 4, 'should see 4 fields');
    findAll('input').forEach(i => assert.notOk(i.disabled, `${i.name} should be editable`));

    assert.ok(find('[data-test-selector=rollback]'), 'cancel button should be visible in editing state');
    assert.ok(find('[data-test-selector=save]'), 'save button should be visible in editing state');

    await fillIn('input[name=email]', 'baz@boo.com');
    assert.ok(find('input[name=confirmEmail]'), 'confirm email should appear in dirty state');
    assert.equal(findAll('input').length, 5, 'should see 5 fields');
  });


  test('displays error states', async function(assert) {
    assert.expect(5);

    await render(hbs`{{nypr-accounts/basic-card debounceMs=0 isEditing=true}}`);

    // trigger error states
    await triggerEvent('input[name=givenName]', 'blur');
    await triggerEvent('input[name=familyName]', 'blur');
    await triggerEvent('input[name=preferredUsername]', 'blur');
    await triggerEvent('input[name=email]', 'blur');

    // wait for confirmation field
    await click('button[data-test-selector=save]');
    assert.equal(findAll('.nypr-input-error').length, 4);
    keys(userFields()).forEach(name => {
      assert.ok(find(`[name=${name}] + .nypr-input-footer > .nypr-input-error`), `${name} has an error`);
    });
  });


  test('changes to fields are not persisted after a rollback', async function(assert) {
    assert.expect(7);
    let user = userFields();
    user.rollbackAttributes = function() {};

    this.set('user', user);

    this.set('isEditing', true);

    await render(hbs`{{nypr-accounts/basic-card
      isEditing=isEditing
      debounceMs=0
      user=user}}`);

    await fillIn('input[name=givenName]', 'zzzz');
    await fillIn('input[name=familyName]', 'xxxxx');
    await fillIn('input[name=preferredUsername]', 'yyyyyy');
    await fillIn('input[name=email]', 'wwwwww');
    await fillIn('input[name=confirmEmail]', 'wwwwww');
    await click('button[data-test-selector=rollback]');

    assert.equal(find('input[name=fullName]').value, 'foo bar', 'displays fullname');
    assert.equal(find('input[name=preferredUsername]').value, 'foobar', 'displays username');
    assert.equal(find('input[name=email]').value, 'foo@bar.com', 'displays email');

    this.set('isEditing', true);
    findAll('input').forEach(
      e => assert.equal(e.value, userFields()[e.name], 'original values are shown')
    );
  });


  test('changes to fields are not persisted after a rollback using toggleEdit', async function(assert) {
    assert.expect(7);
    let user = userFields();
    user.rollbackAttributes = function() {};

    this.set('user', user);

    this.set('isEditing', true);

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      isEditing=isEditing
      user=user}}`);

    await fillIn('input[name=givenName]', 'zzzz');
    await fillIn('input[name=familyName]', 'xxxxx');
    await fillIn('input[name=preferredUsername]', 'yyyyyy');
    await fillIn('input[name=email]', 'wwwwww');
    await fillIn('input[name=confirmEmail]', 'wwwwww');
    await click('button[data-test-selector=nypr-card-button]');

    assert.equal(find('input[name=fullName]').value, 'foo bar', 'displays fullname');
    assert.equal(find('input[name=preferredUsername]').value, 'foobar', 'displays username');
    assert.equal(find('input[name=email]').value, 'foo@bar.com', 'displays email');

    await click('button[data-test-selector=nypr-card-button]');
    findAll('input').forEach(
      e => assert.equal(e.value, userFields()[e.name], 'original values are shown')
    );
  });


  test('can update non-email attrs', async function(assert) {
    assert.expect(4);
    const FIRST_NAME = 'john';
    const LAST_NAME = 'doe';
    const USERNAME = 'johndoe';

    this.set('user', userFields());
    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      isEditing=true
      user=user}}`);

    await fillIn('input[name=givenName]', FIRST_NAME);
    await fillIn('input[name=familyName]', LAST_NAME);
    await fillIn('input[name=preferredUsername]', USERNAME);
    await click('button[data-test-selector=save]');

    assert.equal(findAll('input').length, 3, 'should see 3 fields');
    assert.strictEqual(findAll('input:not([disabled])').length, 0, 'all inputs should be disabled');
    assert.equal(find('input[name=fullName]').value, `${FIRST_NAME} ${LAST_NAME}`, 'displays new fullname');
    assert.equal(find('input[name=preferredUsername]').value, USERNAME, 'displays new username');
  });


  test('resets email value if password modal is closed', async function(assert) {
    assert.expect(3);
    const OLD_EMAIL = userFields()['email'];
    const EMAIL = 'john@doe.com';
    const FIRST_NAME = 'john';
    const LAST_NAME = 'doe';

    this.set('user', userFields());

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      isEditing=true
      user=user}}`);

    await fillIn('input[name=givenName]', FIRST_NAME);
    await fillIn('input[name=familyName]', LAST_NAME);
    await fillIn('input[name=email]', EMAIL);
    await fillIn('input[name=confirmEmail]', EMAIL);
    await click('[data-test-selector=save]');

    await click('.ember-modal-wrapper .nypr-account-modal-close');

    assert.equal(find('input[name=email]').value, OLD_EMAIL, 'displays old email');
    assert.equal(find('input[name=givenName]').value, FIRST_NAME, 'first name still updated value');
    assert.equal(find('input[name=familyName]').value, LAST_NAME, 'last name still updated value');
  });

  test('can update email', async function(assert) {
    assert.expect(3);
    const EMAIL = 'john@doe.com';
    const PASSWORD = '1234567890';
    let authenticate = sinon.stub().resolves();
    this.set('authenticate', authenticate);
    this.set('user', userFields());

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      authenticate=(action authenticate)
      isEditing=true
      user=user}}`);

    await card
      .fillInEmail(EMAIL)
      .fillInConfirmEmail(EMAIL)
      .clickSave();
    await card.passwordModal
      .fillInPassword(PASSWORD)
      .clickSubmit();

    assert.ok(authenticate.calledOnce, 'authenticate was called once');
    assert.ok(authenticate.calledWith(PASSWORD), 'authenticate was called with correct pw');
    assert.equal(card.email, EMAIL, 'displays new email');
  });

  test('can save email', async function(assert) {
    assert.expect(2);
    const EMAIL = 'john@doe.com';
    const PASSWORD = '1234567890';
    let authenticate = sinon.stub().resolves();
    this.set('authenticate', authenticate);
    let user = userFields();
    user.save = sinon.stub().resolves();
    this.set('user', user);

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      authenticate=(action authenticate)
      isEditing=true
      user=user}}`);

    await card
      .fillInEmail(EMAIL)
      .fillInConfirmEmail(EMAIL)
      .clickSave();

    await card.passwordModal
      .fillInPassword(PASSWORD)
      .clickSubmit();

    assert.equal(user.email, EMAIL);
    assert.ok(user.save.calledOnce);
  });


  test('shows an server error if password is rejected', async function(assert) {
    assert.expect(2);
    const EMAIL = 'john@doe.com';
    const BAD_PW = '1234567890';

    this.set('user', userFields());
    this.set('authenticate', function() {
      assert.ok('authenticate was called');
      return Promise.reject({
        "error": {
          "code": "UnauthorizedAccess",
          "message": "Incorrect username or password."
        }
      });
    });

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      authenticate=(action authenticate)
      isEditing=true
      user=user}}`);

    await fillIn('input[name=email]', EMAIL);
    await fillIn('input[name=confirmEmail]', EMAIL);
    await click('[data-test-selector=save]');
    await fillIn('.ember-modal-wrapper input[name=passwordForEmailChange]', BAD_PW);
    await click('.ember-modal-wrapper [data-test-selector="check-pw"]');

    assert.equal(find('.ember-modal-wrapper .nypr-input-error').textContent.trim(), 'Incorrect username or password.');
  });

  test('shows an error message if password fails', async function(assert) {
    assert.expect(2);
    const EMAIL = 'john@doe.com';
    const BAD_PW = '1234567890';

    this.set('user', userFields());
    this.set('authenticate', function() {
      assert.ok('authenticate was called');
      return Promise.reject();
    });

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      authenticate=(action authenticate)
      isEditing=true
      user=user}}`);

    await fillIn('input[name=email]', EMAIL);
    await fillIn('input[name=confirmEmail]', EMAIL);
    await click('[data-test-selector=save]');
    await fillIn('.ember-modal-wrapper input[name=passwordForEmailChange]', BAD_PW);
    await click('.ember-modal-wrapper [data-test-selector="check-pw"]');

    assert.equal(find('.ember-modal-wrapper .nypr-input-error').textContent.trim(), 'This password is incorrect.');
  });

  test('can update them all', async function(assert) {
    assert.expect(6);

    const FIRST_NAME = 'john';
    const LAST_NAME = 'doe';
    const USERNAME = 'johndoe';
    const EMAIL = 'john@doe.com';

    this.set('user', userFields());
    this.set('authenticate', () => Promise.resolve());
    this.set('emailUpdated', () => assert.ok('emailUpdated called'));

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      user=user
      authenticate=(action authenticate)
      emailUpdated=(action emailUpdated)
      isEditing=true
      }}`);

    await fillIn('input[name=givenName]', FIRST_NAME);
    await fillIn('input[name=familyName]', LAST_NAME);
    await fillIn('input[name=preferredUsername]', USERNAME);
    await fillIn('input[name=email]', EMAIL);
    await fillIn('input[name=confirmEmail]', EMAIL);
    await click('button[data-test-selector=save]');

    await fillIn('input[name=passwordForEmailChange]', 'fakepassword');
    await click('button[data-test-selector=check-pw]');

    assert.equal(findAll('input').length, 3, 'should see 3 fields');
    assert.strictEqual(findAll('input:not([disabled])').length, 0, 'all inputs should be disabled');
    assert.equal(find('input[name=fullName]').value, `${FIRST_NAME} ${LAST_NAME}`, 'displays new fullname');
    assert.equal(find('input[name=preferredUsername]').value, USERNAME, 'displays new username');
    assert.equal(find('input[name=email]').value, EMAIL, 'displays new email');
  });

  test('shows pending message for unverified email', async function(assert) {
    this.set('emailIsPendingVerification', true);
    this.set('user', userFields());

    await render(hbs`{{nypr-accounts/basic-card user=user emailIsPendingVerification=emailIsPendingVerification}}`);
    assert.ok(find('.nypr-account-pending'));
  });

  test('does not show pending message for verified email', async function(assert) {
    this.set('emailIsPendingVerification', false);
    this.set('user', userFields());

    await render(hbs`{{nypr-accounts/basic-card user=user emailIsPendingVerification=emailIsPendingVerification}}`);
    assert.notOk(find('.nypr-account-pending'));
  });

  test('shows error for taken username', async function(assert) {
    assert.expect(2);

    const USERNAME = 'taken';
    this.set('user', userFields());

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      user=user
      isEditing=true}}`);

    await fillIn('input[name=preferredUsername]', USERNAME);

    assert.ok(find("[name=preferredUsername] + .nypr-input-footer .nypr-input-error"), 'preferredUsername has one error');
    assert.equal(find("[name=preferredUsername] + .nypr-input-footer .nypr-input-error").textContent.trim(), "public handle already exists", 'preferredUsername shows the correct error message');
  });

  test('shows error for taken email', async function(assert) {
    // assert.expect(2);

    const EMAIL = 'taken@example.com';

    this.set('user', userFields());

    await render(hbs`{{nypr-accounts/basic-card
      debounceMs=0
      user=user
      isEditing=true}}`);


    await fillIn('input[name=email]', EMAIL);
    await triggerEvent('input[name=email]', 'blur');

    assert.ok(find("[name=email] + .nypr-input-footer .nypr-input-error"), 'email has one error');
    assert.equal(find("[name=email] + .nypr-input-footer .nypr-input-error").textContent.trim(), "an account with this email address already exists", 'email shows the correct error message');
  });

  test('edit for an account with no password prompts for email address...', async function(assert) {
    let user = userFields();
    user.hasPassword = false;
    user.socialOnly = true;
    this.set('user', user);
    await render(hbs`{{nypr-accounts/basic-card user=user debounceMs=0}}`);

    await card.clickEdit();

    assert.equal(card.currentModal.title, 'Enter Your Email');
  });

  test('...and after submitting email address, calls requestTempPassword with email', async function(assert) {
    let requestTempPassword = sinon.stub().resolves();
    const EMAIL = 'newmail@example.com';
    let user = userFields();
    user.hasPassword = false;
    user.socialOnly = true;
    this.set('user', user);
    this.set('requestTempPassword', requestTempPassword);

    await render(hbs`{{nypr-accounts/basic-card user=user requestTempPassword=(action requestTempPassword) debounceMs=0}}`);

    await card.clickEdit();
    await card.emailModal
      .fillInEmail(EMAIL)
      .fillInConfirmEmail(EMAIL)
      .clickSubmit();

    assert.ok(requestTempPassword.calledOnce);
    assert.ok(requestTempPassword.calledWith(EMAIL));
    assert.equal(card.currentModal.title, 'Check Your Email');
  });
});
