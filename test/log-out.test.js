'use strict';

const test = require('tape');
const sinon = require('sinon');
const logOut = require('../lib/log-out');

test('log-out logOut No_user_object', t => {
  const removerSpy = sinon.spy((userId, cb) => {
    cb(null);
  });
  const identity = {
    logOut: logOut,
    config: {
      refreshTokenRemover: removerSpy
    }
  };

  identity.logOut();

  t.notOk(removerSpy.called, 'refresh_token remover is not called');
  t.end();
});

test('log-out logOut No_claims', t => {
  const removerSpy = sinon.spy((userId, cb) => {
    cb(null);
  });
  const identity = {
    logOut: logOut,
    config: {
      refreshTokenRemover: removerSpy
    },
    user: {}
  };

  identity.logOut();

  t.notOk(removerSpy.called, 'refresh_token remover is not called');
  t.end();
});

test('log-out logOut No_user_id', t => {
  const removerSpy = sinon.spy((userId, cb) => {
    cb(null);
  });
  const identity = {
    logOut: logOut,
    config: {
      refreshTokenRemover: removerSpy
    },
    user: {
      claims: {}
    }
  };

  identity.logOut();

  t.notOk(removerSpy.called, 'refresh_token remover is not called');
  t.end();
});

test('log-out logOut No_user_id', t => {
  const removerSpy = sinon.spy((userId, cb) => {
    cb(null);
  });
  const identity = {
    logOut: logOut,
    config: {
      refreshTokenRemover: removerSpy
    },
    user: {
      claims: {
        userId: 'some_value'
      }
    }
  };

  identity.logOut();

  t.ok(removerSpy.called, 'refresh_token remover is called');
  t.end();
});
