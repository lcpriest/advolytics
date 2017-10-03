'use strict';

/*
 * Module dependencies.
 */

var defaults = require('@ndhoule/defaults');
var pageDefaults = require('./page_defaults');
var uuid = require('uuid');
var version = require('../package.json').version;

/**
 * Return a default `options.context.page` object.
 *
 * https://segment.com/docs/spec/page/#properties
 *
 * @return {Object}
 */

function normalize(endpoint, params, user) {
  return defaults(params, {
    anonymous_id: user.anonymousId(),
    context: {
      userAgent: navigator.userAgent,
      page: pageDefaults()
    },
    message_id: 'adv-' + uuid.v4(),
    sent_at: new Date(),
    type: endpoint,
    user_id: user.id(),
    version: version
  });
}


/*
 * Exports.
 */

module.exports = normalize;
