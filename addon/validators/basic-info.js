import {
  validatePresence,
  validateFormat
} from 'ember-changeset-validations/validators';
import validateRemote from './remote';

export default {
  firstName:  validatePresence(true),
  lastName:   validatePresence(true),
  username:   [
    validatePresence(true),
    validateRemote({path: '/api/v1/user'})
  ],
  email:      validateFormat({ type: 'email' }),
};
