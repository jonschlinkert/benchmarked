var Suite = require('..');
var suite = new Suite({cwd: 'example'});


suite.fixtures('fixtures/*.txt');
suite.add('code/*.js');

suite.run(function (args) {
  return [args, ')'];
});