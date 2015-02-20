/**
 * @class DatabaseRequest - a container for database requests send over sockets
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/19/15 8:42 AM
 */
var uuid = require('node-uuid');

var DatabaseRequest = function(params) {
    'use strict';

    if (!params) {
        params = {};
    }

    this.id = params.rid || uuid.v4();
    this.cmd = params.cmd || [];
    this.responseHandler = params.responseHandler;

    this.sent = params.sent;
    this.received = params.received;

    this.response = params.response;
};

module.exports = DatabaseRequest;