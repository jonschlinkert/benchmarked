'use strict';

var Suite = require('..');
var suite = new Suite();

var options = {
  fixtures: 'fixtures/*.txt',
  add: 'code/*.js',
  cwd: __dirname
};

suite.run(options, function(args) {
  return [args, ':'];
});
