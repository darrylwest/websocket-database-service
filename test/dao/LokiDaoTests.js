/**
 * @class LokiDaoTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 4/22/15 9:12 PM
 */
var should = require('chai').should(),
    dash = require( 'lodash' ),
    uuid = require( 'node-uuid' ),
    LokiDao = require('../../lib/dao/LokiDao' ),
    MockLogger = require( 'simple-node-logger' ).mocks.MockLogger;

describe('LokiDao', function() {
    'use strict';

    var createOptions = function() {
        var opts = {};

        opts.log = MockLogger.createLogger('LokiDao');

        return opts;
    };

    describe('#instance', function() {
        var dao = new LokiDao( createOptions() ),
            methods = [
                'execute'
            ];

        it('should create an instance of LokiDao', function() {
            should.exist( dao );
            dao.should.be.instanceof( LokiDao );
        });

        it( 'should contain all known methods based on method count and type', function() {
            dash.methods( dao ).length.should.equal( methods.length );
            methods.forEach(function(method) {
                dao[ method ].should.be.a('function');
            });
        });
    });

    describe('execute', function() {
        var dao = new LokiDao( createOptions() );

        it('should execute a valid command and return expected results');
    });
});
