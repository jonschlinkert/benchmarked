'use strict';

/**
 * ```js
 * indexOf(a, b);
 * ```
 */

module.exports = function(a, b) {
  a = String(a);
  b = String(b);
  return a.substr(a.length - b.length) === b;
};
