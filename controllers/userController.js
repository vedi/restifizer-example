/**
 * Created by vedi on 23/08/14.
 */
 
 'use strict';
var
  Bb = require('bluebird'),
  _ = require('lodash'),
  MongooseDataSource = require('restifizer-mongoose-ds'),
  User = require('../models/user'),
  DefaultController = require('./defaultController'),
  HTTP_STATUSES = require('http-statuses')
;

module.exports = DefaultController.extend({
  dataSource: new MongooseDataSource(User),
  path: '/api/users',
  fields: [
    'username', 
    'password',
    'createdAt',
    'roles'
  ],
  qFields: ['username'],
  actions: {
    default: _.defaults({}, DefaultController.prototype.actions.default),
    insert: {
      auth: ['bearer', 'oauth2-client-password']
    },
    update: {
      auth: ['bearer']
    }
  },

  pre: function (req, res, next) {
    if (!req.restifizer.isInsert()) {
      if (req.params._id === 'me') {
        req.params._id = req.user.id;
      }
    }
    if (req.restifizer.isInsert()) {
      // set defaults
      req.params.provider = req.param('provider') || 'local';
    } else if (!req.restifizer.isSelect()) {
      if (!this.isAdmin(req) && (!req.params._id || req.params._id !== req.user.id)) {
        next(HTTP_STATUSES.FORBIDDEN.createError());
      }
    }

    // do not allow list selecting for `users`
    if (!this.isAdmin(req) && req.restifizer.isSelect() && !req.restifizer.isSelectOne()) {
      next(HTTP_STATUSES.FORBIDDEN.createError());
    }

    next();
  },
  assignFilter: function (dest, source, fieldName, req) {
    var fieldValue = source[fieldName];
    // skip empty password
    // skip roles not from admins
    return (fieldName !== 'password' || (fieldValue && fieldValue.length !== 0)) &&
      (fieldName !== 'roles' || this.isAdmin(req) || (fieldValue && fieldValue.length === 1 && fieldValue[0] === 'user'));
  }
});