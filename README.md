# ember-pausable-test

This library provides a set of tools to pause async behavior in your tests to make it easier to assert intermediate state.

## Usage
--------

### Installation

* `ember install ember-pausable-test`

### Acceptance Test

Suppose that we had a maybe-slow-loading route that rendered a loading template, with a model hook that looks like:

```js
import Route from '@ember/routing/route';

export default Route.extend({
  model({ id }) {
    return this.store.find('friends', id);
  }
})
```

And, an acceptance test that looked something like this:

```js
it('shows a friend', async function(assert) {
  visit('/friends/1');

  // Where do we assert this!?!
  // assert.ok(find('.loading-spinner').length, 'loading screen visible!');

  await andThen(() => {});

  assert.ok(find('.friend-name').text().trim(), 'Steve');
});
```

If we were to uncomment the `assert` that checks for the loading spinner, it's _possible_ that it has rendered by then; but not necessarily a guarantee. (This could lead to a flaky test!)

Instead, with this library, we can explicitly pause the model hook so we can test the loading state.

```js
import Route from '@ember/routing/route';
import { pausable } from 'ember-pausable-test';

export default Route.extend({
  model({ id }) {
    const friend = this.store.find('friends', id);
    return pausable(friend, 'friend-promise');
  }
})
```

And, in our test:

(_note:_ You should always call `reset()` in the `afterEach` hook when using `pauseOn`)

```js
import { pauseOn, reset } from 'ember-pausable-test/test-support';

moduleForAcceptance('Acceptance | friend', {
  afterEach() {
    reset();
  }
});

it('shows a friend', async function(assert) {
  const { resume, awaitPause } = pauseOn('friend-promise');

  visit('/friends/1');

  await awaitPause();

  assert.ok(find('.loading-spinner').length, 'loading screen visible!');

  resume();

  await andThen(() => {});

  assert.ok(find('.friend-name').text().trim(), 'Steve');
});
```

### With `ember-concurrecncy`

Let's imagine a component that, when it renders, it pushes items onto a list every second.

There are two things I'd like to think about when testing this component:

- I want to test each step of the state as it changes
- I want the test to run fast (no need to wait a second between each step)

The component may look something like this:

```js
export default Component.extend({
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
      yield timeout(waitTime);
    }
  })
});
```

```hbs
<ul>
  {{#each objects as |object|}}
    <li>{{object.name}}</li>
  {{/each}}
</ul>
```

By replacing the `yield` statement with...

```js
yield pausable(timeout(waitTime), 'state-progressor');
```

...we can setup our integration test like this:

```js
import { pauseOn } from 'ember-pausable-test/test-support';
import wait from 'ember-test-helpers/wait';

test('it renders each of the steps', async function(assert) {
  const { resume, awaitPause } = pauseOn('state-progressor');

  this.render(hbs`{{state-progressor}}`);

  await awaitPause();
  assert.equal(this.$('ul > li').length, 1);
  resume();

  await awaitPause();
  assert.equal(this.$('ul > li').length, 2);
  resume();

  await awaitPause();
  assert.equal(this.$('ul > li').length, 3);
  resume();

  await awaitPause();
  assert.equal(this.$('ul > li').length, 4);
  resume();

  await wait();
  assert.equal(this.$('ul > li').length, 5);
});
```

### API

#### `ember-pausable-test`

- `pausable(yieldable: Any, tokenName: String)`
  In a test environment and when a `pauseOn` is registered with the given `tokenName`, this method will return a promise that resolves
  when `pauseOn(tokenName).resume()` is called and resolves with the `yieldable`.

  In non-test environments, or when there is no `pauseOn` registered, this will return the `yieldable` directly.

#### `ember-pausable-test/test-support`

- `pauseOn(tokenName: String)`
  This regsiters a pause to happen when a corresponding `pausable` is reached in the code.

  This method returns a `PauseToken`.

- `PauseToken`
  - `resume()`
    This will resolve the promise that is pausing the promise chain.

  - `awaitPause()`
    This returns a promise that will resolve the next time the corresponding `pausable()` block is hit.

  - `throwException()`
    This will cause the paused promise to reject, instead of resolve.

### Configuration

Experimental support for unwrappping/removing `pausable()` calls in non-test builds can be used by modifying your `ember-cli-build.js` file:

```js
const app = new EmberApp({
  'ember-pausable-test': {
    strip: true
  }
});
```

## Collaborating
--------

### Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Running Tests

* `yarn test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

### Releasing

* `ember release {--minor, --major, --patch}`
