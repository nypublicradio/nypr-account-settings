import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nypr-account-forms/thanks', 'Integration | Component | nypr account forms/thanks', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{nypr-account-forms/thanks}}`);
  assert.equal(this.$('.account-form').length, 1);
});
