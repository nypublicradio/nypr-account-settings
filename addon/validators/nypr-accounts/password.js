import {
  validateFormat,
  validateLength
} from 'ember-changeset-validations/validators';

export default {
  currentPassword:  validateLength({ min: 8 }),
  newPassword:      [ 
    validateLength({ min: 8, message: 'New password must be at least 8 characters.'}),
    validateFormat({ regex: /\d/, message: 'New password must have at least 1 number.' })
  ]
};
