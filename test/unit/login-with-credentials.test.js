'use strict';

const test = require('tape');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
const sinon = require('sinon');

const mn = 'lib/login-with-credentials';

const getSelf = ({
  grantTokenStub = '',
  refreshTokenStub = '',
  createGrantTokenStub = () => Promise.resolve(grantTokenStub),
  createRefreshTokenStub = () => Promise.resolve(refreshTokenStub),
  isRememberingNeededStub = () => true
} = {}) => proxyquire('../../lib/login-with-credentials', {
  './create-token': {
    grant: createGrantTokenStub,
    refresh: createRefreshTokenStub
  },
  './utils/is-remembering-needed': isRememberingNeededStub
});

const credentialsStub = {};

const createConfigStub = (isUserFound = true) => ({
  workers: {
    getUser: () => Promise.resolve(isUserFound ? {} : null)
  }
});

test(`${mn} > normal scenario with retrieving user and creating refresh token`, async t => {
  try {
    const GRANT_TOKEN = Symbol('');
    const REFRESH_TOKEN = Symbol('');
    const stubs = {
      grantTokenStub: GRANT_TOKEN,
      createRefreshTokenStub: sinon.spy(() => Promise.resolve(REFRESH_TOKEN)),
      isRememberingNeededStub: () => true
    };
    const selfMock = getSelf(stubs);
    const expectedReturnValue = {
      statusCode: 200,
      grantToken: GRANT_TOKEN,
      refreshToken: REFRESH_TOKEN
    };

    const actualReturnValue = await selfMock(credentialsStub, createConfigStub(true));

    t.deepEqual(
      actualReturnValue,
      expectedReturnValue,
      'should return status 200 with both tokens'
    );

    t.equal(
      stubs.createRefreshTokenStub.called,
      true,
      'should invoke refresh token creator'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test(`${mn} > normal scenario without creating refresh token`, async t => {
  try {
    const GRANT_TOKEN = Symbol('');
    const stubs = {
      grantTokenStub: GRANT_TOKEN,
      createRefreshTokenStub: sinon.spy(),
      isRememberingNeededStub: () => false
    };
    const selfMock = getSelf(stubs);
    const expectedReturnValue = {
      statusCode: 200,
      grantToken: GRANT_TOKEN,
      refreshToken: null
    };

    const actualReturnValue = await selfMock(credentialsStub, createConfigStub(true));

    t.deepEqual(
      actualReturnValue,
      expectedReturnValue,
      'should return status 200 with only refresh token'
    );

    t.equal(
      stubs.createRefreshTokenStub.called,
      false,
      'should not invoke refresh token creator'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test(`${mn} > user is not found`, async t => {
  try {
    const stubs = {
      isRememberingNeededStub: () => true
    };
    const selfMock = getSelf(stubs);
    const expectedReturnValue = {
      statusCode: 401,
      grantToken: null,
      refreshToken: null
    };

    const actualReturnValue = await selfMock(credentialsStub, createConfigStub(false));

    t.deepEqual(
      actualReturnValue,
      expectedReturnValue,
      'should return status 401 without tokens'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test(`${mn} > received user object`, async t => {
  try {
    const selfMock = getSelf();
    const configStub = {
      workers: {
        getUser: sinon.spy()
      }
    };
    const userStub = {};

    await selfMock(credentialsStub, configStub, userStub);

    t.equal(
      configStub.workers.getUser.called,
      false,
      'should not invoke user retriever'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});
