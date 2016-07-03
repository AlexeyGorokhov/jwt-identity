'use strict';

const test = require('tape');
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

/** Fakes & Helpers **/

function getSpyFunction () {
  return function () {
    return new Promise((resolve) => {
      resolve();
    });
  };
}

const logInWithRefreshTokenSpy = sinon.spy(getSpyFunction());
const logInWithCredentialsSpy = sinon.spy(getSpyFunction());

function getSelfMock () {
  return proxyquire('../lib/log-in', {
    './login-with-refreshtoken': logInWithRefreshTokenSpy,
    './login-with-credentials': logInWithCredentialsSpy
  });
}

function resetSpies () {
  logInWithRefreshTokenSpy.reset();
  logInWithCredentialsSpy.reset();
}

function getIdentityStub () {
  return {
    request: {
      body: {
        refreshToken: 'some_string'
      }
    },
    config: {
      credentials: {
        refreshToken: 'refreshToken',
        login: 'login',
        password: 'password',
        rememberMe: 'rememberMe'
      }
    },
    logIn: getSelfMock()
  };
}

/** Tests **/

test('log-in >> There is a refresh token in request', t => {
  const identityStub = getIdentityStub();

  identityStub.logIn()
  .then(() => {
    t.ok(logInWithRefreshTokenSpy.called, 'Logging in with refresh token is called');
    resetSpies();
    t.end();
  })
  .catch(err => t.end(err));
});

test('log-in >> There is no refresh token in request', t => {
  const identityStub = getIdentityStub();
  identityStub.request.body.refreshToken = '';

  identityStub.logIn()
  .then(() => {
    t.ok(logInWithCredentialsSpy.called, 'Logging in with credentials is called');
    resetSpies();
    t.end();
  })
  .catch(err => t.end(err));
});
