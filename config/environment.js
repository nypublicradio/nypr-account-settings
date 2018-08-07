"use strict";

module.exports = function(environment, appConfig) {
  let ENV = {
    environment: environment,
    authService: appConfig.authAPI,
    googleCaptchaKey:
      appConfig.googleCaptchaKey || "6LeJomQUAAAAABVGp6Xk3PUZGXNWaHo3t1D7mwF3",
    googleCaptchaEndpoint:
      "https://www.google.com/recaptcha/api.js?render=explicit"
  };

  if (environment === "development") {
    // Google-provided test key
    ENV.googleCaptchaKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
  }

  if (environment === "test") {
    ENV.googleCaptchaEndpoint = undefined;
  }

  return ENV;
};
