import DS from 'ember-data';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  find,
  click,
  findAll
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import RSVP from 'rsvp';
import sinon from 'sinon';

module('Integration | Component | nypr accounts/membership card', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let pledges = server.createList('pledge', 8);
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);

    await render(hbs`{{nypr-accounts/membership-card pledges=pledges}}`);

    assert.equal(
      find('.nypr-card-header').textContent.trim(), 'My Donation Status',
      'has membership header'
    );
    assert.ok(find('.pledge-help-link'), 'has help link');
  });

  test('it displays the custom message and link', async function(assert) {
    const message = "Test 123"
    const link = "http://example.com"
    const linkText = "Go to another page"
    this.set('message', message);
    this.set('link', link);
    this.set('linkText', linkText);

    await render(hbs`{{nypr-accounts/membership-card pledgeManagerEnabled=false customStatusMessage=message customStatusLinkUrl=link customStatusLinkText=linkText}}`);

    assert.equal(
      find('.nypr-card-header').textContent.trim(),
      'My Donation Status',
      'has membership header'
    );

    assert.equal(
      find('.membership-custom-message').textContent.trim(),
      message,
      'has custom message'
    );

    assert.equal(
      find('.membership-custom-link').textContent.trim(),
      linkText,
      'has custom link'
    );
  });

  test('it does not display the custom message and link when unset', async function(assert) {
    await render(hbs`{{nypr-accounts/membership-card pledgeManagerEnabled=false}}`);

    assert.equal(
      findAll('.membership-custom-message'),
      0,
      'has no custom message'
    );

    assert.equal(
      findAll('.membership-custom-link'),
      0,
      'has no custom link'
    );
  });

  // Active sustaining member tests

  test('displays correct number of sustaining pledges', async function(assert) {
    let pledges = server.createList('pledge', 8, {
      isActiveMember: true,
      orderType: 'sustainer'
    });
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });

    // Determine number of unique order codes in all active sustaining donations
    let allPledgeOrderCodes = [];
    let activePledges = pledges.filter((item) => item.isSustainer === true);
    activePledges.forEach(pledge => allPledgeOrderCodes.push(pledge.orderCode));
    let uniquePledgeOrders = Array.from(new Set(allPledgeOrderCodes));

    this.set('promise', pledgePromise);

    await render(hbs`{{nypr-accounts/membership-card pledges=promise}}`);

    assert.equal(
      findAll('.pledge-container').length,
      uniquePledgeOrders.length,
      'displays correct num of pledges'
    );
  });

  test('displays sustaining pledge details', async function(assert) {
    assert.expect(4);

    let pledges = server.createList('pledge', 1, {
      isActiveMember: true,
      isSustainer: true,
      orderType: 'sustainer'
    });
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);

    await render(hbs`{{nypr-accounts/membership-card pledges=pledges}}`);

    assert.equal(
      find('.pledge-order-price').textContent,
      `$${pledges[0].orderPrice} / month`,
      'displays monthly amount'
    );
    assert.equal(
      find('.pledge-fund').textContent,
      pledges[0].fund,
      'displays fund'
    );
    assert.equal(
      find('.pledge-order-cc-type').textContent,
      `${pledges[0].creditCardType} ${pledges[0].creditCardLast4Digits}`,
      'displays credit card details'
    );
    assert.ok(
      find('[data-test-selector="nypr-card-button"]').textContent.trim(), 'Giving History',
      'has giving history link'
    );
  });

  test('update link contains order id, aka order key', async function(assert) {
    let pledges = server.createList('pledge', 1, {
      isActiveMember: true,
      isSustainer: true,
      orderType: 'sustainer'
    });
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);

    await render(hbs`{{nypr-accounts/membership-card pledges=pledges}}`);

    assert.notEqual(
      find('.pledge-update-link a').getAttribute('href').indexOf(pledges[0].orderKey), -1
    );
  });

  test('sustaining pledge but no payments received so far', async function(assert) {
    let pledges = server.createList('pledge', 1, {
      isActiveMember: true,
      isSustainer: true,
      orderType: 'sustainer',
      isPayment: false
    });
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);

    await render(hbs`{{nypr-accounts/membership-card pledges=pledges}}`);

    await click('[data-test-selector="nypr-card-button"]');

    // Should not display the pledge record
    assert.equal(
      findAll('.pledge-history-container'),
      0,
      'Does not display giving-history tabs'
    );
  });

  test('only one sustaining payment, no onetime', async function(assert) {
    let pledges = server.createList('pledge', 1, {
      isActiveMember: true,
      isSustainer: true,
      orderType: 'sustainer',
      isPayment: true
    });
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);

    await render(hbs`{{nypr-accounts/membership-card pledges=pledges}}`);

    await click('[data-test-selector="nypr-card-button"]');

    // Should not display the pledge record
    assert.equal(
      findAll('div.nypr-tabs-tablist a').length,
      1,
      'shows only one tab - the Sustaining Dontations tab'
    );
  });

  test('only onetime pledges, no sustaining payments', async function(assert) {
    let pledges = server.createList('pledge', 1, {
      isActiveMember: true,
      orderType: 'onetime',
      isPayment: true
    });
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);

    await render(hbs`{{nypr-accounts/membership-card pledges=pledges}}`);

    await click('[data-test-selector="nypr-card-button"]');

    // Should not display the pledge record
    assert.equal(
      findAll('div.nypr-tabs-tablist a').length,
      1,
      'shows only one tab - the One-time donations tab'
    );
  });

  // Active one-time member tests

  test('displays most recent active pledge details if active onetime member', async function(assert) {
    assert.expect(3);

    let pledges = server.createList('pledge', 1, {
      isActiveMember: true,
      orderType: 'onetime'
    });
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);

    await render(hbs`{{nypr-accounts/membership-card pledges=pledges siteDomain='wnyc'}}`);

    assert.equal(
      find('.pledge-date').textContent.trim(),
      moment(pledges[0].orderDate).format('MMMM D, YYYY'),
      'date is displayed'
    );
    assert.equal(
      find('.pledge-donate-button').getAttribute('href'),
      `https://pledge3.wnyc.org/donate/mc-main/`,
      'donate links to correct sustainer form'
    );
    assert.ok(
      find('[data-test-selector="nypr-card-button"]').textContent.trim().match(/Giving History/),
      'has giving history link'
    );
  });

  test('displays renewal message if recent member', async function(assert) {
    assert.expect(2);
    let pledges = server.createList('pledge', 1, {
      isActiveMember: false,
      orderType: 'onetime'
    });
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);
    await render(hbs`{{nypr-accounts/membership-card pledges=pledges siteDomain='wnyc'}}`);

    assert.equal(
      find('.pledge-donate-button').textContent.trim(),
      'Donate to renew',
      'Button callout  for renewal'
    );
    assert.equal(
      find('.pledge-donate-button').getAttribute('href'),
      `https://pledge3.wnyc.org/donate/mc-main/`,
      'donate links to correct recap form'
    );
  });

  test('displays donation callout for non-members', async function(assert) {
    let pledges = server.createList('pledge', 0);
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);
    await render(hbs`{{nypr-accounts/membership-card pledges=pledges siteDomain='wnyc'}}`);

    assert.equal(
      find('.pledge-donate-button').textContent.trim(),
      'Become a member',
      'Button callout for non-member'
    );
    assert.equal(
      find('.pledge-donate-button').getAttribute('href'),
      `https://pledge3.wnyc.org/donate/mc-main/`,
      'donate button links to non sustainer version'
    );
    // payment history link does NOT exist
  });

  test('clicking help displays modal', async function(assert) {
    let pledges = server.createList('pledge', 0);
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);
    await render(hbs`{{nypr-accounts/membership-card pledges=pledges}}`);

    await click('.pledge-help-link');
    assert.ok(
      find('.nypr-account-modal-title').textContent.trim().match(/Membership Help/),
      'displays membership modal'
    );
  });

  test('displays pending email notification and it works', async function(assert) {
    let pledges = server.createList('pledge', 8);
    let user = server.create('user');
    let pledgePromise = DS.PromiseArray.create({
      promise: RSVP.Promise.resolve(pledges)
    });
    this.set('pledges', pledgePromise);
    this.set('user', user);
    let resend = sinon.stub().resolves();
    this.set('resendVerificationEmail', resend);

    await render(
      hbs`{{nypr-accounts/membership-card pledges=pledges emailIsPendingVerification=true user=user resendVerificationEmail=resendVerificationEmail resetDelay=0 autoReset=false}}`
    );

    assert.equal(findAll('.nypr-card-alert').length, 1, 'alert should exists');
    assert.ok(
      find('.nypr-card-alert').textContent.includes('A verification email has been sent'),
      'alert should contain verification message'
    );
    assert.ok(
      find('.nypr-card-alert').textContent.includes(user.email),
      'alert should contain user email address'
    );
    assert.equal(findAll('.nypr-card-alert .resend-button').length, 1, 'resend button should exist');

    await click('.nypr-card-alert .resend-button');

    assert.ok(resend.calledOnce, 'clicking on resend button should call resend once');
    assert.ok(find('.nypr-card-alert .resend-success'), 'resend success message should exist');
  });


  // test('displays expiring warning on near-expired membership', function(assert) {

  // });

  // test('pledge update link is populated with order_id', function(assert) {

  // });

  // test('payment history link works', function(assert) {

  // });

  // test('displays full payment history', function(assert) {

  // });

  // test('displays help modal when clicked on', function(assert) {

  // });
});
