import {
  create,
  fillable,
  clickable,
  value,
  text
} from 'ember-cli-page-object';

export default create({
  fillInGivenName: fillable('input[name=givenName]'),
  fillInFamilyName: fillable('input[name=familyName]'),
  fillInUsername: fillable('input[name=preferredUsername]'),
  fillInEmail: fillable('input[name=email]'),
  fillInConfirmEmail: fillable('input[name=confirmEmail]'),
  clickEdit: clickable('[data-test-selector=nypr-card-button]'),
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
  },
  emailModal: {
    testContainer: '.ember-modal-wrapper',
    fillInEmail: fillable('input[name=connectEmail]'),
    fillInConfirmEmail: fillable('input[name=connectEmailConfirmation]'),
    clickSubmit: clickable('[data-test-selector="enter-email"]'),
    clickX: clickable('.nypr-account-modal-close'),
  },
  checkYourEmailModal: {
    testContainer: '.ember-modal-wrapper',
    clickGotIt: clickable('[data-test-selector="got-it"]'),
    clickX: clickable('.nypr-account-modal-close'),
  },
  currentModal: {
    testContainer: '.ember-modal-wrapper',
    title: text('.nypr-account-modal-title'),
  }
});



