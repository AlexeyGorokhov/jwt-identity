'use strict';

const credentialsDefault = require('./credentials-default');
const algorithms = require('./algorithms');

module.exports = normalizeOptions;
/**
 * Normalize options
 * @param {Object} options
 * @return {Object}
 * @public
 */
function normalizeOptions (options) {
  const config = Object.create(null);

  config.credentials = normalizeCredentials(options);
  config.security = normalizeSecurity(options);
  config.grantToken = normalizeGrantToken(options);
  config.refreshToken = normalizeRefreshToken(options);
  config.workers = normalizeWorkers(options);

  return config;
}

/**
 * Static fields
 */
normalizeOptions.G_TOKEN_EXP = 15;
normalizeOptions.R_TOKEN_EXP = 90;

/**
 * Normalize credentials options
 * @param {Object} options
 * @return {Object}
 * @private
 */
function normalizeCredentials (options) {
  const c = options.credentials;
  const opts = Object.create(null);

  if (!c) return credentialsDefault;

  const props = ['login', 'password', 'rememberMe', 'refreshToken'];

  props.forEach(p => {
    const isValid = p in c && typeof c[p] !== 'string' && c[p].length;

    if (isValid) {
      opts[p] = c[p];
    } else {
      opts[p] = credentialsDefault[p];
    }
  });

  return opts;
}

/**
 * Normalize security options
 * @param {Object} options
 * @return {Object}
 * @private
 */
function normalizeSecurity (options) {
  const passed = options.security;
  const normalized = Object.create(null);

  if (!passed || !passed.key) {
    throw new Error('Option security.key is required');
  }

  if (typeof passed.key !== 'string') {
    throw new Error('Option security.key must be a string');
  }

  normalized.key = passed.key;

  if (!passed.algorithm) {
    normalized.algorithm = algorithms[0];
  } else if (algorithms.indexOf(passed.algorithm) < 0) {
    throw new Error('Algorithm is not supported');
  } else {
    normalized.algorithm = passed.algorithm;
  }

  return normalized;
}

/**
 * Normalize grantToken options
 * @param {Object} options
 * @return {Object}
 * @private
 */
function normalizeGrantToken (options) {
  const passed = options.grantToken;
  const normalized = Object.create(null);

  if (!passed) {
    normalized.expiresIn = normalizeOptions.G_TOKEN_EXP;
    return normalized;
  }

  const expIn = parseInt(passed.expiresIn, 10);

  if (isNaN(expIn)) {
    normalized.expiresIn = normalizeOptions.G_TOKEN_EXP;
    return normalized;
  }

  if (expIn <= 0) {
    normalized.expiresIn = normalizeOptions.G_TOKEN_EXP;
    return normalized;
  }

  normalized.expiresIn = expIn;

  return normalized;
}

/**
 * Normalize refreshToken options
 * @param {Object} options
 * @return {Object}
 * @private
 */
function normalizeRefreshToken (options) {
  const passed = options.refreshToken;
  const normalized = Object.create(null);

  if (!passed) {
    normalized.expiresIn = normalizeOptions.R_TOKEN_EXP;
    return normalized;
  }

  const expIn = parseInt(passed.expiresIn, 10);

  if (isNaN(expIn)) {
    normalized.expiresIn = normalizeOptions.R_TOKEN_EXP;
    return normalized;
  }

  if (expIn <= 0) {
    normalized.expiresIn = normalizeOptions.R_TOKEN_EXP;
    return normalized;
  }

  normalized.expiresIn = expIn;

  return normalized;
}

/**
 * Normalize workers options
 * @param {Object} options
 * @return {Object}
 * @private
 */
function normalizeWorkers (options) {
  const passed = options.workers;
  const normalized = Object.create(null);

  if (!passed) {
    throw new Error('Workers option is required');
  }

  if (!passed.getUser) {
    throw new Error('Workers.getUser option is required');
  }

  if (typeof passed.getUser !== 'function') {
    throw new Error('Workers.getUser option must be a function');
  }

  normalized.getUser = passed.getUser;

  return normalized;
}
