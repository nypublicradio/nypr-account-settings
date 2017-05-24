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

  const testEmailId = '123';
  const testVerification = 'QWERTYUIOP';
  let membershipAPI = 'http://example.com';
  this.set('emailId', testEmailId);
  this.set('verificationToken', testVerification);
  this.set('membershipAPI', membershipAPI);

  let requestSpy = sinon.spy();
  let url = `${membershipAPI}/v1/emails/${testEmailId}/verify/`;
  this.server.patch(url, (schema, request) => {
    requestSpy(request);
    return {};
  }, 200);

  this.render(hbs`{{nypr-account-forms/verify
    emailId=emailId
    verificationToken=verificationToken
    membershipAPI=membershipAPI
    session=session}}`);

  const expectedRequestPayload =  {
  data: {
      id: Number(testEmailId),
      type: "EmailAddress",
      attributes: {
        "verification_token": testVerification
      }
    }
  };

  return wait().then(() => {
    assert.equal(requestSpy.callCount, 1);
    assert.equal(requestSpy.firstCall.args[0].requestHeaders['authorization'], 'foo');
    assert.deepEqual(JSON.parse(requestSpy.firstCall.args[0].requestBody), expectedRequestPayload);
  });
});

test('it calls the onSuccess action on success', function(assert) {
  this.set('session', this.session);

  const testEmailId = '123';
  const testVerification = 'QWERTYUIOP';
  let membershipAPI = 'http://example.com';
  let onSuccess = sinon.spy();
  let onFailure = sinon.spy();

  this.set('emailId', testEmailId);
  this.set('verificationToken', testVerification);
  this.set('membershipAPI', membershipAPI);
  this.set('onSuccess', onSuccess);
  this.set('onFailure', onFailure);

  let url = `${membershipAPI}/v1/emails/${testEmailId}/verify/`;
  this.server.patch(url, () => {return {data: {success: true}};}, 200);

  this.render(hbs`{{nypr-account-forms/verify
    emailId=emailId
    verificationToken=verificationToken
    membershipAPI=membershipAPI
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

  const testEmailId = '123';
  const testVerification = 'QWERTYUIOP';
  let membershipAPI = 'http://example.com';
  let onSuccess = sinon.spy();
  let onFailure = sinon.spy();

  this.set('emailId', testEmailId);
  this.set('verificationToken', testVerification);
  this.set('membershipAPI', membershipAPI);
  this.set('onSuccess', onSuccess);
  this.set('onFailure', onFailure);

  let url = `${membershipAPI}/v1/emails/${testEmailId}/verify/`;
  this.server.patch(url, () => {return {data: {success: false}};}, 200);

  this.render(hbs`{{nypr-account-forms/verify
    emailId=emailId
    verificationToken=verificationToken
    membershipAPI=membershipAPI
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

  const testEmailId = '123';
  const testVerification = 'QWERTYUIOP';
  const serverErrorMessage = 'something went wrong';
  let membershipAPI = 'http://example.com';
  let onSuccess = sinon.spy();
  let onFailure = sinon.spy();

  this.set('emailId', testEmailId);
  this.set('verificationToken', testVerification);
  this.set('membershipAPI', membershipAPI);
  this.set('onSuccess', onSuccess);
  this.set('onFailure', onFailure);

  let url = `${membershipAPI}/v1/emails/${testEmailId}/verify/`;
  this.server.patch(url, () => {return { errors: {code: 'ServerError', message: serverErrorMessage } };}, 400);

  this.render(hbs`{{nypr-account-forms/verify
    emailId=emailId
    verificationToken=verificationToken
    membershipAPI=membershipAPI
    session=session
    onSuccess=onSuccess
    onFailure=onFailure}}`);
  return wait().then(() => {
    assert.equal(onSuccess.callCount, 0);
    assert.equal(onFailure.callCount, 1);
    assert.equal(onFailure.firstCall.args[0], serverErrorMessage);
  });
});