import { pausable } from 'ember-pausable-test';
import { pauseOn, reset } from 'ember-pausable-test/test-support'
import { module, test } from 'qunit';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';

module('pausable | promise-y stuff', {
  afterEach() {
    reset();
  }
});

test('it can handle pausing on promisey-stuff', async function(assert) {
  let state = 0;
  const { resume, awaitPause } = pauseOn('pause-token');

  resolve().then(() => {
    state = 1;
    return pausable(resolve(), 'pause-token');
  }).then(() => {
    state = 2;
  });

  assert.equal(state, 0);

  await awaitPause();

  assert.equal(state, 1);

  resume();

  await wait();

  assert.equal(state, 2);
});


test('it can handle pausing on multiple promises', async function(assert) {
  let state = 0;
  const { resume: resume1, awaitPause: awaitPause1 } = pauseOn('pause-token-1');
  const { resume: resume2, awaitPause: awaitPause2 } = pauseOn('pause-token-2');

  resolve().then(() => {
    state = 1;
    return pausable(resolve(), 'pause-token-1');
  }).then(() => {
    state = 2;
    return pausable(resolve(), 'pause-token-2');
  }).then(() => {
    state = 3;
  });

  assert.equal(state, 0);

  await awaitPause1();

  assert.equal(state, 1);

  resume1();

  await awaitPause2();

  assert.equal(state, 2);

  resume2();

  await wait();

  assert.equal(state, 3);
});
