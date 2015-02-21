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

    this.timeSent = params.timeSent;
    this.timeReceived = params.timeReceived;

    this.messageSent = params.messageSent;
    this.messageReceived = params.messageReceived;

    this.response = params.response;
};

module.exports = DatabaseRequest;