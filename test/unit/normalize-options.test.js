'use strict';

const test = require('tape');
const credentialsDefault = require('../../lib/credentials-default');
const algorithms = require('../../lib/algorithms');

const self = require('../../lib/normalize-options');

/** FAKES **/

function getNormalOptions () {
  return {
    credentials: {
      login: 'user_name',
      password: 'psw',
      rememberMe: 'stay_logged_in',
      refreshToken: 'r_token'
    },
    security: {
      key: 'some_string',
      algorithm: 'HS256'
    },
    grantToken: {
      expiresIn: 12
    },
    refreshToken: {
      expiresIn: 13
    },
    workers: {
      getUser: function () {}
    }
  };
}

/** TESTS **/

test('normalize-options >> No credentials option', t => {
  const opts = getNormalOptions();
  delete opts.credentials;

  const result = self(opts);

  t.ok('credentials' in result, 'Credentials option is created');
  t.deepEqual(result.credentials, credentialsDefault, '"credentials" option is set to defaults');
  t.end();
});

test('normalize-options >> Missing login property in credentials option', t => {
  const opts = getNormalOptions();
  delete opts.credentials.login;

  const result = self(opts);

  t.equal(result.credentials.login, credentialsDefault.login,
    'Login property is set up to default value');
  t.end();
});

test('normalize-options >> Not a string login property in credentials option', t => {
  const opts = getNormalOptions();
  opts.credentials.login = {};

  const result = self(opts);

  t.equal(result.credentials.login, credentialsDefault.login,
    'Login property is set up to default value');
  t.end();
});

test('normalize-options >> Empty string login property in credentials option', t => {
  const opts = getNormalOptions();
  opts.credentials.login = '';

  const result = self(opts);

  t.equal(result.credentials.login, credentialsDefault.login,
    'Login property is set up to default value');
  t.end();
});

test('normalize-options >> Missing password property in credentials option', t => {
  const opts = getNormalOptions();
  delete opts.credentials.password;

  const result = self(opts);

  t.equal(result.credentials.password, credentialsDefault.password,
    'password property is set up to default value');
  t.end();
});

test('normalize-options >> Not a string password property in credentials option', t => {
  const opts = getNormalOptions();
  opts.credentials.password = {};

  const result = self(opts);

  t.equal(result.credentials.password, credentialsDefault.password,
    'password property is set up to default value');
  t.end();
});

test('normalize-options >> Empty string password property in credentials option', t => {
  const opts = getNormalOptions();
  opts.credentials.password = '';

  const result = self(opts);

  t.equal(result.credentials.password, credentialsDefault.password,
    'password property is set up to default value');
  t.end();
});

test('normalize-options >> Missing rememberMe property in credentials option', t => {
  const opts = getNormalOptions();
  delete opts.credentials.rememberMe;

  const result = self(opts);

  t.equal(result.credentials.rememberMe, credentialsDefault.rememberMe,
    'rememberMe property is set up to default value');
  t.end();
});

test('normalize-options >> Not a string rememberMe property in credentials option', t => {
  const opts = getNormalOptions();
  opts.credentials.rememberMe = {};

  const result = self(opts);

  t.equal(result.credentials.rememberMe, credentialsDefault.rememberMe,
    'rememberMe property is set up to default value');
  t.end();
});

test('normalize-options >> Empty string rememberMe property in credentials option', t => {
  const opts = getNormalOptions();
  opts.credentials.rememberMe = '';

  const result = self(opts);

  t.equal(result.credentials.rememberMe, credentialsDefault.rememberMe,
    'rememberMe property is set up to default value');
  t.end();
});

test('normalize-options >> Missing refreshToken property in credentials option', t => {
  const opts = getNormalOptions();
  delete opts.credentials.refreshToken;

  const result = self(opts);

  t.equal(result.credentials.refreshToken, credentialsDefault.refreshToken,
    'refreshToken property is set up to default value');
  t.end();
});

test('normalize-options >> Not a string refreshToken property in credentials option', t => {
  const opts = getNormalOptions();
  opts.credentials.refreshToken = {};

  const result = self(opts);

  t.equal(result.credentials.refreshToken, credentialsDefault.refreshToken,
    'refreshToken property is set up to default value');
  t.end();
});

test('normalize-options >> Empty string refreshToken property in credentials option', t => {
  const opts = getNormalOptions();
  opts.credentials.refreshToken = '';

  const result = self(opts);

  t.equal(result.credentials.refreshToken, credentialsDefault.refreshToken,
    'refreshToken property is set up to default value');
  t.end();
});

test('normalize-options >> No security options', t => {
  const opts = getNormalOptions();
  delete opts.security;
  const invocationMock = function () {
    self(opts);
  };

  t.throws(invocationMock, Error, 'Throws');
  t.end();
});

test('normalize-options >> Security.key option is missing', t => {
  const opts = getNormalOptions();
  delete opts.security.key;
  const invocationMock = function () {
    self(opts);
  };

  t.throws(invocationMock, Error, 'Throws');
  t.end();
});

test('normalize-options >> Security.key option is an empty string', t => {
  const opts = getNormalOptions();
  opts.security.key = '';
  const invocationMock = function () {
    self(opts);
  };

  t.throws(invocationMock, Error, 'Throws');
  t.end();
});

