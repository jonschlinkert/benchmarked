'use strict';

var Suite = require('..');
var suite = new Suite({
  cwd: __dirname,
  fixtures: 'fixtures/*.txt',
  code: 'code/*.js',
});

suite.run();
