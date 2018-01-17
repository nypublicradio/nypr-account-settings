import Ember from "ember";
import computed from "ember-computed";
import layout from "../../../templates/components/nypr-accounts/membership-card/download-tax-link-modal";
import service from "ember-service/inject";

export default Ember.Component.extend({
  layout,
  session: service(),
  taxLetterUrl: computed(function() {
    let config = Ember.getOwner(this).resolveRegistration("config:environment");
    let urlRoot = config.membershipAPI || "https://api.wnyc.org";
    return `${urlRoot}/v1/taxes`;
  }),
  init() {
    this.get("session").authorize("authorizer:nypr", (header, value) => {
      let taxLetterUrl = this.get("taxLetterUrl");
      let that = this;

      // https://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post
      var xhr = new XMLHttpRequest();
      xhr.open("GET", taxLetterUrl, true);
      xhr.setRequestHeader(header, value);
      xhr.responseType = "arraybuffer";
      xhr.onload = function() {
        if (this.status === 200) {
          var filename = "";
          var disposition = xhr.getResponseHeader("Content-Disposition");
          if (disposition && disposition.indexOf("attachment") !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1])
              filename = matches[1].replace(/['"]/g, "");
          }
          var type = xhr.getResponseHeader("Content-Type");

          var blob =
            typeof File === "function"
              ? new File([this.response], filename, { type: type })
              : new Blob([this.response], { type: type });
          if (typeof window.navigator.msSaveBlob !== "undefined") {
            // IE workaround for "HTML7007: One or more blob URLs were
            // revoked by closing the blob for which they were created. These
            // URLs will no longer resolve as the data backing the URL has
            // been freed."
            window.navigator.msSaveBlob(blob, filename);
          } else {
            var URL = window.URL || window.webkitURL;
            var downloadUrl = URL.createObjectURL(blob);

            if (filename) {
              // use HTML5 a[download] attribute to specify filename
              var a = document.createElement("a");
              // safari doesn't support this yet
              if (typeof a.download === "undefined") {
                window.location = downloadUrl;
              } else {
                a.href = downloadUrl;
                a.download = filename;
              }
            } else {
              window.location = downloadUrl;
            }

            // Add a href to modal
            var el = document.getElementById("tax-receipt-modal-body");
            el.appendChild(a);
            a.classList.add("nypr-account-confirm");
            a.innerText = "Download Tax Document";

            that.set("taxReceiptReady", true);
          }
        }
      };
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send();
    });

    this._super();
  }
});
