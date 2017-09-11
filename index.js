'use strict';

/**
 * Module dependencies
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const File = require('vinyl');
const ansi = require('ansi');
const Emitter = require('component-emitter');
const Benchmark = require('benchmark');
const define = require('define-property');
const reader = require('file-reader');
const isGlob = require('is-glob');
const typeOf = require('kind-of');
const merge = require('mixin-deep');
const glob = require('resolve-glob');
const log = require('log-utils');
const mm = require('micromatch');

/**
 * Local variables
 */

const utils = require('./lib/utils');
const cursor = ansi(process.stdout);
const colors = log.colors;

/**
 * Create an instance of Benchmarked with the given `options`.
 *
 * ```js
 * const suite = new Suite();
 * ```
 * @param {Object} `options`
 * @api public
 */

function Benchmarked(options) {
  if (!(this instanceof Benchmarked)) {
    return new Benchmarked(options);
  }
  Emitter.call(this);
  this.options = Object.assign({}, options);
  this.results = [];
  this.defaults(this);
}

/**
 * Inherit Emitter
 */

util.inherits(Benchmarked, Emitter);

/**
 * Default settings
 */

Benchmarked.prototype.defaults = function(benchmarked) {
  this.fixtures = {
    files: [],
    cache: {},
    toFile: function(file) {
      const str = fs.readFileSync(file.path, 'utf8');
      file.content = reader.file(file);
      file.bytes = util.format('(%d bytes)', str.length);
    }
  };

  this.code = {
    files: [],
    cache: {},
    toFile: function(file) {
      file.invoke = require(file.path);
    }
  };

  if (typeof this.options.format === 'function') {
    this.format = this.options.format;
  }
  if (this.options.fixtures) {
    this.addFixtures(this.options.fixtures);
  }
  if (this.options.code) {
    this.addCode(this.options.code);
  }
};

/**
 * Default formatter for benchmark.
 *
 * @param  {Benchmark} `benchmark` The Benchmark to produce a string from.
 */

Benchmarked.prototype.format = function(benchmark) {
  return '  ' + benchmark;
};

/**
 * Create a vinyl file object.
 *
 * @param  {String} `type` The type of file to create (`code` or `fixture`)
 * @param  {String} `filepath`
 */

Benchmarked.prototype.toFile = function(type, filepath, options) {
  const opts = merge({cwd: this.cwd}, this.options, options);
  let file = new File({path: path.resolve(opts.cwd, filepath)});

  file.key = utils.setKey(file, opts);
  file.inspect = function() {
    return '<' + utils.toTitle(type) + ' ' + this.key + '"' + this.relative + '">';
  };

  const fn = opts.toFile || this[type].toFile;
  const res = fn.call(this, file);
  if (utils.isFile(res)) {
    file = res;
  }
  return file;
};

/**
 * Add fixtures to run benchmarks against.
 *
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 */

Benchmarked.prototype.filter = function(type, patterns, options) {
  if (typeof patterns === 'undefined') {
    patterns = '*';
  }

  const isMatch = mm.matcher(patterns, options);
  const results = [];

  for (let file of this.fixtures.files) {
    if (isMatch(file.basename)) {
      file.suite = this.addSuite(file, options);
      results.push(file);
    }
  }
  return results;
};

/**
 * Add fixtures to run benchmarks against.
 *
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 */

Benchmarked.prototype.match = function(type, patterns, options) {
  return mm.matchKeys(this[type].files, patterns, options);
};

/**
 * Add fixtures to run benchmarks against.
 *
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 */

Benchmarked.prototype.addFile = function(type, file, options) {
  if (isGlob(file) || Array.isArray(file)) {
    return this.addFiles.apply(this, arguments);
  }

  if (typeof file === 'string') {
    file = this.toFile(type, file, options);
  }

  if (!utils.isFile(file)) {
    throw new Error('expected "file" to be a vinyl file object');
  }

  this[type].cache[file.path] = file;
  this[type].files.push(file);
  return this;
};

