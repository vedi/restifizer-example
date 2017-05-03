/**
 * Created by vedi on 19/09/14.
 */

'use strict';

const Bb = require('bluebird');
const crypto = require('crypto');
const HTTP_STATUSES = require('http-statuses');

const AccessToken = require('../models/access-token.server.model');
const Client = require('../models/client.server.model');
const RefreshToken = require('../models/refresh-token.server.model');
const User = require('../models/user.server.model');

class AuthDelegate {
  constructor() {
    this.tokenLife = 3600;
    this.oAuthifizer = undefined;
  }

  /**
   * Create authorization code
   * @return Promise
   */
  createAuthorizationCode() {
    return Bb.reject(HTTP_STATUSES.NOT_ACCEPTABLE.createError());
  }

  /**
   * Get authorization code object
   * @return Promise with authorization code object if found, null - if not found
   */
  findAuthorizationCode() {
    return Bb.reject(HTTP_STATUSES.NOT_ACCEPTABLE.createError());
  }

  /**
   * Get user object
   * @param context value object containing: id | (login, password)
   * @return Promise with user model if found, null - if not found
   */
  findUser(context) {
    const { id, login, password } = context;
    if (id) {
      return User.findOne({ _id: id });
    } else if (login && password) {
      return User
        .findOne({ username: login })
        .then((user) => {
          if (!user || !user.authenticate(password)) {
            return null;
          }

          return user;
        });
    } else {
      return Bb.reject(new Error('Wrong context!'));
    }
  }

  /**
   * Get user data by token
   * @param context value object containing: accessToken | refreshToken
   * @return Promise with object with user, and info; or null - if not found
   */
  findUserByToken(context) {
    return Bb.try(() => {
      if (context.accessToken) {
        return AccessToken
          .findOne({ token: context.accessToken })
          .then((accessToken) => {
            // if it's expired
            if (accessToken && Math.round(
                (Date.now() - accessToken.createdAt) / 1000) > this.tokenLife) {
              return accessToken
                .remove()
                .then(() => {
                  throw new Error('Token expired');
                });
            } else {
              return accessToken;
            }
          })
          ;
      } else if (context.refreshToken) {
        return RefreshToken.findOne({ token: context.refreshToken });
      } else {
        throw new Error('Wrong context!');
      }
    })
      .then((token) => {
        if (token) {
          return User
            .findOne({ _id: token.userId })
            .then((user) => {
              if (!user) {
                throw new Error('Unknown user');
              }
              const info = { scope: token.scopes };

              return { obj: user, info };
            });
        } else {
          return { obj: false };
        }
      });
  }

  /**
   * Get client object
   * @param context value object containing: clientId, clientSecret,
   * if clientSecret is false we do not need to check it
   * @return Promise with client model if found, false - if not found
   */
  findClient(context) {
    const { clientId, clientSecret } = context;

    return Client
      .findOne({ clientId })
      .then((client) => {
        if (client && (clientSecret === false ||
          client.clientSecret === clientSecret)) {
          return client;
        } else {
          return false;
        }
      });
  }

  /**
   * Clean up tokens
   * @param context value object containing: user|authorizationCode, client
   * @return Promise with no params
   */
  cleanUpTokens(context) {
    const { client: { clientId } } = context;
    const userId = context.user ? context.user._id : context.authorizationCode.userId;
    const query = { userId, clientId };

    return Bb.all([
      RefreshToken.remove(query),
      AccessToken.remove(query),
    ]);
  }

  /**
   * Create access token by user and client
   * @param context value object containing: user|authorizationCode, client, scope, tokenValue,
   * refreshTokenValue
   * @return Promise with no params
   */
  createAccessToken(context) {
    const { user, authorizationCode } = context;
    return Bb
      .try(() => {
        if (user) {
          return user;
        } else {
          return User.findOne({ _id: authorizationCode.userId });
        }
      })
      .then((user) => {
        if (!user) {
          throw new Error('Unknown user');
        }
        context.user = user;
      })
      .then(() => {
        const accessToken = {
          token: crypto.randomBytes(32).toString('base64'),
          clientId: context.client.id,
          userId: context.user._id,
        };
        return AccessToken.create(accessToken);
      })
      .then(result => result.token);
  }

  /**
   * Create refresh token by user and client
   * @param context value object containing: user|authorizationCode, client, scope, tokenValue,
   * refreshTokenValue
   * @return Promise with no params
   */
  createRefreshToken(context) {
    const { user, authorizationCode } = context;
    return Bb
      .try(() => {
        if (user) {
          return user;
        } else {
          return User.findOne({ _id: authorizationCode.userId });
        }
      })
      .then((user) => {
        if (!user) {
          throw new Error('Unknown user');
        }
        context.user = user;
      })
      .then(() => {
        const refreshToken = {
          token: crypto.randomBytes(32).toString('base64'),
          clientId: context.client.id,
          userId: context.user._id,
        };
        return RefreshToken.create(refreshToken);
      })
      .then(result => result.token);
  }

  /**
   * Get additional token info.
   * @param context value object, containing: client, scope, tokenValue, refreshTokenValue,
   * user|authorizationCode
   * @return Promise with an arbitrary object
   */
  getTokenInfo(context) {
    const { user, authorizationCode } = context;
    return Bb
      .try(() => {
        if (user) {
          return user;
        } else {
          return User.findOne({ _id: authorizationCode.userId });
        }
      })
      .then((user) => {
        if (!user) {
          throw new Error('Unknown user');
        }
        return { expires_in: this.tokenLife };
      });
  }
}

module.exports = AuthDelegate;
