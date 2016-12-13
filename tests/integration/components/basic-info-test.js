import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import BasicInfoValidations from 'nypr-account-settings/validators/basic-info';
import PasswordValidations from 'nypr-account-settings/validators/password';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';

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
  name: 'foo',
  familyName: 'bar',
  username: 'foobar',
  email: 'foo@bar.com'
});
const pwFields = () => ({
  oldPassword: '',
  newPassword: ''
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{basic-info}}`);

  assert.ok(this.$('input').length);
});

test('renders default values of passed in model', function(assert) {
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  
  this.render(hbs`{{basic-info
      pwChangeset=(changeset password PasswordValidations)
      basicChangeset=(changeset user BasicInfoValidations)}}`);
      
  assert.equal(this.$('input[name=fullName]').val(), 'foo bar', 'displays fullname');
  assert.equal(this.$('input[name=username]').val(), 'foobar', 'displays username');
  assert.equal(this.$('input[name=email]').val(), 'foo@bar.com', 'displays email');
  assert.equal(this.$('input[name=password]').val(), '******', 'displays password asterisks');
  
  assert.equal(this.$('input[disabled]').length, keys(userFields()).length, 'all fields should be disabled');
  
  assert.notOk(this.$('button').length, 'cancel/save buttons should not be visible in default state');
});

test('switches to inputs when in editing state', function(assert) {
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  
  this.render(hbs`{{basic-info
      isEditing=true
      pwChangeset=(changeset password PasswordValidations)
      basicChangeset=(changeset user BasicInfoValidations)}}`);
      
  assert.equal(this.$('input:not([disabled])').length, keys(userFields()).length, 'all fields should not be disabled');
  
  let inputs = this.$('input').map((i, e) => e.name).get();
  assert.deepEqual(inputs, keys(userFields()));
  
  this.$('button[data-test-selector=change-pw]').click();
  assert.notOk(this.$('input[name=oldPassword]').attr('disabled'), 'old pw should be editable');
  assert.notOk(this.$('input[name=newPassword]').attr('disabled'), 'new pw should be editable');
});

test('displays error states', function(assert) {
  this.set('user', {
    name: '',
    familyName: '',
    username: '',
    email: ''
  });
  this.set('BasicInfoValidations', BasicInfoValidations);
  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  
  this.render(hbs`{{basic-info
      isEditing=true
      pwChangeset=(changeset password PasswordValidations)
      basicChangeset=(changeset user BasicInfoValidations)}}`);
  this.$('button[data-test-selector=save]').click();
  
  return wait().then(() => {
    assert.equal(this.$('.basic-input-error').length, 4);
    ['name', 'familyName', 'email', 'username'].forEach(name => {
      assert.ok(this.$(`[name=${name}] + .basic-input-footer > .basic-input-error`).length, `${name} has an error`);
      
    });
  }).then(() => {
    this.render(hbs`{{basic-info
        isEditing=true
        pwChangeset=(changeset password PasswordValidations)
        basicChangeset=(changeset user BasicInfoValidations)}}`);
    this.$('button[data-test-selector=change-pw]').click();
    this.$('button[data-test-selector=save]').click();
    
    return wait().then(() => {
      assert.equal(this.$('.basic-input-error').length, 6);
      ['name', 'familyName', 'email', 'username', 'oldPassword', 'newPassword'].forEach(name => {
        assert.ok(this.$(`[name=${name}] + .basic-input-footer > .basic-input-error`).length, `${name} has an error`);
      });
    });
  });
  
});

test('changes to fields are not persisted after a rollback', function(assert) {
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  
  this.set('isEditing', true);
  
  this.render(hbs`{{basic-info
      isEditing=isEditing
      pwChangeset=(changeset password PasswordValidations)
      basicChangeset=(changeset user BasicInfoValidations)}}`);
  this.$('button[data-test-selector=change-pw]').click();
  
  this.$('input[name=name]').val('zzzz');
  this.$('input[name=name]').change();
  this.$('input[name=familyName]').val('xxxxx');
  this.$('input[name=familyName]').change();
  this.$('input[name=username]').val('yyyyyy');
  this.$('input[name=username]').change();
  this.$('input[name=email]').val('wwwwww');
  this.$('input[name=email]').change();
  this.$('input[name=oldPassword]').val('vvvvvvv');
  this.$('input[name=oldPassword]').change();
  this.$('input[name=newPassword]').val('uuuuuuu');
  this.$('input[name=newPassword]').change();
  
  this.$('button[data-test-selector=rollback]').click();
  assert.equal(this.$('input[name=fullName]').val(), 'foo bar', 'displays fullname');
  assert.equal(this.$('input[name=username]').val(), 'foobar', 'displays username');
  assert.equal(this.$('input[name=email]').val(), 'foo@bar.com', 'displays email');
  assert.equal(this.$('input[name=password]').val(), '******', 'displays password asterisks');
  
  this.set('isEditing', true);
  let inputs = this.$('input').map((i, e) => e.name).get();
  assert.deepEqual(inputs, keys(userFields()), 'original values are shown');
  assert.ok(this.$('[data-test-selector=change-pw]').length, 'password edit is reset after a rollback');
  
});

test('can save changes to passed in user object', function(assert) {
  const FIRST_NAME = 'john';
  const LAST_NAME = 'doe';
  const USERNAME = 'johndoe';
  const EMAIL = 'john@doe.com';
  
  this.set('user', userFields());
  this.set('BasicInfoValidations', BasicInfoValidations);
  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  
  this.render(hbs`{{basic-info
      isEditing=true
      pwChangeset=(changeset password PasswordValidations)
      basicChangeset=(changeset user BasicInfoValidations)}}`);
  this.$('input[name=name]').val(FIRST_NAME);
  this.$('input[name=name]').change();
  this.$('input[name=familyName]').val(LAST_NAME);
  this.$('input[name=familyName]').change();
  this.$('input[name=username]').val(USERNAME);
  this.$('input[name=username]').change();
  this.$('input[name=email]').val(EMAIL);
  this.$('input[name=email]').change();
  
  
  return wait().then(() => {
    this.$('button[data-test-selector=save]').click();
  }).then(() => {
    return wait().then(() => {
      assert.equal(this.$('input[disabled]').length, keys(userFields()).length, 'all fields should be disabled');
      assert.equal(this.$('input[name=fullName]').val(), `${FIRST_NAME} ${LAST_NAME}`, 'displays new fullname');
      assert.equal(this.$('input[name=username]').val(), USERNAME, 'displays new username');
      assert.equal(this.$('input[name=email]').val(), EMAIL, 'displays new email');
      assert.equal(this.$('input[name=password]').val(), '******', 'displays password asterisks');
    });
  });
});
