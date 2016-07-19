'use strict';

const createToken = require('./create-token');

/**
 * Log the user in with their credentials
 * @param {String} credentials - User's credentials
 *        @prop {String} login
 *        @prop {String} password
 *        @prop {Boolean | String} rememberMe
 * @param {Object} config - Configuration object
 * @return {Promise<Object>}
 *         @prop {Integer} statusCode
 *         @prop {String | null} grantToken
 *         @prop {String | null} refreshToken
 * @public
 */
module.exports = function (credentials, config) {
  return new Promise((resolve, reject) => {
    const result = {
      statusCode: 401,
      grantToken: null,
      refreshToken: null
    };

    config.workers.getUser({
      login: credentials.login,
      password: credentials.password
    })
    .then(userData => {
      if (!userData) {
        resolve(result);
        return;
      }

      result.statusCode = 200;

      const body = {
        userId: userData.userId,
        roles: userData.roles,
        claims: userData.claims
      };

      createToken.grant(body, config)
      .then(token => {
        result.grantToken = token;

        if (credentials.rememberMe && credentials.rememberMe !== 'false') {
          createToken.refresh(userData.userId, userData.securityStamp, config)
          .then(token => {
            result.refreshToken = token;
            resolve(result);
          })
          .catch(err => reject(err));
        } else {
          resolve(result);
        }
      })
      .catch(err => reject(err));
    })
    .catch(err => reject(err));
  });
};
