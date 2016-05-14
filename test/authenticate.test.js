'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const jwtStub = {
  verify: function (token, key) {
    if (token === 'correct_token') {
      return { someProperty: 'some_value' };
    }
    throw new Error();
  },
  sign: function (payload, key, options) {
    return 'some_token';
  }
};

function nowStub () {
  return new Date('2016-02-18T15:00:00.000Z');
}

const authenticate = proxyquire('../lib/authenticate',
  {
    'jsonwebtoken': jwtStub,
    'date-now': nowStub
  }
);

test('authenticate _ No_grant_token', function (t) {
  const reqStub = { identity: {} };
  const resStub = {};
  sinon.stub(authenticate, 'getGrantToken', function (req) {
    return null;
  });
  const jwtSpy = sinon.spy(jwtStub, 'verify');
  const autoprolongateGrantTokenStub =
    sinon.stub(authenticate, 'autoprolongateGrantToken', function (req, res) {
      return;
    });

  authenticate(reqStub, resStub);

  t.notOk(jwtSpy.called, 'No attempt to verify a token');
  t.notOk(autoprolongateGrantTokenStub.called, 'No attempt to autopolongate');
  t.notOk(reqStub.identity.user.isAuthenticated, 'User is not authenticated');
  authenticate.getGrantToken.restore();
  jwtStub.verify.restore();
  authenticate.autoprolongateGrantToken.restore();
  t.end();
});

test('authenticate _ Correct_grant_token', function (t) {
  const reqStub = {
    identity: {
      config: {
        key: 'some_value'
      }
    }
  };
  const resStub = {};
  sinon.stub(authenticate, 'getGrantToken', function (req) {
    return 'correct_token';
  });
  const autoprolongateGrantTokenStub =
    sinon.stub(authenticate, 'autoprolongateGrantToken', function (req, res) {
      return;
    });

  authenticate(reqStub, resStub);

  t.ok(autoprolongateGrantTokenStub.called, 'autopolongate is called');
  t.ok(reqStub.identity.user.isAuthenticated, 'User is authenticated');
  t.ok(reqStub.identity.user.claims, 'There are claims');
  authenticate.getGrantToken.restore();
  authenticate.autoprolongateGrantToken.restore();
  t.end();
});

test('authenticate _ Incorrect_grant_token', function (t) {
  const reqStub = {
    identity: {
      config: {
        key: 'some_value'
      }
    }
  };
  const resStub = {};
  sinon.stub(authenticate, 'getGrantToken', function (req) {
    return 'incorrect_token';
  });
  const autoprolongateGrantTokenStub =
    sinon.stub(authenticate, 'autoprolongateGrantToken', function (req, res) {
      return;
    });

  authenticate(reqStub, resStub);

  t.notOk(autoprolongateGrantTokenStub.called, 'autopolongate is not called');
  t.notOk(reqStub.identity.user.isAuthenticated, 'User is not authenticated');
  t.notOk(reqStub.identity.user.claims, 'There are no claims');
  authenticate.getGrantToken.restore();
  authenticate.autoprolongateGrantToken.restore();
  t.end();
});

test('authenticate getGrantToken No_Headers', function (t) {
  const reqStub = {};

  const result = authenticate.getGrantToken(reqStub);

  t.ok(result === null, 'returns null');
  t.end();
});

test('authenticate getGrantToken No_Auth_Header', function (t) {
  const reqStub = {
    headers: {
      some_other_header: 'some_value'
    }
  };

  const result = authenticate.getGrantToken(reqStub);

  t.ok(result === null, 'returns null');
  t.end();
});

test('authenticate getGrantToken Incorrect_Auth_Header', function (t) {
  const reqStub = {
    headers: {
      authentication: 'Not_started_with_Bearer'
    }
  };

  const result = authenticate.getGrantToken(reqStub);

  t.ok(result === null, 'returns null');
  t.end();
});

test('authenticate getGrantToken Correct_Auth_Header', function (t) {
  const reqStub = {
    headers: {
      authentication: ' Bearer   some_token  '
    }
  };

  const result = authenticate.getGrantToken(reqStub);

  t.ok(result === 'some_token', 'returns token');
  t.end();
});

test(
  'authenticate autoprolongateGrantToken Prolongation_Is_Not_Needed',
  function (t) {
    const reqStub = {
      identity: {
        user: {
          claims: {
            userId: 'some_value',
            exp: (new Date('2016-02-18T15:15:00.000Z')) / 1000
          }
        },
        config: {
          grantToken: {
            body: {
              userId: true
            },
            autoprolongation: 10
          }
        }
      }
    };
    const resStub = {
      set: function () { }
    };
    const resSpy = sinon.spy(resStub, 'set');

    authenticate.autoprolongateGrantToken(reqStub, resStub);

    t.notOk(resSpy.called, 'Header setter is not called');
    t.end();
  }
);

test(
  'authenticate autoprolongateGrantToken Prolongation_Is_Needed',
  function (t) {
    const reqStub = {
      identity: {
        user: {
          claims: {
            userId: 'some_value',
            exp: (new Date('2016-02-18T15:05:00.000Z')) / 1000
          }
        },
        config: {
          grantToken: {
            body: {
              userId: true
            },
            autoprolongation: 10
          }
        }
      }
    };
    const resStub = {
      set: function () { }
    };
    const resSpy = sinon.spy(resStub, 'set');

    authenticate.autoprolongateGrantToken(reqStub, resStub);

    t.ok(resSpy.called, 'Header setter is called');
    t.end();
  }
);
