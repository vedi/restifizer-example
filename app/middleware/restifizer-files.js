/**
 * Created by vedi on 10/10/15.
 */

'use strict';

const _ = require('lodash');
const RestifizerFiles = require('restifizer-files');

const ExpressTransport = RestifizerFiles.ExpressTransport;

module.exports = (app) => {
  const transport = new ExpressTransport({
    app,
  });
  function prepareAuth(options) {
    if (options.auth) {
      // make options.auth to be an array
      if (!Array.isArray(options.auth)) {
        options.auth = [options.auth];
      } else {
        options.auth = _.uniq(options.auth);
      }

      // always add basic auth to client auth
      if (options.auth.includes('oauth2-client-password') && !options.auth.includes('basic')) {
        options.auth.push('basic');
      }
    }
  }

  transport.getAuth = function getAuth(options) {
    prepareAuth(options);
    const auths = [
      app.oAuthifizer.authenticate(options.auth),
      (req, res, next) => {
        if (!req.isAuthenticated()) {
          // options
          return res.status(401).send({
            message: 'User is not logged in',
          });
        }
        next();
      },
    ];
    return options.auth ? auths : (req, res, callback) => {
      callback();
    };
  };
  const restifizer = new RestifizerFiles({
    transports: [transport],
  });

// eslint-disable-next-line global-require
  restifizer.addController(require('../controllers/userpic.controller'));
// eslint-disable-next-line global-require
  restifizer.addController(require('../controllers/userpic-local.controller'));
// eslint-disable-next-line global-require
  restifizer.addController(require('../controllers/userpic-ftp.controller'));
};
