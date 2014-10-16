var Suite = require('..');
var suite = new Suite();

var options = {
  fixtures: 'fixtures/*.txt',
  add: 'code/*.js',
  cwd: 'example'
};

suite.run(options, function(args) {
  return [args, ':'];
});
