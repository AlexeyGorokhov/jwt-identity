'use strict';

const http = require('http');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const identity = require('../index.js');

const identityOptions = {
  key: 'secret',
  grantToken: {
    body: {
      userId: true,
      roles: true,
      userName: true,
      uiLang: true
    },
    expiresIn: 3,
    autoprolongation: 1
  },
  refreshToken: {
    body: {
      userId: true,
      securityStamp: false
    },
    expiresIn: 30,
    autoprolongation: 10
  },
  refreshTokenStorageVerifier: function (claims, cb) {
    cb(
      null,
      new Date('2016-03-25T15:00:00.000Z'),
      {
        userId: 1,
        roles: 'admin, user',
        userName: 'Alex Gorr',
        uiLang: 'ru',
        securityStamp: 'security_stamp'
      }
    );
  },
  refreshTokenSaver: function (refreshToken, userId, expDate, cb) {
    cb(null);
  },
  userDataRetriever: function (login, psw, cb) {
    cb(
      null,
      {
        userId: 1,
        roles: 'admin, user',
        userName: 'Alex Gorr',
        uiLang: 'ru',
        securityStamp: 'security_stamp'
      }
    );
  }
};
const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(identity(identityOptions));
app.set('port', 7000);

app.post('/', function (req, res, next) {
  if (req.identity.user.isAuthenticated) {
    res.status(200).json(req.identity.user.claims);
    return;
  }
  res.status(401).end();
});

app.post('/login', function (req, res, next) {
  req.identity.logIn(function (err, status, body) {
    if (err) {
      res.status(400).json(err);
      return;
    }
    res.status(status).json(body);
  });
});

app.post('/logout', function (req, res, next) {
  req.identity.logOut(function (err) {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.status(200).end();
  });
});

const server = http.createServer(app);
server.listen(7000);
