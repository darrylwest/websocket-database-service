/**
 * @class LokiDao
 *
 * @author: darryl.west@roundpeg.com
 * @created: 4/22/15 9:11 PM
 */
var dash = require('lodash'),
    loki = require('lokijs' ),
    name = 'LokiDao';

var LokiDao = function( options ) {
    'use strict';

    var dao = this,
        log = options.log,
        dbname = options.dbname,
        db,
        validCommands = [
            'insert',
            'update',
            'remove',
            // 'removeDataOnly',
            'get',
            'find',
            'findOne'
        ];

    var init = function(callback) {
        log.info('create and load the database: ', dbname);

        db = new loki( dbname );

        db.loadDatabase( {}, function() {
            if (typeof callback === 'function') {
                callback();
            }
        });
    };

    this.execute = function(command, completeCallback) {
        var cmd,
            runCommand,
            parseCallback;

        runCommand = function() {
            var cmd = command.shift();

            if (validCommands.indexOf( cmd ) >= 0) {
                completeCallback( new Error( 'not implemented' ));
            } else {
                completeCallback( new Error( cmd + ' is not a valid database command...') );
            }
        };

        if (!db) {
            init( runCommand );
        } else {
            runCommand();
        }

    };

    if ( !log ) {
        throw new Error( 'dao must be constructed with a log' );
    }

    if ( !dbname ) {
        throw new Error( 'dao must be constructed with a dbname' );
    }


};

LokiDao.DAO_NAME = name;

module.exports = LokiDao;