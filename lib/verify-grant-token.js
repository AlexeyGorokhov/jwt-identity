'use strict';

const verifyToken = require('./verify-token');
const extractRealClaims = require('./utils/extract-real-claims');

/**
 * Helper exposed via identity.verifyGrantToken(grantToken)
 *
 * @param {String} grantToken Grant token to be verified
 *
 * @return {Promise<Object|null>} User data if token is valid, otherwise null
 *     @prop {String} id
 *     @prop {String} roles
 *     @prop {Object} claims
 */
module.exports = async function verifyGrantToken (grantToken) {
  const { key, algorithm } = this.config.security;

  const tokenClaims = await verifyToken(grantToken, key, algorithm);

  if (!tokenClaims || !tokenClaims.userId) return null;

  return {
    id: tokenClaims.userId,
    roles: tokenClaims.roles || '',
    claims: extractRealClaims(tokenClaims)
  };
};
