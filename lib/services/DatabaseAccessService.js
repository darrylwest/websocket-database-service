/**
 * @class DatabaseAccessService
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/15/15 5:11 PM
 */
var dash = require( 'lodash' ),
    uuid = require( 'node-uuid' ),
    DatabaseClient = require( '../client/DatabaseClient' ),
    RedisDao = require('../../lib/dao/RedisDao' ),
    MessageHub = require( 'node-messaging-commons' );

var DatabaseAccessService = function( options ) {
    'use strict';

    var service = this,
        log = options.log,
        dao = options.dao,
        channel = options.channel,
        producer = options.producer,
        hub = options.hub,
        id = options.id || uuid.v4();

    this.start = function() {
        service.createProducer();
    };

    this.createProducer = function() {
        if ( !producer ) {
            if ( !channel ) {
                channel = DatabaseAccessService.DEFAULT_CHANNEL;
            }

            log.info( 'create producer for channel: ', channel, ', id: ', id );

            producer = hub.createProducer( channel, id );
            producer.onMessage( service.messageHandler );
        }

        return producer;
    };

    this.messageHandler = function( msg ) {
        if ( msg.ssid !== id && msg.message ) {
            log.info( 'message: ', JSON.stringify( msg ) );

            var request = msg.message,
                response;

            if ( request.action === DatabaseAccessService.OPEN_PRIVATE_CHANNEL && request.privateChannel ) {
                request.ssid = msg.ssid;
                createPrivateChannel( request, function() {
                    log.info( 'tell everyone a new channel is available: ', request );
                    response = {};
                    response.channelAccepted = request.privateChannel;

                    producer.publish( response );
                } );
            }
        }
    };

    var createPrivateChannel = function( request, callback ) {
        var consumer = hub.createConsumer( request.privateChannel ),
            ssid = request.ssid;

        consumer.onMessage( function( msg ) {
            if ( msg.ssid !== ssid && msg.message && msg.message.cmd ) {
                log.info( 'db command message: ', msg );

                dao.execute( msg.message.cmd, function(err, response) {
                    if (err) {
                        log.error( err );
                        response = err.message;
                    }

                    consumer.publish( response, message.message.rid );
                });
            }
        } );

        if ( callback ) {
            callback();
        }
    };

    this.shutdown = function() {
        log.info( 'shutdown the database access producer...' );

        if ( producer ) {
            producer.cancel();
            producer = null;
        }
    };

    // constructor validations
    if ( !log ) {
        throw new Error( 'server must be constructed with a log' );
    }
    if ( !hub ) {
        throw new Error( 'server must be constructed with a message hub' );
    }
    if ( !dao ) {
        throw new Error( 'server must be constructed with a DAO object' );
    }
};

// borrow these constants from the client
DatabaseAccessService.DEFAULT_CHANNEL = DatabaseClient.DEFAULT_CHANNEL;
DatabaseAccessService.OPEN_PRIVATE_CHANNEL = DatabaseClient.OPEN_PRIVATE_CHANNEL;
DatabaseAccessService.COMMAND = DatabaseClient.COMMAND;

DatabaseAccessService.createInstance = function( config ) {
    'use strict';

    var logManager,
        createDao;

    if ( !config ) {
        throw new Error( 'must be constructed with a config object' );
    }
    if ( !config.port ) {
        throw new Error( 'server must be constructed with a port' );
    }
    if ( !config.hubName ) {
        throw new Error( 'server must be constructed with a hub name' );
    }

    // don't damage the original
    config = dash.clone( config );

    if ( config.appkey ) {
        config.id = config.appkey;
    }

    if ( config.logging.logDirectory ) {
        config.logging.logDirectory = process.env.HOME + '/logs/';
    }

    logManager = require( 'simple-node-logger' ).createLogManager( config.logging );

    var createRedisDao = function() {
        var opts = {};

        opts.log = logManager.createLogger('RedisDao');

        return new RedisDao( opts );
    };

    if (!createDao) {
        createDao = createRedisDao;
    }

    var createDatabaseService = function() {
        var opts = dash.clone( config );

        opts.log = logManager.createLogger( 'DatabaseAccessService' );
        opts.dao = createDao();

        return new DatabaseAccessService( opts );
    };

    var createMessageHub = function() {
        var opts = dash.clone( config );

        opts.logManager = logManager;

        return MessageHub.createInstance( opts );
    };

    if ( !config.hub ) {
        config.hub = createMessageHub();
    }

    return createDatabaseService();
};

module.exports = DatabaseAccessService;
