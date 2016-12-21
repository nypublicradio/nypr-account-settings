import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('nypr-accounts/password-card', 'Integration | Component | password card', {
  integration: true
});

test('it renders', function(assert) {

  this.render(hbs`{{nypr-accounts/password-card}}`);

  assert.ok(this.$('input').length);
});

test('renders default values', function(assert) {
  this.render(hbs`{{nypr-accounts/password-card}}`);
  
  assert.equal(this.$('input[name=password]').val(), '********', 'displays password asterisks');
  assert.ok(this.$('input[name=password]').attr('disabled'), 'input is disabled');
  
  assert.notOk(this.$('[data-test-selector=rollback]').length, 'cancel button should not be visible in default state');
  assert.notOk(this.$('[data-test-selector=save]').length, 'save button should not be visible in default state');
});

test('editing states', function(assert) {
  this.render(hbs`{{nypr-accounts/password-card isEditing=true}}`);
  
  assert.equal(this.$('input').length, 2, 'should see 2 fields');
  assert.notOk(this.$('input[name=currentPassword]').attr('disabled'), 'old pw should be editable');
  assert.notOk(this.$('input[name=newPassword]').attr('disabled'), 'new pw should be editable');
  
  assert.ok(this.$('[data-test-selector=rollback]').length, 'cancel button should be visible in editing state');
  assert.ok(this.$('[data-test-selector=save]').length, 'save button should be visible in editing state');
});

test('displays error states', function(assert) {
  this.render(hbs`{{nypr-accounts/password-card isEditing=true}}`);
  
  // trigger error state
  this.$('input').get().forEach(i => $(i).focusout());
  this.$('button[data-test-selector=save]').click();
  
  return wait().then(() => {
    assert.equal(this.$('.nypr-input-error').length, 2);
    ['currentPassword', 'newPassword'].forEach(name => {
      assert.ok(this.$(`[name=${name}] + .nypr-input-footer > .nypr-input-error`).length, `${name} has an error`);
    });
  });
});

test('changes to fields are not persisted after a rollback', function(assert) {
  this.render(hbs`{{nypr-accounts/password-card isEditing=true}}`);
  
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

  this.set('changePassword', function(changeset) {
    assert.ok('changePassword was called');
    assert.equal(changeset.get('currentPassword'), OLD_PW);
    assert.equal(changeset.get('newPassword'), NEW_PW);
  });
  this.render(hbs`{{nypr-accounts/password-card
    changePassword=(action changePassword)
    isEditing=true}}`);
  
  this.$('input[name=currentPassword]').val(OLD_PW);
  this.$('input[name=currentPassword]').change();
  this.$('input[name=newPassword]').val(NEW_PW);
  this.$('input[name=newPassword]').change();
  
  this.$('button[data-test-selector=save]').click();
});
