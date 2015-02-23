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
            'del',
            'exists',
            'expire',
            'keys',
            'persist',
            'pexpire',
            'pexpireat',
            'pttl',
            'randomkey',
            'rename',
            'renamenx',
            'sort',
            'ttl',
            'type',
            'scan',
            'set',
            'get',
            'mset',
            'mget',
            'setex',
            'decr',
            'incr',
            'ping'
        ];

    this.execute = function(command, callback) {
        var cmd,
            parseCallback;

        if (!dash.isArray( command )) {
            command = [ command ];
        }

        parseCallback = function(err, model) {
            if (err) {
                log.error( err );
            } else if (typeof model === 'string' && dash.startsWith( model, '{') && dash.endsWith( model, '}')) {
                try {
                    model = JSON.parse( model );
                } catch (ignore) {
                    console.log( 'err: ', ignore);
                    log.warn('json parse error: ', model);
                }
            }

            callback( err, model );
        };

        // pull the command
        cmd = command.shift();

        if (validCommands.indexOf( cmd ) >= 0) {
            if (dash.includes([ 'set','mset','lpush','rpush' ], cmd)) {
                log.info('insure all params are strings for cmd: ', cmd);
                command = command.map(function(param) {
                    if (typeof param !== 'string') {
                        param = JSON.stringify( param );
                    }

                    return param;
                });

                command.push( callback );
            } else if (dash.includes([ 'get', 'mget', 'lpop', 'rpop' ], cmd)) {
                command.push( parseCallback );
            } else if (cmd === 'keys' && command[0] === '*') {
                return callback( new Error('keys command is only valid against domain searches; see README for explanation...'));
            } else {
                command.push( callback );
            }

            log.info('execute cmd: ', cmd);

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
