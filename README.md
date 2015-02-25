# Websocket Database Service
- - -

A database service accessed through a websocket API to support key/value pairs, lists, sets and sorted sets.

[![NPM version](https://badge.fury.io/js/websocket-database-service.svg)](http://badge.fury.io/js/websocket-database-service) [![Build Status](https://travis-ci.org/darrylwest/websocket-database-service.svg?branch=master)](https://travis-ci.org/darrylwest/websocket-database-service) [![Dependency Status](https://david-dm.org/darrylwest/websocket-database-service.svg)](https://david-dm.org/darrylwest/websocket-database-service)

## Introduction

The Websocket Database Service gives a client browser the ability to update a remote database in real time over websockets.  After the client establishes a connection to the public database service, it establishes a private connection to send commands and receive responses directly the the remote database over a dedicated channel.

The initial implementation for the backend serivce supports a subset of redis commands through the specific data access object RedisDAO.  It's possible to use this technology to talk to other databases, NoSQL as well as traditional SQL by implementing an alternate DAO.  Command messages are sent and recieved by serializing complex objects using JSON as handled by the DAO and messaging system.

## Installation

A minimum installation requires a server.  Typically this server talks directly the the target database on the same server.  Alternatively a database service like redis-to-go or other cloud service could host the database.

A production environment would probably use a proxy.  To route messages through port 80 or 443 for secure connections.  There is an example proxy configuration for haproxy in the examples folder.

### Server

~~~
npm install websocket-database-service --save
~~~

Alternatively you can git/clone the project and run as a stand-alone service.

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

Here is a sample server configuration file.

~~~
{
	"host":"http://127.0.0.1",
   "port":29171,
   "hubName":"/DatabaseMessageHub",
   "appkey":"<your-application-key>",
   "logging":{
   		"logDirectory":"HOME/logs",
       "fileNamePattern":"ws-db-<DATE>.log",
       "dateFormat":"YYYY.MM.DD"
   }
}
~~~

You would want to have a proxy and preferably HTTPS in front of this but port 29171 works for development.  Logging here is configured for rolling logs in the applications' ~/logs/ folder.  Any long system that supports debug, info, warn and error can be used (log4j, winston) but the supplied logging framework is [simple-node-logger](http://github/darrylwest/simple-node-logger).

## Database API

The target database is redis (version 2.8.12) so the API supports a sub-set of redis client commands.  There are obvious exclusions including pub/sub, server, etc commands.

It is also possible to swap redis with an alternate by implementing the DAO for the target database.

### Values

All values are assumed to be complex objects.  Values are stringify'd prior to set/mset and parsed after get/mget.  You may get/set regular strings as long as the string does not begin/end with a curly braces.

### Commands
Here is the complete list of the supported redis commands:

#### Keys

~~~
del key [ key ... ]
exists key
expire key seconds
// expireat key timestamp
keys pattern // must be prefixed with a domain, e.g. Users:*
persist key
// pexpire key milliseconds
// pexpireat key milliseconds-timestamp
// pttl key
randomkey
rename key newkey
// renamenx key newkey
sort key [BY pattern] [LIMIT offset count]
ttl key
type key
scan cursor [MATH pattern] [COUNT count]
~~~

#### Strings
~~~
set key value // value is an object
get key // if found, the return is parsed and returned as an object
mset key value [ key value ... ]
mget key [ key ... ]
// setex key seconds value
// psetex key milliseconds value
decr key
incr key
~~~

#### Lists

~~~
linsert key BEFORE|AFTER pivot value
lindex key index
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

#### Sets
_coming soon..._

#### Sorted Sets
_coming soon..._

#### Connection

Noticeable exclusions are auth, quit and select.  These commands should be done on the server side.

~~~
echo message
ping
~~~

#### Server

A very small subset of server commands are supported...

~~~
dbsize
ping
time
~~~

## Database Client

### Use

Currently this must be used with browserify.  The best way to get familiar with the client side logic is to examine the 'client' code in the examples.  It demonstrates which events to listen to, how to send requests and wait for responses.

### DatabaseRequest Object

The DatabaseRequest object is a container used to send requests that expect a response.  The request object remains live until the response is detected.  At that point the 

### Events

The client has a number of events used to coordinate when the private channel is ready to send commands and when responses arrive for specific command requests.  The DatabaseRequest object should be used to send requests that expect a response.

#### Event Definitions
~~~
DatabaseClient.PRIVATE_CHANNEL_ACCEPTED
DatabaseClient.PRIVATE_CHANNEL_CONNECTED // ready for commands
DatabaseClient.PRIVATE_MESSAGE_RECEIVED // any message from server
DatabaseClient.PRIVATE_RESPONSE_RECEIVED // specific response to a request
~~~

## Examples

There is a single client example that queues up multiple requests and sends them when the channel opens.  Most responses are validated against expected results.  See _integration tests_ or _unit tests_ for a more complete exercise of all valid database methods.

## Tests

### Unit Tests

Unit tests include should/specs, jshint and validate-package.  Tests can be run from the command line with this:

~~~
    make test

    or

    make watch

    or

    npm test
~~~

### Integration Tests

_NOTE: running integration tests will flush your redis database, so tests should be done only on a test system were the redis data is not critical..._

All integration tests are in the integration-test folder an run through mocha/chai.  The tests are organized by supported type, e.g., keys, strings, lists, etc.

Run the suite of tests with:

~~~
	make integration
~~~

- - -
<p><small><em>Copyright © 2015, rain city software | Version 0.90.10</em></small></p>
