'use strict';

/**
 * Check if user credentials say the user wants to stay logged-in
 *
 * @param {Boolean|String} rememberMe
 *
 * @return {Boolean}
 */
module.exports = function isRememberingNeeded (rememberMe) {
  return rememberMe !== 'false' && Boolean(rememberMe);
};
