'use strict';

const setConfig = require('./lib/set-config');
const authenticate = require('./lib/authenticate');
const logIn = require('./lib/log-in');
const logOut = require('./lib/log-out');

module.exports = function (options) {
  const proto = Object.create(null);
  proto.config = setConfig(options);
  proto.logIn = logIn;
  proto.logOut = logOut;

  return function (req, res, next) {
    req.identity = Object.create(proto);
    req.identity.request = req;
    authenticate(req, res);
    next();
  };
};
