'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const NOW_VALUE = new Date('2016-02-18T15:00:00.000Z');
const RT_EXP_DATE_FAR = new Date('2016-03-18T15:00:00.000Z');
const RT_EXP_DATE_CLOSE = new Date('2016-02-20T15:00:00.000Z');

var jwtStub = {
  verify: function (token, key, cb) {
    cb(null, 'some_faked_claims');
  },
  sign: function (payload, key, opts, cb) {
    cb('some_grant_token');
  }
};

function nowStub () {
  return NOW_VALUE;
}

var logIn = proxyquire('../lib/log-in',
  {
    'jsonwebtoken': jwtStub,
    'date-now': nowStub
  }
);

test('log-in_decodeRefreshToken_NoRefreshtokenInRequest', function (t) {
  var identityMock = {
    request: {
      body: {}
    }
  };
  var resultStub = {};

  logIn.decodeRefreshToken(identityMock, resultStub)
  .then(function () {
    t.notOk(identityMock.refreshTokenClaims, 'NoRefreshTokenClaimsRetrieved');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in_decodeRefreshToken_ThereIsRefreshToken', function (t) {
  var identityMock = {
    request: {
      body: {
        refresh_token: 'some_refresh_token'
      }
    },
    config: {
      key: 'some_key'
    }
  };
  var resultStub = {};

  logIn.decodeRefreshToken(identityMock, resultStub)
  .then(function () {
    t.ok(identityMock.refreshTokenClaims, 'RefreshTokenClaimsRetrieved');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in verifyRefreshTokenAgainstDb No_RefreshToken_Claims', function (t) {
  var refreshTokenStorageVerifierSpy = sinon.spy(function (claims, cb) {
    cb();
  });
  var identityStub = {
    refreshTokenClaims: null,
    config: {
      refreshTokenStorageVerifier: refreshTokenStorageVerifierSpy
    }
  };

  logIn.verifyRefreshTokenAgainstDb(identityStub)
  .then(function () {
    t.notOk(refreshTokenStorageVerifierSpy.called,
      'RefreshTokenStorageVerifier not called');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test(
  'log-in verifyRefreshTokenAgainstDb There_are_RefreshToken_claims',
  function (t) {
    var identityMock = {
      refreshTokenClaims: 'truthy_value',
      config: {
        refreshTokenStorageVerifier: function (claims, cb) {
          cb(null, new Date(), 'some_user_data');
        }
      }
    };

    logIn.verifyRefreshTokenAgainstDb(identityMock)
    .then(function () {
      t.ok(identityMock.userData, 'refreshTokenStorageVerifier returns data');
      t.end();
    })
    .catch(function (err) {
      t.end(err);
    });
  }
);

test(
  'log-in_verifyRefreshTokenAgainstDb_VerifierFails',
  function (t) {
    var identityMock = {
      refreshTokenClaims: 'truthy_value',
      config: {
        refreshTokenStorageVerifier: function (claims, cb) {
          cb('not_null_err');
        }
      }
    };

    logIn.verifyRefreshTokenAgainstDb(identityMock)
    .then(function () {
      t.end(new Error(''));
    })
    .catch(function () {
      t.ok(true, 'VerifierFails');
      t.end();
    });
  }
);

test(
  'log-in getUserDataFromStorage There_is_RefreshToken_ExpiryDate',
  function (t) {
    var userDataRetrieverSpy = sinon.spy(function (login, password, cb) {
      cb(null);
    });
    var identityStub = {
      refreshTokenExpiryDate: 'some_truthy_value',
      config: {
        userCredentials: {
          login: 'login',
          password: 'password'
        },
        userDataRetriever: userDataRetrieverSpy
      },
      request: {
        body: {
          login: 'login',
          password: 'password'
        }
      }
    };

    logIn.getUserDataFromStorage(identityStub)
    .then(function () {
      t.notOk(userDataRetrieverSpy.called, 'userDataRetriever is not called');
      t.end();
    })
    .catch(function (err) {
      t.end(err);
    });
  }
);

test(
  'log-in getUserDataFromStorage No_RefreshTokenExpiryDate_or_credentials',
  function (t) {
    var userDataRetrieverSpy = sinon.spy(function (login, password, cb) {
      cb(null);
    });
    var identityStub = {
      refreshTokenExpiryDate: null,
      config: {
        userCredentials: {
          login: 'login',
          password: 'password'
        },
        userDataRetriever: userDataRetrieverSpy
      },
      request: {
        body: {
          login: null,
          password: null
        }
      }
    };

    logIn.getUserDataFromStorage(identityStub)
    .then(function () {
      t.notOk(userDataRetrieverSpy.called, 'userDataRetriever is not called');
      t.end();
    })
    .catch(function (err) {
      t.end(err);
    });
  }
);

test(
  'log-in getUserDataFromStorage No_RefreshTokenExpiryDate_but_credentials',
  function (t) {
    var userDataRetrieverSpy = sinon.spy(function (login, password, cb) {
      cb(null);
    });
    var identityStub = {
      refreshTokenExpiryDate: null,
      config: {
        userCredentials: {
          login: 'login',
          password: 'password'
        },
        userDataRetriever: userDataRetrieverSpy
      },
      request: {
        body: {
          login: 'some_value',
          password: 'some_value'
        }
      }
    };

    logIn.getUserDataFromStorage(identityStub)
    .then(function () {
      t.ok(userDataRetrieverSpy.called, 'userDataRetriever is called');
      t.end();
    })
    .catch(function (err) {
      t.end(err);
    });
  }
);

test('log-in_makeNewGrantToken_NoUserData', function (t) {
  var resultMock = {
    responseBody: {}
  };
  var identityStub = {
    userData: null
  };

  logIn.makeNewGrantToken(identityStub, resultMock)
  .then(function () {
    t.notOk(resultMock.responseBody.grant_token, 'NoGrantTokenGenerated');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in_makeNewGrantToken_ThereIsUserData', function (t) {
  var resultMock = {
    responseBody: {}
  };
  var identityStub = {
    config: {
      grantToken: {
        body: {
          someProperty: true
        },
        expiresIn: 10
      },
      key: 'some_value',
      alg: 'some_value'
    },
    userData: {
      someProperty: 'some_data'
    }
  };

  logIn.makeNewGrantToken(identityStub, resultMock)
  .then(function () {
    t.ok(resultMock.responseBody.grant_token, 'GrantTokenHasBeenGenerated');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in_makeNewRefreshToken_NoGrantToken', function (t) {
  var resultFake = {
    responseBody: {
      grant_token: null,
      refresh_token: null
    }
  };
  var identityStub = {
    config: {
      userCredentials: {
        rememberMe: 'remember_me'
      },
      refreshToken: {
        autoprolongation: 10
      },
      key: 'some_value',
      refreshTokenOptions: {}
    },
    userData: {
      someProperty: 'some_data'
    },
    request: {
      body: {
        remember_me: true
      }
    },
    refreshTokenExpiryDate: new Date()
  };

  logIn.makeNewRefreshToken(identityStub, resultFake)
  .then(function () {
    t.notOk(resultFake.responseBody.refresh_token, 'NoRefreshTokenGenerated');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in_makeNewRefreshToken_NoUserData', function (t) {
  var resultFake = {
    responseBody: {
      grant_token: 'some_value',
      refresh_token: null
    }
  };
  var identityStub = {
    config: {
      userCredentials: {
        rememberMe: 'remember_me'
      },
      refreshToken: {
        autoprolongation: 10
      },
      key: 'some_value',
      refreshTokenOptions: {}
    },
    userData: null,
    request: {
      body: {
        remember_me: true
      }
    },
    refreshTokenExpiryDate: new Date()
  };

  logIn.makeNewRefreshToken(identityStub, resultFake)
  .then(function () {
    t.notOk(resultFake.responseBody.refresh_token, 'NoRefreshTokenGenerated');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in_makeNewRefreshToken_FalsyRememberMe', function (t) {
  var resultFake = {
    responseBody: {
      grant_token: 'some_value',
      refresh_token: null
    }
  };
  var identityStub = {
    config: {
      userCredentials: {
        login: 'login',
        rememberMe: 'remember_me'
      },
      refreshToken: {
        autoprolongation: 10
      },
      key: 'some_value',
      refreshTokenOptions: {}
    },
    userData: {
      someProperty: 'some_data'
    },
    request: {
      body: {
        login: 'some_value',
        remember_me: false
      }
    },
    refreshTokenExpiryDate: new Date()
  };

  logIn.makeNewRefreshToken(identityStub, resultFake)
  .then(function () {
    t.notOk(resultFake.responseBody.refresh_token, 'NoRefreshTokenGenerated');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in_makeNewRefreshToken_NoRefreshTokenExpiryDate', function (t) {
  var resultFake = {
    responseBody: {
      grant_token: 'some_value',
      refresh_token: null
    }
  };
  var identityStub = {
    config: {
      userCredentials: {
        rememberMe: 'remember_me'
      },
      refreshToken: {
        body: {
          someProperty: 'some_value'
        },
        autoprolongation: 10
      },
      key: 'some_value',
      refreshTokenOptions: {}
    },
    userData: {
      someProperty: 'some_data'
    },
    request: {
      body: {
        remember_me: true
      }
    },
    refreshTokenExpiryDate: null
  };

  logIn.makeNewRefreshToken(identityStub, resultFake)
  .then(function () {
    t.ok(resultFake.responseBody.refresh_token, 'RefreshTokenGenerated');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in_makeNewRefreshToken_FarFromNowRefTokenExpiryDate', function (t) {
  var resultFake = {
    responseBody: {
      grant_token: 'some_value',
      refresh_token: null
    }
  };
  var identityStub = {
    config: {
      userCredentials: {
        rememberMe: 'remember_me'
      },
      refreshToken: {
        body: {
          someProperty: 'some_value'
        },
        autoprolongation: 10
      },
      key: 'some_value',
      refreshTokenOptions: {}
    },
    userData: {
      someProperty: 'some_data'
    },
    request: {
      body: {
        remember_me: true
      }
    },
    refreshTokenExpiryDate: RT_EXP_DATE_FAR
  };

  logIn.makeNewRefreshToken(identityStub, resultFake)
  .then(function () {
    t.notOk(resultFake.responseBody.refresh_token, 'NoRefreshTokenGenerated');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in makeNewRefreshToken Close_RefToken_ExpiryDate', function (t) {
  var resultFake = {
    responseBody: {
      grant_token: 'some_value',
      refresh_token: null
    }
  };
  var identityStub = {
    config: {
      userCredentials: {
        login: 'login',
        rememberMe: 'remember_me'
      },
      refreshToken: {
        body: {
          someProperty: 'some_value'
        },
        autoprolongation: 10
      },
      key: 'some_value',
      refreshTokenOptions: {}
    },
    userData: {
      someProperty: 'some_data'
    },
    request: {
      body: {
      }
    },
    refreshTokenExpiryDate: RT_EXP_DATE_CLOSE
  };

  logIn.makeNewRefreshToken(identityStub, resultFake)
  .then(function () {
    t.ok(resultFake.responseBody.refresh_token, 'RefreshTokenGenerated');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in saveRefreshToken No_RefreshToken', function (t) {
  var refreshTokenSaverSpy =
    sinon.spy(function (token, userId, expiryDate, cb) {
      cb(null);
    });
  var identityStub = {
    config: {
      refreshTokenSaver: refreshTokenSaverSpy
    }
  };
  var resultStub = {
    responseBody: {
      refresh_token: null
    }
  };

  logIn.saveRefreshToken(identityStub, resultStub)
  .then(function () {
    t.notOk(refreshTokenSaverSpy.called, 'refreshTokenSaver is not called');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});

test('log-in saveRefreshToken Actionable_params_provided', function (t) {
  var refreshTokenSaverSpy =
    sinon.spy(function (token, userId, expiryDate, cb) {
      cb(null);
    });
  var identityStub = {
    config: {
      refreshTokenSaver: refreshTokenSaverSpy,
      refreshToken: { expiresIn: 30 }
    },
    userData: {
      userId: 'some_value'
    }
  };
  var resultStub = {
    responseBody: {
      refresh_token: 'some_value'
    }
  };

  logIn.saveRefreshToken(identityStub, resultStub)
  .then(function () {
    t.ok(refreshTokenSaverSpy.called, 'refreshTokenSaver is called');
    t.end();
  })
  .catch(function (err) {
    t.end(err);
  });
});
