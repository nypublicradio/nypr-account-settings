import { helper } from '@ember/component/helper';

export function centsOrWholeNumber(params/*, hash*/) {
  var number = params[0];
  return number.toFixed(2).split('.00')[0];
}

export default helper(centsOrWholeNumber);
