'use strict';

var assert = require('proclaim');
var normalize = require('../lib/normalize');
var version = require('../package.json').version;
var advocately = require('../lib');
var user = advocately.user();

describe('normalize', function() {
  var defaults;
  beforeEach(function() {
    defaults = {
      path: window.location.pathname,
      referrer: document.referrer,
      search: window.location.search,
      title: document.title,
      url: window.location.href
    };
  });

  var params = { test: 'pants' };

  it('should merge original with normalized', function() {
    var normalized = normalize('page', params, user);
    assert(normalized.anonymous_id === user.anonymousId());
    assert.deepEqual(normalized.context.page, defaults);
    assert(normalized.test === 'pants');
    assert(normalized.version === version);
  });
});
