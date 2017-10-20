import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { pauseOn, reset } from 'ember-pausable-test/test-support';
import wait from 'ember-test-helpers/wait';

moduleForComponent('state-progressor', 'Integration | Component | state progressor', {
  integration: true,
  afterEach() {
    reset();
  }
});

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
