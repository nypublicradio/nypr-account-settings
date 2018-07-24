import Component from '@ember/component';
import layout from '../../templates/components/nypr-account-modal/title';

const Title = Component.extend({
  tagName: 'span',
  layout
});

Title.reopenClass({
  positionalParams: ['text']
});

export default Title;
