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

        databaseClient.on(DatabaseClient.PRIVATE_CHANNEL_CONNECTED, function(channel, key) {
            log.info('private channel connected: ', channel, ', key: ', key);

            // start sending commands
            setTimeout( client.nextCommand, 500 );
        });

        databaseClient.on(DatabaseClient.PRIVATE_MESSAGE_RECEIVED, function(msg) {
            log.debug('private message received: ', msg);
        });

        databaseClient.on(DatabaseClient.PRIVATE_RESPONSE_RECEIVED, function(request) {
            log.info('response received: ', request);

            var response = request.response;

            // validate the response

            if (response.status !== 'ok') {
                log.error('error in response: ', request.response);
            }

            dash.defer( client.nextCommand );
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

            databaseClient.sendDatabaseCommand( command );
        } else {
            setTimeout(function() {
                process.kill( process.pid );
            }, 1000);
        }
    };
};

// simulates factory configuration + test commands
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

        var createUserRequest = function() {
            var user = createRandomUserRecord(),
                key = "TestUser:" + user.id;

            list.push( new DatabaseRequest( { cmd:[ "set", key, user ] } ));
            list.push( new DatabaseRequest(
                {
                    cmd:[ "get", key ],
                    responseHandler:function(req) {
                        console.log('handler: ', req);
                        var resp = req.response,
                            key = req.cmd[1],
                            id = key.split(':')[1];

                        if (resp.status === 'ok') {
                            if (resp.value.id === id) {
                                console.log('user ID is valid: ', id);
                            } else {
                                console.log('ERROR! user id does not match: ', resp.value, " != ", id);
                            }
                        } else {
                            console.log('ERROR! message response is not valid: ', resp);
                        }
                    }
                }
            ));

            list.push( new DatabaseRequest( { cmd:[ "expire", key, 60 ] } ));
        };

        // test a regular string
        var createPlainStringRequest = function() {
            var key = 'PlainStringValue';
            list.push( new DatabaseRequest( { cmd:[ "set", key, "my test plain string" ] } ));
            list.push( new DatabaseRequest(
                {
                    cmd:[ "get", key ],
                    responseHandler:function(req) {
                        var resp = req.response;
                        if (resp.value !== "my test plain string") {
                            console.log('ERROR! value is incorrect: ', resp.value);
                        } else {
                            console.log('key: ', key, ' value is valid: ', resp.value);
                        }
                    }
                }
            ));
        };

        var createKeysRequest = function() {
            var request = new DatabaseRequest( { cmd:[ "keys", "TestUser:*" ] } );
            request.responseHandler = function(request) {
                console.dir( request );
            };

            list.push( request );
        };

        var createMultipleRequests = function(count, fn) {
            while( count > 0 ) {
                fn.call();

                count--;
            }
        };

        createMultipleRequests( 10, createUserRequest );
        createPlainStringRequest();
        createKeysRequest();

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


