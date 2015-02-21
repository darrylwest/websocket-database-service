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
browserify...
~~~


### Server

The project includes a "bin" folder with a run/start/stop and status scripts.  The run script is the same as start, but it runs in the foregound.  It looks something like this:

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

You would want to have a proxy and preferably HTTPS in front of this but port 29171 works for development.


## Database API

The target database is redis (version 2.8.12) so the API supports a sub-set of redis client commands.  There are obvious exclusions including pub/sub, server, etc commands.

It is also possible to swap redis with an alternate by implementing the DAO for the target database.

Here is the complete list of the supported redis commands:

### Keys

~~~
del key [ key ... ]
dump key
exists key
expire key seconds
expireat key timestamp
keys pattern // must be prefixed with a domain, e.g. Users:*
persist key
pexpire key milliseconds
pexpireat key milliseconds-timestamp
pttl key
randomkey
rename key newkey
nenamenx key newkey
sort key [BY pattern] [LIMIT offset count]
ttl key
type key
scan cursor [MATH pattern] [COUNT count]
~~~

### Strings
~~~
set key value
get key
mset key value [ key value ... ]
mget key [ key ... ]
setex key seconds value
psetex key milliseconds value
decr key
incr key
~~~

### Lists

~~~
linsert key BEFORE|AFTER pivot value
llen key
lpop key
lpush key value [ value ... ]
lpushx key value
lrange key start stop
lrem key count value
lset key index value
ltrim key start stop
rpop key
rpoplpush source destination
rpush key value [ value ... ]
rpushx key value
~~~

### Sets
_coming soon..._

### Sorted Sets
_coming soon..._

### Connection

Noticeable exclusions are auth, quit and select.  These commands should be done on the server side.

~~~
echo message
ping
~~~

### Server

A very small subset of server commands are supported...

~~~
dbsize
time
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
