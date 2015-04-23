/**
 * @class LokiDao
 *
 * @author: darryl.west@roundpeg.com
 * @created: 4/22/15 9:11 PM
 */
var dash = require('lodash'),
    name = 'LokiDao';

var LokiDao = function( options ) {
    'use strict';

    var dao = this,
        log = options.log;

    this.execute = function(command, callback) {
        var cmd,
            parseCallback;

        callback( new Error( 'not implemented' ));
    };

    if ( !log ) {
        throw new Error( 'dao must be constructed with a log' );
    }
};

LokiDao.DAO_NAME = name;

module.exports = LokiDao;