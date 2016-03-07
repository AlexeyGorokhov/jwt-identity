'use strict';

var test = require('tape');
var setConfig = require('../lib/set-config');
var userCredentialsDefaults = require('../lib/config/user-credentials.json');
var grantTokenDefaults = require('../lib/config/grant-token.json');
var refreshTokenDefaults = require('../lib/config/refresh-token.json');

test('set-config_setUserCredentials_CalledWithFalsyParam', function (t) {
  var opts = { userCredentials: null };

  var result = setConfig.setUserCredentials(opts);

  t.deepEqual(result, userCredentialsDefaults, 'ReturnsDefaults');
  t.end();
});

test('set-config_setGrantToken_CalledWithFalsyParam', function (t) {
  var opts = { grantToken: null };

  var result = setConfig.setGrantToken(opts);

  t.deepEqual(result, grantTokenDefaults, 'ReturnsDefault');
  t.end();
});

test('set-config_setRefreshToken_CalledWithFalsyParam', function (t) {
  var opts = { refreshToken: null };

  var result = setConfig.setRefreshToken(opts);

  t.deepEqual(result, refreshTokenDefaults, 'ReturnsDefault');
  t.end();
});

test('set-config_setRefreshTokenSaver_ParamIsNotAFunction', function (t) {
  var opts = { refreshTokenSaver: 'not_a_function' };

  var refreshTokenSaver = setConfig.setRefreshTokenSaver(opts);

  t.ok(typeof refreshTokenSaver === 'function', 'ReturnsFunction');
  t.end();
});

test('set-config_setRefreshTokenSaver_NotFourParams', function (t) {
  var opts = {
    refreshTokenSaver: function (a, b, c) {
      a = b + c;
    }
  };

  var refreshTokenSaver = setConfig.setRefreshTokenSaver(opts);

  t.ok(refreshTokenSaver.length === 4, 'ReturnsFunctionWithFourParams');
  t.end();
});

test('set-config setRefreshTokenRemover Param_Is_Not_Function', t => {
  const opts = { refreshTokenRemover: 'not_a_function' };

  const refreshTokenRemover = setConfig.setRefreshTokenRemover(opts);

  t.ok(typeof refreshTokenRemover === 'function', 'Returns function');
  t.end();
});

test('set-config setRefreshTokenRemover Not_two_params', t => {
  const opts = {
    refreshTokenSaver: function (a, b, c) {
      a = b + c;
    }
  };

  const refreshTokenRemover = setConfig.setRefreshTokenRemover(opts);

  t.ok(refreshTokenRemover.length === 2, 'Returns function with two params');
  t.end();
});

test('set-config setRefreshTokenRemover Not_two_params', t => {
  const opts = {
    refreshTokenSaver: function (a, b, c) {
      a = b + c;
    }
  };

  const refreshTokenRemover = setConfig.setRefreshTokenRemover(opts);

  t.ok(refreshTokenRemover.length === 2, 'Returns function with two params');
  t.end();
});
