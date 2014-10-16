var Suite = require('..');
var suite = new Suite();

var options = {
  add: 'code/ends-with/*.js',
  fixtures: 'fixtures/*.txt',
  cwd: 'example'
};

suite.run(options, function(args) {
  return [args, ':'];
});
