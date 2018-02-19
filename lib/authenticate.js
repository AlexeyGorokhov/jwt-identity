'use strict';

const extractTokenFromHeaders = require('./utils/extract-token-from-headers');
const extractRealClaims = require('./utils/extract-real-claims');
const verifyToken = require('./verify-token');

/**
 * Authenticate HTTP request
 *
 * @param {Object} req Request object
 *
 * @return {Promise<Void>}
 */
module.exports = async function authenticate (req) {
  req.identity.user = {
    id: null,
    roles: '',
    claims: Object.create(null),
    isAuthenticated: false
  };

  const grantToken = extractTokenFromHeaders(req.headers);

  if (!grantToken) return;

  const { key, algorithm } = req.identity.config.security;

  const tokenClaims = await verifyToken(grantToken, key, algorithm);

  if (!tokenClaims || !tokenClaims.userId) return;

  req.identity.user.id = tokenClaims.userId;
  req.identity.user.isAuthenticated = true;

  if (tokenClaims.roles) req.identity.user.roles = tokenClaims.roles;

  req.identity.user.claims = extractRealClaims(tokenClaims);
};
