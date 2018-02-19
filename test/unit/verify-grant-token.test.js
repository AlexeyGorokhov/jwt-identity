'use strict';

const test = require('tape');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();

const mn = 'lib/verify-grant-token';

const getSelf = ({
  verifyTokenStub = () => Promise.resolve({ userId: 'user_id' }),
  extractRealClaimsStub = () => {}
} = {}) => proxyquire('../../lib/verify-grant-token', {
  './verify-token': verifyTokenStub,
  './utils/extract-real-claims': extractRealClaimsStub
})
  .bind({ config: { security: {} } });

test(`${mn} > at least userId claim exists`, async t => {
  try {
    const selfMock = getSelf();

    const result = await selfMock();

    t.notEqual(
      result,
      null,
      'should return user object'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test(`${mn} > validation succeeds but without a userId claim`, async t => {
  try {
    const selfMock = getSelf({
      verifyTokenStub: () => Promise.resolve({})
    });

    const result = await selfMock();

    t.equal(
      result,
      null,
      'should return null'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test(`${mn} > token validation fails`, async t => {
  try {
    const selfMock = getSelf({
      verifyTokenStub: () => Promise.resolve(null)
    });

    const result = await selfMock();

    t.equal(
      result,
      null,
      'should return null'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});
