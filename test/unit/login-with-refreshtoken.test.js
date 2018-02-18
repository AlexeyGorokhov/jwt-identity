'use strict';

const test = require('tape');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
const sinon = require('sinon');

const mn = 'lib/login-with-refreshtoken';

const getGetUserStub = (securityStampStub = '') => () => Promise.resolve({
  securityStamp: securityStampStub
});

const getConfigStub = (
  securityStampStub = '',
  getUserStub = getGetUserStub(securityStampStub)
) => ({
  security: {},
  workers: {
    getUser: getUserStub
  }
});

const getSelf = ({
  securityStampStub = '',
  grantTokenStub = '',
  refreshTokenStub = '',
  verifyTokenStub = () => Promise.resolve({ securityStamp: securityStampStub }),
  createGrantTokenStub = () => Promise.resolve(grantTokenStub),
  createRefreshTokenStub = () => Promise.resolve(refreshTokenStub),
  isProlongationNeededStub = () => true
} = {}) => proxyquire('../../lib/login-with-refreshtoken', {
  './verify-token': verifyTokenStub,
  './create-token': {
    grant: createGrantTokenStub,
    refresh: createRefreshTokenStub
  },
  './utils/is-prolongation-needed': isProlongationNeededStub
});

test(`${mn} > normal scenario with retrieving user and refresh token prolongation`, async t => {
  try {
    const SECURITY_STAMP = Symbol('');
    const GRANT_TOKEN = Symbol('');
    const REFRESH_TOKEN = Symbol('');
    const stubs = {
      securityStampStub: SECURITY_STAMP,
      createGrantTokenStub: sinon.spy(() => Promise.resolve(GRANT_TOKEN)),
      createRefreshTokenStub: sinon.spy(() => Promise.resolve(REFRESH_TOKEN)),
      isProlongationNeededStub: () => true
    };
    const getUserStub = sinon.spy(getGetUserStub(SECURITY_STAMP));
    const tokenStub = Symbol('');
    const configStub = getConfigStub(SECURITY_STAMP, getUserStub);
    const selfMock = getSelf(stubs);
    const expectedReturnValue = {
      statusCode: 200,
      grantToken: GRANT_TOKEN,
      refreshToken: REFRESH_TOKEN
    };

    const actualReturnValue = await selfMock(tokenStub, configStub);

    t.deepEqual(
      actualReturnValue,
      expectedReturnValue,
      'should return object with status 200 and both tokens'
    );

    t.equal(
      getUserStub.called,
      true,
      'should retrieve user'
    );

    t.equal(
      stubs.createGrantTokenStub.called,
      true,
      'should create grant token'
    );

    t.equal(
      stubs.createRefreshTokenStub.called,
      true,
      'should create refresh token'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test(`${mn} > user object is passed`, async t => {
  try {
    const SECURITY_STAMP = Symbol('');
    const stubs = {
      securityStampStub: SECURITY_STAMP
    };
    const getUserStub = sinon.spy();
    const tokenStub = Symbol('');
    const configStub = getConfigStub(SECURITY_STAMP, getUserStub);
    const selfMock = getSelf(stubs);
    const userStub = { securityStamp: SECURITY_STAMP };

    await selfMock(tokenStub, configStub, userStub);

    t.equal(
      getUserStub.called,
      false,
      'should not try to retrieve user'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test(`${mn} > refresh token prolongation is not needed`, async t => {
  try {
    const SECURITY_STAMP = Symbol('');
    const GRANT_TOKEN = Symbol('');
    const stubs = {
      securityStampStub: SECURITY_STAMP,
      grantTokenStub: GRANT_TOKEN,
      createRefreshTokenStub: sinon.spy(),
      isProlongationNeededStub: () => false
    };
    const tokenStub = Symbol('');
    const configStub = getConfigStub(SECURITY_STAMP);
    const selfMock = getSelf(stubs);
    const expectedReturnValue = {
      statusCode: 200,
      grantToken: GRANT_TOKEN,
      refreshToken: null
    };

    const actualReturnValue = await selfMock(tokenStub, configStub);

    t.deepEqual(
      actualReturnValue,
      expectedReturnValue,
      'should return object with status 200 and only grant token'
    );

    t.equal(
      stubs.createRefreshTokenStub.called,
      false,
      'should not create refresh token'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});