/**
 * Add fixtures to run benchmarks against.
 *
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 */

Benchmarked.prototype.addFiles = function(type, files, options) {
  const opts = merge({cwd: this.cwd}, this.options, options);
  switch (typeOf(files)) {
    case 'string':
      if (isGlob(files)) {
        this.addFiles(type, glob.sync(files, opts), options);
      } else {
        this.addFile(type, files, options);
      }
      break;
    case 'array':
      this.addFilesArray(type, files, options);
      break;
    case 'object':
      this.addFilesObject(type, files, options);
      break;
    default: {
      throw new TypeError('cannot load files: ', util.inspect(arguments));
    }
  }
  return this;
};

/**
 * Add an array of `files` to the files array and cache for the given `type`.
 *
 * @param  {String} `type` Either `code` or `fixtures`
 * @param  {Array} Files to add
 * @param  {Object}
 */

Benchmarked.prototype.addFilesArray = function(type, files, options) {
  for (let file of files) {
    this.addFile(type, file, options);
  }
  return this;
};

/**
 * Add a fixture to run benchmarks against.
 *
 * @param  {String|Function} `fixture` Filepath or function
 */

Benchmarked.prototype.addFilesObject = function(type, files, options) {
  for (let key in Object.keys(files)) {
    this.addFile(type, files[key], options);
  }
  return this;
};

/**
 * Add a fixture to run benchmarks against.
 *
 * @param  {String|Function} `fixture` Filepath or function
 */

Benchmarked.prototype.addFixture = function(file, options) {
  this.addFile('fixtures', file, options);
  return this;
};

/**
 * Add fixtures to run benchmarks against.
 *
 * ```js
 * benchmarks.addFixtures('fixtures/*.txt');
 * ```
 * @param  {String|Array} `patterns` Filepaths or glob patterns.
 * @param  {Options} `options`
 * @api public
 */

Benchmarked.prototype.addFixtures = function(files, options) {
  this.addFiles('fixtures', files, options);
  return this;
};

/**
 * Specify the functions to be benchmarked.
 *
 * ```js
 * benchmarks.addCode('fixtures/*.txt');
 * ```
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 * @api public
 */

Benchmarked.prototype.addCode = function(file, options) {
  this.addFiles('code', file, options);
  return this;
};

/**
 * Add benchmark suite to the given `fixture` file.
 *
 * @param {Object} `fixture` vinyl file object
 * @api public
 */

Benchmarked.prototype.addSuite = function(fixture, options) {
  var files = this.code.files;
  var opts = this.options;
  var format = this.format;
  var self = this;

  // capture results for this suite
  var res = {name: fixture.key, file: fixture, results: []};
  define(res, 'fixture', fixture);
  this.results.push(res);

  if (opts.dryRun === true) {
    files.forEach(function(file) {
      console.log(file.invoke(fixture.content));
    });
    return;
  }

  var suite = new Benchmark.Suite(fixture.bytes, {
    name: fixture.key,
    onStart: function onStart() {
      console.log(colors.cyan('\n# %s %s'), fixture.relative, fixture.bytes);
    },
    onComplete: function() {
      cursor.write('\n');
    }
  });

  files.forEach((file) => {
    suite.add(file.key, Object.assign({
      onCycle: function onCycle(event) {
        cursor.horizontalAbsolute();
        cursor.eraseLine();
        cursor.write(format(event.target));
      },
      fn: function() {
        return file.invoke.apply(null, utils.arrayify(fixture.content));
      },
      onComplete: function(event) {
        cursor.horizontalAbsolute();
        cursor.eraseLine();
        cursor.write(format(event.target));
        cursor.write('\n');
        res.results.push(utils.captureBench(event, file));
      },
      onAbort: this.emit.bind(this, 'error'),
      onError: this.emit.bind(this, 'error')
    }, options));
  });

  if (files.length <= 1) {
    return suite;
  }

  suite.on('complete', () => {
    var fastest = suite.filter('fastest').map('name');
    res.fastest = fastest;
    this.emit('complete', res);
    console.log('  fastest is', colors.green(fastest));
  });

  return suite;
};

