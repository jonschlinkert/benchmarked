'use strict';

/**
 * ```js
 * indexOf(a, b);
 * ```
 */

module.exports = function(a, b) {
  // if (typeof a !== 'string') {
  //   throw new Error('ends-with expects a string as the first argument.');
  // }
  a = String(a);
  b = String(b);

  var re = new RegExp(b + '$');
  return re.test(a);
};
