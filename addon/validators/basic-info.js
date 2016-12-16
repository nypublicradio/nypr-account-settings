import {
  validatePresence,
  validateFormat
} from 'ember-changeset-validations/validators';
import validateRemote from './remote';

export default {
  givenName:  validatePresence(true),
  familyName: validatePresence(true),
  preferredUsername: [
    validatePresence(true),
    validateRemote({path: '/api/v1/user'})
  ],
  email:      validateFormat({ type: 'email' }),
};
