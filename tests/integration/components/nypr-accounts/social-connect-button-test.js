import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | nypr accounts/social connect button', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{nypr-accounts/social-connect-button}}`);

    assert.equal(findAll('.nypr-social-connect').length, 1);
  });

  test('it shows a manage link when connected', async function(assert) {
    let providerName='LoginZone';
    let manageUrl='http://example.com';
    this.set('providerName', providerName);
    this.set('manageUrl', manageUrl);
    await render(hbs`{{nypr-accounts/social-connect-button
      connected=true
      providerName=providerName
      manageUrl=manageUrl
    }}`);

    assert.equal(findAll('button').length, 0);
    assert.equal(findAll('a').length, 1);
    assert.equal(find('a').textContent.trim(), `Manage ${providerName} connection`);
    assert.equal(find('a').getAttribute('href'), manageUrl);
  });

  test('it shows a button when not connected', async function(assert) {
    let providerName='LoginZone';
    let buttonClass='loginzone-orange';
    this.set('providerName', providerName);
    this.set('buttonClass', buttonClass);
    await render(hbs`{{nypr-accounts/social-connect-button
      connected=false
      providerName=providerName
      buttonClass=buttonClass
    }}`);

    assert.equal(findAll('a').length, 0);
    assert.equal(findAll('button').length, 1);
    assert.equal(find('button').textContent.trim(), `Connect with ${providerName}`);
    assert.ok(find('button').classList.contains(buttonClass));
  });

  test('button shows font awesome icon', async function(assert) {
    let providerIcon='loginzone';
    this.set('providerIcon', providerIcon);
    await render(hbs`{{nypr-accounts/social-connect-button
      connected=false
      providerIcon=providerIcon
    }}`);

    assert.equal(findAll('button > i').length, 1);
    assert.ok(find('button > i').classList.contains(`fa-${providerIcon}`));
  });

  test('button triggers action', async function(assert) {
    let timesButtonWasPressed = 0;
    let buttonAction = () => timesButtonWasPressed++;
    this.set('buttonAction', buttonAction);
    await render(hbs`{{nypr-accounts/social-connect-button
      connected=false
      buttonAction=buttonAction
    }}`);

    await click('button');

    assert.equal(timesButtonWasPressed, 1);
  });
});
