'use strict';

const normalizeOptions = require('./lib/normalize-options');
const logIn = require('./lib/log-in');
const authenticate = require('./lib/authenticate');

module.exports = function (options) {
  const proto = Object.create(null);
  proto.config = normalizeOptions(options);
  proto.logIn = logIn;

  return function (req, res, next) {
    const identity = Object.create(proto);
    identity.request = req;

    req.identity = identity;
    authenticate(req)
      .then(() => next())
      .catch(err => next(err));
  };
};
