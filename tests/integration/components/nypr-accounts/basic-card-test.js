import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';
import rsvp from 'rsvp';
import Test from 'ember-test';

const { Promise } = rsvp;

moduleForComponent('nypr-accounts/basic-card', 'Integration | Component | nypr-accounts/basic card', {
  integration: true,
  beforeEach() {
    if(typeof server !== 'undefined') { server.shutdown(); }
    this.server = startMirage();
  },
  afterEach() {
    this.server.shutdown();
    if(typeof server !== 'undefined') { server.shutdown(); }
  }
});

const { keys } = Object;
const userFields = () => ({
  givenName: 'foo',
  familyName: 'bar',
  preferredUsername: 'foobar',
  email: 'foo@bar.com',
});

test('it renders', function(assert) {
  this.render(hbs`{{nypr-accounts/basic-card}}`);

  assert.ok(this.$('input').length);
});


test('renders default values of passed in model', function(assert) {
  this.set('user', userFields());

  this.render(hbs`{{nypr-accounts/basic-card user=user}}`);

  assert.equal(this.$('input[name=fullName]').val(), 'foo bar', 'displays fullname');
  assert.equal(this.$('input[name=preferredUsername]').val(), 'foobar', 'displays username');
  assert.equal(this.$('input[name=email]').val(), 'foo@bar.com', 'displays email');

  assert.equal(this.$('input').length, 3, 'should see 3 fields');
  this.$('input').get().forEach(i => assert.ok(i.disabled, `${i.name} should be disabled`));

  assert.notOk(this.$('[data-test-selector=rollback]').length, 'cancel button should not be visible in default state');
  assert.notOk(this.$('[data-test-selector=save]').length, 'save button should not be visible in default state');
});


test('editing states', function(assert) {
  let done = assert.async();
  let confirmEmailIsVisible = () => this.$('input[name=confirmEmail]').length === 1;

  assert.expect(9);
  this.set('user', userFields());

  this.render(hbs`{{nypr-accounts/basic-card isEditing=true user=user}}`);

  assert.equal(this.$('input').length, 4, 'should see 4 fields');
  this.$('input').get().forEach(i => assert.notOk(i.disabled, `${i.name} should be editable`));

  assert.ok(this.$('[data-test-selector=rollback]').length, 'cancel button should be visible in editing state');
  assert.ok(this.$('[data-test-selector=save]').length, 'save button should be visible in editing state');

  this.$('input[name=email]').val('baz@boo.com');
  this.$('input[name=email]').blur();
  Test.registerWaiter(this, confirmEmailIsVisible);
  wait().then(() => {
    Test.unregisterWaiter(this, confirmEmailIsVisible);
    assert.ok(this.$('input[name=confirmEmail]').length, 'confirm email should appear in dirty state');
    assert.equal(this.$('input').length, 5, 'should see 5 fields');
    done();
  });
  return wait();
});


test('displays error states', function(assert) {
  let done = assert.async();
  assert.expect(6);

  let confirmEmailIsVisible = () => this.$('input[name=confirmEmail]').length === 1;

  this.render(hbs`{{nypr-accounts/basic-card
    isEditing=true}}`);

  // trigger error states
  this.$('input[name=givenName]').blur();
  this.$('input[name=familyName]').blur();
  this.$('input[name=preferredUsername]').blur();
  this.$('input[name=email]').blur();

  // wait for confirmation field
  Test.registerWaiter(this, confirmEmailIsVisible);
  wait().then(() => {
    Test.unregisterWaiter(this, confirmEmailIsVisible);
    this.$('input[name=confirmEmail]').blur();
  });
  wait().then(() => {
    this.$('button[data-test-selector=save]').click();
    assert.equal(this.$('.nypr-input-error').length, 5); // 5 fields including confirmEmail
    keys(userFields()).forEach(name => {
      assert.ok(this.$(`[name=${name}] + .nypr-input-footer > .nypr-input-error`).length, `${name} has an error`);
    });
    assert.equal(this.$('[name=confirmEmail] + .nypr-input-footer > .nypr-input-error').length, 1, 'confirmEmail has an error');
    done();
  });
  return wait();
});


