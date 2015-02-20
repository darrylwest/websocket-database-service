#!/usr/bin/env node

// dpw@alameda.local
// 2015.02.19

var dash = require('lodash'),
    uuid = require('node-uuid'),
    DatabaseClient = require( '../index' ).client.DatabaseClient,
    DatabaseRequest = require( '../index' ).client.DatabaseRequest;

var Client = function(options) {
    'use strict';

    var client = this,
        log = options.log,
        createLoggger = options.createLogger,
        databaseClient = options.databaseClient;


    this.start = function() {
        log.info('client started...');

        databaseClient.openDatabaseChannel();
    };
};

Client.createInstance = function() {
    'use strict';

    var logManager = require('simple-node-logger' ).createLogManager(),
        config = require( '../config.json' ),
        host = 'http://127.0.0.1:29171',
        opts = {};

    var createDatabaseClient = function() {
        var opts = {};

        opts.log = logManager.createLogger('DatabaseClient');
        opts.createLogger = logManager.createLogger;
        opts.messageURL = [ host, '/DatabaseMessageHub' ].join('');
        opts.publicKey = config.appkey;

        return new DatabaseClient( opts );
    };

    opts.log = logManager.createLogger('TestDbClient');
    opts.databaseClient = createDatabaseClient();

    return new Client( opts );
};

var client = Client.createInstance();
client.start();

