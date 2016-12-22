import {
  validatePresence,
  validateFormat,
  validateConfirmation
} from 'ember-changeset-validations/validators';
import validateRemote from './remote';

export default function({usernamePath}) {
  return {
    givenName:  validatePresence(true),
    familyName: validatePresence(true),
    preferredUsername: [
      validatePresence(true),
      validateRemote({
        path: `${usernamePath}/v1/user/exists-by-attribute`,
        filterKey: 'preferred_username'
      })
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
}
