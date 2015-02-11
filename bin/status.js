#!/usr/bin/env node

'use strict';

var config = require( __dirname + '/../config.json' ),
    exec = require( 'child_process' ).exec,
    command = [ 'curl -q ', ' http://127.0.0.1:', config.port, '/status' ].join(''),
    child;

child = exec(command, function(err, stdout, stderr) {
    console.log( stdout );

    if (err) {
        console.log( 'error: ', err);
    }
});

