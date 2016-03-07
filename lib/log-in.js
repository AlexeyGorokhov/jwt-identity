/** @module log-in */

'use strict';

var jwt = require('jsonwebtoken');
var now = require('date-now');
var moment = require('moment');

module.exports = logIn;

logIn.decodeRefreshToken = decodeRefreshToken;
logIn.verifyRefreshTokenAgainstDb = verifyRefreshTokenAgainstDb;
logIn.getUserDataFromStorage = getUserDataFromStorage;
logIn.makeNewGrantToken = makeNewGrantToken;
logIn.makeNewRefreshToken = makeNewRefreshToken;
logIn.saveRefreshToken = saveRefreshToken;

/**
 * Log a user in
 *
 * @param {Function} cb(err, responseData) - Callback Function
 *        @param {Object} err - Error object
 *        @param {Object} responseData - Data to form the HTTP response
 */
function logIn (cb) {
  var _this = this;
  var result = {
    statusCode: 401,
    responseBody: {
      grant_token: '',
      refresh_token: ''
    }
  };

  decodeRefreshToken(_this)
  .then(function () {
    return verifyRefreshTokenAgainstDb(_this);
  })
  .then(function () {
    return getUserDataFromStorage(_this);
  })
  .then(function () {
    return makeNewGrantToken(_this, result);
  })
  .then(function () {
    return makeNewRefreshToken(_this, result);
  })
  .then(function () {
    return saveRefreshToken(_this, result);
  })
  .then(function () {
    if (result.responseBody.grant_token) {
      result.statusCode = 200;
    }
    cb(null, result.statusCode, result.responseBody);
  })
  .catch(function (err) {
    cb(err);
  });
}

function decodeRefreshToken (identity) {
  return new Promise(function (resolve, reject) {
    if (!identity.request.body.refresh_token) {
      resolve();
      return;
    }

    jwt.verify(
      identity.request.body.refresh_token,
      identity.config.key,
      function (err, claims) {
        if (!err) {
          identity.refreshTokenClaims = claims;
        }
        resolve();
      }
    );
  });
}

function verifyRefreshTokenAgainstDb (identity) {
  return new Promise(function (resolve, reject) {
    if (!identity.refreshTokenClaims) {
      resolve();
      return;
    }

    identity.config.refreshTokenStorageVerifier(
      identity.refreshTokenClaims,
      function (err, expiryDate, userData) {
        if (err) {
          reject(err);
          return;
        }
        if (expiryDate instanceof Date) {
          identity.refreshTokenExpiryDate = expiryDate;
          identity.userData = userData;
        }
        resolve();
      }
    );
  });
}

function getUserDataFromStorage (identity) {
  return new Promise(function (resolve, reject) {
    var reqBody = identity.request.body;
    var login = reqBody[identity.config.userCredentials.login];
    var password = reqBody[identity.config.userCredentials.password];

    var isOperationNeeded =
      !identity.refreshTokenExpiryDate && login && password;

    if (!isOperationNeeded) {
      resolve();
      return;
    }

    identity.config.userDataRetriever(login, password, function (err, data) {
      if (err) {
        reject(err);
        return;
      }
      identity.userData = data;
      resolve();
    });
  });
}

function makeNewGrantToken (identity, result) {
  return new Promise(function (resolve, reject) {
    if (!identity.userData) {
      resolve();
      return;
    }

    var payload = Object.create(null);
    Object.keys(identity.config.grantToken.body).forEach(function (item) {
      if (identity.config.grantToken.body[item]) {
        payload[item] = identity.userData[item];
      }
    });

    jwt.sign(
      payload,
      identity.config.key,
      {
        algorithm: identity.config.alg,
        expiresIn: identity.config.grantToken.expiresIn * 60
      },
      function (token) {
        result.responseBody.grant_token = token;
        resolve();
      }
    );
  });
}

function makeNewRefreshToken (identity, result) {
  return new Promise(function (resolve, reject) {
    var isThisNeeded = true;

    if (!result.responseBody.grant_token) isThisNeeded = false;
    if (!identity.userData) isThisNeeded = false;

    if (identity.request.body[identity.config.userCredentials.login] &&
        !identity.request.body[identity.config.userCredentials.rememberMe]) {
      isThisNeeded = false;
    }

    if (identity.refreshTokenExpiryDate &&
        (identity.config.refreshToken.autoprolongation <
        (identity.refreshTokenExpiryDate - now()) / 1000 / 60 / 60 / 24)) {
      isThisNeeded = false;
    }

    if (!isThisNeeded) {
      resolve();
      return;
    }

    var payload = Object.create(null);
    Object.keys(identity.config.refreshToken.body).forEach(function (item) {
      if (identity.config.refreshToken.body[item]) {
        payload[item] = identity.userData[item];
      }
    });

    jwt.sign(
      payload,
      identity.config.key,
      identity.refreshTokenOptions,
      function (token) {
        result.responseBody.refresh_token = token;
        resolve();
      }
    );
  });
}

function saveRefreshToken (identity, result) {
  return new Promise(function (resolve, reject) {
    if (!result.responseBody.refresh_token) {
      resolve();
      return;
    }

    var expiryDate = moment()
      .add(identity.config.refreshToken.expiresIn, 'days')
      .toDate();

    identity.config.refreshTokenSaver(
      result.responseBody.refresh_token,
      identity.userData.userId,
      expiryDate,
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}
