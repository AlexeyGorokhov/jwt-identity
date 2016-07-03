'use strict';

const jwt = require('jsonwebtoken');

module.exports = {
  grant: grant,
  refresh: refresh
};

/**
 * Create a grant token
 * @param {Object} payload
 *        @prop {String} userId
 *        @prop {String} roles - A comma separated list of user's roles
 *        @prop {Object} claims - Other claims to include in the token
 * @param {Object} config
 * @return {Promise<String>}
 * @public
 */
function grant (payload, config) {
  return new Promise((resolve, reject) => {
    const body = Object.create(null);
    body.userId = payload.userId;
    body.roles = payload.roles;

    Object.keys(payload.claims).forEach(key => {
      body[key] = payload.claims[key];
    });

    const opts = {
      algorithm: config.security.algorithm,
      expiresIn: config.grantToken.expiresIn * 60
    };

    const secret = config.security.key;

    jwt.sign(body, secret, opts, (err, token) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(token);
    });
  });
}

/**
 * Create a refresh token
 * @param {String} userId
 * @param {String} securityStamp
 * @param {Object} config
 * @return {Promise<String>}
 * @public
 */
function refresh (userId, securityStamp, config) {
  return new Promise((resolve, reject) => {
    const body = {
      userId: userId,
      securityStamp: securityStamp
    };
    const opts = {
      algorithm: config.security.algorithm,
      expiresIn: Math.ceil(config.refreshToken.expiresIn * 24 * 60 * 60)
    };
    const secret = config.security.key;

    jwt.sign(body, secret, opts, (err, token) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(token);
    });
  });
}
