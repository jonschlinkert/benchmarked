'use strict';

var Suite = require('..');
var suite = new Suite({cwd: 'example'});

suite.addFixtures('fixtures/*.txt');
suite.addCode('code/*.js');

suite.run();
