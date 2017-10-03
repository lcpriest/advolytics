'use strict';

var advocately = require('../lib');
var assert = require('proclaim');

describe('advocately', function() {
  it('should expose a .VERSION', function() {
    var pkg = require('../package.json');
    assert.equal(advocately.VERSION, pkg.version);
  });
});
