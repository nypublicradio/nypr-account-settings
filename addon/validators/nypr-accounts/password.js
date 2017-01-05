import {
  validateFormat,
  validateLength
} from 'ember-changeset-validations/validators';

export default {
  currentPassword:  validateLength({ min: 8 }),
  newPassword:      [ 
    validateLength({ min: 8 }),
    validateFormat({ regex: /\d/ })
  ]
};
