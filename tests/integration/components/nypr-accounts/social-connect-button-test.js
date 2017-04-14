import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nypr-accounts/social-connect-button', 'Integration | Component | nypr accounts/social connect button', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{nypr-accounts/social-connect-button}}`);

  assert.equal(this.$('.nypr-social-connect').length, 1);
});

test('it shows a manage link when connected', function(assert) {
  let providerName='LoginZone';
  let manageUrl='http://example.com';
  this.set('providerName', providerName);
  this.set('manageUrl', manageUrl);
  this.render(hbs`{{nypr-accounts/social-connect-button
    connected=true
    providerName=providerName
    manageUrl=manageUrl
  }}`);

  assert.equal(this.$('button').length, 0);
  assert.equal(this.$('a').length, 1);
  assert.equal(this.$('a').text().trim(), `Manage ${providerName} connection`);
  assert.equal(this.$('a').attr('href'), manageUrl);
});

test('it shows a button when not connected', function(assert) {
  let providerName='LoginZone';
  let buttonClass='loginzone-orange';
  this.set('providerName', providerName);
  this.set('buttonClass', buttonClass);
  this.render(hbs`{{nypr-accounts/social-connect-button
    connected=false
    providerName=providerName
    buttonClass=buttonClass
  }}`);

  assert.equal(this.$('a').length, 0);
  assert.equal(this.$('button').length, 1);
  assert.equal(this.$('button').text().trim(), `Connect with ${providerName}`);
  assert.ok(this.$('button').hasClass(buttonClass));
});

test('button shows font awesome icon', function(assert) {
  let providerIcon='loginzone';
  this.set('providerIcon', providerIcon);
  this.render(hbs`{{nypr-accounts/social-connect-button
    connected=false
    providerIcon=providerIcon
  }}`);

  assert.equal(this.$('button > i').length, 1);
  assert.ok(this.$('button > i').hasClass(`fa-${providerIcon}`));
});

test('button triggers action', function(assert) {
  let timesButtonWasPressed = 0;
  let buttonAction = () => timesButtonWasPressed++;
  this.set('buttonAction', buttonAction);
  this.render(hbs`{{nypr-accounts/social-connect-button
    connected=false
    buttonAction=buttonAction
  }}`);

  this.$('button').click();

  assert.equal(timesButtonWasPressed, 1);
});
