/* eslint-env node */
'use strict';

module.exports = function(environment, appConfig) {
  return {
    authService: appConfig.wnycAuthAPI
  };
};
