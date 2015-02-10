# Websocket Database Service
- - -

A database service accessed through a websocket API to support key/value pairs, lists, sets and sorted sets.

[![NPM version](https://badge.fury.io/js/websocket-database-service.svg)](http://badge.fury.io/js/websocket-database-service) [![Build Status](https://travis-ci.org/darrylwest/websocket-database-service.svg?branch=master)](https://travis-ci.org/darrylwest/websocket-database-service) [![Dependency Status](https://david-dm.org/darrylwest/websocket-database-service.svg)](https://david-dm.org/darrylwest/websocket-database-service)

## Introduction

The Websocket Database Service...

## Installation

### Server

~~~
	npm install websocket-database-service --save
~~~

### Client/Browser

The project includes a "browser" folder with enough example code to access the service.

Here is a short snippet of the browser code:

~~~
<!DOCTYPE html>
<html>
<head>
    <title>test database page</title>
    <script src="browser-messaging-commons.js"></script>
    <script src="hmac-sha256.js"></script>
    <script src="DatabaseClient.js"></script>
    <script>
        var client;

        window.client = client;
    </script>
</head>
~~~


### Server

The project includes a "bin" folder with a run/start/stop and status scripts.  The run script is the same as start, but it runs in the forgound.  It looks something like this:

~~~
	var config = require('./config.json'),
    	DatabaseService = require('websocket-database-service'),
        service = DatabaseService.createInstance( config );

    service.start();
~~~

## Configuration

Here is a sample configuration file.

~~~
{
    "port":29171,
    "hubName":"/MessageHub",
    "channels":[ "/database" ],
    "appkey":"b55d91a2-a68f-48a1-8f4b-c4dfc65d60bb"
}
~~~

You would want to have a proxy and preferrably HTTPS in front of this but port 29171 works for development.

~~~


## Tests

Unit tests include should/specs, jshint and validate-package.  Tests can be run from the command line with this:

~~~
    make test

    or

    make watch

	or
	
	npm test
~~~

- - -
<p><small><em>Copyright © 2015, rain city software | Version 0.90.10</em></small></p>
