import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import BasicInfoValidations from 'nypr-account-settings/validators/basic-info';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';
import rsvp from 'rsvp';
const { Promise } = rsvp;

moduleForComponent('basic-info', 'Integration | Component | basic info', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
  },
  afterEach() {
    this.server.shutdown();
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
  this.render(hbs`{{basic-info}}`);

  assert.ok(this.$('input').length);
});

test('renders default values of passed in model', function(assert) {
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  
  this.render(hbs`{{basic-info basicChangeset=(changeset user BasicInfoValidations)}}`);
      
  assert.equal(this.$('input[name=fullName]').val(), 'foo bar', 'displays fullname');
  assert.equal(this.$('input[name=preferredUsername]').val(), 'foobar', 'displays username');
  assert.equal(this.$('input[name=email]').val(), 'foo@bar.com', 'displays email');
  
  assert.equal(this.$('input').length, 3, 'should see 3 fields');
  assert.ok(this.$('input').get().every(i => i.disabled), 'all inputs should be disabled');
  
  assert.notOk(this.$('button[data-test-selector=rollback]').length, 'cancel button should not be visible in default state');
  assert.notOk(this.$('button[data-test-selector=save]').length, 'save button should not be visible in default state');
});

test('switches to inputs when in editing state', function(assert) {
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  
  this.render(hbs`{{basic-info
    isEditing=true
    basicChangeset=(changeset user BasicInfoValidations)}}`);
      
  assert.equal(this.$('input').length, 4, 'should see 4 fields');
  
  let inputs = this.$('input:not([disabled])').map((i, e) => e.name).get();
  assert.deepEqual(inputs, ['givenName', 'familyName', 'preferredUsername']);
  
  
  this.$('button[data-test-selector=change-email]').click();
  assert.notOk(this.$('input[name=email]').attr('disabled'), 'email should be editable');
  assert.notOk(this.$('input[name=confirmEmail]').attr('disabled'), 'confirm email should be editable');
});

test('displays error states', function(assert) {
  this.set('user', {
    givenName: '',
    familyName: '',
    preferredUsername: '',
    email: '',
  });
  this.set('BasicInfoValidations', BasicInfoValidations);
  
  this.render(hbs`{{basic-info
    isEditing=true
    basicChangeset=(changeset user BasicInfoValidations)}}`);
  this.$('button[data-test-selector=save]').click();
  
  return wait().then(() => {
    assert.equal(this.$('.basic-input-error').length, 4);
    keys(userFields()).forEach(name => {
      assert.ok(this.$(`[name=${name}] + .basic-input-footer > .basic-input-error`).length, `${name} has an error`);
    });
  });
});

test('changes to fields are not persisted after a rollback', function(assert) {
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  
  this.set('isEditing', true);
  
  this.render(hbs`{{basic-info
    isEditing=isEditing
    basicChangeset=(changeset user BasicInfoValidations)}}`);
  
  this.$('input[name=name]').val('zzzz');
  this.$('input[name=name]').change();
  this.$('input[name=familyName]').val('xxxxx');
  this.$('input[name=familyName]').change();
  this.$('input[name=username]').val('yyyyyy');
  this.$('input[name=username]').change();
  this.$('input[name=email]').val('wwwwww');
  this.$('input[name=email]').change();
  this.$('input[name=confirmEmail]').val('wwwwww');
  this.$('input[name=confirmEmail]').change();
  
  this.$('button[data-test-selector=rollback]').click();
  assert.equal(this.$('input[name=fullName]').val(), 'foo bar', 'displays fullname');
  assert.equal(this.$('input[name=preferredUsername]').val(), 'foobar', 'displays username');
  assert.equal(this.$('input[name=email]').val(), 'foo@bar.com', 'displays email');
  
  this.set('isEditing', true);
  let inputs = this.$('input').map((i, e) => e.name).get();
  assert.deepEqual(inputs, keys(userFields()), 'original values are shown');
  assert.ok(this.$('[data-test-selector=change-pw]').length, 'password edit is reset after a rollback');
  assert.ok(this.$('[data-test-selector=change-email]').length, 'email edit is reset after a rollback');
});

