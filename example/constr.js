'use strict';

var Suite = require('..');
var suite = new Suite({
  fixtures: 'fixtures/*.txt',
  add: 'code/*.js',
  cwd: __dirname
});

suite.run(function(args) {
  return [args, ':'];
});

