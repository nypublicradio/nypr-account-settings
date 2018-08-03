import Component from '@ember/component';
import layout from '../../templates/components/nypr-account-modal/close-button';

const Button = Component.extend({
  tagName: 'button',
  classNames: ['nypr-account-modal-close'],
  attributeBindings: ['data-category', 'data-action', 'data-label', 'data-value'],
  layout
});

Button.reopenClass({
  positionalParams: ['text']
});

export default Button;