test('can update non-email attrs', function(assert) {
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  const USERNAME = 'johndoe';
  
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  
  this.render(hbs`{{basic-info
    isEditing=true
    basicChangeset=(changeset user BasicInfoValidations)}}`);
  
  this.$('input[name=givenName]').val(FIRST_NAME);
  this.$('input[name=givenName]').change();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').change();
  this.$('input[name=preferredUsername]').val(USERNAME);
  this.$('input[name=preferredUsername]').change();
  
  return wait().then(() => {
    this.$('button[data-test-selector=save]').click();
  }).then(() => {
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
  
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  this.set('emailRequirement', function() {
    assert.ok('emailRequirement called');
    return Promise.resolve();
  });
  
  this.render(hbs`{{basic-info
    isEditing=true
    emailRequirement=emailRequirement
    basicChangeset=(changeset user BasicInfoValidations)}}`);
  this.$('[data-test-selector=change-email]').click();
  
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').change();
  this.$('input[name=confirmEmail]').val(EMAIL);
  this.$('input[name=confirmEmail]').change();
  
  return wait().then(() => {
    this.$('[data-test-selector=save]').click();
  }).then(() => {
    return wait().then(() => {
      assert.equal(this.$('input[name=email]').val(), EMAIL, 'displays new email');
    });
  });
});

test('resets email value if emailRequirement is rejected', function(assert) {
  assert.expect(4);
  const EMAIL = 'john@doe.com';
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  this.set('emailRequirement', function() {
    assert.ok('emailRequirement called');
    return Promise.reject();
  });
  
  this.render(hbs`{{basic-info
    isEditing=true
    emailRequirement=emailRequirement
    basicChangeset=(changeset user BasicInfoValidations)}}`);
  this.$('[data-test-selector=change-email]').click();
  
  this.$('input[name=givenName]').val(FIRST_NAME);
  this.$('input[name=givenName]').change();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').change();
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').change();
  this.$('input[name=confirmEmail]').val(EMAIL);
  this.$('input[name=confirmEmail]').change();
  
  return wait().then(() => {
    this.$('[data-test-selector=save]').click();
  }).then(() => {
    return wait().then(() => {
      assert.equal(this.$('input[name=email]').val(), userFields()['email'], 'displays old email');
      assert.equal(this.$('input[name=givenName]').val(), FIRST_NAME, 'first name still updated value');
      assert.equal(this.$('input[name=familyName]').val(), LAST_NAME, 'last name still updated value');
    });
  });
});

test('can update them all', function(assert) {
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  const USERNAME = 'johndoe';
  const EMAIL = 'john@doe.com';
  
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  this.set('emailRequirement', () => Promise.resolve());
  
  this.render(hbs`{{basic-info
    isEditing=true
    emailRequirement=emailRequirement
    basicChangeset=(changeset user BasicInfoValidations)}}`);
  this.$('[data-test-selector=change-email]').click();
  
  this.$('input[name=givenName]').val(FIRST_NAME);
  this.$('input[name=givenName]').change();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').change();
  this.$('input[name=preferredUsername]').val(USERNAME);
  this.$('input[name=preferredUsername]').change();
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').change();
  this.$('input[name=confirmEmail]').val(EMAIL);
  this.$('input[name=confirmEmail]').change();
  
  return wait().then(() => {
    this.$('button[data-test-selector=save]').click();
  }).then(() => {
    return wait().then(() => {
      assert.equal(this.$('input').length, 3, 'should see 3 fields');
      assert.ok(this.$('input').get().every(i => i.disabled), 'all inputs should be disabled');
      
      assert.equal(this.$('input[name=fullName]').val(), `${FIRST_NAME} ${LAST_NAME}`, 'displays new fullname');
      assert.equal(this.$('input[name=preferredUsername]').val(), USERNAME, 'displays new username');
      assert.equal(this.$('input[name=email]').val(), EMAIL, 'displays new email');
    });
  });
});
