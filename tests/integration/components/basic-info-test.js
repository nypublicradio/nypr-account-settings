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
  
  this.render(hbs`{{basic-info changeset=(changeset user BasicInfoValidations)}}`);
      
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
  this.set('BasicInfoValidations', BasicInfoValidations);
  
  this.render(hbs`{{basic-info
    isEditing=true
    changeset=(changeset user BasicInfoValidations)}}`);
      
  assert.equal(this.$('input').length, 4, 'should see 4 fields');
  this.$('input').get().forEach(i => assert.notOk(i.disabled, `${i.name} should be editable`));
  
  assert.ok(this.$('[data-test-selector=rollback]').length, 'cancel button should be visible in editing state');
  assert.ok(this.$('[data-test-selector=save]').length, 'save button should be visible in editing state');
  
  this.$('input[name=email]').val('baz@boo.com');
  this.$('input[name=email]').change();
  
  assert.ok(this.$('input[name=confirmEmail]').length, 'confirm email should appear in dirty state');
  assert.equal(this.$('input').length, 5, 'should see 5 fields');
  
  // this.$('input[name=email]').val(userFields()['email']);
  // this.$('input[name=email]').change();
  // 
  // assert.notOk(this.$('input[name=confirmEmail]').length, 'confirm email should disappear in pristine state');
  // assert.equal(this.$('input').length, 4, 'should see 4 fields again');
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
    changeset=(changeset user BasicInfoValidations)}}`);
    
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
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  
  this.set('isEditing', true);
  
  this.render(hbs`{{basic-info
    isEditing=isEditing
    changeset=(changeset user BasicInfoValidations)}}`);
  
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
});

test('can update non-email attrs', function(assert) {
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  const USERNAME = 'johndoe';
  
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  
  this.render(hbs`{{basic-info
    isEditing=true
    changeset=(changeset user BasicInfoValidations)}}`);
  
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
    changeset=(changeset user BasicInfoValidations)}}`);
  
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
    changeset=(changeset user BasicInfoValidations)}}`);
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
    changeset=(changeset user BasicInfoValidations)}}`);
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
