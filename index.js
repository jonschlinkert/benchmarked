'use strict';

var ansi = require('ansi');
var chalk = require('chalk');
var read = require('file-reader');
var forOwn = require('for-own');
var Benchmark = require('benchmark');
var extend = require('extend-shallow');
var cursor = ansi(process.stdout);

/**
 * Suite constructor.
 */

function Suite(options) {
  this.options = extend({cwd: process.cwd()}, options);
}

/**
 * Define fixtures to run benchmarks against.
 *
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 * @api public
 */

Suite.prototype.fixtures = function(patterns, options) {
  options = options || {cwd: this.options.cwd};
  this._fixtures = read(patterns, options);
  return this;
};

/**
 * Define the functions to benchmark.
 *
 * @param  {String|Array} `patterns` Filepath(s) or glob patterns.
 * @param  {Options} `options`
 * @api public
 */

Suite.prototype.add = function(patterns, options) {
  options = options || {cwd: this.options.cwd};
  this._add = read(patterns, options);
  return this;
};

/**
 * Run the benchmarks
 *
 * @param  {Object} `options`
 * @param  {Function} `cb`
 * @param  {Object} `thisArg`
 * @api public
 */

Suite.prototype.run = function(options, cb, thisArg) {
  var self = this;
  var i = 0;

  if (typeof options == 'function') {
    thisArg = cb;
    cb = options;
    options = {};
  }

  options = extend({}, this.options, options);
  var fixtures = this._fixtures;
  var add = this._add;

  if (options.fixtures) {
    fixtures = read(options.fixtures, options);
  }
  if (options.add) {
    add = read(options.add, options);
  }

  forOwn(fixtures, function (args, name) {
    if (typeof cb == 'function') {
      args = cb(args);
    }

    args = Array.isArray(args) ? args : [args];

    var benchmark = new Benchmark.Suite(name, {
      name: name,
      onStart: function () {
        console.log(chalk.magenta('\nBenchmark #%s: %s'), ++i, '"' + name + '"');
      },
      onComplete: function () {
        cursor.write('\n');
      }
    });

    forOwn(add, function (fn, fnName) {
      benchmark
        .add(fnName, {
          onCycle: function onCycle(event) {
            cursor.horizontalAbsolute();
            cursor.eraseLine();
            cursor.write(' > ' + event.target);
          },
          onComplete: function () {
            cursor.write('\n');
          },
          fn: function () {
            fn.apply(thisArg, args);
            return;
          }
        });
    });

    benchmark.run();
  });

  return this;
};


/**
 * Expose `Suite`
 */

module.exports = Suite;