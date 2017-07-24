
import { centsOrWholeNumber } from 'dummy/helpers/cents-or-whole-number';
import { module, test } from 'qunit';

module('Unit | Helper | cents or whole number');

// Replace this with your real tests.
test('it works', function(assert) {
  let result = centsOrWholeNumber([42]);
  assert.ok(result);
});

test('whole number does not contain decimals', function(assert) {
  let result = centsOrWholeNumber([42.000000]);
  assert.equal(result, "42");
});

test('number with exact cents show cents', function(assert) {
  let result = centsOrWholeNumber([42.42]);
  assert.equal(result, "42.42");
});

test('more than two decimals is rounded to two places', function(assert) {
  let result = centsOrWholeNumber([42.5555555555]);
  assert.equal(result, "42.56");
});

test('an almost-whole number is represented as a whole', function(assert) {
  let result = centsOrWholeNumber([42.9999999999999999]);
  assert.equal(result, "43");
});
