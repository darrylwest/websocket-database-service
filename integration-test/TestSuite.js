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

describe('TestSuite', function() {
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

    var validateResponse = function(results, status) {
        log.info( "del results: ", results );

        if (!status) {
            status = 'ok';
        }

        should.exist( results );
        should.exist( results.timeSent );
        should.exist( results.timeReceived );
        should.exist( results.messageReceived );
        should.exist( results.messageReceived.ts );
        should.exist( results.messageReceived.message );
        should.exist( results.messageReceived.message.rid );
        should.exist( results.messageReceived.message.status );

        should.exist( results.response );

        results.response.status.should.equal( status );

        if (status === 'ok') {
            should.exist( results.messageReceived.message.value );
            should.exist( results.response.value );
        } else {
            should.exist( results.messageReceived.message.reason );
            should.exist( results.response.reason );
        }
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
            it('should return all the keys for a given domain set', function(done) {
                var key = 'Markup:*',
                    validate = function(list) {
                        list.length.should.equal( 7 );

                        // insure that all the returned keys are actually in the known list
                        list.forEach(function(key) {
                            keys.indexOf( key ).should.be.above( -1 );
                        });
                    },
                    handler = createStandardHandler( validate, done ),
                    request = dataset.createDatabaseRequest([ 'keys', key ], handler);

                databaseClient.sendDatabaseCommand( request );

            });

            it('should return an error if there is no domain', function(done) {
                var key = '*',
                    handler = function(results) {
                        validateResponse( results, 'failed' );

                        done();
                    },
                    request = dataset.createDatabaseRequest([ 'keys', key ], handler);

                databaseClient.sendDatabaseCommand( request );
            });
        });

        describe('persist', function() {
            it('should remove the ttl for a known key', function(done) {
                var key = keys[ dash.random( keys.length ) ],
                    nextAction = function() {
                        var secondHandler = createStandardHandler( 1, done ),
                            secondRequest = dataset.createDatabaseRequest([ 'persist', key ], secondHandler);

                        databaseClient.sendDatabaseCommand( secondRequest );
                    },
                    handler = createStandardHandler( 1, nextAction ),
                    request = dataset.createDatabaseRequest([ 'expire', key, 120 ], handler);

                databaseClient.sendDatabaseCommand( request );
            });
        });

        describe('randomKey', function() {
            it('should return a known key from a list of known keys', function(done) {
                var validate = function(key) {
                        should.exist( key );
                    },
                    handler = createStandardHandler( validate, done ),
                    request = dataset.createDatabaseRequest( 'randomkey', handler);

                databaseClient.sendDatabaseCommand( request );
            });
        });

        describe('rename', function() {
            it('should rename a known key', function(done) {
                var key = keys[ dash.random( keys.length ) ],
                    handler = createStandardHandler( 'OK', done ),
                    newKey = 'newkeyname',
                    request = dataset.createDatabaseRequest([ 'rename', key, newKey ], handler);

                databaseClient.sendDatabaseCommand( request );
            });
        });

        describe('ttl', function() {
            it('should return the ttl for a known expiring key');
            it('should return -1 for a non-expiring key');
        });

        describe('type', function() {
            it('should return the type for a known key', function(done) {
                var key = 'Markup:d0a9025ab6c311e49305cb3bb7ef8a18',
                    handler = createStandardHandler( 'string', done ),
                    request = dataset.createDatabaseRequest([ 'type', key ], handler);

                databaseClient.sendDatabaseCommand( request );
            });

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
            it('should set multiple plain text values');
        });

        describe('mget', function() {
            it('should return multiple values from multiple keys');
        });

        describe('decr', function() {
            it('should decrement a new key');
            it('should decrement a known key');
        });

        describe('incr', function() {
            it('should increment a new key');
            it('should increment a known key');
        });
    });

    describe('ListTests', function() {
        describe('linsert', function() {
            it('should insert a new list item before a known item');
            it('should insert a new list item after a known item');
        });

        describe('lindex', function() {
            it('should return a list item with a known positive index');
            it('should return a list item with a known negative index');
            it('should return null with an index greater than the list length');
        });

        describe('llen', function() {
            it('should return the length of a know list');
            it('should return zero for an unknown list');
        });

        describe('lpop', function() {
            it('should pop an item off the left side of a known list');
        });

        describe('lpush', function() {
            it('should push a new item on the left side of a list');
            it('should push multiple items to the left side of a list');
        });

        describe('lpushx', function() {
            it('should push a value to a known list');
            it('should not push a value to an unknown list');
        });

        describe('lrange', function() {
            it('should return a complete list if items given 0 and -1 start/stop offsets');
            it('should return a null list given start/stop offsets out of the list range');
        });

        describe('lrem', function() {
            it('should remove elements equal to value moving from head to tail');
            it('should remove elements equal to value moving from tail to head');
            it('should remove all elements equal to a known value');
        });

        describe('lset', function() {
            it('should replace a known value at a specific index location');
            // TODO other tests...
        });

        describe('ltrim', function() {
            it('should remove a subset of items from a known list');
        });

        describe('rpop', function() {
            it('should pop an item off the right side of a known list');
        });

        describe('rpoplpush', function() {
            it('should pop an item of a known list and push it to a new list');
        });

        describe('rpush', function() {
            it('should push a value to the right side of a list');
            it('should push multiple values to the right side of a list');
        });

        describe('rpushx', function() {
            it('should push a value to a known list');
            it('should not push a value to an unknown list');
        });
    });

});
