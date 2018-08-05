import Component from "@ember/component";
import { isNone } from "@ember/utils";
import { bind, later } from "@ember/runloop";
import { next } from "@ember/runloop";
import config from "ember-get-config";
import getScript from "../utils/get-script";

export default Component.extend({
  /**
   * Component based off ember-g-recaptcha ember component:
   * https://github.com/algonauti/ember-g-recaptcha
   */
  classNames: ["g-recaptcha"],
  sitekey: config.googleCaptchaKey,
  renderReCaptcha() {
    if (isNone(window.grecaptcha) || isNone(window.grecaptcha.render)) {
      later(() => {
        this.renderReCaptcha();
      }, 500);
    } else {
      let container = this.element;
      if (container) {
        let widgetId = window.grecaptcha.render(container, {
          sitekey: this.get("sitekey"),
          callback: bind(this, "successCallback"),
          "expired-callback": bind(this, "expiredCallback")
        });
        this.set("widgetId", widgetId);
      }
    }
  },

  resetReCaptcha() {
    window.grecaptcha.reset(this.get("widgetId"));
  },

  successCallback(recaptchaKey) {
    this.get("reCaptchaResponse")(recaptchaKey);
  },

  expiredCallback() {
    this.resetReCaptcha();
  },

  didInsertElement() {
    // If testing, bypass the getScript call to avoid pulling a live file on
    // each test run. This jumps straight to the successCallback.
    if (config.googleCaptchaEndpoint) {
      getScript(config.googleCaptchaEndpoint, () => {
        this._super(...arguments);
        next(() => {
          this.renderReCaptcha();
        });
      });
    } else {
      this._super(...arguments);
      next(() => {
        this.successCallback("non-working key");
      });
    }
  }
});