/**
 * Run the benchmarks.
 *
 * ```js
 * benchmarks.run();
 * ```
 * @param  {Object} `options`
 * @param  {Function} `cb`
 * @param  {Object} `thisArg`
 * @api public
 */

Benchmarked.prototype.run = function(patterns, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = { async: true };
  }

  var fixtures = this.filter('fixtures', patterns, options);

  if (fixtures.length > 0) {
    console.log('Benchmarking: (%d of %d)', fixtures.length, this.fixtures.files.length);
    fixtures.forEach(function(file) {
      console.log(' · %s', file.key);
    });
  } else {
    console.log('No matches for patterns: %s', util.inspect(patterns));
  }

  fixtures.forEach(function(file) {
    file.suite.run(options);
  });

  this.emit('end', this.results);
};

Benchmarked.prototype.dryRun = function(pattern, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = null;
  }

  if (typeof pattern === 'function') {
    fn = pattern;
    options = {};
    pattern = '**/*';
  }

  if (typeof fn !== 'function') {
    throw new TypeError('Expected fn to be a function');
  }

  var opts = Object.assign({ async: true }, options);
  var fixtures = this.filter('fixtures', pattern, opts);
  var len = this.fixtures.files.length;
  var code = this.code;

  if (fixtures.length > 0) {
    console.log('Dry run for (%d of %d) fixtures:', fixtures.length, len);
    fixtures.forEach(function(file) {
      console.log(' · %s', file.key);
    });
  } else {
    console.log('No matches for pattern: %s', util.inspect(pattern));
  }



  console.log();
  code.files.forEach(function(file) {
    fixtures.forEach(function(fixture) {
      fn(file, fixture);
    });
  });
};

Benchmarked.run = function(options) {
  const opts = Object.assign({cwd: process.cwd()}, options);

  if (fs.existsSync(path.join(opts.cwd, 'benchmark'))) {
    opts.cwd = path.join(opts.cwd, 'benchmark');
  }

  return new Promise(function(resolve, reject) {
    const suite = new Benchmarked({
      cwd: __dirname,
      fixtures: path.join(opts.cwd, opts.fixtures),
      code: path.join(opts.cwd, opts.code)
    });

    suite.on('error', reject);

    if (opts.dry) {
      suite.dryRun(function(code, fixture) {
        console.log(colors.cyan('%s > %s'), code.key, fixture.key);
        const args = require(fixture.path).slice();
        const expected = args.pop();
        const actual = code.invoke.apply(null, args);
        console.log(expected, actual);
        console.log();
        resolve();
      });
    } else {
      suite.on('end', resolve);
      suite.run();
    }
  });
};

Benchmarked.render = function(benchmarks) {
  const res = [];
  for (let i = 0; i < benchmarks.length; i++) {
    const target = benchmarks[i];
    let b = `# ${target.name} ${target.file.bytes}\n`;

    for (let i = 0; i < target.results.length; i++) {
      const stats = target.results[i];
      b += `  ${stats.name} x ${stats.ops} ops/sec ±${stats.rme}%`;
      b += ` (${stats.runs} runs sampled)\n`;
    }

    b += `\n  fastest is ${target.fastest.join(', ')}`;
    b += ` (by ${diff(target)} avg)\n`;
    res.push(b);
  }
  return res.join('\n');
};

function diff(target) {
  let len = target.results.length;
  let fastest = 0;
  let rest = 0;

  for (let i = 0; i < len; i++) {
    let stats = target.results[i];

    if (target.fastest.indexOf(stats.name) !== -1) {
      fastest = +stats.hz;
    } else {
      rest += +stats.hz;
    }
  }
  var avg = (fastest / (+rest / (len - 1)) * 100);
  return avg.toFixed() + '%';
}

/**
 * Expose `Benchmarked`
 */

module.exports = Benchmarked;
