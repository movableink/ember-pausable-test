/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-pausable-test',

  included(app) {
    const appOptions = app.options || {};
    const addonOptions = appOptions['ember-pausable-test'] || {};

    if (addonOptions.stripPausable && app.env !== 'test') {
      app.options.babel = app.options.babel || {};
      app.options.babel.plugins = app.options.babel.plugins || [];
      app.options.babel.plugins.push(require('./strip-pausable-plugin'));
    }
  }
};
