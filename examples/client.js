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
        commandList = options.commandList;

    this.initListeners = function() {
        databaseClient.on(DatabaseClient.PRIVATE_CHANNEL_ACCEPTED, function(channel) {
            log.info( 'private channel ready: ', channel);
        });
    };

    this.run = function() {
        log.info('client started...');

        databaseClient.openDatabaseChannel();
    };

    this.nextCommand = function() {
        var command = commandList.shift(),
            msg = {
                "rid":[ Date.now(), rid++ ].join('-'),
                "cmd":command
            };

        if (command) {
            log.info('send message: ', JSON.stringify( msg ));

            // send and wait
            // responseList.push( msg.rid );
            // producer.publish( msg, ssid );
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
            list = [];

        var createRandomUserRecord = function() {
            var obj = {};

            obj.id = uuid.v4();
            obj.name = randomData.name;
            obj.zip = randomData.zip;

            return obj;
        };

        while (list.length < 4) {
            var user = createRandomUserRecord();
            list.push( [ "set", "TestUser:" + user.id, user ] );
        }

        list.push( [ "keys", "TestUser:*" ]);

        return list;
    };

    var createDatabaseClient = function() {
        var opts = {};

        opts.log = logManager.createLogger('DatabaseClient');
        opts.createLogger = logManager.createLogger;
        opts.messageURL = [ host, config.hubName ].join('');
        opts.publicKey = config.appkey;

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


