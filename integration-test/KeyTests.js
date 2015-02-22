/**
 * @class KeyTests
 *
 * @author: darryl.west@roundpeg.com
 * @created: 2/21/15 4:53 PM
 */
var should = require('chai').should(),
    dash = require('lodash'),
    uuid = require('node-uuid' );

describe('KeyTests', function() {
    beforeEach(function(done) {

        // TODO : with direct access to the database, flush then reload for each test

        done();
    });

    describe('del', function() {
        it('should delete a known record by key');
        it('should not delete an unknown key');
    });

    describe('dump', function() {
        it('should dump a known key with predictable results');
        it('should not dump an unknown key');
    });

    describe('exists', function() {
        it('should return true when checking a known key');
        it('should return false when checking an unknown key');
    });

    describe('expire', function() {
        it('should set a ttl for a known key');
        // TODO what about error handling for a bad command, like if the seconds are 'flarb'
    });

    describe('keys', function() {
        it('should return all the keys for a given domain set');
        it('should return an error if there is no domain');
    });

    describe('persist', function() {
        it('should remove the ttl for a known key');
    });

    describe('randomKey', function() {
        it('should return a known key from a list of known keys');
    });

    describe('rename', function() {
        it('should rename a known key');
    });

    describe('ttl', function() {
        it('should return the ttl for a known expiring key');
        it('should return -1 for a non-expireing key');
    });

    describe('type', function() {
        it('should return the type for a known key');
        // TODO : test for all supported types
    });

    describe('scan', function() {
        it('should return the scan results for a list of records');
    });

});