test('changes to fields are not persisted after a rollback', function(assert) {
  let done = assert.async();
  assert.expect(7);
  let user = userFields();
  user.rollbackAttributes = function() {};

  this.set('user', user);

  this.set('isEditing', true);

  this.render(hbs`{{nypr-accounts/basic-card
    isEditing=isEditing
    user=user}}`);

  this.$('input[name=givenName]').val('zzzz');
  this.$('input[name=givenName]').blur();
  this.$('input[name=familyName]').val('xxxxx');
  this.$('input[name=familyName]').blur();
  this.$('input[name=preferredUsername]').val('yyyyyy');
  this.$('input[name=preferredUsername]').blur();
  this.$('input[name=email]').val('wwwwww');
  this.$('input[name=email]').blur();
  this.$('input[name=confirmEmail]').val('wwwwww');
  this.$('input[name=confirmEmail]').blur();

  this.$('button[data-test-selector=rollback]').click();
  assert.equal(this.$('input[name=fullName]').val(), 'foo bar', 'displays fullname');
  assert.equal(this.$('input[name=preferredUsername]').val(), 'foobar', 'displays username');
  assert.equal(this.$('input[name=email]').val(), 'foo@bar.com', 'displays email');

  this.set('isEditing', true);
  this.$('input').each((i, e) => assert.equal(e.value, userFields()[e.name], 'original values are shown'));
  done();
  return wait();
});


test('changes to fields are not persisted after a rollback using toggleEdit', function(assert) {
  let done = assert.async();
  assert.expect(7);
  let user = userFields();
  user.rollbackAttributes = function() {};

  this.set('user', user);

  this.set('isEditing', true);

  this.render(hbs`{{nypr-accounts/basic-card
    isEditing=isEditing
    user=user}}`);

  this.$('input[name=givenName]').val('zzzz');
  this.$('input[name=givenName]').blur();
  this.$('input[name=familyName]').val('xxxxx');
  this.$('input[name=familyName]').blur();
  this.$('input[name=preferredUsername]').val('yyyyyy');
  this.$('input[name=preferredUsername]').blur();
  this.$('input[name=email]').val('wwwwww');
  this.$('input[name=email]').blur();
  this.$('input[name=confirmEmail]').val('wwwwww');
  this.$('input[name=confirmEmail]').blur();

  this.$('button[data-test-selector=nypr-card-button]').click();
  assert.equal(this.$('input[name=fullName]').val(), 'foo bar', 'displays fullname');
  assert.equal(this.$('input[name=preferredUsername]').val(), 'foobar', 'displays username');
  assert.equal(this.$('input[name=email]').val(), 'foo@bar.com', 'displays email');

  this.$('button[data-test-selector=nypr-card-button]').click();
  this.$('input').each((i, e) => assert.equal(e.value, userFields()[e.name], 'original values are shown'));
  done();
  return wait();
});


test('can update non-email attrs', function(assert) {
  let done = assert.async();
  assert.expect(4);
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  const USERNAME = 'johndoe';
  let notEditing = () => this.$('input:not([disabled])').length === 0;

  this.set('user', userFields());
  this.render(hbs`{{nypr-accounts/basic-card
    isEditing=true
    user=user}}`);

  this.$('input[name=givenName]').val(FIRST_NAME);
  this.$('input[name=givenName]').blur();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').blur();
  this.$('input[name=preferredUsername]').val(USERNAME);
  this.$('input[name=preferredUsername]').blur();
  wait().then(() => {
    this.$('button[data-test-selector=save]').click();
    Test.registerWaiter(this, notEditing);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, notEditing);
    assert.equal(this.$('input').length, 3, 'should see 3 fields');
    assert.strictEqual(this.$('input:not([disabled])').length, 0, 'all inputs should be disabled');
    assert.equal(this.$('input[name=fullName]').val(), `${FIRST_NAME} ${LAST_NAME}`, 'displays new fullname');
    assert.equal(this.$('input[name=preferredUsername]').val(), USERNAME, 'displays new username');
    done();
  });
  return wait();
});


test('resets email value if emailRequirement is rejected', function(assert) {
  let done = assert.async(2);
  assert.expect(4);
  const OLD_EMAIL = userFields()['email'];
  const EMAIL = 'john@doe.com';
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  let confirmEmailIsHidden = () => this.$('input[name=confirmEmail]').length === 0;
  let confirmEmailIsVisible = () => this.$('input[name=confirmEmail]').length === 1;

  this.set('user', userFields());
  this.set('emailRequirement', function() {
    assert.ok('emailRequirement called');
    done();
    return Promise.reject();
  });

  this.render(hbs`{{nypr-accounts/basic-card
    emailRequirement=emailRequirement
    isEditing=true
    user=user}}`);

  this.$('input[name=givenName]').val(FIRST_NAME);
  this.$('input[name=givenName]').blur();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').blur();
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').blur();
  Test.registerWaiter(this, confirmEmailIsVisible);
  wait().then(() => {
    Test.unregisterWaiter(this, confirmEmailIsVisible);
    this.$('input[name=confirmEmail]').val(EMAIL);
    this.$('input[name=confirmEmail]').blur();
  });
  wait().then(() => {
    this.$('[data-test-selector=save]').click();
    Test.registerWaiter(this, confirmEmailIsHidden);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, confirmEmailIsHidden);
    assert.equal(this.$('input[name=email]').val(), OLD_EMAIL, 'displays old email');
    assert.equal(this.$('input[name=givenName]').val(), FIRST_NAME, 'first name still updated value');
    assert.equal(this.$('input[name=familyName]').val(), LAST_NAME, 'last name still updated value');
    done();
  });
  return wait();
});


