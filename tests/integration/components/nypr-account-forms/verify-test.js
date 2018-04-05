import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | nypr account forms/verify', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.session = { authorize(_, callback) { callback('authorization', 'foo'); } };
  });

  test('it sends the correct values to the endpoint to verify the account', async function(assert) {
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

    await render(hbs`{{nypr-account-forms/verify
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

    assert.equal(requestSpy.callCount, 1);
    assert.equal(requestSpy.firstCall.args[0].requestHeaders['authorization'], 'foo');
    assert.deepEqual(JSON.parse(requestSpy.firstCall.args[0].requestBody), expectedRequestPayload);
  });

  test('it calls the onSuccess action on success', async function(assert) {
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

    await render(hbs`{{nypr-account-forms/verify
      emailId=emailId
      verificationToken=verificationToken
      membershipAPI=membershipAPI
      session=session
      onSuccess=onSuccess
      onFailure=onFailure}}`);

    assert.equal(onSuccess.callCount, 1);

  });

  test('it calls the onFailure action on failure', async function(assert) {
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

    await render(hbs`{{nypr-account-forms/verify
      emailId=emailId
      verificationToken=verificationToken
      membershipAPI=membershipAPI
      session=session
      onSuccess=onSuccess
      onFailure=onFailure}}`);

    assert.equal(onSuccess.callCount, 0);
    assert.equal(onFailure.callCount, 1);
  });

  test('it calls the onFailure action with the server error message', async function(assert) {
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

    await render(hbs`{{nypr-account-forms/verify
      emailId=emailId
      verificationToken=verificationToken
      membershipAPI=membershipAPI
      session=session
      onSuccess=onSuccess
      onFailure=onFailure}}`);

    assert.equal(onSuccess.callCount, 0);
    assert.equal(onFailure.callCount, 1);
    assert.equal(onFailure.firstCall.args[0], serverErrorMessage);

  });
});
