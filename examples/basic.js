'use strict';

var Suite = require('..');
var suite = new Suite({
  fixtures: 'fixtures/*.txt',
  code: 'code/*.js',
  cwd: __dirname,
  format: function(benchmark) {
    // this is how `benchmark` builds its toString() value
    // in default format: '  ' + benchmark
    var name = benchmark.name;
    var ops = benchmark.hz.toFixed(benchmark.hz < 100 ? 2 : 0);
    var rme = '\xb1' + benchmark.stats.rme.toFixed(2) + '%';
    var size = benchmark.stats.sample.length;
    var ess  = benchmark.stats.sample.length === 1 ? '' : 's';

    return name + ' x ' + ops + ' ops/sec ' + rme + ' (' + size +
      ' run' + ess + ' sampled)';
  }
});

suite.run();
