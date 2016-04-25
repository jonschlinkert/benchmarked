'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var Base = require('base');
var File = require('vinyl');
var utils = require('./lib/utils');
var cursor = utils.ansi(process.stdout);

/**
 * Create an instance of Benchmarked with the given `options`.
 *
 * ```js
 * var benchmarks = new Benchmarked();
 * ```
 * @param {Object} `options`
 * @api public
 */

function Benchmarked(options) {
  if (!(this instanceof Benchmarked)) {
    return new Benchmarked(options);
  }
  Base.call(this, null, options);
  this.use(utils.option());
  this.use(utils.cwd());
  this.defaults(this);
}

/**
 * Inherit `Base`
 */

Base.extend(Benchmarked);

/**
 * Default settings
 */

Benchmarked.prototype.defaults = function(benchmarked) {
  this.fixtures = {
    files: [],
    cache: {},
    toFile: function(file) {
      file.contents = fs.readFileSync(file.path);
      file.content = file.contents.toString();
      file.title = util.format('(%d bytes)', file.content.length);
    }
  };

  this.code = {
    files: [],
    cache: {},
    toFile: function(file) {
      file.run = require(file.path);
    }
  };

  if (this.options.fixtures) {
    this.addFixtures(this.options.fixtures);
  }
  if (this.options.code) {
    this.addCode(this.options.code);
  }
};

/**
 * Create a vinyl file object.
 *
 * @param  {String} `type` The type of file to create (`code` or `fixture`)
 * @param  {String} `filepath`
 */

Benchmarked.prototype.toFile = function(type, filepath, options) {
  var opts = utils.merge({}, this.options, options);
  var file = new File({path: path.resolve(this.cwd, filepath)});

  file.key = utils.setKey(file, opts);
  file.inspect = function() {
    return `<${utils.toTitle(type)} ${this.key} "${this.relative}">`;
  };

  var fn = opts.toFile || this[type].toFile;
  var res = fn.call(this, file);
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

  if (Array.isArray(patterns)) {
    patterns = '{' + patterns.join(',') + '}';
  }

  var isMatch = utils.mm.matcher(patterns, options);
  var results = [];
  var self = this;

  this.fixtures.files.forEach(function(file) {
    if (isMatch(file.basename)) {
      file.suite = self.addSuite(file);
      results.push(file);
    }
  });
  return results;
};

/**
 * Add fixtures to run benchmarks against.
 *
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 */

Benchmarked.prototype.match = function(type, patterns, options) {
  return utils.mm.matchKeys(this[type].files, patterns, options);
};

/**
 * Add fixtures to run benchmarks against.
 *
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 */

Benchmarked.prototype.addFile = function(type, file, options) {
  if (utils.isGlob(file) || Array.isArray(file)) {
    return this.addFiles.apply(this, arguments);
  }

  type = utils.type(type);
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
  var opts = utils.merge({cwd: this.cwd}, this.options, options);
  switch (utils.typeOf(files)) {
    case 'string':
      if (utils.isGlob(files)) {
        this.addFiles(type, utils.glob.sync(files, opts), options);
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
  for (var i = 0; i < files.length; i++) {
    this.addFile(type, files[i], options);
  }
  return this;
};

/**
 * Add a fixture to run benchmarks against.
 *
 * @param  {String|Function} `fixture` Filepath or function
 */

Benchmarked.prototype.addFilesObject = function(type, files, options) {
  for (var key in files) {
    if (files.hasOwnProperty(key)) {
      this.addFile(type, files[key], options);
    }
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
  this.addFile('code', file, options);
  return this;
};

/**
 * Add benchmark suite to the given `fixture` file.
 *
 * @param {Object} `fixture` vinyl file object
 * @api public
 */

Benchmarked.prototype.addSuite = function(fixture, files) {
  var colors = utils.colors;

  var suite = new utils.Benchmark.Suite(fixture.title, {
    name: fixture.key,
    onStart: function onStart() {
      console.log(colors.cyan('\n# %s %s'), fixture.relative, fixture.title);
    },
    onComplete: function() {
      cursor.write('\n');
    }
  });

  files = files || this.code.files;
  files.forEach(function(file) {
    suite.add(file.key, {
      onCycle: function onCycle(event) {
        cursor.horizontalAbsolute();
        cursor.eraseLine();
        cursor.write('  ' + event.target);
      },
      fn: function() {
        file.run(fixture.content);
        return;
      },
      onComplete: function() {
        cursor.write('\n');
      }
    });
  });

  if (files.length <= 1) {
    return suite;
  }

  suite.on('complete', function() {
    console.log('  fastest is', colors.green(this.filter('fastest').pluck('name')));
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

Benchmarked.prototype.run = function(patterns, options) {
  var files = this.filter('fixtures', patterns, options);

  if (files.length > 0) {
    console.log('Benchmarking: (%d of %d)', files.length, this.fixtures.files.length);
    files.forEach(function(file) {
      console.log(' · %s', file.key);
    });
  } else {
    console.log('No matches for patterns: %s', util.inspect(patterns));
  }

  files.forEach(function(file) {
    file.suite.run();
  });
};

/**
 * Expose `Benchmarked`
 */

module.exports = Benchmarked;
