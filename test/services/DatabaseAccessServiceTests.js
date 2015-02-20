/**
 * @class DatabaseAccessServiceTests
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 2/15/15 5:05 PM
 */
var should = require('chai').should(),
    dash = require('lodash'),
    uuid = require('node-uuid' ),
    MockLogger = require('simple-node-logger').mocks.MockLogger,
    MessageHub = require('node-messaging-commons'),
    DatabaseAccessService = require('../../lib/services/DatabaseAccessService');

describe('DatabaseAccessService', function() {
    'use strict';

    var createMessageHub = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('DatabaseAccessService');
        opts.port = 12345;
        opts.hubName = 'DatabaseAccessHub';

        return MessageHub.createInstance( opts );
    };

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('DatabaseAccessService');
        opts.hub = createMessageHub();

        opts.id = uuid.v4();

        return opts;
    };

    describe('#instance', function() {
        var service = new DatabaseAccessService( createOptions()),
            methods = [
                'start',
                'createProducer',
                'shutdown',
                'messageHandler'
            ];

        it('should create an instance of DatabaseAccessService', function() {
            should.exist( service );
            service.should.be.instanceof( DatabaseAccessService );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( service ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                service[ method ].should.be.a('function');
            });
        });
    });

    describe('start', function() {
        var service = new DatabaseAccessService( createOptions());

        it('should create the primary producer to listen for connection requests');
    });

    describe('messageHandler', function() {
        it('should handle a known message type');
    });
});
