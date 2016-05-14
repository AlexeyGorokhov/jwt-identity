# jwt-identity

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

JSON Web Token authentication middleware for Express.js

The middleware extends the `req` object with an `identity` object that:

* contains user `claims` extracted from the `grant_token` received in the request's `Authentication` header;

* exposes the `logIn` method that is supposed to be used on a route set up for getting a user logged in;

* exposes the `logOut` method that is supposed to be used on a route set up for getting the current user logged out.

The middleware also provides for `grant_token` and `refresh_token` auto-prolongation.

__Important Note!__ This middleware does not directly interact with any storage systems. To be functional, the middleware must be provided with functions that take care of interacting with such a storage at the moment of its initialization.

__Another Important Note!__ This middleware must be mounted __after__ a request body parser so that when the middleware needs to get user credentials from the body, they are available.

## Installation

```bash
$ npm install jwt-identity --save
```

## Usage example

```javascript
const app = require('express')();
const bodyParser = require('body-parser-of-your-choice');
const jwtIdentity = require('jwt-identity');

const options = {
  userCredentials: {
    login: 'user_name',
    password: 'psw',
    rememberMe: 'remember_me'
  },
  key: 'secret',
  grantToken: {
    body: {
      userId: true,
      roles: true,
      userName: false,
      uiLang: false
    },
    expiresIn: 30,
    autoprolongation: 10
  },
  refreshToken: {
    body: {
      userId: true,
      securityStamp: true
    },
    expiresIn: 30,
    autoprolongation: 10
  },
  refreshTokenStorageVerifier: function (refreshTokenClaims, cb) {...},
  refreshTokenSaver: function (refreshToken, userId, expiryDate, cb) {...},
  refreshTokenRemover: function (userId, cb) {...},
  userDataRetriever: function (login, password, cb) {...}
};

// Mount the middleware
app.use(bodyParser());
app.use(jwtIdentity(options));

// Use on ordinary routes
app.get('/some_path', function (req, res) {
  const isUserAuthenticated = req.identity.user.isAuthenticated;
  const userId = req.identity.user.claims.userId;
  // etc
});

// Route for getting a user logged in
app.post('/login', function (req, res) {
  req.identity.logIn(function (err, status, body) {
    if (err) {
      res.status(400).json(err);
      return;
    }
    res.status(status).json(body);
  });
});

// Route for getting the current user logged out
app.post('/logout', function (req, res) {
  req.identity.logOut(function (err) {
    if (err) {
      res.status(500).json(err);
      return;
    }
    res.status(200).end();
  });
});
```

## API

### Configuration `options`

#### options.userCredentials

Type: `Object`

Maps string literals that client applications are expected to use as data keys when sending in user credentials in the request body.

```javascript
const options = {
  login: 'literal_for_login_key',
  password: 'literal_for_password_key',
  rememberMe: 'literal_for_rememberMe_key'
};
```

If any of the properties is omitted or resolves to a falsy value, the following defaults are used:

```javascript
{
  login: 'login',
  password: 'password',
  rememberMe: 'rememberMe'
}
```

#### options.key

Type: `String`

Secret key to use at both `grant_token` and `refresh_token` creation and verification.

#### options.grantToken

Type: `Object`

Sets up characteristics of grant tokens that are used to authenticate user requests.

##### options.grantToken.body

Type: `Object`

Sets up claims that are included in the grant token body.

###### options.grantToken.body.userId

Type: `Boolean`

If `true` (default), the user ID claim is included in the `grant_token` body and will be accessible through `req.identity.user.claims.userId`.

###### options.grantToken.body.roles

Type: `Boolean`

If `true` (default), the user roles claim is included in the `grant_token` body and will be accessible through `req.identity.user.claims.roles`.

###### options.grantToken.body.userName

Type: `Boolean`

If `true`, the user name claim is included in the `grant_token` body and will be accessible through `req.identity.user.claims.userName`. Defaults to `false`.

###### options.grantToken.body.uiLang

Type: `Boolean`

If `true`, the user's preferred UI language claim is included in the `grant_token` body and will be accessible through `req.identity.user.claims.uiLangs`. Defaults to `false`.

##### options.grantToken.expiresIn

Type: `Number`

Sets up a timespan (in minutes) during which a `grant_token` is valid after it is issued. Defaults to `30`.

##### options.grantToken.autoprolongation

Type: `Number`

Sets up a timespan (in minutes) for `grant_token` automatic re-issue. This is to allow a client to wire user's credentials less often. The value defaults to `0` (which means the auto-prolongation mechanism is not active) if any of the following is true:

* the property is omitted;
* the value cannot be parsed to a number;
* the value is `0` or a negative number;
* the value is equal to or exceeds the `options.grantToken.expiresIn` value.

#### options.refreshToken

Type: `Object`

Sets up characteristics of `refresh_token`s that are used for user authentication and issuing `grant_token`s without wiring user's credentials.

##### options.refreshToken.body

Type: `Object`

Sets up claims that are included in the `refresh_token` body and will be passed as a parameter to the `options.refreshTokenStorageVerifier` function.

###### options.refreshToken.body.userId

Type: `Boolean`

The user ID claim. Always is `true` no matter what (even if omitted in the `options` object).

###### options.refreshToken.body.securityStamp

Type: `Boolean`

If `true` (default), the user security stamp claim is included in the `refresh_token` body.

##### options.refreshToken.expiresIn

