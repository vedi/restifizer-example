/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const mongoose = require('../../config/mongoose');

const modelName = 'User';

const _ = require('lodash');
const crypto = require('crypto');

const schema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Create instance method for hashing a password
 */
schema.methods.hashPassword = function hashPassword(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
  } else {
    return password;
  }
};

/**
 * Create instance method for authenticating user
 */
schema.methods.authenticate = function authenticate(password) {
  return this.hashedPassword === this.hashPassword(password);
};

schema.virtual('password')
  .set(function setPassword(password) {
    this._plainPassword = password;
    this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
    this.hashedPassword = this.hashPassword(password);
  })
  .get(function getPassword() {
    return this._plainPassword;
  });

module.exports = mongoose.model(modelName, schema);
