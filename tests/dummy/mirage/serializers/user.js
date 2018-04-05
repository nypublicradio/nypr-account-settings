import { JSONAPISerializer } from 'ember-cli-mirage';
import { underscore } from '@ember/string';

export default JSONAPISerializer.extend({
  typeKeyForModel: () => 'user',
  keyForAttribute: attr => underscore(attr)
});
