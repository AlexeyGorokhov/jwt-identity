'use strict';

const createToken = require('./create-token');
const isRememberingNeeded = require('./utils/is-remembering-needed');

/**
 * Log user in with their credentials
 *
 * @param {String} credentials User credentials
 *     @prop {String} login
 *     @prop {String} password
 *     @prop {Boolean | String} rememberMe
 * @param {Object} config Configuration object
 * @param {Object} [user] Optional. If passed, this user object is used in tokens creation
 *                        instead of retrieving user with config.workers.getUser()
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
module.exports = async function loginWithCredentials (credentials, config, user = null) {
  const result = {
    statusCode: 401,
    grantToken: null,
    refreshToken: null
  };

  const userData = user || await config.workers.getUser({
    login: credentials.login,
    password: credentials.password
  });

  if (!userData) return result;

  result.statusCode = 200;

  const body = {
    userId: userData.userId,
    roles: userData.roles,
    claims: userData.claims
  };

  result.grantToken = await createToken.grant(body, config);

  if (isRememberingNeeded(credentials.rememberMe)) {
    result.refreshToken =
      await createToken.refresh(userData.userId, userData.securityStamp, config);
  }

  return result;
};
