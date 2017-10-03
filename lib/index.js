'use strict';

/**
 * Advocately
 *
 * (C) 2016-2017 Advocate.ly Inc.
 */

var Advocately = require('./advocately');

// Create a new `advocately` singleton.
var advocately = new Advocately();

// Expose `require`.
// TODO(ndhoule): Look into deprecating, we no longer need to expose it in tests
advocately.require = require;

// Expose package version.
advocately.VERSION = require('../package.json').version;

// Get a handle on the global advocately queue, as initialized by the
// advocately.js snippet. The snippet stubs out the advocately.js API and queues
// up calls for execution when the full advocately.js library (this file) loads.
var advocatelyq = global.advocately || [];

// Initialize advocately
advocately.initialize(advocatelyq.apiToken, {
  protocol: advocatelyq.protocol,
  host: advocatelyq.host,
  debug: advocatelyq.debug
});


// Make any queued calls up before the full advocately.js library
// loaded
while (advocatelyq && advocatelyq.length > 0) {
  var args = advocatelyq.shift();
  var method = args.shift();

  if (typeof advocately[method] === 'function') {
    advocately[method].apply(advocately, args);
  }
}


// Free the reference to advocatelyq
advocatelyq = null;

/*
 * Exports.
 */

// Set `global.advocately` explicitly rather than using Browserify's
// `--standalone` flag in order to avoid hooking into an already-declared
// `global.require`
global.advocately = advocately;

module.exports = advocately;
