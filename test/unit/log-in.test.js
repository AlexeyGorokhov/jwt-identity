'use strict';

const test = require('tape');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
const sinon = require('sinon');

const mn = 'lib/log-in';

const getIdentityMock = ({
  logInWithRefreshTokenStub = () => Promise.resolve({}),
  logInWithCredentialsStub = () => Promise.resolve({})
} = {}) => ({
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
  logIn: proxyquire('../../lib/log-in', {
    './login-with-refreshtoken': logInWithRefreshTokenStub,
    './login-with-credentials': logInWithCredentialsStub
  })
});

test(`${mn} > there is refresh token in request`, async t => {
  try {
    const stubs = {
      logInWithRefreshTokenStub: sinon.spy(() => Promise.resolve({})),
      logInWithCredentialsStub: sinon.spy(() => Promise.resolve({}))
    };
    const identityMock = getIdentityMock(stubs);

    await identityMock.logIn();

    t.equal(
      stubs.logInWithRefreshTokenStub.called,
      true,
      'should log in with refresh token'
    );

    t.equal(
      stubs.logInWithCredentialsStub.called,
      false,
      'should not try to log in with credentials'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test(`${mn} > there is no refresh token in request`, async t => {
  try {
    const stubs = {
      logInWithRefreshTokenStub: sinon.spy(() => Promise.resolve({})),
      logInWithCredentialsStub: sinon.spy(() => Promise.resolve({}))
    };
    const identityMock = getIdentityMock(stubs);
    identityMock.request.body.refreshToken = '';

    await identityMock.logIn();

    t.equal(
      stubs.logInWithRefreshTokenStub.called,
      false,
      'should not try to log in with refresh token'
    );

    t.equal(
      stubs.logInWithCredentialsStub.called,
      true,
      'should log in with credentials'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});
