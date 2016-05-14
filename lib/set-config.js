'use strict';

var userCredentialsDefaults = require('./config/user-credentials.json');
var grantTokenDefaults = require('./config/grant-token.json');
var refreshTokenDefaults = require('./config/refresh-token.json');

module.exports = setConfig;

/**
 * Transform options received from the user into a normalized configuaration
 * object
 * @param {Object} options
 * @return {Object} Normalized configuration object
 */
function setConfig (options) {
  var opts = options || Object.create(null);
  var config = Object.create(null);

  config.userCredentials = setUserCredentials(opts);
  config.key = opts.key ? opts.key + '' : '';
  config.grantToken = setGrantToken(opts);
  config.refreshToken = setRefreshToken(opts);
  config.refreshTokenStorageVerifier = setRefreshTokenStorageVerifier(opts);
  config.userDataRetriever = setUserDataRetriever(opts);
  config.refreshTokenSaver = setRefreshTokenSaver(opts);
  config.refreshTokenRemover = setRefreshTokenRemover(opts);
  config.alg = 'HS256';
  config.refreshTokenOptions = {
    algorithm: config.alg,
    noTimestamp: true
  };

  return config;
}

setConfig.setUserCredentials = setUserCredentials;
setConfig.setGrantToken = setGrantToken;
setConfig.setRefreshToken = setRefreshToken;
setConfig.setRefreshTokenStorageVerifier = setRefreshTokenStorageVerifier;
setConfig.setUserDataRetriever = setUserDataRetriever;
setConfig.setRefreshTokenSaver = setRefreshTokenSaver;
setConfig.setRefreshTokenRemover = setRefreshTokenRemover;

/**
 * Set up the part of the options passed to the middleware function that
 * describes the names of user credentials the client is expected to be
 * sending in a request body
 * @param {Object} opts - Options object
 */
function setUserCredentials (opts) {
  var result = Object.create(null);

  var userCredentials = opts.userCredentials || userCredentialsDefaults;

  result.login = typeof userCredentials.login === 'string'
    ? userCredentials.login
    : userCredentialsDefaults.login;

  result.password = typeof userCredentials.password === 'string'
    ? userCredentials.password
    : userCredentialsDefaults.password;

  result.rememberMe = typeof userCredentials.rememberMe === 'string'
    ? userCredentials.rememberMe
    : userCredentialsDefaults.rememberMe;

  return result;
}

/**
 * Set up configuration for grant token handling
 * @param {Object} opts - Options object
 */
function setGrantToken (opts) {
  var result = Object.create(null);
  result.body = Object.create(null);

  var grantToken = opts.grantToken || grantTokenDefaults;
  var body = grantToken.body || grantTokenDefaults.body;

  result.body.userId = body.userId === true;
  result.body.roles = body.roles === true;
  result.body.userName = body.userName === true;
  result.body.uiLang = body.uiLang === true;

  result.expiresIn =
    parseInt(grantToken.expiresIn, 10) || grantTokenDefaults.expiresIn;

  var ap = parseInt(grantToken.autoprolongation, 10) ||
    grantTokenDefaults.autoprolongation;

  result.autoprolongation = (result.expiresIn - ap) > 0
    ? ap
    : grantTokenDefaults.autoprolongation;

  return result;
}

/**
 * Set up configuration for refresh token handling
 * @param {Object} opts - Options object
 */
function setRefreshToken (opts) {
  var result = Object.create(null);
  result.body = Object.create(null);

  var refreshToken = opts.refreshToken || refreshTokenDefaults;
  var body = refreshToken.body || refreshTokenDefaults.body;

  result.body.userId = true;
  result.body.securityStamp = body.securityStamp === true;

  result.expiresIn = parseInt(refreshToken.expiresIn, 10) ||
    refreshTokenDefaults.expiresIn;

  var ap = parseInt(refreshToken.autoprolongation, 10) ||
    refreshTokenDefaults.autoprolongation;

  result.autoprolongation = (result.expiresIn - ap) > 0
    ? ap
    : refreshTokenDefaults.autoprolongation;

  return result;
}

/**
 * Set up function to use for verifying refresh tokens against a refresh token
 * permanent store
 * @param {Object} opts - Options object
 */
function setRefreshTokenStorageVerifier (opts) {
  return typeof opts.refreshTokenStorageVerifier === 'function'
    ? opts.refreshTokenStorageVerifier
    : function (claims, cb) {
      cb(null);
    };
}

/**
 * Set up function to use for retrieving user data with user's credentials
 * @param {Object} opts - Options object
 */
function setUserDataRetriever (opts) {
  return typeof opts.userDataRetriever === 'function'
    ? opts.userDataRetriever
    : function (userName, password, cb) {
      cb(null, Object.create(null));
    };
}

/**
 * Set up the function that will be called to save a newly generated refresh
 * token to a permanent storage
 * @param {Object} opts - Options object
 */
function setRefreshTokenSaver (opts) {
  var isCorrectFunction =
    typeof opts.refreshTokenSaver === 'function' &&
    opts.refreshTokenSaver.length === 4;

  if (isCorrectFunction) {
    return opts.refreshTokenSaver;
  } else {
    return function (token, userId, expiryDate, cb) {
      cb(null);
    };
  }
}

/**
 * Set up the function that will be called to remove a refresh token from
 * a permanent storage
 * @param {Object} opts - Options object
 */
function setRefreshTokenRemover (opts) {
  var isCorrectFunction =
    typeof opts.refreshTokenRemover === 'function' &&
    opts.refreshTokenRemover.length === 2;

  if (isCorrectFunction) {
    return opts.refreshTokenRemover;
  } else {
    return function (userId, cb) {
      cb(null);
    };
  }
}
