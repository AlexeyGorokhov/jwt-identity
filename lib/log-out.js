/** @module log-out */

module.exports = logOut;

/**
 * Log a user out
 *
 * @param {Function} cb(err) - Callback Function
 *        @param {Object} err - Error object
 */
function logOut (cb) {
  const remover = this.config.refreshTokenRemover;

  if (typeof cb !== 'function') cb = e => {};

  if (!this.user || !this.user.claims || !this.user.claims.userId) {
    cb(null);
    return;
  }

  const userId = this.user.claims.userId;
  remover(userId, cb);
}
