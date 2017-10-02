import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';
import messages from './custom-messages';

export default {
  password: [
    // At least one digit
    // (?=.*\d)
    //
    // Letters, numbers, special characters listed at http://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-policies.html
    // [\w-^$*.[\]{}()?"!@#%&/\\,><':;|~`]
    //
    // Minimum 8 characters
    // {8,}
    validateFormat({regex: /^(?=.*\d)[\w-^$*.[\]{}()?"!@#%&/\\,><':;|~`]{8,}$/, allowBlank: true, message: messages.passwordRules }),
    validatePresence({ presence: true, message: messages.passwordRequired })
  ]
};
