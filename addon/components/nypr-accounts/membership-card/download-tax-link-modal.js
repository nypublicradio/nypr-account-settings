import Ember from "ember";
import computed from "ember-computed";
import fetch from 'fetch';
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
      let requestHeaders = {};
      requestHeaders[header] = value;

      fetch(taxLetterUrl, {headers: requestHeaders}).then(response => {
        response.arrayBuffer().then(data => {
          var blob = new Blob([data], {type: "application/pdf"});
          var url = window.URL.createObjectURL(blob);
          var a = document.createElement("a");
          var el = document.getElementById("tax-receipt-modal-body")

          el.appendChild(a);
          a.classList.add('nypr-account-confirm')
          a.href = url;
          a.innerText = "Download Tax Document";
          a.download = "NYPR_Tax_Documentation.pdf";

          this.set("taxReceiptReady", true);
        });
      })

    });
    this._super();
  }
});
