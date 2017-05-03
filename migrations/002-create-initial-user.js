/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const User = require('../app/models/user.server.model');

exports.up = (next) => {
  console.log('Create default user');
  User
    .create({ username: 'admin', password: 'adminadmin' })
    .asCallback(next);
};

exports.down = (next) => {
  console.log('Remove default user');
  User
    .remove({})
    .asCallback(next);
};
