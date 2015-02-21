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
        hub = options.hub,
        responseList = [];

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
        log.info('private channel now open: ', privateChannel, ', privateKey/ssid: ', privateKey);

        dash.defer(function() {
            client.emit( DatabaseClient.PRIVATE_CHANNEL_CONNECTED, privateChannel, privateKey );
        });
    };

    this.privateMessageHandler = function(msg) {
        if (msg.ssid !== privateKey) {
            log.info('private message received: ', msg);

            dash.defer(function() {
                client.emit( DatabaseClient.PRIVATE_MESSAGE_RECEIVED, msg );
            });

            // this is a response to a published request
            if (msg.message && msg.message.rid) {
                dash.defer(function() {
                    var request,
                        rid = msg.message.rid;

                    request = dash.find( responseList, function(req) {
                        return req.id = rid;
                    });

                    if (request) {
                        request.timeReceived = Date.now();
                        request.response = msg.message;
                        request.messageReceived = msg;

                        dash.remove( responseList, function(req) {
                            return req.id === rid;
                        });

                        dash.defer(function() {
                            client.emit( DatabaseClient.PRIVATE_RESPONSE_RECEIVED, request );

                            if (typeof request.responseHandler === 'function') {
                                request.responseHandler( request );
                            }
                        });
                    }
                });
            }
        }
    };

    this.publicConnectHandler = function() {
        log.info('public channel connection accepted');

        dash.defer(function() {
            client.openPrivateChannel();
            client.requestPrivateChannel();
        });
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

        publicService.publish( request, publicKey );
    };

    this.sendDatabaseCommand = function(request) {
        var msg = {
            "rid":request.id,
            "cmd":request.cmd
        };

        log.info('send command: ', msg);

        request.timeSent = Date.now();
        request.messageSent = msg;

        responseList.push( request );

        privateService.publish( msg, privateKey );
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

// events
DatabaseClient.PRIVATE_CHANNEL_ACCEPTED = 'privateChannelAccepted';
DatabaseClient.PRIVATE_CHANNEL_CONNECTED = 'privateChannelConnected';
DatabaseClient.PRIVATE_MESSAGE_RECEIVED = 'privateMessageReceived';
DatabaseClient.PRIVATE_RESPONSE_RECEIVED = 'privateResponsereceived';

// message constants
DatabaseClient.OPEN_PRIVATE_CHANNEL = 'openPrivateChannel';
DatabaseClient.DEFAULT_CHANNEL = '/database';
DatabaseClient.COMMAND = 'cmd';

module.exports = DatabaseClient;