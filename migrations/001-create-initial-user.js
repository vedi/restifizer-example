/**
 * Created by vedi on 23/08/14.
 */

var
  Q = require('q'),
  User = require('../models/user'),
  Client = require('../models/client'),
  AccessToken = require('../models/accessToken'),
  RefreshToken = require('../models/refreshToken');

exports.up = function (next) {
  Q
    .try(function () {
      console.log("Create default user");
      var user = new User({ username: "admin", password: "adminadmin", roles: ["admin"]});
      return Q.ninvoke(user, "save");
    })
    .then(function () {
      console.log("Create default client");
      var client = new Client({ name: "appName", clientId: "myClientId", clientSecret: "myClientSecret" });
      return Q.ninvoke(client, "save");
    })
    .then(function () {
      console.log("Clean up access tokens");
      return Q.ninvoke(AccessToken, "remove", {});
    })
    .then(function () {
      console.log("Clean up refresh tokens");
      return Q.ninvoke(RefreshToken, "remove", {});
    })
    .then(function () {
      next();
    })
    .catch(function (err) {
      console.log("Error", err);
      next(err);
    });
};

exports.down = function (next) {
  Q
    .try(function () {
      console.log("Remove default user");
      return Q.ninvoke(User, 'remove', {username: "admin"});
    })
    .then(function () {
      console.log("Remove default client");
      return Q.ninvoke(Client, 'remove', {clientId: "myClientId"});
    })
    .then(function () {
      next();
    })
    .catch(function (err) {
      console.log("Error", err);
      next(err);
    });
};
