import { defer, resolve } from 'rsvp';
import { _registerPauseOn, _reset as reset } from 'ember-concurrency-test-controller/-lib/pausable';

export function pauseOn(name) {
  let awaitPauseResolve,
      yieldPromise,
      yieldResolve;

  _registerPauseOn(name, (yieldable) => {
    if (awaitPauseResolve) {
      awaitPauseResolve();
    }

    return resolve()
      .then(() => yieldPromise)
      .then(() => yieldable);
  });

  function _resetPauseOn() {
    const { promise, resolve } = defer();
    yieldPromise = promise;
    yieldResolve = resolve;
  }

  _resetPauseOn();

  return {
    resume() {
      yieldResolve();
      _resetPauseOn();
    },
    awaitPause() {
      const { resolve, promise } = defer();

      awaitPauseResolve = resolve;

      return promise;
    }
  };
}

export { reset };
