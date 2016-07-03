'use strict';

const verifyToken = require('./verify-token');

/**
 * Authenticate HTTP request
 * @param {Object} req - Request object
 * @return {Promise<Void>}
 * @public
 */
module.exports = function (req) {
  return new Promise((resolve) => {
    req.identity.user = {
      id: null,
      roles: '',
      claims: Object.create(null),
      isAuthenticated: false
    };

    const grantToken = getToken(req.headers);

    if (!grantToken) {
      resolve();
      return;
    }

    verifyToken(grantToken, req.identity.config.security.key)
    .then(tokenClaims => {
      if (!tokenClaims || !tokenClaims.userId) {
        resolve();
        return;
      }

      req.identity.user.id = tokenClaims.userId;
      req.identity.user.isAuthenticated = true;

      if (tokenClaims.roles) req.identity.user.roles = tokenClaims.roles;

      const otherTokenClaimKeys = Object.keys(tokenClaims).filter(key => {
        return key !== 'userId' && key !== 'roles' && key !== 'iat' && key !== 'exp';
      });

      otherTokenClaimKeys.forEach(claimKey => {
        req.identity.user.claims[claimKey] = tokenClaims[claimKey];
      });

      resolve();
    });
  });
};

/**
 * Get grant token from HTTP headers
 * @param {Object} headers - Collection of headers
 * @return {String | null} - Grant token
 * @private
 */
function getToken (headers) {
  const authHeader = headers.authorization;

  if (!authHeader) return null;

  const content = authHeader.trim().split(' ').filter(x => x);

  if (content[0] !== 'Bearer') return null;

  if (content[1]) return content[1];

  return null;
}
