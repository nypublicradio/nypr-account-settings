import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('nypr-account-modal', 'Integration | Component | account modal', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{nypr-account-modal}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#nypr-account-modal as |m|}}
      {{#m.body}}
        body
      {{/m.body}}
      {{#m.footer}}
        footer
      {{/m.footer}}
    {{/nypr-account-modal}}
  `);

  assert.equal(this.$().siblings().find('.nypr-account-modal-body').text().trim(), 'body');
  assert.equal(this.$().siblings().find('.nypr-account-modal-footer').text().trim(), 'footer');
});

test('it accepts other params', function(assert) {
  assert.expect(2);
  
  this.set('close', () => assert.ok('close was called'));
  this.render(hbs`
    {{#nypr-account-modal closeAction=(action close) title="foo" as |m|}}
      {{#m.body}}
        body
      {{/m.body}}
      {{#m.footer}}
        footer
      {{/m.footer}}
    {{/nypr-account-modal}}
  `);

  assert.equal(this.$().siblings().find('.nypr-account-modal-title').text().trim(), 'foo');
  
  this.$().siblings().find('.nypr-account-modal-close').click();
});
