'use strict';

/**
 * Extract grant token from HTTP headers
 *
 * @param {Object} headers Collection of headers
 *
 * @return {String|null} Grant token
 */
module.exports = function extractTokenFromHeaders (headers) {
  const authHeader = headers.authorization;

  if (!authHeader) return null;

  const content = authHeader.trim().split(' ').filter(x => x);

  if (content[0] !== 'Bearer') return null;

  if (content[1]) return content[1];

  return null;
};
