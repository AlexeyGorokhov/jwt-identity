'use strict';

/**
 * Extract real claims (those that have to go to "identity.user.claims") from all token claims
 *
 * @param {Object} allTokenClaims Collection of all claims a token includes
 *
 * @return {Object} Collection of real claims
 */
module.exports = function extractRealClaims (allTokenClaims) {
  const realClaims = {};

  Object.keys(allTokenClaims)
    .filter(key => key !== 'userId' && key !== 'roles' && key !== 'iat' && key !== 'exp')
    .forEach(keyOfRealClaim => {
      realClaims[keyOfRealClaim] = allTokenClaims[keyOfRealClaim];
    });

  return realClaims;
};
