/**
 * @class RedisDao
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/20/15 2:57 PM
 */
var should = require('chai').should(),
    dash = require( 'lodash' ),
    uuid = require( 'node-uuid' ),
    RedisDao = require('../../lib/dao/RedisDao' ),
    MockRedis = require( 'mock-redis-client' ),
    MockLogger = require( 'simple-node-logger' ).mocks.MockLogger;

describe('RedisDao', function() {
    'use strict';

    var redis = MockRedis.createMockRedis();

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('RedisDao');
        opts.redis = redis;

        return opts;
    };

    describe('#instance', function() {
        var dao = new RedisDao( createOptions()),
            methods = [
                'execute'
            ];

        it('should create an instance of RedisDao', function() {
            should.exist( dao );
            dao.should.be.instanceof( RedisDao );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( dao ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                dao[ method ].should.be.a('function');
            });
        });
    });

    describe('execute', function() {
        var dao = new RedisDao( createOptions() ),
            client = redis.createClient(),
            knownObj = {
                id:'852dda60-b9ea-11e4-a345-bb70f1207674',
                name:'flarb'
            },
            key = 'KnownObject:' + knownObj.id;

        beforeEach(function(done) {
            var callback = function(err, result) {
                if (err) throw err;

                done();
            };

            client.set( key, knownObj, callback );
        });

        it('should execute a valid set command and return expected results', function(done) {
            var callback = function(err, results) {
                should.not.exist( err );
                should.exist( results );

                results.should.equal( 'OK' );

                done();
            };

            dao.execute( [ 'set', 'mykey', knownObj ], callback );
        });

        it('should execute a valid get command and return expected results', function(done) {
            var callback = function(err, results) {
                should.not.exist( err );
                should.exist( results );

                results.id.should.equal( knownObj.id );
                results.name.should.equal( knownObj.name );

                done();
            };

            dao.execute( [ 'get', key ], callback );
        });

        it('should execute a valid del command and return expected results', function(done) {
            var callback = function(err, results) {
                should.not.exist( err );
                should.exist( results );

                results.should.equal( 1 );

                done();
            };

            dao.execute( [ 'del', key ], callback );
        });

        it('should execute a valid exists command and return expected results', function(done) {
            var callback = function(err, results) {
                should.not.exist( err );
                should.exist( results );

                results.should.equal( 1 );

                done();
            };

            dao.execute( [ 'exists', key ], callback );
        });

        it('should execute a valid exists command and an unknown key and return expected results', function(done) {
            var callback = function(err, results) {
                should.not.exist( err );
                should.exist( results );

                results.should.equal( 0 );

                done();
            };

            dao.execute( [ 'exists', 'MyBadKey' ], callback );
        });

        it('should execute a valid expire command and return expected results', function(done) {
            var callback = function(err, results) {
                should.not.exist( err );
                should.exist( results );

                results.should.equal( 1 );

                done();
            };

            dao.execute( [ 'expire', key, 3 ], callback );
        });
    });
});
