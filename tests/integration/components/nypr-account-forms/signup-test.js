import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';
import sinon from 'sinon';

module('Integration | Component | account signup form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{nypr-account-forms/signup}}`);
    assert.ok(find('.account-form'));
  });

  test('submitting the form tries to save values on a new user model', async function(assert) {
    let save = sinon.stub().returns(RSVP.Promise.resolve({}));
    let fakeUser = {save};
    let createRecord = sinon.stub().returns(fakeUser);
    let authAPI = 'http://example.com';
    let store = {createRecord};
    this.set('authAPI', authAPI);
    this.set('store', store);
    await render(hbs`{{nypr-account-forms/signup store=store authAPI=authAPI}}`);

    let testFirstName = 'Test';
    let testLastName = 'User';
    let testEmail = 'test@email.com';
    let testPassword = 'password123';

    await fillIn('input[name="given_name"]', testFirstName);
    await fillIn('input[name="family_name"]', testLastName);
    await fillIn('input[name="email"]', testEmail);
    await fillIn('input[name="emailConfirmation"]', testEmail);
    await fillIn('input[name="typedPassword"]', testPassword);
    await click('button[type="submit"]');

    delete fakeUser.save;
    assert.equal(createRecord.callCount, 1);
    assert.equal(save.callCount, 1);
    assert.deepEqual(fakeUser, {
      givenName: testFirstName,
      familyName: testLastName,
      email: testEmail,
      emailConfirmation: testEmail,
      typedPassword: testPassword
    });
  });

  test('submitting the form in noPassword state shows an error', async function(assert) {
    let testFirstName = 'Test';
    let testLastName = 'User';
    let testEmail = 'test@email.com';
    let testPassword = 'password123';
    let signUp = () => RSVP.reject({errors: {code: 'UserNoPassword'} });
    this.set('signUp', signUp);

    await render(hbs`{{nypr-account-forms/signup signUp=signUp}}`);

    await fillIn('input[name="given_name"]', testFirstName);
    await fillIn('input[name="family_name"]', testLastName);
    await fillIn('input[name="email"]', testEmail);
    await fillIn('input[name="emailConfirmation"]', testEmail);
    await fillIn('input[name="typedPassword"]', testPassword);
    await click('button[type="submit"]');

    assert.ok(find('.account-form-error'));
  });
});
