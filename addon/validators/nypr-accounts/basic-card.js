import {
  validatePresence,
  validateFormat,
  validateConfirmation
} from 'ember-changeset-validations/validators';
import validateRemote from './remote';

export default function({usernamePath}) {
  return {
    givenName:  validatePresence({
      presence: true,
      message: 'first name cannot be blank'
    }),
    familyName: validatePresence({
      presence: true,
      message: 'last name cannot be blank'
    }),
    preferredUsername: [
      validatePresence({
        presence: true,
        message: 'public handle cannot be blank'
      }),
      validateRemote({
        path: `${usernamePath}/v1/user/exists-by-attribute`,
        filterKey: 'preferred_username',
        message: 'public handle already exists'
      })
    ],
    email: [
      validatePresence({
      presence: true,
        message: 'email cannot be blank'
      }),
      validateFormat({ type: 'email', allowBlank: true, message: 'this is not a valid email address' }),
    ],
    confirmEmail: validateConfirmation({ on: 'email', message: "the emails you typed don't match" })
  };
}
