import { helper } from '@ember/component/helper';

export function lowercase(params/*, hash*/) {
  let myString = params[0];
  return myString.toLowerCase();
}

export default helper(lowercase);
