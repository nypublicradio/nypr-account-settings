import Ember from 'ember';

export function lowercase(params/*, hash*/) {
  let myString = params[0];
  return myString.toLowerCase();
}

export default Ember.Helper.helper(lowercase);
