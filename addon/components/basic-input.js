import Component from 'ember-component';
import { bool } from 'ember-computed';
import set from 'ember-metal/set';
import layout from '../templates/components/basic-input';

export default Component.extend({
  layout,
  classNameBindings: ['hasError'],
  touched: false,
  // hasError: and('errors', 'touched'),
  hasError: bool('errors'),
  type: 'text',
  actions: {
    setTouched() {
      set(this, 'touched', true);
    }
  }
});
