/**
 * Created by vedi on 08/07/16.
 */

'use strict';

const fs = require('fs');
const _ = require('lodash');
const chakram = require('chakram');
const request = require('request-promise');

const config = require('../config');
const specHelper = require('../spec-helper');

const FILE_NAME = './temp_userpic.png';
const FILE_PATH = `./${FILE_NAME}`;
const OUR_FILE_PATH = `./our_temp_userpic`;
const SAMPLE_URL = 'https://placeholdit.imgix.net/~text?txtsize=33&txt=Userpic&w=300&h=200';

const expect = chakram.expect;

[
  {
    fieldName: 'userpic',
    urlFieldName: 'userpicUrl',
    fieldUrl: 'userpic',
  },
  {
    fieldName: 'userpicLocal',
    urlFieldName: 'userpicLocalUrl',
    fieldUrl: 'userpic-local',
  },
  {
    fieldName: 'userpicFtp',
    urlFieldName: 'userpicFtpUrl',
    fieldUrl: 'userpic-ftp',
  },
].forEach(({ fieldName, urlFieldName, fieldUrl }) => describe(`User ${fieldName}`, () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);

  let ourUserpicUrl;

  before('get file', (done) => {
    const file = fs.createWriteStream(FILE_PATH);
    request(SAMPLE_URL)
      .on('response', () => {
        done();
      })
      .pipe(file);
  });

  before('create user', () => specHelper.createUser(user));
  before('sign in user', () => specHelper.signInUser(user));

  describe(`Get initial ${fieldName} Profile`, () => {
    let userResponse;

    before('Get Profile', () => specHelper
      .getUser(user)
      .then((result) => {
        userResponse = result;
      }));

    it(`should not contain ${urlFieldName}`, () => expect(userResponse[urlFieldName]).not.to.exist);
  });

  describe('Upload file', () => {
    let response;

    before('send request', () => {
      const req = request.put({
        url: `${config.baseUrl}/api/users/me/${fieldUrl}`,
        headers: {
          Authorization: `Bearer ${user.auth.access_token}`,
        },
        formData: {
          [fieldName]: {
            value: fs.createReadStream(FILE_PATH),
            options: {
              filename: FILE_NAME,
              contentType: 'image/png',
            },
          },
        },
        resolveWithFullResponse: true,
        json: true,
      });
      return req
        .then((result) => {
          response = result;
        });
    });

    it('should return status 200', () => {
      expect(response.statusCode).to.be.equal(200);
    });
  });

  describe(`Get ${fieldName} Profile After Uploading`, () => {
    let userResponse;

    before('Get Profile', () => specHelper
      .getUser(user)
      .then((result) => {
        userResponse = result;
      }));

    it(`should contain ${urlFieldName}`, () => {
      ourUserpicUrl = userResponse[urlFieldName];
      return expect(userResponse[urlFieldName]).to.exist;
    });
  });

  describe('Get File', () => {
    let response;

    before('get file', (done) => {
      const file = fs.createWriteStream(OUR_FILE_PATH);
      request({
        url: ourUserpicUrl,
        headers: {
          Authorization: `Bearer ${user.auth.access_token}`,
        },
      })
        .on('response', (result) => {
          response = result;
          done();
        })
        .pipe(file);
    });

    it('should return status 200', () => {
      expect(response.statusCode).to.be.equal(200);
    });
  });

  describe('Remove File', () => {
    let response;

    before('send request', () => chakram
      .delete(`${config.baseUrl}/api/users/me/${fieldUrl}`,
        {}, { headers: {
          Authorization: `Bearer ${user.auth.access_token}`,
        } }
      )
      .then((result) => {
        response = result;
      }));

    it('should return status 200', () => {
      expect(response).to.have.status(200);
    });
  });

  describe(`Get ${fieldName} Profile after deletion`, () => {
    let userResponse;

    before('Get Profile', () => specHelper
      .getUser(user)
      .then((result) => {
        userResponse = result;
      }));

    it(`should not contain ${fieldName}`, () => expect(userResponse[urlFieldName]).not.to.exist);
  });

  after('remove user', () => specHelper.removeUser(user));
  after('remove file', () => fs.unlinkSync(FILE_PATH));
  after('remove our file', () => fs.unlinkSync(OUR_FILE_PATH));
}));
