/**
 * Created by vedi on 08/07/16.
 */

'use strict';

const _ = require('lodash');
const chakram = require('chakram');

const testConfig = require('../config');
const specHelper = require('../spec-helper');

const expect = chakram.expect;

describe('User Auth', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);

  before('create user', () => specHelper.createUser(user));

  describe('Sign in', () => {
    let response;

    before('send post', () => chakram
      .post(`${testConfig.baseUrl}/oauth`,
        Object.assign({
          grant_type: 'password',
        }, _.pick(user, 'username', 'password'), specHelper.getClientAuth()))
      .then((result) => {
        response = result;
      }));

    it('should return status 200', () => {
      expect(response).to.have.status(200);
      user.auth = _.pick(response.body, 'access_token', 'refresh_token');
    });
  });

  after('remove user', () => specHelper.removeUser(user));
});
