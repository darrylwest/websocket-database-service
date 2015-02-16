/**
 * @class DatabaseAccessService
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/15/15 5:11 PM
 */
var dash = require( 'lodash' ),
    uuid = require( 'node-uuid' ),
    MessageHub = require( 'node-messaging-commons' );

var DatabaseAccessService = function( options ) {
    'use strict';

    var service = this,
        log = options.log,
        channel = options.channel,
        producer = options.producer,
        hub = options.hub;

    this.start = function() {

    };

    this.createProducer = function() {

    };

    this.messageHandler = function(msg) {

    };

    this.shutdown = function() {
        log.info( 'shutdown the database access producer...' );
    };

    // constructor validations
    if ( !log ) {
        throw new Error( 'server must be constructed with a log' );
    }
    if ( !hub ) {
        throw new Error( 'server must be constructed with a message hub' );
    }
};

module.exports = DatabaseAccessService;
