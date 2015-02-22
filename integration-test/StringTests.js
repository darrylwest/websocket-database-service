/**
 * @class StringTests
 *
 * @author: darryl.west@raincitysoftware.com
 * @created: 2/22/15 6:57 AM
 */
var should = require('chai').should(),
    dash = require('lodash'),
    uuid = require('node-uuid' );

describe('StringTests', function() {
    beforeEach(function(done) {

        // TODO : with direct access to the database, flush then reload for each test

        done();
    });

    describe('set', function() {
        it('should save a known complex domain object by key');
        it('should save a known plain text value by key');
    });

    describe('get', function() {
        it('should return a known complex domain object by key');
        it('should return a known plain text value by key');
    });

    describe('mset', function() {
        it('should set multiple complex values');
        it('should set mulptiple plain text values');
    });

    describe('mget', function() {
        it('should return multiple values from multiple keys');
    });


});