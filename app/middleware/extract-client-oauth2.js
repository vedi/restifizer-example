/**
 * Created by vedi on 10/10/15.
 */

'use strict';

module.exports = () => (req, res, next) => {
  // Code was taken from here: https://github.com/jshttp/basic-auth/blob/master/index.js
  req = req.req || req;

  let auth = req.headers.authorization;
  if (!auth) {
    return next();
  }

  // malformed
  const parts = auth.split(' ');
  if (parts[0].toLowerCase() !== 'basic') {
    return next();
  }
  if (!parts[1]) {
    return next();
  }
  auth = parts[1];

  // credentials
  auth = new Buffer(auth, 'base64').toString();
  auth = auth.match(/^([^:]*):(.*)$/);
  if (!auth) {
    return next();
  }

  if (!req.body) {
    req.body = {};
  }
  req.body.client_id = auth[1];
  req.body.client_secret = auth[2];

  return next();
};
