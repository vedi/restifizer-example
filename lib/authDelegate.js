/**
 * Created by vedi on 7/7/14.
 */

var
  util = require('util'),
  Q = require('q'),
  crypto = require('crypto'),
  User = require('./../models/user'),
  Client = require('./../models/client'),
  AccessToken = require('./../models/accessToken'),
  RefreshToken = require('./../models/refreshToken');

function AuthDelegate() {
  this.tokenLife = 3600;
}

util.inherits(AuthDelegate, Object);

/**
 * Get user object by login and password
 * @param login
 * @param password
 * @param callback receives user model if found, false - if not found
 */
AuthDelegate.prototype.findUserByLoginAndPassword = function(login, password, callback) {
  return Q
    .ninvoke(User, 'findOne', { username: login })
    .then(function (user) {
      if (user && user.checkPassword(password)) {
        return user;
      } else {
        return false;
      }
    })
    .nodeify(callback)
    ;
};

/**
 * Get client object by id and secret
 * @param clientId
 * @param clientSecret
 * @param callback client model if found, false - if not found
 */
AuthDelegate.prototype.findClientByIdAndSecret = function(clientId, clientSecret, callback) {
  return Q
    .ninvoke(Client, 'findOne', { clientId: clientId })
    .then(function (client) {
      if (client && client.clientSecret == clientSecret) {
        return client;
      } else {
        return false;
      }
    })
    .nodeify(callback)
    ;
};

/**
 * Get user object by token
 * @param token
 * @param callback receives user model and additional info object if found, false - if not found
 */
AuthDelegate.prototype.findUserByAccessToken = function(token, callback) {
  var _this = this;
  return Q
    .ninvoke(AccessToken, 'findOne', { token: token })
    .then(function (token) {
      if (!token) {
        return {obj: false};
      } else if (Math.round((Date.now() - token.createdAt) / 1000) > _this.tokenLife) {
        return Q
          .ninvoke(AccessToken, 'remove', { token: token })
          .then(function () {
            return {obj: false, info: { message: 'Token expired' }};
          })
          ;
      } else {
        return Q
          .ninvoke(User, 'findById', token.userId)
          .then(function (user) {
            if (!user) {
              return {obj: false, info: { message: 'Unknown user' }};
            }
            var info = { scope: token.scopes };
            return {obj: user, info: info};
          })
      }
    })
    .nodeify(callback)
    ;
};

/**
 * Get user object by refreshToken
 * @param token
 * @param callback receives user model if found, false - if not found
 */
AuthDelegate.prototype.findUserByRefreshToken = function(token, callback) {
  return Q
    .ninvoke(RefreshToken, 'findOne', { token: token })
    .then(function (token) {
      if (!token) {
        return {obj: false};
      } else {
        return Q
          .ninvoke(User, 'findById', token.userId)
          .then(function (user) {
            if (!user) {
              return {obj: false, info: { message: 'Unknown user' }};
            }
            var info = { scope: token.scopes };
            return {obj: user, info: info};
          })
      }
    })
    .nodeify(callback)
    ;
};

/**
 * Clean up tokens for user and client
 * @param user
 * @param client
 * @param callback receives no params
 */
AuthDelegate.prototype.cleanUpTokensByUserAndClient = function(user, client, callback) {
  return Q
    .all([
      Q.ninvoke(RefreshToken, 'remove', { userId: user._id, clientId: client.clientId }),
      Q.ninvoke(AccessToken, 'remove', { userId: user._id, clientId: client.clientId })
    ])
    .nodeify(callback)
    ;
};

/**
 * Create tokens for user and client
 * @param user
 * @param client
 * @param scope
 * @param tokenValue
 * @param refreshTokenValue
 * @param callback receives no params
 */
AuthDelegate.prototype.createTokensByUserAndClient = function (user, client, scope, tokenValue, refreshTokenValue, callback) {
  var _this = this;
  return Q
    .all([
      Q.try(function () {
        var accessToken = new AccessToken({ token: tokenValue, clientId: client.clientId, userId: user._id });
        accessToken.scopes = _this._getAllowedScopes(user, scope);
        return Q.ninvoke(accessToken, 'save');
      }),
      Q.try(function () {
        var refreshToken = new RefreshToken({ token: refreshTokenValue, clientId: client.clientId, userId: user._id });
        return Q.ninvoke(refreshToken, 'save');
      })
    ])
    .nodeify(callback)
    ;
};

/**
 * Get additional token info.
 * @returns {Object} an arbitrary object
 */
AuthDelegate.prototype.getTokenInfo = function () {
  return { 'expires_in': this.tokenLife, serverTime: new Date() };
};

/**
 * Generate token value string.
 * @returns {String} tokenValue
 */
AuthDelegate.prototype.generateTokenValue = function () {
  return crypto.randomBytes(32).toString('base64');
};

AuthDelegate.prototype._getAllowedScopes = function (user, requestedScopes) {
  if (!requestedScopes) {
    return user.scopes;
  } else {
    var requestedScopesArr = requestedScopes.split(",");
    var resultScopes = [];
    for (var i = 0; i < requestedScopesArr.length; i++) {
      if (user.scopes.indexOf(requestedScopesArr[i]) >= 0) {
        resultScopes.push(requestedScopesArr[i]);
      }
    }
    return resultScopes;
  }
};

module.exports = AuthDelegate;