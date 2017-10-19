import { defer, resolve } from 'rsvp';
import { _registerPauseOn, _reset as reset } from 'ember-concurrency-test-controller/-lib/pausable';

export function pauseOn(name) {
  let awaitPauseResolve,
      yieldPromise,
      yieldResolve,
      yieldReject;

  _registerPauseOn(name, (yieldable) => {

    resolve().then(() => yieldable).then(() => {
      if (awaitPauseResolve) {
        awaitPauseResolve()
      }
    });

    return resolve()
      .then(() => yieldPromise)
      .then(() => yieldable);
  });

  function _resetPauseOn() {
    const { promise, resolve, reject } = defer();
    yieldPromise = promise;
    yieldResolve = resolve;
    yieldReject = reject;
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
    },
    throwException(error) {
      yieldReject(error);
    }
  };
}

export { reset };
