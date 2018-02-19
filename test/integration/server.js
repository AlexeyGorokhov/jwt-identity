'use strict';

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const identity = require('./index.js');
const CLAIMS = require('./claims');

const identityOptions = {
  credentials: {
    login: 'login',
    password: 'password',
    rememberMe: 'rememberMe',
    refreshToken: 'refreshToken'
  },
  security: {
    key: 'secret',
    algorithm: 'HS256'
  },
  grantToken: {
    expiresIn: 10
  },
  refreshToken: {
    expiresIn: 90
  },
  workers: {
    getUser: getUser
  }
};
const app = express();

app.use(bodyParser.json());
app.use(identity(identityOptions));
app.set('port', 7000);

/**
 * Return the "identity.user" object attached to Request object
 */
app.get('/', function (req, res, next) {
  res.status(200).json(req.identity.user);
});

/**
 * Log in user
 */
app.post('/login', function (req, res, next) {
  req.identity.logIn()
    .then(result => {
      if (result.statusCode === 200) {
        res.status(result.statusCode).json({
          grantToken: result.grantToken,
          refreshToken: result.refreshToken
        });
      } else {
        res.status(result.statusCode).end();
      }
    })
    .catch(err => next(err));
});

/**
 * Endpoint with authentication
 */
app.get('/private', function (req, res) {
  if (req.identity.user.isAuthenticated) {
    return res.status(200).end();
  } else {
    return res.status(401).end();
  }
});

app.post('/verify-grant-token', async function (req, res) {
  const user = await req.identity.verifyGrantToken(req.body.grantToken);
  res.status(200).json(user);
});

// Start server
const server = http.createServer(app);
server.listen(7000);

/**
 * Helper returning user object
 */
function getUser (userCredentials) {
  return Promise.resolve({
    userId: 'd43f0277-36fc-4a1d-849d-1c978ff0ed05',
    roles: 'admin,user',
    securityStamp: 'bob123',
    claims: CLAIMS
  });
}
