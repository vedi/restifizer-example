/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const Client = require('../app/models/client.server.model');

exports.up = (next) => {
  console.log('Create default client');
  return Client
    .create({ name: 'appName', clientId: 'myClientId', clientSecret: 'myClientSecret' })
    .asCallback(next);
};

exports.down = (next) => {
  console.log('Remove default client');
  return Client
    .remove({ clientId: 'myClientId' })
    .asCallback(next);
};
