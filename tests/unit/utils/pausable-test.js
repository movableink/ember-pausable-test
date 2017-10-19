import { pausable } from 'ember-concurrency-test-controller';
import { pauseOn, reset } from 'ember-concurrency-test-controller/test-support'
import { module, test } from 'qunit';
import EmberObject, { get, set } from '@ember/object';
import { run } from '@ember/runloop';
import { task, timeout } from 'ember-concurrency';
import wait from 'ember-test-helpers/wait';
import { defer } from 'rsvp';

module('Unit | Utility | pausable', {
  beforeEach() {
    this.registerTask = (taskFn) => {
      return this._obj = EmberObject.extend({
        myTask: task(taskFn)
      }).create();
    };

    this.perform = (...args) => {
      run(get(this._obj, 'myTask'), 'perform', ...args);
    }
  },
  afterEach() {
    const { _obj } = this;
    this._obj = null;
    run(_obj, 'destroy');
    reset();
  }
});

test('it can pause on a task if it resolves synchronously', async function(assert) {
  const obj = this.registerTask(function *() {
    set(this, 'value', '1');
    yield pausable('resolves', 'yield-1');
    set(this, 'value', '2');
  });

  const { resume } = pauseOn('yield-1');

  this.perform();

  assert.equal(get(obj, 'value'), '1', 'we have paused on `yield-1`');

  resume();

  await wait();

  assert.equal(get(obj, 'value'), '2', 'we have proceeded past');
});

test('it can pause on a task that resolves asynchronously', async function(assert) {
  const { promise, resolve } = defer();

  const obj = this.registerTask(function *() {
    set(this, 'value', '1');
    yield pausable(promise, 'yield-1');
    set(this, 'value', '2');
  });

  const { resume } = pauseOn('yield-1');

  this.perform();

  assert.equal(get(obj, 'value'), '1', 'we have paused on `yield-1`');

  resume();

  await wait();

  assert.equal(get(obj, 'value'), '1', 'we are still paused on `yield-1` since the promise is unresolved');

  resolve();
  await wait();

  assert.equal(get(obj, 'value'), '2', 'we have proceeded past');
});

test('it can await for the pause to be hit', async function(assert) {
  const obj = this.registerTask(function *() {
    yield timeout(50);
    set(this, 'value', '1');
    yield pausable('hello', 'yield-1');
  });

  const { awaitPause } = pauseOn('yield-1');

  this.perform();

  await awaitPause();

  assert.equal(get(obj, 'value'), '1', 'we have paused on `yield-1`');
});

test('the pause can be hit and awaited for repeatedly', async function(assert) {
  const obj = this.registerTask(function *() {
    let inc = 0;

    while (inc < 50) {
      yield timeout(50);
      set(this, 'value', ++inc);
      yield pausable('hello', 'yield-1');
    }
  });

  const { awaitPause, resume } = pauseOn('yield-1');

  this.perform();

  await awaitPause();

  assert.equal(get(obj, 'value'), 1, 'we have paused on `yield-1`');

  resume();

  await awaitPause();

  assert.equal(get(obj, 'value'), 2, 'we have paused on `yield-1`');

  resume();

  await awaitPause();

  assert.equal(get(obj, 'value'), 3, 'we have paused on `yield-1`');
});
