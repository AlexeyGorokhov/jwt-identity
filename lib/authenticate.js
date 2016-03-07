/** @module authenticate */

'use strict';

const jwt = require('jsonwebtoken');
const now = require('date-now');

module.exports = authenticate;

authenticate.getGrantToken = getGrantToken;
authenticate.autoprolongateGrantToken = autoprolongateGrantToken;

/**
 * Authenticate an HTTP request
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
function authenticate (req, res) {
  req.identity.user = {
    isAuthenticated: false,
    claims: null
  };

  const grantToken = authenticate.getGrantToken(req);
  if (!grantToken) return;

  try {
    req.identity.user.claims =
      jwt.verify(grantToken, req.identity.config.key);
  } catch (e) { }

  if (req.identity.user.claims) {
    req.identity.user.isAuthenticated = true;
    authenticate.autoprolongateGrantToken(req, res);
  }
}

/**
 * Get grant_token from the header
 *
 * @param {Object} req - Request object
 * @returns {String} - grant_token string
 * @private
 */
function getGrantToken (req) {
  if (!req.headers || !req.headers['authentication']) return null;
  const value = (req.headers['authentication']).trim();
  if (!value.startsWith('Bearer')) return null;
  const items = value.split(' ');
  return items[items.length - 1];
}

/**
 * Make a new grant_token if autoprolongation is needed
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @private
 */
function autoprolongateGrantToken (req, res) {
  const claims = req.identity.user.claims;
  const config = req.identity.config;
  const exp = claims.exp * 1000;
  const ap = config.grantToken.autoprolongation;

  if (ap < (exp - now()) / 1000 / 60) return;

  const payload = Object.create(null);
  Object.keys(config.grantToken.body).forEach(function (item) {
    if (config.grantToken.body[item]) {
      payload[item] = claims[item];
    }
  });

  const token = jwt.sign(
    payload,
    config.key,
    {
      algorithm: config.alg,
      expiresIn: config.grantToken.expiresIn * 60
    }
  );

  if (token) {
    res.set('X-Grant-Token', token);
  }
}
