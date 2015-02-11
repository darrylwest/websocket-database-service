#!/usr/bin/env node

var config = require( __dirname + '/../config.json'),
    DatabaseService = require( __dirname + '/../index'),
    service;
    
// don't run in background...
config.daemon = false;
console.log('message hub: ', config.hubName);

service = DatabaseService.createInstance( config );
service.start();

