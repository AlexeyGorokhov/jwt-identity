'use strict';

const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const identity = require('../index.js');

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
    expiresIn: 1
  },
  refreshToken: {
    expiresIn: 90
  },
  workers: {
    getUser: getUser
  }
};
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(identity(identityOptions));
app.set('port', 7000);

app.get('/', function (req, res, next) {
  res.status(200).json(req.identity.user);
});

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

const server = http.createServer(app);
server.listen(7000);

function getUser (userCredentials) {
  return new Promise((resolve) => {
    resolve({
      userId: 'd43f0277-36fc-4a1d-849d-1c978ff0ed05',
      roles: 'admin, user',
      securityStamp: 'bob123',
      claims: {
        userName: 'Bob Dash',
        userStatus: 'pro'
      }
    });
  });
}
