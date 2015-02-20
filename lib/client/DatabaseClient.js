/**
 * @client DatabaseClient - client side access component
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/19/15 4:20 PM
 */
var uuid = require('node-uuid' ),
    dash = require('lodash' ),
    util = require('util' ),
    events = require('events' ),
    MessageService = require( 'node-messaging-commons' ).services.MessageService,
    DatabaseRequest = require( '../models/DatabaseRequest');

var DatabaseClient = function(options) {
    'use strict';

    var client = this,
        log = options.log,
        createLogger = options.createLogger,
        faye = options.faye || require( 'faye' ),
        messageURL = options.messageURL,
        privateChannel = options.privateChannel || '/db-' + dash.random( 1e16 ).toString( 16 ),
        publicChannel = options.publicChannel || DatabaseClient.DEFAULT_CHANNEL,
        publicKey = options.publicKey || options.appkey,
        publicService = options.publicService,
        privateService = options.privateService,
        privateKey = options.privateKey || uuid.v4(),
        hub = options.hub;

    this.createHub = function() {
        if (!hub) {
            log.info('open the common database channel');

            hub = new faye.Client( messageURL );
            log.info('endpoint: ', hub._endpoint );
        }

        return hub;
    };

    this.openDatabaseChannel = function() {
        var opts = {};

        log.info('open the public database channel...');

        opts.log = createLogger('PublicDatabaseChannel');

        opts.client = client.createHub();
        opts.channel = publicChannel;

        // add the optional params
        opts.algorithm = options.algorithm;
        opts.hmacEncoding = options.hmacEncoding;
        opts.ssid = publicKey;

        publicService = new MessageService( opts );

        publicService.onConnect( client.publicConnectHandler );
        publicService.onMessage( client.publicMessageHandler );
    };

    this.openPrivateChannel = function() {
        var opts = {};

        log.info('open the private channel: ', privateChannel);

        opts.log = createLogger('PrivateDatabaseChannel');

        opts.client = client.createHub();
        opts.channel = privateChannel;

        // add the optional params
        opts.algorithm = options.algorithm;
        opts.hmacEncoding = options.hmacEncoding;
        opts.ssid = privateKey;

        privateService = new MessageService( opts );

        privateService.onConnect( client.privateConnectHandler );
        privateService.onMessage( client.privateMessageHandler );
    };

    this.privateConnectHandler = function() {
        log.info('private channel now open: ', privateChannel, ', ssid: ', privateKey);

        // emit('privateConnectionOpen')
    };

    this.privateMessageHandler = function(msg) {
        log.info('private message received: ', msg);

        // emit privateMessageReceived
    };

    this.publicConnectHandler = function() {
        log.info('public channel connection accepted');

        client.openPrivateChannel();
        client.requestPrivateChannel();
    };

    this.publicMessageHandler = function(msg) {
        if (msg.ssid === publicKey) {
            log.info('public message received: ', msg);

            if (msg.message.channelAccepted === privateChannel) {
                log.info('channel accepted: ', privateChannel);

                dash.defer(function() {
                    client.emit(DatabaseClient.PRIVATE_CHANNEL_ACCEPTED, privateChannel);
                });
            }
        }
    };

    this.requestPrivateChannel = function() {
        var request = {
            action:DatabaseClient.OPEN_PRIVATE_CHANNEL,
            privateChannel:privateChannel
        };

        log.info('open the private channel: ', request );

        publicService.publish( request );
    };

    if (!log) {
        throw new Error('database client must be constructed with a log');
    }
    if (!createLogger) {
        throw new Error('database client must be constructed with a log manager');
    }
    if (!messageURL) {
        throw new Error('database client must be constructed with a message URL');
    }

    events.EventEmitter.call( this );
};

util.inherits( DatabaseClient, events.EventEmitter );

DatabaseClient.PRIVATE_CHANNEL_ACCEPTED = 'privateChannelAccepted';

DatabaseClient.OPEN_PRIVATE_CHANNEL = 'openPrivateChannel';
DatabaseClient.DEFAULT_CHANNEL = '/database';
DatabaseClient.COMMAND = 'cmd';

module.exports = DatabaseClient;