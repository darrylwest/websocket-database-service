#!/usr/bin/env node

// dpw@alameda.local
// 2015.02.19

var dash = require('lodash'),
    uuid = require('node-uuid'),
    DatabaseClient = require( '../index' ).client.DatabaseClient,
    DatabaseRequest = require( '../index' ).client.DatabaseRequest;

/**
 * @class Client - an implementation that writes and reads from the database
 *
 * @param options
 * @constructor
 */
var Client = function(options) {
    'use strict';

    var client = this,
        log = options.log,
        databaseClient = options.databaseClient,
        commandList = options.commandList,
        responseList = [];

    this.initListeners = function() {
        databaseClient.on(DatabaseClient.PRIVATE_CHANNEL_ACCEPTED, function(channel) {
            log.info( 'private channel ready: ', channel);
        });

        databaseClient.on(DatabaseClient.PRIVATE_CHANNEL_CONNECTED, function(channel, key) {
            log.info('private channel connected: ', channel, ', key: ', key);

            // start sending commands
            setTimeout( client.nextCommand, 500 );
        });

        databaseClient.on(DatabaseClient.PRIVATE_MESSAGE_RECEIVED, function(msg) {
            log.info('private message received: ', msg);

            var rid = msg.message.rid;

            var request = dash.find( responseList, function(req) {
                return req.id === rid;
            });

            if (request) {
                request.received = Date.now();
                log.info( JSON.stringify( request ));

                dash.remove( responseList, function(req) {
                    return req.id === rid;
                });

                dash.defer( client.nextCommand );
            }
        });
    };

    this.run = function() {
        log.info('run the client...');

        databaseClient.openDatabaseChannel();
    };

    this.nextCommand = function() {
        var command = commandList.shift();

        if (command) {
            log.info('send message: ', JSON.stringify( command ));

            responseList.push( command );

            databaseClient.sendDatabaseCommand( command );
        } else {
            process.nextTick(function() {
                process.kill( process.pid );
            });
        }
    };
};

// simulates factory configuration
Client.createInstance = function() {
    'use strict';

    var logManager = require('simple-node-logger' ).createLogManager(),
        config = require( '../config.json' ),
        host = 'http://127.0.0.1:29171',
        opts = {};

    var createCommandList = function() {
        var randomData = require('random-fixture-data' ),
            list = [],
            request;

        var createRandomUserRecord = function() {
            var obj = {};

            obj.id = uuid.v4();
            obj.name = randomData.name;
            obj.zip = randomData.zip;

            return obj;
        };

        while (list.length < 4) {
            var user = createRandomUserRecord();

            request = new DatabaseRequest( { cmd:[ "set", "TestUser:" + user.id, user ] } );

            list.push( request );
        }

        request = new DatabaseRequest( { cmd:[ "keys", "TestUser:*" ] } );
        request.responseHandler = function(msg) {
            console.dir( msg );
        };

        list.push( request );

        return list;
    };

    var createDatabaseClient = function() {
        var opts = {};

        opts.log = logManager.createLogger('DatabaseClient');
        opts.createLogger = logManager.createLogger;
        opts.messageURL = [ host, config.hubName ].join('');
        opts.publicKey = config.appkey;

        opts.algorithm = 'sha256';

        opts.log.info('client instance ops: ', opts);

        return new DatabaseClient( opts );
    };

    opts.log = logManager.createLogger('TestDbClient');
    opts.databaseClient = createDatabaseClient();
    opts.commandList = createCommandList();

    return new Client( opts );
};

var client = Client.createInstance();
client.initListeners();
client.run();


