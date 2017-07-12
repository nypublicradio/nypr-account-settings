import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import { startMirage }  from 'dummy/initializers/ember-cli-mirage';
import RSVP from 'rsvp';
import sinon from 'sinon';

moduleForComponent('nypr-account-forms/signup', 'Integration | Component | account signup form', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it renders', function(assert) {
  this.render(hbs`{{nypr-account-forms/signup}}`);
  assert.equal(this.$('.account-form').length, 1);
});

test('submitting the form tries to save values on a new user model', function(assert) {
  let save = sinon.stub().returns(RSVP.Promise.resolve({}));
  let fakeUser = {save};
  let createRecord = sinon.stub().returns(fakeUser);
  let authAPI = 'http://example.com';
  let store = {createRecord};
  this.set('authAPI', authAPI);
  this.set('store', store);
  this.render(hbs`{{nypr-account-forms/signup store=store authAPI=authAPI}}`);

  let testFirstName = 'Test';
  let testLastName = 'User';
  let testEmail = 'test@email.com';
  let testPassword = 'password123';

  this.$('label:contains(First Name) + input').val(testFirstName).blur();
  this.$('label:contains(Last Name) + input').val(testLastName).blur();
  this.$('label:contains(Email) + input').val(testEmail).blur();
  this.$('label:contains(Confirm Email) + input').val(testEmail).blur();
  this.$('label:contains(Password) + input').val(testPassword).blur();
  this.$('button:contains(Sign up)').click();

  return wait().then(() => {
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
});

test('submitting the form in noPassword state shows an error', function(assert) {
  let testFirstName = 'Test';
  let testLastName = 'User';
  let testEmail = 'test@email.com';
  let testPassword = 'password123';
  let signUp = () => RSVP.reject({errors: {code: 'UserNoPassword'} });
  this.set('signUp', signUp);

  this.render(hbs`{{nypr-account-forms/signup signUp=signUp}}`);

  this.$('label:contains(First Name) + input').val(testFirstName).blur();
  this.$('label:contains(Last Name) + input').val(testLastName).blur();
  this.$('label:contains(Email) + input').val(testEmail).blur();
  this.$('label:contains(Confirm Email) + input').val(testEmail).blur();
  this.$('label:contains(Password) + input').val(testPassword).blur();
  this.$('button:contains(Sign up)').click();

  return wait().then(() => {
    assert.equal(this.$('.account-form-error').length, 1);
  });
});
