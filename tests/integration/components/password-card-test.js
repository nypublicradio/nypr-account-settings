import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import PasswordValidations from 'nypr-account-settings/validators/password';
import wait from 'ember-test-helpers/wait';

moduleForComponent('password-card', 'Integration | Component | password card', {
  integration: true
});
const pwFields = () => ({
  currentPassword: '',
  newPassword: ''
});

test('it renders', function(assert) {

  this.render(hbs`{{password-card}}`);

  assert.ok(this.$('input').length);
});

test('renders default values', function(assert) {
  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  this.render(hbs`{{password-card changeset=(changeset password PasswordValidations)}}`);
  
  assert.equal(this.$('input[name=password]').val(), '********', 'displays password asterisks');
  assert.ok(this.$('input[name=password]').attr('disabled'), 'input is disabled');
  
  assert.notOk(this.$('[data-test-selector=rollback]').length, 'cancel button should not be visible in default state');
  assert.notOk(this.$('[data-test-selector=save]').length, 'save button should not be visible in default state');
});

test('editing states', function(assert) {
  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  this.render(hbs`{{password-card
    isEditing=true
    changeset=(changeset password PasswordValidations)}}`);
  
  assert.equal(this.$('input').length, 2, 'should see 2 fields');
  assert.notOk(this.$('input[name=currentPassword]').attr('disabled'), 'old pw should be editable');
  assert.notOk(this.$('input[name=newPassword]').attr('disabled'), 'new pw should be editable');
  
  assert.ok(this.$('[data-test-selector=rollback]').length, 'cancel button should be visible in editing state');
  assert.ok(this.$('[data-test-selector=save]').length, 'save button should be visible in editing state');
});

test('displays error states', function(assert) {
  this.set('password', {
    currentPassword: '',
    newPassword: ''
  });
  this.set('PasswordValidations', PasswordValidations);
  this.render(hbs`{{password-card
    isEditing=true
    changeset=(changeset password PasswordValidations)}}`);
  this.$('button[data-test-selector=save]').click();
  
  return wait().then(() => {
    assert.equal(this.$('.basic-input-error').length, 2);
    ['currentPassword', 'newPassword'].forEach(name => {
      assert.ok(this.$(`[name=${name}] + .basic-input-footer > .basic-input-error`).length, `${name} has an error`);
    });
  });
});

test('changes to fields are not persisted after a rollback', function(assert) {
  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  this.render(hbs`{{password-card
    isEditing=true
    changeset=(changeset password PasswordValidations)}}`);
  
  this.$('input[name=currentPassword]').val('vvvvvvv');
  this.$('input[name=currentPassword]').change();
  this.$('input[name=newPassword]').val('uuuuuuu');
  this.$('input[name=newPassword]').change();
  this.$('button[data-test-selector=rollback]').click();
  
  assert.equal(this.$('input[name=password]').val(), '********', 'displays password asterisks');
  assert.ok(this.$('input[name=password]').attr('disabled'), 'input is disabled');
  
  assert.notOk(this.$('[data-test-selector=rollback]').length, 'cancel button should not be visible in default state');
  assert.notOk(this.$('[data-test-selector=save]').length, 'save button should not be visible in default state');
});

test('clicking save with a valid password calls changePassword', function(assert) {
  const OLD_PW = 'oldvalidpassword';
  const NEW_PW = 'newvalidpassword';
  assert.expect(3);

  this.set('password', pwFields());
  this.set('PasswordValidations', PasswordValidations);
  this.set('changePassword', function(changeset) {
    assert.ok('changePassword was called');
    assert.equal(changeset.get('currentPassword'), OLD_PW);
    assert.equal(changeset.get('newPassword'), NEW_PW);
  });
  this.render(hbs`{{password-card
    changePassword=changePassword
    isEditing=true
    changeset=(changeset password PasswordValidations)}}`);
  
  this.$('input[name=currentPassword]').val(OLD_PW);
  this.$('input[name=currentPassword]').change();
  this.$('input[name=newPassword]').val(NEW_PW);
  this.$('input[name=newPassword]').change();
  
  this.$('button[data-test-selector=save]').click();
});
