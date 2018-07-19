import Component from "@ember/component";
import layout from "../templates/components/google-recaptcha";
import { alias } from "@ember/object/computed";
import { isNone } from "@ember/utils";
import { later } from "@ember/runloop";
import { merge } from "@ember/polyfills";
import { isPresent } from "@ember/utils";
import { next } from "@ember/runloop";

export default Component.extend({
  layout,

  classNames: ["g-recaptcha"],

  sitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",

  tabindex: alias("tabIndex"),

  renderReCaptcha() {
    if (isNone(window.grecaptcha) || isNone(window.grecaptcha.render)) {
      later(() => {
        this.renderReCaptcha();
      }, 500);
    } else {
      let container = this.$()[0];
      let properties = this.getProperties(
        "sitekey",
        "theme",
        "type",
        "size",
        "tabindex",
        "hl"
      );
      let parameters = merge(properties, {
        callback: this.get("successCallback").bind(this),
        "expired-callback": this.get("expiredCallback").bind(this)
      });
      let widgetId = window.grecaptcha.render(container, parameters);
      this.set("widgetId", widgetId);
      this.set("ref", this);
    }
  },

  resetReCaptcha() {
    if (isPresent(this.get("widgetId"))) {
      window.grecaptcha.reset(this.get("widgetId"));
    }
  },

  successCallback() {
    this.get('reCaptchaResponse')();
  },

  expiredCallback() {
    let action = this.get("onExpired");
    if (isPresent(action)) {
      action();
    } else {
      this.resetReCaptcha();
    }
  },

  // Lifecycle Hooks

  didInsertElement() {
    function getScript(source, callback) {
      // getScript snippet taken from https://stackoverflow.com/a/28002292
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

          if (!isAbort) {
            if (callback) callback();
          }
        }
      };

      script.src = source;
      prior.parentNode.insertBefore(script, prior);
    }
    getScript("https://www.google.com/recaptcha/api.js", () => {
      this._super(...arguments);
      next(() => {
        this.renderReCaptcha();
      });
    });
  }
});
