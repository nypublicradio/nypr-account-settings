"use strict";

module.exports = function (environment, appConfig) {
  let ENV = {
    environment: environment,
    authService: appConfig.authAPI,
    googleCaptchaKey:
      appConfig.googleCaptchaKey || "6Ld23V8kAAAAAC33lAWBrqN7TsPz_o7M4q8I-2MS",
    googleCaptchaEndpoint:
      "https://www.google.com/recaptcha/api.js?render=explicit",
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
