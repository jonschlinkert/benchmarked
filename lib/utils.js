'use strict';

const typeOf = require('kind-of');
const hasValues = require('has-values');
const inflection = require('inflection');
const define = require('define-property');

/**
 * Create a title from the given `name`
 *
 * @param  {String} `name`
 * @return {String}
 */

exports.toTitle = function(name) {
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return inflection.singularize(name);
};

/**
 * Set a `key` property on a vinyl file object
 *
 * @param  {Object} `file`
 */

exports.setKey = function(file, options) {
  if (typeof options.renameKey === 'function') {
    return options.renameKey(file, options);
  }
  if (typeof options.renameKey === 'string') {
    return file[options.renameKey];
  }
  return file.stem;
};

/**
 * Capture benchmark results
 * @param {Object} `bench`
 * @return {Object}
 */

exports.captureBench = function(event, file) {
  const target = event.target;
  const results = {
    name: target.name,
    file: file,
    runs: target.stats.sample.length,
    // operations per second
    hz: target.hz,
    ops: exports.formatNumber(target.hz),
    // relative margin of error
    rme: target.stats.rme.toFixed(2)
  };

  define(results, 'target', target);
  return results;
};

/**
 * Format a nubmer to have
 * @param {Number} num
 * @return {String}
 */

exports.formatNumber = function(num) {
  num = String(num.toFixed(num < 100 ? 2 : 0)).split('.');
  return num[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',')
    + (num[1] ? '.' + num[1] : '');
};

/**
 * Return true if `val` is a vinyl file object
 *
 * @param  {*} `val`
 * @return {Boolean}
 */

exports.isFile = function(file) {
  return exports.isObject(file)
    && typeof file.path === 'string'
    && file._isVinyl;
};

/**
 * Return true if `val` is an object
 *
 * @param  {*} `val`
 * @return {Boolean}
 */

exports.isObject = function(val) {
  return typeOf(val) === 'object';
};

/**
 * Cast `val` to an array
 *
 * @param  {*} val
 * @return {Array}
 */

exports.arrayify = function(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Return `true` if the given value is "empty"
 */

exports.isEmpty = function(val) {
  return typeof val !== 'function' && !hasValues.apply(null, arguments);
};
