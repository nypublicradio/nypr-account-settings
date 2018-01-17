import { test } from "qunit";
import moduleForAcceptance from "../../tests/helpers/module-for-acceptance";
import moment from "moment";

moduleForAcceptance("Acceptance | download tax letter");

test("tax letter link is visible", function(assert) {
  let lastYear = moment().subtract(1, "year").year();
  server.create("user");
  server.createList("pledge", 20);
  visit("/");

  andThen(function() {
    assert.equal(
      find(".tax-letter-link")
        .text()
        .trim(),
      `${lastYear} Tax Receipt`
    );
  });
});

test("tax letter is not visible if no pledges", function(assert) {
  server.create("user");
  server.createList('pledge', 0);
  visit("/");

  andThen(function() {
    assert.ok(find(".tax-letter-link").empty());
  });

});

test("tax letter is not visible if pledges from ineligible year", function(
  assert
) {
  server.create("user");
  server.createList("pledge", 20, {
    orderDate: "2015-10-28T07:34:00.502Z"
  });
  visit("/");

  andThen(function() {
    assert.ok(find(".tax-letter-link").empty());
  });
});
