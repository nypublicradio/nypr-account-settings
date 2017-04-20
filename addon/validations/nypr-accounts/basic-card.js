import {
  validatePresence,
  validateLength,
  validateFormat,
  validateConfirmation
} from 'ember-changeset-validations/validators';
import validateRemote from 'nypr-account-settings/validators/nypr-accounts/remote';
import messages from './custom-messages';

export default function({usernamePath}) {
  return {
    givenName:  [
      validatePresence({ presence: true, message: messages.firstNameRequired }),
      validateLength({ max: 20, message: messages.firstNameMaxLength }),
      validateFormat({ regex: /^\S.*$/, allowBlank: true, message: messages.noLeadingSpace }),
      validateFormat({ regex: /^.*\S$/, allowBlank: true, message: messages.noTrailingSpace })
    ],
    familyName: [
      validatePresence({ presence: true, message: messages.lastNameRequired }),
      validateLength({ max: 40, message: messages.lastNameMaxLength }),
      validateFormat({ regex: /^\S.*$/, allowBlank: true, message: messages.noLeadingSpace }),
      validateFormat({ regex: /^.*\S$/, allowBlank: true, message: messages.noTrailingSpace })
    ],
    preferredUsername: [
      validatePresence({
        presence: true,
        message: messages.publicHandleRequired
      }),
      validateRemote({
        path: `${usernamePath}/v1/user/exists-by-attribute`,
        filterKey: 'preferred_username',
        message: messages.publicHandleExists
      })
    ],
    email: [
      validatePresence({
      presence: true,
        message: messages.emailRequired
      }),
      validateRemote({
        path: `${usernamePath}/v1/user/exists-by-attribute`,
        filterKey: 'email',
        message: messages.emailExists
      }),
      validateFormat({ type: 'email', allowBlank: true, message: messages.emailFormat }),
    ],
    confirmEmail: validateConfirmation({ on: 'email', message: messages.emailConfirmation })
  };
}
