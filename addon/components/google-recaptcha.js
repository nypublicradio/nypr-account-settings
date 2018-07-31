import Component from "@ember/component";
import layout from "../templates/components/google-recaptcha";
import { alias } from "@ember/object/computed";
import { isNone } from "@ember/utils";
import { bind, later } from "@ember/runloop";
import { merge } from "@ember/polyfills";
import { isPresent } from "@ember/utils";
import { next } from "@ember/runloop";

export default Component.extend({
  /**
   * Component based off ember-g-recaptcha ember component:
   * https://github.com/algonauti/ember-g-recaptcha
  */
  layout,
  classNames: ["g-recaptcha"],
  sitekey: "6LeJomQUAAAAABVGp6Xk3PUZGXNWaHo3t1D7mwF3", // public captcha key
  tabindex: alias("tabIndex"),

  renderReCaptcha() {
    if (isNone(window.grecaptcha) || isNone(window.grecaptcha.render)) {
      later(this, 'renderRecaptcha', 500);
    } else {
      let container = this.element;
      if (container) {
        let properties = this.getProperties(
          "sitekey",
          "theme",
          "type",
          "size",
          "tabindex",
          "hl"
        );
        let parameters = merge(properties, {
          callback: bind(this, "successCallback"),
          "expired-callback": bind(this, "expiredCallback")
        });
        let widgetId = window.grecaptcha.render(container, parameters);
        this.set("widgetId", widgetId);
      }
    }
  },

  resetReCaptcha() {
    window.grecaptcha.reset(this.get("widgetId"));
  },

  successCallback(recaptchaKey) {
    this.get('reCaptchaResponse')(recaptchaKey);
  },

  expiredCallback() {
    this.resetReCaptcha();
  },

  didInsertElement() {
    function getScript(source, callback) {
      /**
       * Loads and executes a script asynchronously; using this here so the
       * reCaptcha script isn't executed on every page, but only when the user
       * hits the sign up page.
       *
       * getScript snippet taken from https://stackoverflow.com/a/28002292
      */
      var script = document.createElement("script");
      var prior = document.getElementsByTagName("script")[0];
      script.async = 1;

      script.onload = script.onreadystatechange = function(_, isAbort) {
        if (
          isAbort ||
          !script.readyState ||
          /loaded|complete/.test(script.readyState)
        ) {
          script.onload = script.onreadystatechange = null;
          script = undefined;

          if (!isAbort && callback) {
            callback();
          }
        }
      };

      script.src = source;
      prior.parentNode.insertBefore(script, prior);
    }
    getScript("https://www.google.com/recaptcha/api.js?render=explicit", () => {
      this._super(...arguments);
      next(() => {
        this.renderReCaptcha();
      });
    });
  }
});
