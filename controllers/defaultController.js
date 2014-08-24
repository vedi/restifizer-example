/**
 * Created by vedi on 23/08/14.
 */

var
  Restifizer = require('restifizer').Restifizer,
  passport = require('oauthifizer').passport;

var DefaultController = Restifizer.Controller.extend({
  isAdmin: function (req) {
    return req.authInfo
      && req.authInfo.scope
      && req.authInfo.scope.indexOf("all") >= 0;
  },
  defaultOptions: {
    auth: 'bearer'  // default auth strategy
  },
  getAuth: function (options) {
    return options.auth ? passport.authenticate(options.auth, { session: false }) : this._emptyPre; // inject passport authentication to the project
  }
});

module.exports = DefaultController;