test('can update email', function(assert) {
  let done = assert.async(2);
  assert.expect(2);
  const EMAIL = 'john@doe.com';
  const PASSWORD = '1234567890';
  let confirmEmailIsVisible = () => this.$('input[name=confirmEmail]').length === 1;
  let modalIsVisible = () => this.$().siblings('.ember-modal-wrapper').find('input[name=passwordForEmailChange]').length === 1;
  let modalIsHidden = () => this.$().siblings('.ember-modal-wrapper').find('input[name=passwordForEmailChange]').length === 0;
  this.set('user', userFields());
  this.set('authenticate', pw => {
    assert.equal(pw, PASSWORD, 'authenticate was called with correct pw');
    done();
    return Promise.resolve();
  });

  this.render(hbs`{{nypr-accounts/basic-card
    authenticate=(action authenticate)
    isEditing=true
    user=user}}`);

  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').blur();

  Test.registerWaiter(this, confirmEmailIsVisible);
  wait().then(() => {
    Test.unregisterWaiter(this, confirmEmailIsVisible);
    this.$('input[name=confirmEmail]').val(EMAIL);
    this.$('input[name=confirmEmail]').blur();
  });
  wait().then(() => {
    this.$('[data-test-selector=save]').click();
    Test.registerWaiter(this, modalIsVisible);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, modalIsVisible);
    let modal = this.$().siblings('.ember-modal-wrapper');
    modal
      .find('input')
      .val(PASSWORD)
      .blur();
    modal
      .find('[data-test-selector=check-pw]')
      .click();
    Test.registerWaiter(this, modalIsHidden);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, modalIsHidden);
    assert.equal(this.$('input[name=email]').val(), EMAIL, 'displays new email');
    done();
  });
  return wait();
});


test('shows an error message if password is rejected', function(assert) {
  let done = assert.async(2);
  assert.expect(2);
  const EMAIL = 'john@doe.com';
  const BAD_PW = '1234567890';
  let modalIsVisible = () => this.$().siblings('.ember-modal-wrapper').find('input[name=passwordForEmailChange]').length === 1;
  let confirmEmailIsVisible = () => this.$('input[name=confirmEmail]').length === 1;

  this.set('user', userFields());
  this.set('authenticate', function() {
    assert.ok('authenticate was called');
    done();
    return Promise.reject({
      "error": {
        "code": "UnauthorizedAccess",
        "message": "Incorrect username or password."
      }
    });
  });

  this.render(hbs`{{nypr-accounts/basic-card
    authenticate=(action authenticate)
    isEditing=true
    user=user}}`);

  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').blur();
  Test.registerWaiter(this, confirmEmailIsVisible);
  wait().then(() => {
    Test.unregisterWaiter(this, confirmEmailIsVisible);
    this.$('input[name=confirmEmail]').val(EMAIL);
    this.$('input[name=confirmEmail]').blur();
  });
  wait().then(() => {
    this.$('[data-test-selector=save]').click();
    Test.registerWaiter(this, modalIsVisible);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, modalIsVisible);
    this.$().siblings('.ember-modal-wrapper').find('input[name=passwordForEmailChange]').val(BAD_PW);
    this.$().siblings('.ember-modal-wrapper').find('input[name=passwordForEmailChange]').blur();
    this.$().siblings('.ember-modal-wrapper').find('[data-test-selector="check-pw"]').click();
  });
  wait().then(() => {
    assert.equal(this.$().siblings('.ember-modal-wrapper').find('.nypr-input-error').text().trim(), 'Incorrect username or password.');
    done();
  });
  return wait();
});


