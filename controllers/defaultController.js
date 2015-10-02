/**
 * Created by vedi on 23/08/14.
 */
'use strict';

var
  Restifizer = require('restifizer'),
  passport = require('oauthifizer').passport,
  User = require('../models/user');

module.exports = Restifizer.Controller.extend({
  hasRole: function (req, role) {
    return req.user &&
      req.user.roles &&
      req.user.roles.indexOf(role) >= 0;
  },
  isAdmin: function (req) {
    return this.hasRole(req, User.ROLES.ADMIN);
  },
  isStaff: function (req) {
    return this.hasRole(req, User.ROLES.STAFF);
  },
  actions: {
    'default': {
      enabled: true,
      auth: ['bearer']
    }
  },
  getAuth: function (options) {
    var auths = [
      passport.authenticate(options.auth, { session: false }),
      function (req, res, next) {
        if (!req.isAuthenticated()) {
          //options
          return res.status(401).send({
            message: 'User is not logged in'
          });
        }

        next();
      }
    ];
    return options.auth ? auths : function(req, res, callback) {
      callback();
    };
  }
});