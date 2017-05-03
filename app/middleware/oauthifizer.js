/**
 * Created by vedi on 10/10/15.
 */

'use strict';

const OAuthifizer = require('oauthifizer');

const AuthDelegate = require('../lib/auth-delegate');

module.exports = (app) => {
  const authDelegate = new AuthDelegate();
  const oAuthifizer = new OAuthifizer(authDelegate);
  app.route('/oauth').post(oAuthifizer.getToken());
  app.oAuthifizer = oAuthifizer;
};
