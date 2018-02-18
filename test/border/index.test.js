'use strict';

const test = require('tape');

const jwt = require('jsonwebtoken');

const BODY = {
  p1: 'foo',
  p2: 'bar'
};

const SECRET = 'baz';

test('"sign" method', t => {
  t.plan(1);

  const DURATION_MINUTES = 10;

  const opts = {
    algorithm: 'HS256',
    expiresIn: DURATION_MINUTES * 60
  };

  jwt.sign(BODY, SECRET, opts, (err, token) => {
    if (err) return t.end(err);

    const verifyOpts = {
      algorithms: [opts.algorithm]
    };

    jwt.verify(token, SECRET, verifyOpts, (err, claims) => {
      if (err) return t.end(err);

      const { iat, exp } = claims;
      const actualDurationMinutes = (exp - iat) / 60;

      t.equal(actualDurationMinutes, DURATION_MINUTES, 'operates on seconds');
    });
  });
});

test('supported algorithms', t => {
  const algorithms = ['HS256', 'HS384', 'HS512'];

  t.plan(algorithms.length);

  algorithms.forEach(algorithm => {
    const opts = {
      algorithm,
      expiresIn: 10 * 60
    };

    jwt.sign(BODY, SECRET, opts, (err, token) => {
      if (err) return t.end(err);

      const verifyOpts = {
        algorithms: [algorithm]
      };

      jwt.verify(token, SECRET, verifyOpts, (err, claims) => {
        if (err) return t.end(err);

        t.equal(Boolean(claims), true, `supports ${algorithm} algorithm`);
      });
    });
  });
});
