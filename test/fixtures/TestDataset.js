/**
 * @class TestDataset - build test data for mock db in unit tests or redis instance for integration tests.
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 2/22/15 9:33 AM
 */
var dash = require('lodash' ),
    uuid = require('node-uuid' ),
    randomData = require('random-fixture-data' ),
    DatabaseRequest = require('../../lib/models/DatabaseRequest' ),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    MockRedisClient = require('mock-redis-client' ),
    data = require('./sample-db.json');

var TestDataset = function(options) {
    'use strict';

    if (!options) {
        options = {};
    }

    var dataset = this,
        log = options.log || MockLogger.createLogger('TestDataset' ),
        client = options.client || new MockRedisClient();

    this.getRedisClient = function() {
        return client;
    };

    this.createSampleDb = function(callback) {
        var createMarkup,
            createProjects,
            keys = [],
            runNext;

        log.info('copy the sample database to redis client');

        runNext = function(next) {
            var job = next.shift();

            if (job) {
                job( next );
            } else {
                log.info('jobs complete...');

                if (typeof callback === 'function') {
                    callback(null, keys);
                }
            }
        };

        createMarkup = function(next) {
            var list = data.markupList.map(function(markup) {
                    return markup;
                });

            log.info('create the list of markup documents: ', list.length);

            var loop = function(err) {
                if ( err ) throw err;

                var markup = list.pop(),
                    key;

                if (markup) {
                    key = 'Markup:' + markup.id;
                    client.set( key, JSON.stringify( markup ), loop );
                    keys.push( key );
                } else {
                    runNext( next );
                }
            };

            loop();
        };

        createProjects = function(next) {
            var projects = data.projects.map(function(project) {
                    return project;
                });

            log.info('create the list of projects: ', projects.length);

            var loop = function(err) {
                if ( err ) throw err;

                var project = projects.pop(),
                    key;

                if (project) {
                    key = 'Project:' + project.id;
                    client.set( key, project, loop );
                    keys.push( key );
                } else {
                    runNext( next );
                }
            };

            loop();
        };

        runNext( [ createProjects, createMarkup ] );
    };

    /**
     * create a database request with optional responseHandler
     *
     * @param cmd
     * @param fn
     * @returns {DatabaseRequest}
     */
    this.createDatabaseRequest = function(cmd, fn) {
        var request = new DatabaseRequest( { cmd:cmd } );

        if (typeof fn === 'function') {
            request.responseHandler = fn;
        }

        return request;
    }
};

module.exports = TestDataset;
