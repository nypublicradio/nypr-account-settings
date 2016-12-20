/* jshint node: true */
'use strict';

module.exports = {
  name: 'nypr-account-settings',
  included: function(app) {
    this._super.included(app);
  },
  isDevelopingAddon: () => true
};
