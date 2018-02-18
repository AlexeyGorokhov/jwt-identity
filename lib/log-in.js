'use strict';

const logInWithRefreshToken = require('./login-with-refreshtoken');
const logInWithCredentials = require('./login-with-credentials');

/**
 * Log the user in
 *
 * @param {Object} [user] Optional. User data
 *     @prop {String} userId
 *     @prop {String} roles
 *     @prop {String} securityStamp
 *     @prop {Object} claims
 *
 * @return {Promise<Object>}
 *     @prop {Integer} statusCode
 *     @prop {String | null} grantToken
 *     @prop {String | null} refreshToken
 */
module.exports = async function logIn (user = void 0) {
  const { config, request: req } = this;
  const incomingRefreshToken = req.body[config.credentials.refreshToken];

  let result;

  if (incomingRefreshToken) {
    result = await logInWithRefreshToken(incomingRefreshToken, config, user);
  } else {
    const credentials = {
      login: req.body[config.credentials.login],
      password: req.body[config.credentials.password],
      rememberMe: req.body[config.credentials.rememberMe]
    };

    result = await logInWithCredentials(credentials, config, user);
  }

  return result;
};
