/**
 * Created by vedi on 7/7/14.
 */

var
  util = require('util'),
  Q = require('q'),
  crypto = require('crypto'),
  HTTP_STATUSES = require('http-statuses'),
  User = require('./../models/user'),
  Client = require('./../models/client'),
  AccessToken = require('./../models/accessToken'),
  RefreshToken = require('./../models/refreshToken');

function AuthDelegate() {
  this.tokenLife = 3600;
  this.oAuthifizer = undefined;
}

util.inherits(AuthDelegate, Object);

/**
 * Create authorization code
 * @param context value object containing: user, client, scope, redirectUri, codeValue
 * @param callback receives no params
 */
AuthDelegate.prototype.createAuthorizationCode = function (context, callback) {
  callback(HTTP_STATUSES.NOT_ACCEPTABLE.createError());
};

/**
 * Get authorization code object
 * @param context value object containing: codeValue, client, redirectUri
 * @param callback receives authorization code object if found, null - if not found
 */
AuthDelegate.prototype.findAuthorizationCode = function(context, callback) {
  callback(HTTP_STATUSES.NOT_ACCEPTABLE.createError());
};


/**
 * Get user object
 * @param context value object containing: id | (login, password)
 * @param callback receives user model if found, null - if not found
 */
AuthDelegate.prototype.findUser = function(context, callback) {
  if (context.id) {
    return Q
      .ninvoke(User, 'findById', context.id)
      .nodeify(callback)
      ;
  } else if (context.login && context.password) {
    var query = User.findOne({username: context.login});
    return Q
      .ninvoke(query, 'exec')
      .then(function (user) {
        if (!user || !user.authenticate(context.password)) {
          return null;
        }
        return user;
      })
      .nodeify(callback)
      ;
  } else {
    throw new Error('Wrong context!');
  }
};

/**
 * Get user data by token
 * @param context value object containing: accessToken | refreshToken
 * @param callback receives object with user, and info; or null - if not found
 */
AuthDelegate.prototype.findUserByToken = function(context, callback) {
  var _this = this;
  Q
    .try(function() {
      if (context.accessToken) {
        return Q
          .ninvoke(AccessToken, 'findOne', { token: context.accessToken})
          .then(function (token) {
            // if it's expired
            if (token && Math.round((Date.now() - token.created) / 1000) > _this.tokenLife) {
              return Q
                .ninvoke(AccessToken, 'remove', { token: token })
                .then(function () {
                  throw { message: 'Token expired' };
                })
                ;
            } else {
              return token;
            }
          })
          ;
      } else if (context.refreshToken) {
        return Q.ninvoke(RefreshToken, 'findOne', { token: context.refreshToken });
      } else {
        throw new Error('Wrong context!');
      }
    })
    .then(function(token) {
      if (token) {
        return Q
          .ninvoke(User, 'findById', token.userId)
          .then(function (user) {
            if (!user) {
              throw { message: 'Unknown user' };
            }
            var info = { scope: token.scopes };
            return {obj: user, info: info};
          });
      } else {
        return {obj: false};
      }

    })
    .nodeify(callback)
  ;
};

/**
 * Get client object
 * @param context value object containing: clientId, clientSecret, if clientSecret is false we do not need to check it
 * @param callback client model if found, false - if not found
 */
AuthDelegate.prototype.findClient = function(context, callback) {
  return Q
    .ninvoke(Client, 'findOne', { clientId: context.clientId })
    .then(function (client) {
      if (client && (context.clientSecret === false || client.clientSecret === context.clientSecret)) {
        return client;
      } else {
        return false;
      }
    })
    .nodeify(callback)
    ;
};

/**
 * Clean up tokens
 * @param context value object containing: user|authorizationCode, client
 * @param callback receives no params
 */
AuthDelegate.prototype.cleanUpTokens = function(context, callback) {

  var clientId = context.client.clientId;
  var userId = context.user ? context.user._id : context.authorizationCode.userId;

  return Q
    .all([
      Q.ninvoke(RefreshToken, 'remove', { userId: userId, clientId: clientId }),
      Q.ninvoke(AccessToken, 'remove', { userId: userId, clientId: clientId })
    ])
    .nodeify(callback)
    ;
};

/**
 * Create tokens by user and client
 * @param context value object containing: user|authorizationCode, client, scope, tokenValue, refreshTokenValue
 * @param callback receives no params
 */
AuthDelegate.prototype.createTokens = function (context, callback) {
  var _this = this;
  return Q
    .try(function () {
      if (context.user) {
        return context.user;
      } else {
        return Q.ninvoke(User, 'findById', context.authorizationCode.userId);
      }
    })
    .then(function (user) {
      if (!user) {
        throw new Error('Unknown user');
      }
      context.user = user;
    })
    .then(function () {
      return Q.all([
        Q.try(function () {
          var accessToken = new AccessToken({ token: context.tokenValue, clientId: context.client.clientId, userId: context.user._id });
          accessToken.scopes = _this._getAllowedScopes(context.user, context.scope);
          if (!accessToken.scopes || accessToken.scopes.length === 0) {
            accessToken.scopes = ['own'];
          }
          return Q.ninvoke(accessToken, 'save');
        }),
        Q.try(function () {
          var refreshToken = new RefreshToken({ token: context.refreshTokenValue, clientId: context.client.clientId, userId: context.user._id });
          return Q.ninvoke(refreshToken, 'save');
        })
      ]);
    })
    .nodeify(callback)
    ;
};

/**
 * Get additional token info.
 * @param context value object, containing: client, scope, tokenValue, refreshTokenValue, user|authorizationCode
 * @param callback
 * @returns {Object} an arbitrary object
 */
AuthDelegate.prototype.getTokenInfo = function (context, callback) {
  var _this = this;
  Q
    .try(function () {
      if (context.user) {
        return context.user;
      } else {
        return Q.ninvoke(User, 'findById', context.authorizationCode.userId);
      }
    })
    .then(function (user) {
      if (!user) {
        throw new Error('Unknown user');
      }
      return {expires_in: _this.tokenLife};
    })
    .nodeify(callback)
  ;
};

/**
 * Generate token value string.
 * @returns {String} tokenValue
 */
AuthDelegate.prototype.generateTokenValue = function () {
  return crypto.randomBytes(32).toString('base64');
};

AuthDelegate.prototype.ensureLoggedIn = function(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    this._redirectToLogin(req, res);
  } else {
    next();
  }
};

AuthDelegate.prototype.approveClient = function() {
  return [
    function(req, res, next) {
      req.params.transactionID = req.oauth2.transactionID;
      next();
    },
    this.oAuthifizer.getDecision()
  ];
};

AuthDelegate.prototype.afterToken = function(data, req, res) {
};

AuthDelegate.prototype._getAllowedScopes = function (user, requestedScopes) {
  if (!requestedScopes) {
    return user.roles;
  } else {
    var requestedScopesArr = requestedScopes.split(',');
    var resultScopes = [];
    for (var i = 0; i < requestedScopesArr.length; i++) {
      if (user.roles.indexOf(requestedScopesArr[i]) >= 0) {
        resultScopes.push(requestedScopesArr[i]);
      }
    }
    return resultScopes;
  }
};

AuthDelegate.prototype._redirectToLogin = function (req, res) {
  if (req.session) {
    req.session.returnTo = req.originalUrl || req.url;
    req.session.client_id = req.param('client_id');
    req.session.redirect_uri = req.param('redirect_uri');
    req.session.response_type = req.param('response_type');
    req.session.scope = req.param('scope');
  }
  return res.redirect('/login');
};


module.exports = AuthDelegate;