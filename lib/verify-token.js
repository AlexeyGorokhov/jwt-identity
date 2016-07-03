'use strict';

const jwt = require('jsonwebtoken');

/**
 * Verify a token
 * @param {String} token
 * @param {String} secret
 * @return {Promise<Object | null>} - Claims if token is valid, otherwise - null.
 *         The Promise never rejects.
 * @public
 */
module.exports = function (token, secret) {
  return new Promise(resolve => {
    jwt.verify(token, secret, (err, claims) => {
      if (err) {
        resolve(null);
        return;
      }
      resolve(claims);
    });
  });
};
