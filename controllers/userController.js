/**
 * Created by vedi on 23/08/14.
 */
var
  _ = require('lodash'),
  User = require('../models/user'),
  DefaultController = require('./defaultController');

var UserController = DefaultController.extend({
  ModelClass: User,
  path: '/api/users',
  fields: [
    'username',
    'password',
    'createdAt',
    'scopes'
  ],
  qFields: ['username'],

  actions: {
    default: _.defaults({}, DefaultController.prototype.actions.default),
    insert: {
      auth: ['bearer', 'oauth2-client-password']  // support both
    },
    update: {
      auth: ['bearer']
    }
  },
  pre: function (req, res, next) {
    if (req.restifizer.isInsert()) {
      req.params.scopes = ['own'];    // creating user is not admin
      if (!req.authInfo) {
        req.authInfo = {};
      }
      req.authInfo.scope = 'own';
    }
    next();
  },
  assignFilter: function (dest, source, fieldName, req) {
    var fieldValue = source[fieldName];
    if (fieldName == 'password') {
      // we do not set password to empty value
      if (fieldValue && fieldValue.length == 0) {
        return false;
      }
    }
    else if (fieldName == 'scopes') {
      // only admins are able to change
      if (!this.isAdmin(req) && !(fieldValue && fieldValue.length == 1 && fieldValue[0] == "own")) {
        return false;
      }
    }
    return true;
  }
});

module.exports = UserController;
