'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('ansi');
require('base-cwd', 'cwd');
require('base-option', 'option');
require('benchmark', 'Benchmark');
require('define-property', 'define');
require('for-own');
require('resolve-glob', 'glob');
require('has-values');
require('inflection');
require('is-glob');
require('kind-of', 'typeOf');
require('log-utils', 'log');
require('micromatch', 'mm');
require('mixin-deep', 'merge');
require = fn;

/**
 * Expose `utils.log.colors` as `utils.colors`
 */

utils.colors = utils.log.colors;

/**
 * Create a title from the given `name`
 *
 * @param  {String} `name`
 * @return {String}
 */

utils.type = function(name) {
  return name === 'code' ? 'code' : 'fixtures';
};

/**
 * Create a title from the given `name`
 *
 * @param  {String} `name`
 * @return {String}
 */

utils.toTitle = function(name) {
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return utils.inflection.singularize(name);
};

/**
 * Set a `key` property on a vinyl file object
 *
 * @param  {Object} `file`
 */

utils.setKey = function(file, options) {
  if (typeof options.renameKey === 'function') {
    return options.renameKey(file, options);
  }
  if (typeof options.renameKey === 'string') {
    return file[options.renameKey];
  }
  return file.stem;
};

/**
 * Return true if `val` is a vinyl file object
 *
 * @param  {*} `val`
 * @return {Boolean}
 */

utils.isFile = function(file) {
  return utils.isObject(file) && typeof file.path === 'string' && file._isVinyl;
};

/**
 * Return true if `val` is an object
 *
 * @param  {*} `val`
 * @return {Boolean}
 */

utils.isObject = function(val) {
  return utils.typeOf(val) === 'object';
};

/**
 * Cast `val` to an array
 *
 * @param  {*} val
 * @return {Array}
 */

utils.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Return `true` if the given value is "empty"
 */

utils.isEmpty = function(val) {
  return typeof val !== 'function' && !utils.hasValues.apply(null, arguments);
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
