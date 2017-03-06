import {
  validateFormat,
  validateLength,
  validatePresence
} from 'ember-changeset-validations/validators';
import messages from './custom-messages';

export default {
  currentPassword:  validateLength({ min: 8 }),
  newPassword:      [
    validateFormat({regex: /^(?=[\S]*?[0-9]).{8,}$/, allowBlank: true, message: messages.passwordRules }),
    validatePresence({ presence: true, message: messages.passwordRequired })
  ]
};
