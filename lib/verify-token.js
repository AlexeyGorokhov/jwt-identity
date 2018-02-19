'use strict';

const jwt = require('jsonwebtoken');

/**
 * Verify a token

 * @param {String} token
 * @param {String} secret
 * @param {String} algorithm
 *
 * @return {Promise<Object|null>} Claims if token is valid, otherwise null
 */
module.exports = function verifyToken (token, secret, algorithm) {
  return new Promise(resolve => {
    const opts = {
      algorithms: [algorithm]
    };

    jwt.verify(token, secret, opts, (err, claims) => {
      if (err) {
        resolve(null);
        return;
      }
      resolve(claims);
    });
  });
};
