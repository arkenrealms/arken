"use strict";

/**
 * When using the PNPM package manager, you can use pnpmfile.js to workaround
 * dependencies that have mistakes in their package.json file.  (This feature is
 * functionally similar to Yarn's "resolutions".)
 *
 * For details, see the PNPM documentation:
 * https://pnpm.js.org/docs/en/hooks.html
 *
 * IMPORTANT: SINCE THIS FILE CONTAINS EXECUTABLE CODE, MODIFYING IT IS LIKELY TO INVALIDATE
 * ANY CACHED DEPENDENCY ANALYSIS.  After any modification to pnpmfile.js, it's recommended to run
 * "rush update --full" so that PNPM will recalculate all version selections.
 */
module.exports = {
  hooks: {
    readPackage,
  },
};

/**
 * This hook is invoked during installation before a package's dependencies
 * are selected.
 * The `packageJson` parameter is the deserialized package.json
 * contents for the package that is about to be installed.
 * The `context` parameter provides a log() function.
 * The return value is the updated object.
 */
function readPackage(packageJson, context) {
  const remapDependencies = {
    iconv: "iconv-lite",
  };

  const overrideDependencies = {
    leveldown: "6.1.1",
    "iconv-lite": "0.6.3",
    react: "^19",
    "react-dom": "^19",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "node-gyp": "10.2.0",
    "@solana/spl-token": "0.4.9",
    // "rpc-websockets": "7.11.2",
    "@solana/web3.js": "1.31.0",
    // "@solana/web3.js": "1.66.2",
    // "iconv-utf-8-mac": "2.4.0",
    // "babel-loader": "8.3.0"
  };

  ["dependencies", "devDependencies"].forEach((depType) => {
    if (packageJson[depType]) {
      Object.keys(remapDependencies).forEach((dep) => {
        if (packageJson[depType][dep]) {
          packageJson[depType][remapDependencies[dep]] =
            packageJson[depType][dep];
          delete packageJson[depType][dep];
        }
      });

      Object.keys(overrideDependencies).forEach((dep) => {
        if (packageJson[depType][dep]) {
          packageJson[depType][dep] = overrideDependencies[dep];
        }
      });
    }
  });

  return packageJson;
}
