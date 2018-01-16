import Ember from "ember";
import layout from "../../templates/components/nypr-accounts/membership-card";
import computed from "ember-computed";
import moment from "moment";
import service from 'ember-service/inject';

export default Ember.Component.extend({
  layout,
  session: service(),
  taxLetterUrl: computed(function() {
    let config = Ember.getOwner(this).resolveRegistration('config:environment');
    let urlRoot = config.membershipAPI || "https://api.wnyc.org";
    return `${urlRoot}/v1/taxes`;
  }),
  previousYear: computed(function() {
    return moment()
      .subtract(1, "year")
      .year();
  }),
  hasPledgesInPastTaxYear: computed.filter("pledges", function(pledge) {
    let previousYear = moment().subtract(1, "year").year();
    let pledgeYear = pledge.orderDate || pledge.get("orderDate").year();
    return moment(pledgeYear == previousYear);
  }),
  actions: {
    downloadTaxLetter() {
      this.get('session').authorize('authorizer:nypr', (header, value) => {
        let taxLetterUrl = this.get("taxLetterUrl");
        let fetchOptions = {};
        fetchOptions[header] = value;

        fetch(taxLetterUrl, fetchOptions).then(response => {
          response.arrayBuffer().then(data =>{
            var blob = new Blob([data], {type: "application/pdf"});
            var url = window.URL.createObjectURL(blob);

            // Create hidden <a>, click on it, remove it
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.href = url;
            a.download = "NYPR_Tax_Documentation.pdf";
            a.click();
            window.URL.revokeObjectURL(url);
          });
        })
      });
    }
  }
});
