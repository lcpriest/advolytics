/* eslint-env node */
'use strict';

var baseConfig = require('./karma.conf');

module.exports = function(config) {
  baseConfig(config);

  config.set({
    browserDisconnectTolerance: 1,

    browserDisconnectTimeout: 60000,

    browserNoActivityTimeout: 60000,

    singleRun: true,

    reporters: ['progress', 'junit'],

    browsers: ['PhantomJS'],

    junitReporter: {
      outputDir: process.env.TEST_REPORTS_DIR,
      suite: require('./package.json').name
    }

    // Edge and Safari 9 still panic with coverage. Keeping disabled.
    // coverageReporter: {
    //   reporters: [
    //     { type: 'lcov' }
    //   ]
    // }
  });
};
