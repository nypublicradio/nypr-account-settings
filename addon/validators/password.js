import {
  validateLength,
} from 'ember-changeset-validations/validators';

export default {
  oldPassword:  validateLength({ min: 8 }),
  newPassword:  validateLength({ min: 8 }),
};
