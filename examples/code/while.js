'use strict'

/**
 * ```js
 * indexOf(a, b);
 * ```
 */

module.exports = function (a, b) {
  a = String(a);
  b = String(b);

  var i = b.length;
  var len = a.length - i;

  while (i--) {
    if (b.charAt(i) !== a.charAt(len + i)) {
      return false;
    }
  }
  return true;
};