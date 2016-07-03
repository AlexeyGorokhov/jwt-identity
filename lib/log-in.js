'use strict';

const logInWithRefreshToken = require('./login-with-refreshtoken');
const logInWithCredentials = require('./login-with-credentials');

/**
 * Log the user in
 * @return {Promise<Object>}
 *         @prop {Integer} statusCode
 *         @prop {String | null} grantToken
 *         @prop {String | null} refreshToken
 * @public
 */
module.exports = function () {
  return new Promise((resolve, reject) => {
    const config = this.config;
    const req = this.request;

    const incomingRefreshToken = req.body[config.credentials.refreshToken];

    if (incomingRefreshToken) {
      logInWithRefreshToken(incomingRefreshToken, config)
      .then(result => resolve(result))
      .catch(err => reject(err));
    } else {
      const credentials = {
        login: req.body[config.credentials.login],
        password: req.body[config.credentials.password],
        rememberMe: req.body[config.credentials.rememberMe]
      };

      logInWithCredentials(credentials, config)
      .then(result => resolve(result))
      .catch(err => reject(err));
    }
  });
};
