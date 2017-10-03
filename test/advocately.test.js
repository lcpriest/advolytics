'use strict';

var Advocately = require('../lib').constructor;
var advocately = require('../lib');
var assert = require('proclaim');

var user = advocately.user();

describe('Advocately', function() {
  var advocately;

  beforeEach(function() {
    advocately = new Advocately();
    advocately.initialize('test', {
      host: 'analytics.lvh.me:3000',
      _debug: true,
      protocol: 'http'
    });
  });

  afterEach(function() {
    user.logout();
  });

  describe('#page', function() {
    var head = document.getElementsByTagName('head')[0];
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

    it('should default .anonymousId', function() {
      var promise = advocately.page();
      promise.then(function(response) {
        assert(response.request_data.anonymous_id.length === 36);
      });
    });

    it('should default .url to .location.href', function() {
      var promise = advocately.page();
      promise.then(function(response) {
        assert(response.request_data.properties.url === window.location.href);
      });
    });

    it('should respect canonical', function() {
      var el = document.createElement('link');
      el.rel = 'canonical';
      el.href = 'baz.com';
      head.appendChild(el);
      var promise = advocately.page();
      promise.then(function(response) {
        assert(response.request_data.properties.url === 'baz.com' + window.location.search);
      });
      el.parentNode.removeChild(el);
    });

    it('should accept (category, name, properties)', function() {
      var promise = advocately.page('category', 'name', {});
      promise.then(function(response) {
        assert(response.request_data.properties.category === 'category');
        assert(response.request_data.properties.name === 'name');
        assert(typeof response.request_data.properties === 'object');
      });
    });

    it('should accept (category, name)', function() {
      var promise = advocately.page('category', 'name');
      promise.then(function(response) {
        assert(response.request_data.properties.category === 'category');
        assert(response.request_data.properties.name === 'name');
      });
    });

    it('should back properties with defaults', function() {
      var promise = advocately.page('category', 'name', { property: true });
      defaults.property = true;
      defaults.name = 'name';
      defaults.category = 'category';
      promise.then(function(response) {
        assert.deepEqual(response.request_data.properties, defaults);
      });
    });

    it('should include context.page', function() {
      var promise = advocately.page('category', 'name', { property: true });
      promise.then(function(response) {
        assert.deepEqual(response.request_data.context.page, defaults);
      });
    });
  });

  describe('#identify', function() {
    it('should default .anonymousId', function() {
      advocately.identify('user-id');
      var id = advocately.user().anonymousId();
      assert(id.length === 36);
    });

    it('should accept (userId, traits)', function() {
      advocately.identify('id', { hi: 'test' });

      assert(typeof user.traits() === 'object');
      assert(user.id() === 'id');
    });

    it('should accept (id)', function() {
      advocately.identify('id');
      assert(user.id() === 'id');
    });

    it('should identify the user', function() {
      advocately.identify('id', { trait: true });

      assert(user.id() === 'id');
    });

    it('should back traits with stored traits', function() {
      user.traits({ one: 1 });
      user.save();
      advocately.identify('id', { two: 2 });

      assert(user.id() === 'id');
      assert(user.traits().one === 1);
      assert(user.traits().two === 2);
    });
  });

  describe('#survey', function() {
    it('should default .anonymousId', function() {
      advocately.survey('user-id');
      var id = advocately.user().anonymousId();
      assert(id.length === 36);
    });

    it('should accept (userId, traits)', function() {
      advocately.survey('id', { hi: 'test' });

      assert(typeof user.traits() === 'object');
      assert(user.id() === 'id');
    });

    it('should accept (id)', function() {
      advocately.survey('id');
      assert(user.id() === 'id');
    });

    it('should survey the user', function() {
      advocately.survey('id', { trait: true });

      assert(user.id() === 'id');
    });

    it('should back traits with stored traits', function() {
      user.traits({ one: 1 });
      user.save();
      advocately.survey('id', { two: 2 });

      assert(user.id() === 'id');
      assert(user.traits().one === 1);
      assert(user.traits().two === 2);
    });

    // it('should load survey snippet', function() {
    //   assert.ok(false);
    // });

    it('should load advonps-survey element', function() {
      var el = document.getElementsByClassName('advonps-survey');
      assert(el);
    });
  });

  describe('#user', function() {
    it('should return the user singleton', function() {
      assert(advocately.user() === user);
    });
  });

  describe('#track', function() {
    it('should default .anonymousId', function() {
      var promise = advocately.track('event', { reviews_count: 1 });
      promise.then(function(response) {
        assert(response.request_data.anonymous_id.length === 36);
      });
    });

    it('should accept (event, properties)', function() {
      var promise = advocately.track('event', {});
      promise.then(function(response) {
        assert(response.request_data.event === 'event');
        assert(typeof response.request_data.properties === 'object');
      });
    });
  });
});
