'use strict';

var _advocately = global.advocately;

/*
 * Module dependencies.
*/

var fetchival = require('fetchival');
var memory = require('./memory');
var cookie = require('./cookie');
var store = require('./store');
var user = require('./user');
var normalize = require('./normalize');
var clone = require('@ndhoule/clone');
var bindAll = require('bind-all');
var defaults = require('@ndhoule/defaults');
var pageDefaults = require('./page_defaults');

/**
 * Initialize a new `Advocately` instance.
 */

function Advocately() {
  this._options({});
  this.apiToken = '';
  this.host = 'analytics.advocate.ly';
  this.protocol = 'https';
  this._debug = false;
  this.debug('Advocately instance');
  bindAll(this);
}

Advocately.prototype.debug = function(/* message */) {
  // if (this._debug) {
  //   window.console.log(message);
  // }
};

Advocately.prototype.isInDebugMode = function() {
  var query = window.location.search.substring(1);
  if (query.includes('advocately')) {
    user.reset();
    var self = this;

    this._get('config').then(function(response) {
      if (response.config) {
        self.surveyConfig = response;

        self._sideLoadJs('https://d1m5z9tultw2jo.cloudfront.net/advonps.js');
        self._sideLoadCss('https://d1m5z9tultw2jo.cloudfront.net/advonps.css');

        return self.surveyConfig;
      }
    });
  } else {
    return false;
  }
};

Advocately.prototype._printError = function(message) {
  window.console.error(message);
};


Advocately.prototype.init = Advocately.prototype.initialize = function(apiToken, options) {
  this.apiToken = apiToken;
  this.options = options || {};
  this._options(options);

  if (this.options.protocol) {
    this.protocol = this.options.protocol;
  }

  if (this.options.host) {
    this.host = this.options.host;
  }

  if (this.options.debug) {
    this._debug = this.options.debug;
  }
  this.debug('init');
  user.load();
  return this;
};

/**
 * Trigger a pageview, that a user has triggered with optional `properties`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object|string} [properties] (or path)
 * @return {Advocately}
 */

Advocately.prototype.page = function(category, name, properties) {
  properties = clone(properties) || {};
  if (name) properties.name = name;
  if (category) properties.category = category;

  var data = {
    properties: defaults(properties, pageDefaults()),
    category: category,
    name: name
  };
  return this._post('page', data);
};

/**
 * Identify a user by `userId` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @return {Advocately}
 */

Advocately.prototype.identify = function(userId, traits) {
  var data = {
    traits: traits
  };

  user.identify(userId, traits);

  return this._post('identify', data);
};

/**
 * Trigger an NPS survey for a user by `userId` and `traits`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {Object} [traits=null] User traits.
 * @return {Advocately}
 */

Advocately.prototype.survey = function(userId, traits) {
  if (this.isInDebugMode()) {
    return;
  }

  var data = {
    traits: traits
  };

  user.identify(userId, traits);
  var self = this;

  return this._post('survey', data).then(function(response) {
    if (response.config) {
      self.surveyConfig = response;
      self._sideLoadJs('https://d1m5z9tultw2jo.cloudfront.net/advonps.js');
      self._sideLoadCss('https://d1m5z9tultw2jo.cloudfront.net/advonps.css');

      return self.surveyConfig;
    }
  });
};

Advocately.prototype.submitSurvey = function(data) {
  var url = this.protocol + '://' + this.host + '/surveys/' + this.surveyConfig.api_token;

  return fetchival(url).put(data).then(function(response) {
    return response;
  });
};

/**
 * Return the current user.
 *
 * @return {Object}
 */

Advocately.prototype.user = function() {
  return user;
};

/**
 * Track an `event` that a user has triggered with optional `properties`.
 *
 * @param {string} [id=user.id()] User ID.
 * @param {string} event
 * @param {Object} [properties=null]
 * @return {Advocately}
 */

Advocately.prototype.track = function(event, properties) {
  if (arguments.length !== 2) {
    return this._printError('Missing argument in Advocately.track');
  }

  var data = {
    event: event,
    properties: properties
  };

  return this._post('track', data);
};

/**
 * Apply options.
 *
 * @param {Object} options
 * @return {Advocately}
 * @api private
 */

Advocately.prototype._options = function(options) {
  options = options || {};
  this.options = options;
  cookie.options(options.cookie);
  store.options(options.localStorage);
  user.options(options.user);
  return this;
};


/* Apply apiToken to the request body */

Advocately.prototype._buildMessage = function(method, endpoint, params) {
  return {
    _method: method,
    api_token: this.apiToken,
    data: normalize(endpoint, params, this.user())
  };
};

Advocately.prototype._sideLoadJs = function(source) {
  var el = document.createElement('script');
  el.type = 'text/javascript';
  el.async = !0;
  el.src = source;
  var n = document.getElementsByTagName('script')[0];
  n.parentNode.insertBefore(el, n);
};

Advocately.prototype._sideLoadCss = function(source) {
  var el = document.createElement('link');
  el.rel = 'stylesheet';
  el.href = source;
  var n = document.getElementsByTagName('link')[0];
  if (!n) {
    n = document.getElementsByTagName('head')[0];
  }
  n.parentNode.insertBefore(el, n);
};


// Advocately.prototype.setAnonymousId = function(id) {
//   this.user().anonymousId(id);
//   return this;
// };


/*
  Generate distinct URLs based on the request method
*/

Advocately.prototype._buildUrl = function(method) {
  var url = this.protocol + '://' + this.host + '/events/';

  switch (method) {
  case 'track':
    url = url + 't';
    break;
  case 'identify':
    url = url + 'i';
    break;
  case 'page':
    url = url + 'p';
    break;
  case 'survey':
    url = url + 's';
    break;
  case 'config':
    url = url + 'cfg';
    break;
  default:
  }

  this.debug(url);

  return url;
};


/*
  Base function for posting data to tracking server
*/

Advocately.prototype._post = function(endpoint, params) {
  var data = this._buildMessage('post', endpoint, params);
  var self = this;

  if (typeof this.apiToken === 'undefined' || this.apiToken.trim().length === 0) {
    this._printError('Missing apiToken');
    return;
  }

  return fetchival(this._buildUrl(endpoint)).post(data).then(function(response) {
    if (!response.success) {
      self._printError(response.error);
    }
    response.request_data = data;
    return response;
  });
};

Advocately.prototype._get = function(endpoint, params) {
  var data = this._buildMessage('get', endpoint, params);

  if (typeof this.apiToken === 'undefined' || this.apiToken.trim().length === 0) {
    this._printError('Missing apiToken');
    return;
  }

  return fetchival(this._buildUrl(endpoint)).get(data).then(function(response) {
    if (!response.success) {
      self._printError(response.error);
    }
    response.request_data = data;
    return response;
  });
};

/**
 * No conflict support.
 */

Advocately.prototype.noConflict = function() {
  window.advocately = _advocately;
  return this;
};

module.exports = Advocately;
module.exports.cookie = cookie;
module.exports.memory = memory;
module.exports.store = store;
