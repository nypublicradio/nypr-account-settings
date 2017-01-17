import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';
import rsvp from 'rsvp';
import observer from 'ember-metal/observer';
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
  this.set('user', userFields());
  
  this.render(hbs`{{nypr-accounts/basic-card isEditing=true user=user}}`);
      
  assert.equal(this.$('input').length, 4, 'should see 4 fields');
  this.$('input').get().forEach(i => assert.notOk(i.disabled, `${i.name} should be editable`));
  
  assert.ok(this.$('[data-test-selector=rollback]').length, 'cancel button should be visible in editing state');
  assert.ok(this.$('[data-test-selector=save]').length, 'save button should be visible in editing state');
  
  this.$('input[name=email]').val('baz@boo.com');
  this.$('input[name=email]').change();
  this.$('input[name=email]').click();
  
  assert.ok(this.$('input[name=confirmEmail]').length, 'confirm email should appear in dirty state');
  assert.equal(this.$('input').length, 5, 'should see 5 fields');
  
  // this.$('input[name=email]').val(userFields()['email']);
  // this.$('input[name=email]').change();
  // 
  // assert.notOk(this.$('input[name=confirmEmail]').length, 'confirm email should disappear in pristine state');
  // assert.equal(this.$('input').length, 4, 'should see 4 fields again');
});

test('displays error states', function(assert) {
  function dummyObserver() {
    this.changeset.set('preferredUsername', this.get('preferredUsername'));
  }
  
  this.set('usernameObserver', observer('preferredUsername', dummyObserver));
  
  this.render(hbs`{{nypr-accounts/basic-card isEditing=true usernameObserver=usernameObserver}}`);
    
  // trigger error state
  this.$('input').get().forEach(i => $(i).focusout());
  this.$('button[data-test-selector=save]').click();
  
  return wait().then(() => {
    assert.equal(this.$('.nypr-input-error').length, 4);
    keys(userFields()).forEach(name => {
      assert.ok(this.$(`[name=${name}] + .nypr-input-footer > .nypr-input-error`).length, `${name} has an error`);
    });
  });
});

test('changes to fields are not persisted after a rollback', function(assert) {
  let user = userFields();
  user.rollbackAttributes = function() {};

  this.set('user', user);
  
  this.set('isEditing', true);
  
  this.render(hbs`{{nypr-accounts/basic-card isEditing=isEditing user=user}}`);
  
  this.$('input[name=givenName]').val('zzzz');
  this.$('input[name=givenName]').change();
  this.$('input[name=familyName]').val('xxxxx');
  this.$('input[name=familyName]').change();
  this.$('input[name=preferredUsername]').val('yyyyyy');
  this.$('input[name=preferredUsername]').change();
  this.$('input[name=email]').val('wwwwww');
  this.$('input[name=email]').change();
  this.$('input[name=confirmEmail]').val('wwwwww');
  this.$('input[name=confirmEmail]').change();
  
  this.$('button[data-test-selector=rollback]').click();
  assert.equal(this.$('input[name=fullName]').val(), 'foo bar', 'displays fullname');
  assert.equal(this.$('input[name=preferredUsername]').val(), 'foobar', 'displays username');
  assert.equal(this.$('input[name=email]').val(), 'foo@bar.com', 'displays email');
  
  this.set('isEditing', true);
  this.$('input').each((i, e) => assert.equal(e.value, userFields()[e.name], 'original values are shown'));
  return wait();
});

test('can update non-email attrs', function(assert) {
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  const USERNAME = 'johndoe';
  
  this.set('user', userFields());
  this.render(hbs`{{nypr-accounts/basic-card isEditing=true user=user}}`);
      
  
  this.$('input[name=givenName]').val(FIRST_NAME);
  this.$('input[name=givenName]').change();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').change();
  this.$('input[name=preferredUsername]').val(USERNAME);
  this.$('input[name=preferredUsername]').change();
  
  return wait().then(() => {
    this.$('button[data-test-selector=save]').click();
    return wait().then(() => {
      assert.equal(this.$('input').length, 3, 'should see 3 fields');
      assert.ok(this.$('input').get().every(i => i.disabled), 'all inputs should be disabled');
      
      assert.equal(this.$('input[name=fullName]').val(), `${FIRST_NAME} ${LAST_NAME}`, 'displays new fullname');
      assert.equal(this.$('input[name=preferredUsername]').val(), USERNAME, 'displays new username');
    });
  });
});

