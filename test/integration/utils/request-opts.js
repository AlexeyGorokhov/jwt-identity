'use strict';

const BASE_URL = 'http://localhost:7000';

module.exports = function requestOpts (path) {
  return {
    method: 'GET',
    uri: BASE_URL + path,
    json: true,
    resolveWithFullResponse: true,
    simple: false
  };
};
