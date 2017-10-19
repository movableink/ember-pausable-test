import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { pauseOn, reset } from 'ember-concurrency-test-controller/test-support'

moduleForAcceptance('Acceptance | friend', {
  afterEach() {
    reset();
  }
});

test('visiting /friend/1', async function(assert) {
  const { resume, awaitPause } = pauseOn('friend-promise');

  visit('/friend/1');

  await awaitPause();

  assert.ok(find('.loading').length, 'loading screen visible');

  resume();

  await andThen(() => {});

  assert.ok(find('.friend-name').text().trim(), 'Steve');
  assert.ok(find('.friend-id').text().trim(), '1');
});

test('erroring on /friend/1', async function(assert) {
  const { throwException, awaitPause } = pauseOn('friend-promise');

  visit('/friend/1');

  await awaitPause();

  assert.ok(find('.loading').length, 'loading screen visible');

  throwException();

  await andThen(() => {});

  assert.ok(find('.error-state').length, 'error state visible');
});