test('can update them all', function(assert) {
  let done = assert.async();
  assert.expect(6);

  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  const USERNAME = 'johndoe';
  const EMAIL = 'john@doe.com';

  let formIsDisabled = () => this.$('input').length === 3;
  let confirmEmailIsVisible = () => this.$('input[name=confirmEmail]').length === 1;

  this.set('user', userFields());
  this.set('authenticate', () => Promise.resolve());
  // skip filling in the modal
  this.set('emailRequirement', () => Promise.resolve());

  this.set('emailUpdated', () => assert.ok('emailUpdated called'));

  this.render(hbs`{{nypr-accounts/basic-card
    user=user
    authenticate=(action authenticate)
    emailUpdated=(action emailUpdated)
    isEditing=true
    emailRequirement=emailRequirement}}`);

  wait().then(() => {
    this.$('input[name=givenName]').val(FIRST_NAME);
    this.$('input[name=givenName]').blur();
    this.$('input[name=familyName]').val(LAST_NAME);
    this.$('input[name=familyName]').blur();
    this.$('input[name=preferredUsername]').val(USERNAME);
    this.$('input[name=preferredUsername]').blur();
    this.$('input[name=email]').val(EMAIL);
    this.$('input[name=email]').blur();
    Test.registerWaiter(this, confirmEmailIsVisible);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, confirmEmailIsVisible);
    this.$('input[name=confirmEmail]').val(EMAIL);
    this.$('input[name=confirmEmail]').blur();
  });
  wait().then(() => {
    this.$('button[data-test-selector=save]').click();
    Test.registerWaiter(this, formIsDisabled);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, formIsDisabled);
    assert.equal(this.$('input').length, 3, 'should see 3 fields');
    assert.strictEqual(this.$('input:not([disabled])').length, 0, 'all inputs should be disabled');
    assert.equal(this.$('input[name=fullName]').val(), `${FIRST_NAME} ${LAST_NAME}`, 'displays new fullname');
    assert.equal(this.$('input[name=preferredUsername]').val(), USERNAME, 'displays new username');
    assert.equal(this.$('input[name=email]').val(), EMAIL, 'displays new email');
    done();
  });
  return wait();
});


test('shows pending message for unverified email', function(assert) {
  this.set('emailIsPendingVerification', true);
  this.set('user', userFields());

  this.render(hbs`{{nypr-accounts/basic-card user=user emailIsPendingVerification=emailIsPendingVerification}}`);
  assert.equal(this.$('.nypr-account-pending').length, 1);
});


test('does not show pending message for verified email', function(assert) {
  this.set('emailIsPendingVerification', false);
  this.set('user', userFields());

  this.render(hbs`{{nypr-accounts/basic-card user=user emailIsPendingVerification=emailIsPendingVerification}}`);
  assert.equal(this.$('.nypr-account-pending').length, 0);
});

test('shows error for taken username', function(assert) {
  let done = assert.async();
  assert.expect(2);

  const USERNAME = 'taken';
  let showingErrors = () => this.$(".nypr-input-error").length > 0;

  this.set('user', userFields());

  this.render(hbs`{{nypr-accounts/basic-card
    user=user
    isEditing=true}}`);

  wait().then(() => {
    this.$('input[name=preferredUsername]').val(USERNAME);
    this.$('input[name=preferredUsername]').blur();
    this.$('input[name=preferredUsername]').trigger($.Event("input"));
    Test.registerWaiter(this, showingErrors);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, showingErrors);
    assert.equal(this.$("[name=preferredUsername] + .nypr-input-footer .nypr-input-error").length, 1, 'preferredUsername has one error');
    assert.equal(this.$("[name=preferredUsername] + .nypr-input-footer .nypr-input-error").text().trim(), "public handle already exists", 'preferredUsername shows the correct error message');
    done();
  });
  return wait();
});

test('shows error for taken email', function(assert) {
  let done = assert.async();
  assert.expect(2);

  const EMAIL = 'taken@example.com';
  let showingErrors = () => this.$(".nypr-input-error").length > 0;

  this.set('user', userFields());

  this.render(hbs`{{nypr-accounts/basic-card
    user=user
    isEditing=true}}`);

  wait().then(() => {
    this.$('input[name=email]').val(EMAIL);
    this.$('input[name=email]').blur();
    this.$('input[name=email]').trigger($.Event("input"));
    Test.registerWaiter(this, showingErrors);
  });
  wait().then(() => {
    Test.unregisterWaiter(this, showingErrors);
    assert.equal(this.$("[name=email] + .nypr-input-footer .nypr-input-error").length, 1, 'email has one error');
    assert.equal(this.$("[name=email] + .nypr-input-footer .nypr-input-error").text().trim(), "an account with this email address already exists", 'email shows the correct error message');
    done();
  });
  return wait();
});

