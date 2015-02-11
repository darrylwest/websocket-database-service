#!/usr/bin/env node

var config = require( __dirname + '/../config.json'),
    DatabaseService = require( __dirname + '/../index'),
    service;
    
// run in background...
config.daemon = true;

service = DatabaseService.createInstance( config );
service.start();

