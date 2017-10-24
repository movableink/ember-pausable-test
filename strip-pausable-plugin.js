/* global module */

function StripPausablePlugin() {
  return {
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value === 'ember-pausable-test') {
          path.traverse({
            ImportSpecifier(specifierPath) {
              if (specifierPath.node.imported.name === 'pausable') {
                if (specifierPath.inList && specifierPath.container.length > 1) {
                  specifierPath.remove();
                } else {
                  path.remove();
                }
              }
            },
            ImportDefaultSpecifier() {
              path.remove();
            }
          });
        }
      },
      CallExpression(path) {
        if (path.node.callee.name === 'pausable') {
          path.replaceWith(path.node.arguments[0]);
        }
      }
    }
  };
}

module.exports = StripPausablePlugin;