test('can update email', function(assert) {
  assert.expect(2);
  const EMAIL = 'john@doe.com';
  const PASSWORD = '1234567890';
  
  this.set('user', userFields());
  this.set('authenticate', pw => {
    assert.equal(pw, PASSWORD, 'authenticate was called with correct pw');
    return Promise.resolve();
  });
  
  this.render(hbs`{{nypr-accounts/basic-card
    authenticate=(action authenticate)
    isEditing=true
    user=user}}`);
  
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').change();
  this.$('input[name=email]').click();
  this.$('input[name=confirmEmail]').val(EMAIL);
  this.$('input[name=confirmEmail]').change();
  
  return wait().then(() => {
    this.$('[data-test-selector=save]').click();
    return wait().then(() => {
      let modal = this.$().siblings('.ember-modal-wrapper');
      modal
        .find('input')
        .val(PASSWORD)
        .change();
      modal
        .find('[data-test-selector=check-pw]')
        .click();
      return wait().then(() => {
        assert.equal(this.$('input[name=email]').val(), EMAIL, 'displays new email');
      });
    });
  });
});

test('resets email value if emailRequirement is rejected', function(assert) {
  assert.expect(4);
  const EMAIL = 'john@doe.com';
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  
  this.set('user', userFields());
  this.set('emailRequirement', function() {
    assert.ok('emailRequirement called');
    return Promise.reject();
  });
  
  this.render(hbs`{{nypr-accounts/basic-card emailRequirement=emailRequirement isEditing=true user=user}}`);
  this.$('[data-test-selector=change-email]').click();
  
  this.$('input[name=givenName]').val(FIRST_NAME);
  this.$('input[name=givenName]').change();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').change();
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').change();
  this.$('input[name=email]').click();
  this.$('input[name=confirmEmail]').val(EMAIL);
  this.$('input[name=confirmEmail]').change();
  
  return wait().then(() => {
    this.$('[data-test-selector=save]').click();
    return wait().then(() => {
      assert.equal(this.$('input[name=email]').val(), userFields()['email'], 'displays old email');
      assert.equal(this.$('input[name=givenName]').val(), FIRST_NAME, 'first name still updated value');
      assert.equal(this.$('input[name=familyName]').val(), LAST_NAME, 'last name still updated value');
    });
  });
});

test('shows an error message if password is rejected', function(assert) {
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
  
  this.render(hbs`{{nypr-accounts/basic-card authenticate=(action authenticate) isEditing=true user=user}}`);
  this.$('[data-test-selector=change-email]').click();
  
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').change();
  this.$('input[name=email]').click();
  this.$('input[name=confirmEmail]').val(EMAIL);
  this.$('input[name=confirmEmail]').change();
  
  return wait().then(() => {
    this.$('[data-test-selector=save]').click();
    return wait().then(() => {
      this.$().siblings('.ember-modal-wrapper').find('input[name=passwordForEmailChange]').val(BAD_PW);
      this.$().siblings('.ember-modal-wrapper').find('input[name=passwordForEmailChange]').focusout();
      this.$().siblings('.ember-modal-wrapper').find('[data-test-selector="check-pw"]').click();
      return wait().then(() => {
        assert.equal(this.$().siblings('.ember-modal-wrapper').find('.nypr-input-error').text().trim(), 'Incorrect username or password.');
      });
    });
  });
});

test('can update them all', function(assert) {
  assert.expect(6);
  
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  const USERNAME = 'johndoe';
  const EMAIL = 'john@doe.com';
  
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
      
  this.$('[data-test-selector=change-email]').click();
  
  this.$('input[name=givenName]').val(FIRST_NAME);
  this.$('input[name=givenName]').change();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').change();
  this.$('input[name=preferredUsername]').val(USERNAME);
  this.$('input[name=preferredUsername]').change();
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').change();
  this.$('input[name=email]').click();
  this.$('input[name=confirmEmail]').val(EMAIL);
  this.$('input[name=confirmEmail]').change();
  
  return wait().then(() => {
    this.$('button[data-test-selector=save]').click();
    return wait().then(() => {
      assert.equal(this.$('input').length, 3, 'should see 3 fields');
      assert.ok(this.$('input').get().every(i => i.disabled), 'all inputs should be disabled');
      
      assert.equal(this.$('input[name=fullName]').val(), `${FIRST_NAME} ${LAST_NAME}`, 'displays new fullname');
      assert.equal(this.$('input[name=preferredUsername]').val(), USERNAME, 'displays new username');
      assert.equal(this.$('input[name=email]').val(), EMAIL, 'displays new email');
    });
  });
});
