#!/usr/bin/env node

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
        console.log('create the producer: ', request.privateChannel, ', session: ', ssid);
        producer = hub.createProducer( request.privateChannel, ssid );

        producer.onMessage(function(msg) {
            if (msg.ssid !== ssid) {
                console.log('received: ', JSON.stringify( msg ));
            }
        });

        setInterval(function() {
            var id = dash.random( 10000 ).toString(),
                msg = {
                    "rid":rid++,
                    "cmd":[ "set", "mykey", { id:id, name:randomData.name, zip:randomData.zip } ]
                };

            console.log('send message: ', JSON.stringify( msg ));

            producer.publish( msg, ssid );
        }, 2500);
    });
};

consumer.onConnect(function(chan) {
    console.log('c>> connected to database service: ', chan);
});

consumer.onMessage(function(msg) {
    console.log( msg );
});

openDatabaseChannel();