Type: `Number`

Sets up a timespan (in days) during which a `refresh_token` is valid after it is issued. Defaults to `30`.

##### options.refreshToken.autoprolongation

Type: `Number`

Sets up a timespan (in days) for `refresh_token` automatic re-issue. The value defaults to `0` (which means the auto-prolongation mechanism is not active) if any of the following is true:

* the property is omitted;
* the value cannot be parsed to a number;
* the value is `0` or a negative number;
* the value is equal to or exceeds the `options.refreshToken.expiresIn` value.

#### options.refreshTokenStorageVerifier

Type: `Function`

Optional. A function that verifies `refresh_token` claims against a permanent storage (database etc). If omitted, the `refresh_token` mechanism will not be active.

The function is passed the following parameters:

* `{Object} refreshTokenClaims` - claims collection derived from the `refresh_token` provided by the client;
* `{Function} cb(err, expiryDate, userData)` - Callback function that must be provided with the following parameters:

  * `{Error} err` - an `Error` object if any error condition occurred while communicating to the permanent storage of refresh tokens;
  * `{Date} expiryDate` - a `Date` object with the value of the refresh token expiry date and time or a falsy value if any of the following is true:

    * there is no refresh token in the storage associated with the claims derived from the refresh token provided by the client;
    * the refresh token is expired;

  * `{Object} userData` - user data as described below:

    * `{String} userId` - user ID
    * `{String} roles` - a comma separated list of user's roles
    * `{String} userName` - user's name
    * `{String} uiLang` - code of the user's preferred UI language
    * `{string} securityStamp` - current security stamp as provided by the user storage. Optional - it is required only if `options.refreshToken.body.securityStamp` is set to `true`.

#### options.refreshTokenSaver

Type: `Function`

Optional. A function that saves the newly generated refresh token into a permanent storage (database etc). If omitted, the refresh token will not be saved.

The function is passed the following parameters:

* `{String} refreshToken` - the newly generated `refresh_token`
* `{String} userId` - user ID
* `{Date} expiryDate` - the newly generated `refresh_token` expiry date
* `{Function} cb(err)` - callback function

#### options.refreshTokenRemover

Type: `Function`

Optional. A function that removes the record about the refresh token from a permanent storage (database etc) when the user is logging out. If omitted, the refresh token will not be removed.

The function is passed the following parameters:

* `{String} userId` - user ID
* `{Function} cb(err)` - callback function

#### options.userDataRetriever

Type: `Function`

A function that communicates to the user storage (database etc) to retrieve user data.

The function is passed the following parameters:

* `{String} login` - user's login
* `{String} password` - user's password
* `{Function} cb(err, userData)` - callback function that must be called with the following parameters:

  * `{Error} err` - an `Error` object if any error condition occurred while communicating to the user storage;
  * `{Object} userData` - user data as described below:

    * `{String} userId` - the user's ID
    * `{String} roles` - a comma separated list of user's roles
    * `{String} userName` - the user's name
    * `{String} uiLang` - code of the user's preferred UI language
    * `{string} securityStamp` - the current security stamp as provided by the user storage.

### User claims

If a request is successfully authenticated, user's claims retrieved from the request's grant token are exposed through the `req.identity.user.claims` object. The following claims are available depending on if the presence of each of them in grant tokens is configured to `true`:

* `{String} userId` - the current authenticated user's ID,
* `{Array<String>} roles` - the current authenticated user's roles,
* `{String} userName` - the current authenticated user's name.

### Grant token auto-prolongation

An ordinary request passing through the authentication procedure is checked if the provided grant token needs to be auto-prolonged. If so, the HTTP response will be added with the `X-Grant-Token` header containing a fresh grant token that the client application should use with future requests.

### Logging a user in

The `req.identity.logIn(cb)` function is supposed to be used on a route responsible for logging users in.

This functions goes through the following steps:

* Checks the request for the presence of a refresh token, decodes it, and calls the provided function `options.refreshTokenStorageVerifier` to verify the refresh token against a permanent storage.

* If the preceding step fails, it checks for user's login and password, calls the provided function `options.userDataRetriever` to verify the user credentials, generates a new grant token, and if the request has a `rememberMe` field, generates a new refresh token and calls the provided function `options.refreshTokenSaver` to save the new refresh token to a permanent storage.

* If both of the preceding steps fail, the log in is considered failed.

The callback function `cb(err, statusCode, responseBody)` is passed the following parameters:

* `{Error} err` - an `Error` object if any error condition has occurred during the operation;
* `{Number} statusCode` - an HTTP status code of the response to be send back to the client. Possible values:
  * `200` - The user has successfully been logged in and a grant token has been generated,
  * `401` - The log-in has failed (but not because of any error condition);
* `{Object} responseBody` - JSON object to be sent to the client as payload. Includes `grant_token` and (optionally) `refresh_token` properties.

Example:

```javascript
{
  statusCode: 200,
  responseBody: {
    grant_token: 'aaa.bbb.ccc',
    refresh_token: 'ddd.eee.fff'
  }
}
```

### Logging a user out

The `req.identity.logOut(cb)` function is supposed to be used on a route responsible for logging users out. It calls the provided function `options.refreshTokenRemover` to remove the refresh token from a permanent storage.

The callback function `cb(err)` is passed the following parameters:

* `{Error} err` - an `Error` object if any error condition has occurred during the operation.
