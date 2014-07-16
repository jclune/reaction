var should = require('should');
var test = require('../public/scripts/test');
var fb = require('../lib/facebook');

describe('hello world', function() {
  describe('test', function() {
      it('hello = hello', function() {
          test.hello().should.equal('hello');
      });
    });
});

describe('facebook.js', function() {
  describe('check types:', function() {
      it('Facebook is an object', function() {
        var type = typeof fb;
        type.should.equal('object');
      });
    });
});