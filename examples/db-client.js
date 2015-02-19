#!/usr/bin/env node

/**
 * simulate a browser client's interactions by opening a private channel and sending a series of commands
 */

// dpw@alameda.local
// 2015.02.16
'use strict';

var dash = require('lodash'),
    uuid = require('node-uuid' ),
    randomData = require('random-fixture-data' ),
    config = require( __dirname + '/../config.json' ),
    DatabaseAccessService = require( __dirname + '/../index' ),
    MessageHub = require( 'node-messaging-commons' ),
    hub = MessageHub.createInstance( config ),
    consumer = hub.createConsumer( DatabaseAccessService.DEFAULT_CHANNEL ),
    producer;

var openDatabaseChannel = function() {
    var ssid = uuid.v4(),
        request = {},
        rid = 1;

    request.action = 'openPrivateChannel';
    request.privateChannel = '/test-' + (dash.random( 1000000 ) + 1000000).toString(19);

    console.log('create the database channel: ', request);

    consumer.publish( request, config.appkey );

    process.nextTick(function() {
        var commandList = createCommandList(),
            thread;

        console.log('create the producer: ', request.privateChannel, ', session: ', ssid);
        producer = hub.createProducer( request.privateChannel, ssid );

        producer.onMessage(function(msg) {
            if (msg.ssid !== ssid) {
                console.log('received: ', JSON.stringify( msg ));
            }
        });

        thread = setInterval(function() {
            var command = commandList.shift(),
                msg = {
                    "rid":rid++,
                    "cmd":command
                };

            if (command) {
                console.log('send message: ', JSON.stringify( msg ));

                producer.publish( msg, ssid );
            } else {
                clearInterval( thread );
                thread = null;

                producer.close();
                consumer.close();
                
                process.nextTick(function() {
                    process.kill( process.pid );
                });
            }
        }, 1000);
    });
};

var createCommandList = function() {
    var list = [];

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

consumer.onConnect(function(chan) {
    console.log('c>> connected to database service: ', chan);
});

consumer.onMessage(function(msg) {
    console.log( msg );
});

openDatabaseChannel();
