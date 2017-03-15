import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { startMirage }  from 'dummy/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';

moduleForComponent('nypr-account-forms/verify', 'Integration | Component | nypr account forms/verify', {
  integration: true,
  beforeEach() {
    this.server = startMirage();
    this.session = { authorize(_, callback) { callback('authorization', 'foo'); } };

  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it sends the correct values to the endpoint to verify the account', function(assert) {
  this.set('session', this.session);

  const testEmailId = 'email';
  const testVerification = 'QWERTYUIOP';
  let authAPI = 'http://example.com';
  this.set('emailId', testEmailId);
  this.set('verificationCode', testVerification);
  this.set('authAPI', authAPI);

  let requestSpy = sinon.spy();
  let url = `${authAPI}/membership/email/${testEmailId}/verify`;
  this.server.patch(url, (schema, request) => {
    requestSpy(request);
    return {};
  }, 200);

  this.render(hbs`{{nypr-account-forms/verify
    emailId=emailId
    verificationCode=verificationCode
    authAPI=authAPI
    session=session}}`);

  return wait().then(() => {
    assert.equal(requestSpy.callCount, 1);
    assert.equal(requestSpy.firstCall.args[0].requestHeaders['authorization'], 'foo');
    assert.deepEqual(JSON.parse(requestSpy.firstCall.args[0].requestBody), { verification_code: testVerification });
  });
});

test('it calls the onSuccess action on success', function(assert) {
  this.set('session', this.session);

  const testEmailId = 'email';
  const testVerification = 'QWERTYUIOP';
  let authAPI = 'http://example.com';
  let onSuccess = sinon.spy();
  let onFailure = sinon.spy();

  this.set('emailId', testEmailId);
  this.set('verificationCode', testVerification);
  this.set('authAPI', authAPI);
  this.set('onSuccess', onSuccess);
  this.set('onFailure', onFailure);

  let url = `${authAPI}/membership/email/${testEmailId}/verify`;
  this.server.patch(url, () => {return {};}, 200);

  this.render(hbs`{{nypr-account-forms/verify
    emailId=emailId
    verificationCode=verificationCode
    authAPI=authAPI
    session=session
    onSuccess=onSuccess
    onFailure=onFailure}}`);

  return wait().then(() => {
    assert.equal(onSuccess.callCount, 1);
    assert.equal(onFailure.callCount, 0);
  });
});

test('it calls the onFailure action on failure', function(assert) {
  this.set('session', this.session);

  const testEmailId = 'email';
  const testVerification = 'QWERTYUIOP';
  let authAPI = 'http://example.com';
  let onSuccess = sinon.spy();
  let onFailure = sinon.spy();

  this.set('emailId', testEmailId);
  this.set('verificationCode', testVerification);
  this.set('authAPI', authAPI);
  this.set('onSuccess', onSuccess);
  this.set('onFailure', onFailure);

  let url = `${authAPI}/membership/email/${testEmailId}/verify`;
  this.server.patch(url, () => {return {};}, 400);

  this.render(hbs`{{nypr-account-forms/verify
    emailId=emailId
    verificationCode=verificationCode
    authAPI=authAPI
    session=session
    onSuccess=onSuccess
    onFailure=onFailure}}`);
  return wait().then(() => {
    assert.equal(onSuccess.callCount, 0);
    assert.equal(onFailure.callCount, 1);
  });
});


test('it calls the onFailure action with the server error message', function(assert) {
  this.set('session', this.session);

  const testEmailId = 'email';
  const testVerification = 'QWERTYUIOP';
  const serverErrorMessage = 'something went wrong';
  let authAPI = 'http://example.com';
  let onSuccess = sinon.spy();
  let onFailure = sinon.spy();

  this.set('emailId', testEmailId);
  this.set('verificationCode', testVerification);
  this.set('authAPI', authAPI);
  this.set('onSuccess', onSuccess);
  this.set('onFailure', onFailure);

  let url = `${authAPI}/membership/email/${testEmailId}/verify`;
  this.server.patch(url, () => {return { errors: {code: 'ServerError', message: serverErrorMessage } };}, 400);

  this.render(hbs`{{nypr-account-forms/verify
    emailId=emailId
    verificationCode=verificationCode
    authAPI=authAPI
    session=session
    onSuccess=onSuccess
    onFailure=onFailure}}`);
  return wait().then(() => {
    assert.equal(onSuccess.callCount, 0);
    assert.equal(onFailure.callCount, 1);
    assert.equal(onFailure.firstCall.args[0], serverErrorMessage);
  });
});
