const pluginTester = require('babel-plugin-tester');
const plugin = require('../strip-pausable-plugin');
const path = require('path');

pluginTester({
  plugin,
  pluginName: 'removePausable',
  fixtures: path.join(__dirname, '__babel_fixtures__')
});