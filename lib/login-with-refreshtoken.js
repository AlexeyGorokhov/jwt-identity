'use strict';

const verifyToken = require('./verify-token');
const createToken = require('./create-token');

/**
 * Log the user in with a refresh token
 * @param {String} token - Refresh token
 * @param {Object} config - Configuration object
 * @return {Promise<Object>}
 *         @prop {Integer} statusCode
 *         @prop {String | null} grantToken
 *         @prop {String | null} refreshToken - Prolonged refresh token if needed
 * @public
 */
module.exports = function (token, config) {
  return new Promise((resolve, reject) => {
    const result = {
      statusCode: 401,
      grantToken: null,
      refreshToken: null
    };

    verifyToken(token, config.security.key, config.security.algorithm)
    .then(claims => {
      if (!claims) {
        resolve(result);
        return;
      }

      config.workers.getUser({
        id: claims.userId
      })
      .then(userData => {
        const isValidUser = userData && userData.securityStamp === claims.securityStamp;
        if (!isValidUser) {
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

          if (!isProlongationNeeded(claims.iat, claims.exp)) {
            resolve(result);
            return;
          }

          createToken.refresh(userData.userId, userData.securityStamp, config)
          .then(token => {
            result.refreshToken = token;
            resolve(result);
          })
          .catch(err => reject(err));
        })
        .catch(err => reject(err));
      })
      .catch(err => reject(err));
    });
  });
};

/**
 * Check if refresh token prolongation is needed
 * @param {Integer} iat - Timestamp of issure time (without ms)
 * @param {Integer} exp - Timestamp of expiry time (without ms)
 * @return {Boolean}
 * @private
 */
function isProlongationNeeded (iat, exp) {
  const issueDate = new Date(iat * 1000);
  const expiryDate = new Date(exp * 1000);
  const total = expiryDate - issueDate;
  const remains = expiryDate - Date.now();
  const THRESHOLD = 0.25;

  return remains / total < THRESHOLD;
}
