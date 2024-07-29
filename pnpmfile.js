'use strict';

module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.dependencies && pkg.dependencies['node-gyp']) {
        pkg.dependencies['node-gyp'] = '10.0.1';
      }
      if (pkg.devDependencies && pkg.devDependencies['node-gyp']) {
        pkg.devDependencies['node-gyp'] = '10.0.1';
      }
      if (pkg.dependencies) {
        if (pkg.dependencies['babel-loader']) {
          pkg.dependencies['babel-loader'] = '8.3.0';
        }
      }
      return pkg;
    }
  }
};