test('normalize-options >> Security.key option is not a string', t => {
  const opts = getNormalOptions();
  opts.security.key = ['not', 'a', 'string'];
  const invocationMock = function () {
    self(opts);
  };

  t.throws(invocationMock, Error, 'Throws');
  t.end();
});

test('normalize-options >> Security.atgorithm option is missing', t => {
  const opts = getNormalOptions();
  delete opts.security.algorithm;

  const result = self(opts);

  t.equal(result.security.algorithm, algorithms[0], 'Algorithm is set to default');
  t.end();
});

test('normalize-options >> Security.atgorithm option valiue is not supported', t => {
  const opts = getNormalOptions();
  opts.security.algorithm = 'not_supported_value';
  const invocationMock = function () {
    self(opts);
  };

  t.throws(invocationMock, Error, 'Throws');
  t.end();
});

test('normalize-options >> Security.atgorithm is valid', t => {
  const opts = getNormalOptions();

  const result = self(opts);

  t.equal(result.security.algorithm, opts.security.algorithm, 'Algorithm is not changed');
  t.end();
});

test('normalize-options >> No grantToken options', t => {
  const opts = getNormalOptions();
  delete opts.grantToken;

  const result = self(opts);

  t.equal(result.grantToken.expiresIn, self.G_TOKEN_EXP, 'ExpiresIn property is set to default');
  t.end();
});

test('normalize-options >> GrantToken.expiresIn option is not a number', t => {
  const opts = getNormalOptions();
  opts.grantToken.expiresIn = 'not_a_number';

  const result = self(opts);

  t.equal(result.grantToken.expiresIn, self.G_TOKEN_EXP, 'ExpiresIn property is set to default');
  t.end();
});

test('normalize-options >> GrantToken.expiresIn option is not a positive number', t => {
  const opts = getNormalOptions();
  opts.grantToken.expiresIn = -1;

  const result = self(opts);

  t.equal(result.grantToken.expiresIn, self.G_TOKEN_EXP, 'ExpiresIn property is set to default');
  t.end();
});

test('normalize-options >> GrantToken.expiresIn option is a positive number', t => {
  const opts = getNormalOptions();
  const expIn = opts.grantToken.expiresIn = 1;

  const result = self(opts);

  t.equal(result.grantToken.expiresIn, expIn, 'ExpiresIn property is not changed');
  t.end();
});

test('normalize-options >> GrantToken.expiresIn option can be parsed into a positive number', t => {
  const opts = getNormalOptions();
  opts.grantToken.expiresIn = '1';
  const expIn = 1;

  const result = self(opts);

  t.equal(result.grantToken.expiresIn, expIn, 'ExpiresIn property is parsed');
  t.end();
});

test('normalize-options >> No refreshToken options', t => {
  const opts = getNormalOptions();
  delete opts.refreshToken;

  const result = self(opts);

  t.equal(result.refreshToken.expiresIn, self.R_TOKEN_EXP, 'ExpiresIn property is set to default');
  t.end();
});

test('normalize-options >> RefreshToken.expiresIn option is not a number', t => {
  const opts = getNormalOptions();
  opts.refreshToken.expiresIn = 'not_a_number';

  const result = self(opts);

  t.equal(result.refreshToken.expiresIn, self.R_TOKEN_EXP, 'ExpiresIn property is set to default');
  t.end();
});

test('normalize-options >> RefreshToken.expiresIn option is not a positive number', t => {
  const opts = getNormalOptions();
  opts.refreshToken.expiresIn = -1;

  const result = self(opts);

  t.equal(result.refreshToken.expiresIn, self.R_TOKEN_EXP, 'ExpiresIn property is set to default');
  t.end();
});

test('normalize-options >> RefreshToken.expiresIn option is a positive number', t => {
  const opts = getNormalOptions();
  const expIn = opts.refreshToken.expiresIn = 1;

  const result = self(opts);

  t.equal(result.refreshToken.expiresIn, expIn, 'ExpiresIn property is not changed');
  t.end();
});

test('normalize-options >> RefreshToken.expiresIn option can be parsed into a positive number',
  t => {
    const opts = getNormalOptions();
    opts.refreshToken.expiresIn = '1';
    const expIn = 1;

    const result = self(opts);

    t.equal(result.refreshToken.expiresIn, expIn, 'ExpiresIn property is parsed');
    t.end();
  }
);

test('normalize-options >> No workers options', t => {
  const opts = getNormalOptions();
  delete opts.workers;
  const invocationMock = function () {
    self(opts);
  };

  t.throws(invocationMock, Error, 'Throws');
  t.end();
});

test('normalize-options >> Workers.getUser option is missing', t => {
  const opts = getNormalOptions();
  delete opts.workers.getUser;
  const invocationMock = function () {
    self(opts);
  };

  t.throws(invocationMock, Error, 'Throws');
  t.end();
});

test('normalize-options >> Workers.getUser option is not a function', t => {
  const opts = getNormalOptions();
  opts.workers.getUser = 'not_a_function';
  const invocationMock = function () {
    self(opts);
  };

  t.throws(invocationMock, Error, 'Throws');
  t.end();
});
