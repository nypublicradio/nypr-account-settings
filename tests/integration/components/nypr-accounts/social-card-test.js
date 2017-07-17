import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nypr-accounts/social-card', 'Integration | Component | nypr accounts/social card', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{nypr-accounts/social-card}}`);

  assert.equal(this.$('.nypr-social-card__header').length, 1);
});


test('it yields a connect button', function(assert) {
  this.render(hbs`
    {{#nypr-accounts/social-card as |card|}}
      {{card.connect-button}}
    {{/nypr-accounts/social-card}}`);

  assert.equal(this.$('.nypr-social-connect__button').length, 1);
});

test('it yields three connect buttons', function(assert) {
  this.render(hbs`
    {{#nypr-accounts/social-card as |card|}}
      {{card.connect-button}}
      {{card.connect-button}}
      {{card.connect-button}}
    {{/nypr-accounts/social-card}}`);

  assert.equal(this.$('.nypr-social-connect__button').length, 3);
});
