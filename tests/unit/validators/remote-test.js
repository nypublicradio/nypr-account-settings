import { module, test } from 'qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

import validateRemote from 'nypr-account-settings/validators/nypr-accounts/remote';

module('Unit | Validator | remote', {
  beforeEach() {
    this.server = startMirage();
  },
  afterEach() {
    this.server.shutdown();
  }
});

test('it exists', function(assert) {
  assert.ok(validateRemote());
});

test('it works for non unique values', function(assert) {
  let done = assert.async();
  let key = 'username';
  let options = {path: '/api/v1/user', message: 'This username is taken'};
  let validator = validateRemote(options);
  
  // invalid response
  this.server.get(options.path, {username: 'foo'});
  validator(key, 'foo').then(msg => {
    assert.equal(msg, options.message);
    done();
  });
});
  
test('it works for unique values', function(assert) {
  let done = assert.async();
  let key = 'username';
  let options = {path: '/api/v1/user'};
  let validator = validateRemote(options);
  
  this.server.get(options.path, {username: ''});
  validator(key, 'foo').then(msg => {
    assert.equal(msg, true);
    done();
  });
});
