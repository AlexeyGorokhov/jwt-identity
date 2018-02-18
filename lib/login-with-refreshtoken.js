'use strict';

const verifyToken = require('./verify-token');
const createToken = require('./create-token');
const isProlongationNeeded = require('./utils/is-prolongation-needed');

/**
 * Log the user in with a refresh token
 *
 * @param {String} token Refresh token
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
 *     @prop {String | null} refreshToken - Prolonged refresh token if needed
 */
module.exports = async function logInWithRefreshToken (token, config, user = null) {
  const result = {
    statusCode: 401,
    grantToken: null,
    refreshToken: null
  };

  const claims = await verifyToken(token, config.security.key, config.security.algorithm);

  if (!claims) return result;

  const userData = user || await config.workers.getUser({ id: claims.userId });

  const isValidUser = userData && userData.securityStamp === claims.securityStamp;

  if (!isValidUser) return result;

  result.statusCode = 200;

  const body = {
    userId: userData.userId,
    roles: userData.roles,
    claims: userData.claims
  };

  const grantToken = await createToken.grant(body, config);

  result.grantToken = grantToken;

  if (!isProlongationNeeded(claims.iat, claims.exp)) return result;

  const refreshToken = await createToken.refresh(userData.userId, userData.securityStamp, config);

  result.refreshToken = refreshToken;

  return result;
};
