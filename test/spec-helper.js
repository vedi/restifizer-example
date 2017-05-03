/**
 * Created by vedi on 08/07/16.
 */

'use strict';

const _ = require('lodash');
const Bb = require('bluebird');
const request = require('request-promise');

const User = require('../app/models/user.server.model');
const AccessToken = require('../app/models/access-token.server.model');
const RefreshToken = require('../app/models/refresh-token.server.model');
const testConfig = require('./config');

const FIXTURE_TYPES = {
  USER: 'user.data',
};

const clientAuth = {
  client_id: testConfig.client.clientId,
  client_secret: testConfig.client.clientSecret,
};

const specHelper = {

  FIXTURE_TYPES,

  get(uri, options) {
    return this.request('GET', uri, undefined, options);
  },
  post(uri, body, options) {
    return this.request('POST', uri, body, options);
  },
  patch(uri, body, options) {
    return this.request('PATCH', uri, body, options);
  },
  put(uri, body, options) {
    return this.request('PUT', uri, body, options);
  },
  delete(uri, body, options) {
    return this.request('DELETE', uri, body, options);
  },
  request(method, uri, body, options) {
    options = Object.assign({
      method,
      uri,
      body,
      resolveWithFullResponse: true,
      // simple: false,
      json: true,
    }, options);

    return request(options);
  },

  getFixture(fixtureType, seed) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const fixtureProvider = require(`./data/${fixtureType}`);
    if (_.isArray(fixtureProvider)) {
      if (_.isUndefined(seed)) {
        seed = Math.floor(Math.random() * fixtureProvider.length);
      } else if (!_.isNumber(seed) || seed >= fixtureProvider.length) {
        throw new Error(`Wrong seed value: ${seed}`);
      }

      return Object.assign({}, fixtureProvider[seed]);
    } else if (_.isFunction(fixtureProvider)) {
      seed = seed || Math.floor(Math.random() * 1000000);
      return fixtureProvider(seed);
    } else {
      throw new Error(`Unsupported fixture provider: ${fixtureType}`);
    }
  },

  getClientAuth() {
    return Object.assign({}, clientAuth);
  },
  getBasicAuth(client) {
    const clientId = client ? client.clientId : clientAuth.client_id;
    const clientSecret = client ? client.clientSecret : clientAuth.client_secret;

    return new Buffer(`${clientId}:${clientSecret}`).toString('base64');
  },

  getAdminUser() {
    return Object.assign({}, testConfig.adminUser);
  },

  createUser(data) {
    return this
      .post(`${testConfig.baseUrl}/api/users`, _.assign({}, data, this.getClientAuth()))
      .then((result) => {
        data._id = result.body._id;
        return result.body;
      });
  },

  signInUser(data) {
    return this
      .post(`${testConfig.baseUrl}/oauth`,
        _.assign({
          grant_type: 'password',
        }, _.pick(data, 'username', 'password'), this.getClientAuth()))
      .then((result) => {
        data.auth = {
          access_token: result.body.access_token,
          refresh_token: result.body.refresh_token,
        };

        return result.body;
      });
  },

  getUser(userData, data, userId) {
    data = data || userData;
    userId = userId || data._id;
    return this
      .get(`${testConfig.baseUrl}/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userData.auth.access_token}`,
          },
        })
      .then((result) => {
        data._id = result.body._id;
        return result.body;
      });
  },

  removeUser(data) {
    return Bb
      .try(() => {
        if (data._id) {
          return User.remove({ _id: data._id });
        }
      });
  },
};

before(() => Bb
  .join(
    User.remove({ username: { $ne: testConfig.adminUser.username } }),
    AccessToken.remove(),
    RefreshToken.remove()
  ));

module.exports = specHelper;
