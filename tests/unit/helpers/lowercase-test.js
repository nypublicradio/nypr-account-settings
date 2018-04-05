
import { lowercase } from 'dummy/helpers/lowercase';
import { module, test } from 'qunit';

module('Unit | Helper | lowercase', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = lowercase(['I Am A String']);
    assert.ok(result);
    assert.equal(result, 'i am a string');
  });
});

