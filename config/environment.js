'use strict';

module.exports = function(environment, appConfig) {
  return {
    authService: appConfig.authAPI
  };
};
