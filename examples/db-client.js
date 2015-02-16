#!/usr/bin/env node

// dpw@alameda.local
// 2015.02.16
'use strict';

var dash = require('lodash'),
    uuid = require('node-uuid' ),
    config = require( __dirname + '/../config.json' ),
    DatabaseAccessService = require( __dirname + '/../index' ),
    MessageHub = require( 'node-messaging-commons' ),
    hub = MessageHub.createInstance( config ),
    consumer = hub.createConsumer( DatabaseAccessService.DEFAULT_CHANNEL ),
    producer;

var openDatabaseChannel = function() {
    var id = uuid.v4(),
        request = {};

    request.action = 'openPrivateChannel';
    request.privateChannel = '/test-' + (dash.random( 1000000 ) + 1000000).toString(19);

    console.log('create the database channel: ', request);

    consumer.publish( request, config.appkey );

    process.nextTick(function() {
        console.log('create the producer: ', request.privateChannel);
        producer = hub.createProducer( request.privateChannel, id );

        producer.onMessage(function(msg) {
            console.log('received: ', msg);
        });

        setInterval(function() {
            var msg = {
                "set":[ "mykey", dash.random( 1000 ).toString() ]
            };

            console.log('send message: ', msg);

            producer.publish( msg, id );
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
