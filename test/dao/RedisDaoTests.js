/**
 *
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

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('RedisDao');
        opts.redis = MockRedis.createMockRedis();

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
        var dao = new RedisDao( createOptions());

        it('should execute a valid command and return expected results', function(done) {
            var callback = function(err, results) {
                should.not.exist( err );
                should.exist( results );

                results.should.equal( 'ok' );

                done();
            };

            dao.execute( [ 'set', 'mykey', 'flarb' ], callback );
        });
    });
});
