import Ember from "ember";
import layout from "../../templates/components/nypr-accounts/membership-card";
import computed from "ember-computed";
import moment from "moment";
import service from "ember-service/inject";

export default Ember.Component.extend({
  layout,
  session: service(),
  taxLetterUrl: computed(function() {
    let config = Ember.getOwner(this).resolveRegistration("config:environment");
    let urlRoot = config.membershipAPI || "https://api.wnyc.org";
    return `${urlRoot}/v1/taxes`;
  }),
  previousYear: computed(function() {
    return moment()
      .subtract(1, "year")
      .year();
  }),
  hasPledgesInPastTaxYear: computed.filter("pledges", function(pledge) {
    let previousYear = moment()
      .subtract(1, "year")
      .year();
    let pledgeYear = pledge.orderDate || pledge.get("orderDate").year();
    return moment(pledgeYear == previousYear);
  }),
  actions: {
    downloadTaxLetter() {
      this.get("session").authorize("authorizer:nypr", (header, value) => {
        let taxLetterUrl = this.get("taxLetterUrl");

        // https://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post
        var xhr = new XMLHttpRequest();
        xhr.open("GET", taxLetterUrl, true);
        xhr.setRequestHeader(header, value)
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
                  document.body.appendChild(a);
                  a.click();
                }
              } else {
                window.location = downloadUrl;
              }

              setTimeout(function() {
                URL.revokeObjectURL(downloadUrl);
              }, 100); // cleanup
            }
          }
        };
        xhr.setRequestHeader(
          "Content-type",
          "application/x-www-form-urlencoded"
        );
        xhr.send();
      });
    }
  }
});
