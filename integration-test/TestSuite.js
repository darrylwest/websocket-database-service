/**
 * @class TestSuite - all integration tests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/22/15 2:21 PM
 */
var should = require('chai').should(),
    dash = require('lodash'),
    uuid = require('node-uuid' ),
    redis = require('redis' ),
    Logger = require('simple-node-logger' ),
    MockDatabaseClient = require( '../test/mocks/MockDatabaseClient' ),
    DatabaseClient = require('../lib/client/DatabaseClient' ),
    Dataset = require( '../test/fixtures/TestDataset' );

describe('KeyTests', function() {
    var dataset = new Dataset( { client:redis.createClient() } ),
        log = Logger.createSimpleFileLogger('integration-test/test.log'),
        databaseClient,
        keys;

    before(function(done) {
        var opts = MockDatabaseClient.createOptions();
        opts.log = log;

        databaseClient = new DatabaseClient( opts );

        databaseClient.on(DatabaseClient.PRIVATE_CHANNEL_CONNECTED, function(channel, key) {
            log.info('private channel connected: ', channel, ', key: ', key);

            // start tests
            done();
        });

        databaseClient.openDatabaseChannel();
    });

    // populate the database with known domain models; set the keys variable
    beforeEach(function(done) {
        log.info('initialize the database');
        dataset.createSampleDb(function(err, list) {
            keys = list;

            done();
        });
    });

    var validateResponse = function(results) {
        log.info( "del results: ", results );

        should.exist( results );
        should.exist( results.timeSent );
        should.exist( results.timeReceived );
        should.exist( results.messageReceived );
        should.exist( results.messageReceived.ts );
        should.exist( results.messageReceived.message );
        should.exist( results.messageReceived.message.rid );
        should.exist( results.messageReceived.message.status );
        should.exist( results.messageReceived.message.value );
        should.exist( results.response );

        results.response.status.should.equal( 'ok' );
        should.exist( results.response.value );
    };

    var createStandardHandler = function(validate, next) {
        var handler = function(results) {
            validateResponse( results );

            if (typeof validate === 'function') {
                validate( results.response.value );
            } else if (validate !== null) {
                results.response.value.should.equal( validate );
            }

            if (typeof next === 'function') {
                next();
            }
        };

        return handler;
    };

    describe('KeyTests', function() {
        describe('del', function() {
            it('should delete a known record by key', function(done) {
                var key = keys[ dash.random( keys.length ) ],
                    handler = createStandardHandler( 1, done ),
                    request = dataset.createDatabaseRequest([ 'del', key ], handler);

                databaseClient.sendDatabaseCommand( request );
            });

            it('should not delete an unknown key', function(done) {
                var key = 'ImpossibleKey:' + uuid.v4(),
                    handler = createStandardHandler( 0, done ),
                    request = dataset.createDatabaseRequest([ 'del', key ], handler);

                databaseClient.sendDatabaseCommand( request );
            });
        });

        describe('exists', function() {
            it('should return true when checking a known key', function(done) {
                var key = keys[ dash.random( keys.length ) ],
                    handler = createStandardHandler( 1, done ),
                    request = dataset.createDatabaseRequest([ 'exists', key ], handler);

                databaseClient.sendDatabaseCommand( request );
            });

            it('should return false when checking an unknown key', function(done) {
                var key = 'ImpossibleKey:' + uuid.v4(),
                    handler = createStandardHandler( 0, done ),
                    request = dataset.createDatabaseRequest([ 'exists', key ], handler);

                databaseClient.sendDatabaseCommand( request );
            });
        });

        describe('expire', function() {
            it('should set a ttl for a known key', function(done) {
                var key = keys[ dash.random( keys.length ) ],
                    handler = createStandardHandler( 1, done ),
                    request = dataset.createDatabaseRequest([ 'expire', key, 120 ], handler);

                databaseClient.sendDatabaseCommand( request );
            });

            // TODO what about error handling for a bad command, like if the seconds are 'flarb'
        });

        describe('keys', function() {
            it('should return all the keys for a given domain set');
            it('should return an error if there is no domain');
        });

        describe('persist', function() {
            it('should remove the ttl for a known key');
        });

        describe('randomKey', function() {
            it('should return a known key from a list of known keys');
        });

        describe('rename', function() {
            it('should rename a known key');
        });

        describe('ttl', function() {
            it('should return the ttl for a known expiring key');
            it('should return -1 for a non-expiring key');
        });

        describe('type', function() {
            it('should return the type for a known key');
            // TODO : test for all supported types
        });

        describe('scan', function() {
            it('should return the scan results for a list of records');
        });

    });

    describe('StringTests', function() {
        describe('set', function() {
            it('should save a known complex domain object by key');
            it('should save a known plain text value by key');
        });

        describe('get', function() {
            it('should return a known complex domain object by key');
            it('should return a known plain text value by key');
        });

        describe('mset', function() {
            it('should set multiple complex values');
            it('should set mulptiple plain text values');
        });

        describe('mget', function() {
            it('should return multiple values from multiple keys');
        });
    });

});
