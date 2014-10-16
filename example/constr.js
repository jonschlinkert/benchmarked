var Suite = require('..');
var suite = new Suite({
  fixtures: 'fixtures/*.txt',
  add: 'code/*.js',
  cwd: 'example'
});

suite.run(function(args) {
  return [args, ':'];
});

