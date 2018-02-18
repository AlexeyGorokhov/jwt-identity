'use strict';

const test = require('tape');

const self = require('../../../lib/utils/is-remembering-needed');

const mn = 'lib/utils/is-remembering-needed';

test(`${mn} > given boolean true`, t => {
  const result = self(true);

  t.equal(result, true, 'should return true');
  t.end();
});

test(`${mn} > given a truthy value but not string "false"`, t => {
  const result = self({});

  t.equal(result, true, 'should return true');
  t.end();
});

test(`${mn} > given string "false"`, t => {
  const result = self('false');

  t.equal(result, false, 'should return false');
  t.end();
});

test(`${mn} > given boolean false`, t => {
  const result = self(false);

  t.equal(result, false, 'should return false');
  t.end();
});

test(`${mn} > given a falsey value`, t => {
  const result = self(0);

  t.equal(result, false, 'should return false');
  t.end();
});
