import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('basic-input', 'Integration | Component | nypr swap input', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{basic-input}}`);

  assert.equal(this.$().text().trim(), '');

  // // Template block usage:
  // this.render(hbs`
  //   {{#basic-input}}
  //     template block text
  //   {{/basic-input}}
  // `);
  // 
  // assert.equal(this.$().text().trim(), 'template block text');
});
