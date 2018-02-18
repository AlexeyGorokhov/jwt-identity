'use strict';

const dateNow = require('./date-now');
const THRESHOLD = require('./exp-threshold');

/**
 * Check if refresh token needs to be prolonged
 *
 * @param {Integer} iat Issure time timestamp (without ms)
 * @param {Integer} exp Expiry time timestamp (without ms)
 *
 * @return {Boolean}
 */
module.exports = function isProlongationNeeded (iat, exp) {
  const issueDate = new Date(iat * 1000);
  const expiryDate = new Date(exp * 1000);
  const total = expiryDate - issueDate;
  const remains = expiryDate - dateNow();

  return (remains / total) < THRESHOLD;
};
