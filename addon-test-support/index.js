import { defer, resolve } from 'rsvp';
import { _registerPauseOn, _reset as reset } from 'ember-pausable-test/-lib/pausable';
import { next } from '@ember/runloop';

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
      next(yieldResolve);
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
