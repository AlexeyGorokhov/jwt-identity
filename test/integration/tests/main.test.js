'use strict';

const test = require('tape');
const request = require('request-promise-native');
const _ = require('lodash');

const reqOpts = require('../utils/request-opts');
const CLAIMS = require('../claims');

test('"identity.user" object', async t => {
  try {
    const opts = {
      ...reqOpts('/login'),
      method: 'POST',
      body: {
        login: 'foo',
        password: 'bar',
        rememberMe: true
      }
    };

    const res = await request(opts);

    const { grantToken } = res.body;

    const checkOpts = {
      ...reqOpts('/'),
      headers: {
        Authorization: `Bearer ${grantToken}`
      }
    };

    const expectedUserProps = [
      'id',
      'isAuthenticated',
      'roles',
      'claims'
    ];

    const checkRes = await request(checkOpts);

    const user = checkRes.body;
    const actualUserProps = Object.keys(user);
    const hasAllProps = actualUserProps.every(prop => expectedUserProps.includes(prop)) &&
      expectedUserProps.every(prop => actualUserProps.includes(prop));

    t.equal(
      checkRes.statusCode,
      200,
      'recieves 200 OK'
    );

    t.equal(
      _.isPlainObject(user),
      true,
      '"user" prop exists and it is a plain object'
    );

    t.equal(
      hasAllProps,
      true,
      '"user" object has correct set of props'
    );

    t.deepEqual(
      user.claims,
      CLAIMS,
      'should have correct "claims" collection'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test('log-in without remembering', async t => {
  try {
    const opts = {
      ...reqOpts('/login'),
      method: 'POST',
      body: {
        login: 'foo',
        password: 'bar',
        rememberMe: false
      }
    };

    const res = await request(opts);

    const { grantToken, refreshToken } = res.body;

    const checkOpts = {
      ...reqOpts('/private'),
      headers: {
        Authorization: `Bearer ${grantToken}`
      }
    };

    const checkRes = await request(checkOpts);

    t.equal(
      res.statusCode,
      200,
      'should recieve 200 OK'
    );

    t.notEqual(
      grantToken,
      null,
      'should receive grant token'
    );

    t.equal(
      refreshToken,
      null,
      'should not receive refresh token'
    );

    t.equal(
      checkRes.statusCode,
      200,
      'should get authenticated access with grant token'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test('log-in with remembering', async t => {
  try {
    const opts = {
      ...reqOpts('/login'),
      method: 'POST',
      body: {
        login: 'foo',
        password: 'bar',
        rememberMe: true
      }
    };

    const res = await request(opts);

    const { grantToken, refreshToken } = res.body;

    const checkOpts = {
      ...reqOpts('/login'),
      method: 'POST',
      body: {
        refreshToken
      }
    };

    const checkRes = await request(checkOpts);

    t.equal(
      res.statusCode,
      200,
      'should recieve 200 OK'
    );

    t.notEqual(
      grantToken,
      null,
      'should receive grant token'
    );

    t.notEqual(
      refreshToken,
      null,
      'should receive refresh token'
    );

    t.notEqual(
      checkRes.body.grantToken,
      null,
      'should get logged in with refresh token'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});

test('verify grant token', async t => {
  try {
    const opts = {
      ...reqOpts('/login'),
      method: 'POST',
      body: {
        login: 'foo',
        password: 'bar',
        rememberMe: true
      }
    };

    const res = await request(opts);

    const { grantToken } = res.body;

    const checkOpts = {
      ...reqOpts('/verify-grant-token'),
      method: 'POST',
      body: {
        grantToken
      }
    };

    const checkRes = await request(checkOpts);

    t.deepEqual(
      checkRes.body.claims,
      CLAIMS,
      'should return correct claims'
    );

    t.end();
  } catch (err) {
    t.end(err);
  }
});
