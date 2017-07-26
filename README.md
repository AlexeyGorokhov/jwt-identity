# jwt-identity

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

JSON Web Token authentication middleware for Express.js

On the background, jwt-identity makes use of [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) package for generating and verifying tokens.

__Important Notes:__

* Jwt-identity must be mounted __after__ a request body parser so that when jwt-identity needs the content of the request body, it is parsed and available as `req.body` object.

* Jwt-identity automatically provides for refresh token sliding expiration. While a user is being logged in with the use of a valid refresh token, if the refresh token expiration period has less than 25% time remaining, a new refresh token will be issued.

* Jwt-identity enforces use of the algorithm, provided with configuration options, at token verification. For more information, refer to [Critical vulnerabilities in JSON Web Token libraries](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/).

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
  credentials: {
    login: 'user_name',
    password: 'psw',
    rememberMe: 'remember_me',
    refreshToken: 'refresh_token'
  },
  security: {
    key: 'secret',
    algorithm: 'HS256'
  },
  grantToken: {
    expiresIn: 15
  },
  refreshToken: {
    expiresIn: 90
  },
  workers: {
    getUser (userCredentials) {...}
  }
};

// Mount the middleware
app.use(bodyParser());
app.use(jwtIdentity(options));

// Use on ordinary routes
app.get('/some_path', (req, res, next) => {
  const isUserAuthenticated = req.identity.user.isAuthenticated;
  const userId = req.identity.user.id;
  // etc
});

// Route for getting a user logged in
app.post('/login', (req, res, next) => {
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
```

## Options

### credentials

Optional.

Type: `Object`

Maps string literals that client applications are expected to use as data keys when sending in user credentials in the request body.

Object properties:

* `{String} login`;
* `{String} password`;
* `{String} rememberMe` - Key for a flag indicating that the user is willing to receive a refresh token;
* `{String} refreshToken` - Key for a refresh token that the client is sending in to get logged in.

If the `credentials` option or any of the properties are omitted or resolve to a falsy value, the following defaults are used:

```javascript
{
  login: 'login',
  password: 'password',
  rememberMe: 'rememberMe',
  refreshToken: 'refreshToken'
}
```

### security

Type: `Object`

Options for creating and verifying JSON Web Tokens (both, grant and refresh).

Object properties:

* `{String} key` - Secret key to sign tokens with;
* `{String} algorithm` - Optional. Algorithm to be used for token signing. Default: `HS256`.


Currently, jwt-identity only supports JSON Web Signature algorithms:

|Algorithm parameter value| Signature algorithm
|--|--|
|HS256|HMAC using SHA-256 hash algorithm|
|HS384|HMAC using SHA-384 hash algorithm|
|HS512|HMAC using SHA-512 hash algorithm|


### grantToken

Type: `Object`

Grant token configuration.

Object properties:

* `{Integer} expiresIn` - Time of grant token validity (in minutes). Defaults to `15`.

### refreshToken

Type: `Object`

Refresh token configuration.

Object properties:

* `{Integer} expiresIn` - Time of refresh token validity (in days). Defaults to `90`.

### workers

Type: `Object`

Collection of methods that provide communication with the application user data storage.

#### `{Function} getUser (userCredentials)`

Get user data from a data storage.

The function is passed the `{Object} userCredentials` parameter that contains user data retrieved from the HTTP request as follows:

* `{String} id` - User ID;
* `{String} login` - User login;
* `{String} password` - User password.

Either `id` or `login + password` are passed depending on the source of data (refresh token or credentials provided by the user directly).

The function is supposed to return a Promise/A+ that resolves with `null` if no user has been found, or, otherwise, with an object with the following properties:

* `{String} userId`;
* `{String} roles` - A comma separated list of user roles;
* `{String} securityStamp` - Security stamp to be included in or verified against the refresh token;
* `{Object} claims` - A collection of other claims to be included in the grant token.

## API

Jwt-identity extends the `req` object with the `identity` property.

### req.identity.user

Type: `Object`

Properties:

* `{String} id` - User ID;
* `{Boolean} isAuthenticated` - `true` if the request is authenticated;
* `{String} roles` - A comma separated list of user roles;
* `{Object} claims` - A collection of other user claims derived from the grant token.

### req.identity.logIn()

Type: `Function`

The function that is supposed to be used on the log-in endpoint.

The function takes no parameters.

The function return a Promise/A+ that resolves with an object with following properties:

* `{Integer} statusCode` - HTTP response status code:
  * `200` - The user has successfully been logged in, and a grant token (and optionally a refresh token) is issued;
  * `401` - The log-in failed;
* `{String | null} grantToken` - Grant token if the log-in succeeded; otherwise `null`;
* `{String | null} refreshToken` - Refresh token if the log-in succeeded AND either the log-in was initiated by user sending in a valid refresh token that needed sliding prolongation, or the log-in was initiated by user sending in login and password with `rememberMe` flag.
