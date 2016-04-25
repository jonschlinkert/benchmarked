'use strict';

var path = require('path');
var Suite = require('./');
var suite = new Suite({
  cwd: path.resolve(__dirname, 'examples'),
  fixtures: 'fixtures/short.txt',
  code: 'code/{while,slice}.js',
});

suite.run();
