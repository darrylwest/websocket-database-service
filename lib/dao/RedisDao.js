/**
 * @class RedisDao - thin wrapper on top of redis client.  Used to verify and filter remote commands.
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/20/15 2:54 PM
 */
var dash = require( 'lodash' );

var RedisDao = function( options ) {
    'use strict';

    var dao = this,
        log = options.log,
        redis = options.redis || require( 'redis' ),
        client = options.client,
        validCommands = [
            'set',
            'get',
            'keys',
            'ping'
        ];

    this.execute = function(command, callback) {
        var cmd;

        // TODO : verify that the command is an array

        cmd = command.shift();

        if (validCommands.indexOf( cmd ) >= 0) {
            // insure that all the values are strings
            command = command.map(function(param) {
                if (typeof param !== 'string') {
                    param = JSON.stringify( param );
                }

                return param;
            });

            log.info('execute the command: ', command);

            command.push( callback );

            client[ cmd ].apply( client, command );
        } else {
            callback( new Error( cmd + ' is not a valid database command...') );
        }
    };

    if ( !log ) {
        throw new Error( 'dao must be constructed with a log' );
    }

    if (!client) {
        log.info('create the redis client');
        client = redis.createClient();
    }
};

module.exports = RedisDao;
