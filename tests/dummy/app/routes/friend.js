import Route from '@ember/routing/route';
import { defer } from 'rsvp';
import Ember from 'ember';
import { pausable } from 'ember-concurrency-test-controller';

const { testing } = Ember;

export default Route.extend({
  model({ id }) {
    const { resolve, promise } = defer();

    setTimeout(() => {
      resolve({
        id,
        name: 'Steve'
      });
    }, testing ? 0 : 2000);

    return pausable(promise, 'friend-promise');
  }
});
