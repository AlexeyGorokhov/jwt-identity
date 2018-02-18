'use strict';

const test = require('tape');
const proxyquire = require('proxyquire').noPreserveCache();

const THRESHOLD = require('../../../lib/utils/exp-threshold');

const mn = 'lib/utils/is-prolongation-needed';

const IAT = 1518806368199;
const DURATION = 90 * 24 * 60 * 60 * 1000;
const iatStub = IAT / 1000;
const expStub = (IAT + DURATION) / 1000;

const getSelf = dateNowStub => proxyquire('../../../lib/utils/is-prolongation-needed', {
  './date-now': dateNowStub
});

test(`${mn} > threshold is hit`, t => {
  const dateNowStub = () => Math.ceil(IAT + DURATION * (1 - THRESHOLD) + 1);
  const self = getSelf(dateNowStub);

  const result = self(iatStub, expStub);

  t.equal(result, true, 'should return true');
  t.end();
});

test(`${mn} > threshold is not hit`, t => {
  const dateNowStub = () => Math.floor(IAT + DURATION * (1 - THRESHOLD) - 1);
  const self = getSelf(dateNowStub);

  const result = self(iatStub, expStub);

  t.equal(result, false, 'should return false');
  t.end();
});
