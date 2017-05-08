'use strict';

require('mocha');
var path = require('path');
var assert = require('assert');
var cwd = require('memoize-path')(__dirname);
var Benchmarked = require('..');
var benchmarked;

var fixtures = cwd('fixtures');
var code = cwd('code');

describe('benchmarked', function() {
  beforeEach(function() {
    benchmarked = new Benchmarked({cwd: cwd()});
  });

  it('should export a function', function() {
    assert.equal(typeof Benchmarked, 'function');
  });

  it('should instantiate', function() {
    assert(benchmarked instanceof Benchmarked);
  });

  it('should instantiate without new', function() {
    assert(Benchmarked() instanceof Benchmarked);
  });

  it('should add fixtures to `fixtures.files', function() {
    benchmarked.addFixtures('*.txt', {cwd: fixtures()});
    assert(benchmarked.fixtures.files.length > 0);
  });

  it('should add code to `code.files', function() {
    benchmarked.addCode('*.js', {cwd: code()});
    assert(benchmarked.code.files.length > 0);
  });
});

describe('build options', function() {
  it('should have default format option', function() {
    benchmarked = new Benchmarked({cwd: cwd()});
    assert.equal(typeof benchmarked.format, 'function');
  });

  it('should override the format option', function() {
    function formatter() {}
    benchmarked = new Benchmarked({
      cwd: cwd(),
      format: formatter,
    });
    assert.equal(benchmarked.format, formatter);
  });
})
