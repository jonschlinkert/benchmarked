'use strict';

/**
 * ```js
 * indexOf(a, b);
 * ```
 */

var endsWith = module.exports = function(a, b) {
  a = String(a);
  b = String(b);
  var i = a.lastIndexOf(b)
  return i >= 0 && i === a.length - b.length;
};
