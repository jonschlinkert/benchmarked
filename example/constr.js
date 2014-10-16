var Suite = require('..');
var suite = new Suite({
  add: 'code/*.js',
  fixtures: 'fixtures/*.txt',
  cwd: 'example'
});

suite.run(function(args) {
  return [args, ':'];
});

