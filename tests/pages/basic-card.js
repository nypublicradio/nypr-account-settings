import {
  create,
  fillable,
  clickable,
  value
} from 'ember-cli-page-object';

export default create({
  fillInGivenName: fillable('input[name=givenName]'),
  fillInFamilyName: fillable('input[name=familyName]'),
  fillInUsername: fillable('input[name=preferredUsername]'),
  fillInEmail: fillable('input[name=email]'),
  fillInConfirmEmail: fillable('input[name=confirmEmail]'),
  clickCancel: clickable('[data-test-selector=rollback]'),
  clickSave: clickable('[data-test-selector=save]'),
  givenName: value('input[name=givenName]'),
  familyName: value('input[name=familyName]'),
  username: value('input[name=preferredUsername]'),
  email: value('input[name=email]'),
  confirmEmail: value('input[name=confirmEmail]'),
  passwordModal: {
    testContainer: '.ember-modal-wrapper',
    fillInPassword: fillable('input[name=passwordForEmailChange]'),
    clickSubmit: clickable('[data-test-selector="check-pw"]'),
    clickX: clickable('.nypr-account-modal-close'),
  }
});



