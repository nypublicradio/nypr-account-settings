import {
  validatePresence,
  validateFormat,
  validateConfirmation
} from 'ember-changeset-validations/validators';
import validateRemote from './remote';

export default {
  givenName:  validatePresence(true),
  familyName: validatePresence(true),
  preferredUsername: [
    validatePresence(true),
    validateRemote({path: '/api/v1/user'})
  ],
  email: [
    validatePresence(true),
    validateFormat({ type: 'email' }),
  ],
  confirmEmail: [
    validatePresence(true),  
    validateConfirmation({ on: 'email' })
  ]
};
