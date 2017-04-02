import DS from 'ember-data';
import { moduleForComponent, test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';
import moment from 'moment';
import RSVP from 'rsvp';

moduleForComponent(
  'nypr-accounts/membership-card',
  'Integration | Component | nypr accounts/membership card',
  {
    integration: true,
    beforeEach() {
      if (typeof server !== 'undefined') {
        server.shutdown();
      }
      this.server = startMirage();
    },
    afterEach() {
      this.server.shutdown();
      if (typeof server !== 'undefined') {
        server.shutdown();
      }
    }
  }
);

test('it renders', function(assert) {
  let pledges = server.createList('pledge', 8);
  let pledgePromise = DS.PromiseArray.create({
    promise: RSVP.Promise.resolve(pledges)
  });
  this.set('pledges', pledgePromise);

  this.render(hbs`{{nypr-accounts/membership-card/index pledges=pledges}}`);

  return wait().then(() => {
    assert.ok(
      this.$().text().trim().match(/Membership Info/),
      'has membership header'
    );
    assert.ok(this.$('a').text().trim().match(/Help/), 'has help link');
  });
});

// Active sustaining member tests

test('displays correct number of sustaining pledges', function(assert) {
  let pledges = server.createList('pledge', 8, {
    isActive: true,
    orderType: 'sustainer'
  });
  let pledgePromise = DS.PromiseArray.create({
    promise: RSVP.Promise.resolve(pledges)
  });

  this.set('promise', pledgePromise);

  this.render(hbs`{{nypr-accounts/membership-card/index pledges=promise}}`);

  return wait().then(() => {
    assert.equal(
      this.$('.pledge-container').length,
      8,
      'displays correct num of pledges'
    );
  });
});

test('displays sustaining pledge details', function(assert) {
  assert.expect(4);

  let pledges = server.createList('pledge', 1, {
    isActive: true,
    orderType: 'sustainer'
  });
  let pledgePromise = DS.PromiseArray.create({
    promise: RSVP.Promise.resolve(pledges)
  });
  this.set('pledges', pledgePromise);

  this.render(hbs`{{nypr-accounts/membership-card/index pledges=pledges}}`);

  return wait().then(() => {
    assert.equal(
      this.$('.pledge-order-price').text(),
      `$${pledges[0].orderPrice}/month`,
      'displays monthly amount'
    );
    assert.equal(
      this.$('.pledge-fund').text(),
      pledges[0].fund,
      'displays fund'
    );
    assert.equal(
      this.$('.pledge-order-cc-type').text(),
      `${pledges[0].creditCardType} ${pledges[0].creditCardLast4Digits}`,
      'displays credit card details'
    );
    assert.ok(
      this.$('span').text().trim().match(/Payment History/),
      'has payment history link'
    );
  });
});

// Active one-time member tests

test('displays most recent active pledge details if active onetime member', function(assert) {
  assert.expect(3);

  let pledges = server.createList('pledge', 1, {
    isActive: true,
    orderType: 'onetime'
  });
  let pledgePromise = DS.PromiseArray.create({
    promise: RSVP.Promise.resolve(pledges)
  });
  this.set('pledges', pledgePromise);

  this.render(hbs`{{nypr-accounts/membership-card/index pledges=pledges}}`);

  return wait().then(() => {
    assert.equal(
      this.$('.pledge-date').text().trim(),
      moment(pledges[0].orderDate).format('MMMM D, YYYY'),
      'date is displayed'
    );
    assert.equal(
      this.$('.pledge-donate-button-link').attr('href'),
      `https://pledge3.wnyc.org/donate/membership-sustainer/sustainer/?order_id=${pledges[0].orderKey}`,
      'donate links to correct sustainer form'
    );
    assert.ok(
      this.$('span').text().trim().match(/Payment History/),
      'has payment history link'
    );
  });
});

test('displays renewal message if recent member', function(assert) {
  assert.expect(2);
  let pledges = server.createList('pledge', 1, {
    isActive: false,
    orderType: 'onetime'
  });
  let pledgePromise = DS.PromiseArray.create({
    promise: RSVP.Promise.resolve(pledges)
  });
  this.set('pledges', pledgePromise);
  this.render(hbs`{{nypr-accounts/membership-card/index pledges=pledges}}`);

  return wait().then(() => {
    assert.equal(
      this.$('.pledge-donate-button').text(),
      'Donate to renew',
      'Button callout  for renewal'
    );
    assert.equal(
      this.$('.pledge-donate-button-link').attr('href'),
      `https://pledge3.wnyc.org/donate/membership-sustainer/sustainer/?order_id=${pledges[0].orderKey}`,
      'donate links to correct recap form'
    );
  });
});

test('displays donation callout for non-members', function(assert) {
  let pledges = server.createList('pledge', 0);
  let pledgePromise = DS.PromiseArray.create({
    promise: RSVP.Promise.resolve(pledges)
  });
  this.set('pledges', pledgePromise);
  this.render(hbs`{{nypr-accounts/membership-card/index pledges=pledges}}`);

  return wait().then(() => {
    assert.equal(
      this.$('.pledge-donate-button').text(),
      'Become a member',
      'Button callout for non-member'
    );
    assert.equal(
      this.$('.pledge-donate-button-link').attr('href'),
      `https://pledge3.wnyc.org/donate/membership-sustainer/sustainer/`,
      'donate button links to non sustainer version'
    );
  });
  // payment history link does NOT exist
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
