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
            'ping'
        ];

    this.execute = function(command, callback) {
        var cmd = command.shift();

        if (validCommands.indexOf( cmd ) >= 0) {
            log.info('execute the command: ', command);

            callback( null, 'ok');
        } else {
            callback( new Error( cmd + ' is not a valid database command...') );
        }
    };

    if ( !log ) {
        throw new Error( 'dao must be constructed with a log' );
    }

    if (!client) {
        client = redis.createClient();
    }
};

module.exports = RedisDao;
