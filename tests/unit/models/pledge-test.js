import { moduleForModel, test } from "ember-qunit";
import Ember from 'ember';

moduleForModel("pledge", "Unit | Model | pledge", {
  // Specify the other units that are required for this test.
  needs: []
});

test("it exists", function(assert) {
  let model = this.subject();

  Ember.run(function() {
    model.set("fund", "WNYC");
    assert.equal(
      model.get("updateLink"),
      "https://pledge3.wnyc.org/donate/mc-wnyc"
    );
    model.set("fund", "WQXR");
    assert.equal(
      model.get("updateLink"),
      "https://pledge3.wqxr.org/donate/mc-wqxr"
    );
    model.set("fund", "Radiolab");
    assert.equal(
      model.get("updateLink"),
      "https://pledge3.wnyc.org/donate/mc-radiolab"
    );
    model.set("fund", "Freakonomics");
    assert.equal(
      model.get("updateLink"),
      "https://pledge3.wnyc.org/donate/mc-freakonomics"
    );
    model.set("fund", "J. Schwartz");
    assert.equal(
      model.get("updateLink"),
      "https://pledge3.wnyc.org/donate/mc-jschwartz"
    );
  });
});
