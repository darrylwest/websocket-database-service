/**
 * @class MockDatabaseClient
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 2/22/15 12:33 PM
 */
var dash = require('lodash' ),
    DatabaseClient = require('../../lib/client/DatabaseClient' ),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    MockRedisClient = require('mock-redis-client' );

var MockDatabaseClient = function(options) {
    'use strict';

    // TODO : mock out execute method to simulate
};

MockDatabaseClient.createOptions = function(config) {
    'use strict';

    var opts;

    if (!config) {
        config = require( '../../config.json' );
    }

    opts = dash.clone( config );

    if (!opts.createLogger) {
        opts.createLogger = MockLogger.createLogger;
    }

    if (!opts.log) {
        opts.log = opts.createLogger('MockDatabaseClient');
    }

    if (!opts.host) {
        opts.host = 'http://127.0.0.1';
    }

    if (!opts.messageURL) {
        opts.messageURL = [ opts.host, ':', opts.port, opts.hubName ].join('');
    }

    if (!opts.publicKey) {
        opts.publicKey = opts.appkey;
    }

    return opts;
};

/**
 * this creates a real database client based on config settings
 *
 * @param config - if null config is read locally
 * @returns DatabaseClient object
 */
MockDatabaseClient.createDatabaseClient = function(config) {
    'use strict';

    return new DatabaseClient( MockDatabaseClient.createOptions( config ) );
};

module.exports = MockDatabaseClient;
