/**
 * @client DatabaseClientTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/19/15 4:23 PM
 */
var should = require('chai').should(),
    dash = require('lodash'),
    uuid = require('node-uuid' ),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    DatabaseClient = require('../../lib/client/DatabaseClient');

describe('DatabaseClient', function() {
    'use strict';

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('DatabaseClient');
        opts.createLogger = MockLogger.createLogger;
        opts.messageURL = 'http://localhost:12345/DatabaseAccessHub';
        opts.publicKey = 'myPublicKey';

        return opts;
    };

    describe('#instance', function() {
        var client = new DatabaseClient( createOptions() ),
            methods = [
                'createHub',
                'openPrivateChannel',
                'privateConnectHandler',
                'privateMessageHandler',
                'requestPrivateChannel',
                'openDatabaseChannel',
                'publicConnectHandler',
                'publicMessageHandler',
                // inherited
                'addListener',
                'emit',
                'listeners',
                'on',
                'once',
                'removeAllListeners',
                'removeListener',
                'setMaxListeners'
            ];

        it('should create an instance of DatabaseClient', function() {
            should.exist( client );
            client.should.be.instanceof( DatabaseClient );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( client ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                client[ method ].should.be.a('function');
            });
        });
    });

    describe('createHub', function() {
        var client = new DatabaseClient( createOptions() );

        it('should create a valid faye hub', function() {
            var hub = client.createHub();

            should.exist( hub );
            hub._endpoint.should.equal( 'http://localhost:12345/DatabaseAccessHub' );
        });
    });
});
