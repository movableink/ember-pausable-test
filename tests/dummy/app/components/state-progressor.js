import Component from '@ember/component';
import layout from '../templates/components/state-progressor';
import { get, set } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { pausable } from 'ember-concurrency-test-controller';
import Ember from 'ember';
import { A } from '@ember/array';

const { testing } = Ember;

export default Component.extend({
  layout,
  objects: null,

  didInsertElement() {
    set(this, 'objects', A([]));
    get(this, 'myTask').perform();
  },

  myTask: task(function *() {
    const objects = get(this, 'objects');
    const waitTime = testing ? 0 : 1000;
    let idx = -1;

    while (++idx < 5) {
      objects.pushObject({ name: `Step ${idx}` });
      yield pausable(timeout(waitTime), 'state-progressor');
    }
  })
});
