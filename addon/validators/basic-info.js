import {
  validatePresence,
  validateFormat
} from 'ember-changeset-validations/validators';
import validateRemote from './remote';

export default {
  name:       validatePresence(true),
  familyName: validatePresence(true),
  username:   [
    validatePresence(true),
    validateRemote({path: '/api/v1/user'})
  ],
  email:      validateFormat({ type: 'email' }),
};
