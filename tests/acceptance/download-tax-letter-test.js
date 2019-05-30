import { find, visit } from '@ember/test-helpers';
import { module, test } from "qunit";
import { setupApplicationTest } from 'ember-qunit';
import moment from "moment";

module("Acceptance | download tax letter", function(hooks) {
  setupApplicationTest(hooks);

  test("tax letter link is visible", async function(assert) {
    let lastYear = moment().subtract(1, "year").year();
    server.create("user");
    server.createList("pledge", 1, {
      orderDate: lastYear + "-03-26T11:57:22.139Z"
    });
    await visit("/");

    assert.equal(
      find(".tax-letter-link").textContent
        .trim(),
      `${lastYear} Tax Receipt`
    );
  });

  test("tax letter is not visible if no pledges", async function(assert) {
    server.create("user");
    server.createList('pledge', 0);
    await visit("/");

    assert.notOk(find(".tax-letter-link"));

  });

  test("tax letter is not visible if pledges from ineligible year", async function(assert) {
    server.create("user");
    server.createList("pledge", 20, {
      orderDate: "2015-10-28T07:34:00.502Z"
    });
    await visit("/");

    assert.notOk(find(".tax-letter-link"));
  });
});
