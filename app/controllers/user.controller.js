/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const User = require('../models/user.server.model');
const BaseController = require('./base.controller');

class UserController extends BaseController {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: User,
        },
      },
      path: '/api/users',
      fields: [
        'username',
        'password',
        'createdAt',
        'userpic',
        'userpicUrl',
        'userpicLocal',
        'userpicLocalUrl',
        'userpicFtp',
        'userpicFtpUrl',
      ],
      qFields: ['username'],
      readOnlyFields: [
        'createdAt',
        'updatedAt',
      ],
      actions: {
        default: BaseController.createAction({
          auth: ['bearer'],
        }),

        insert: BaseController.createAction({
          auth: ['bearer', 'oauth2-client-password'],
        }),

        update: BaseController.createAction({
          auth: ['bearer'],
        }),
      },
    });

    super(options);
  }

  pre(scope) {
    const { params, user } = scope;
    if (!scope.isInsert() && params._id === 'me') {
      params._id = user.id;
    }
  }

  post(user, scope) {
    if (user.userpic) {
      const { transportData: { req } } = scope;
      user.userpicUrl = `${req.protocol}://${req.get('host')}/api/users/${user._id}/userpic`;
      delete user.userpic;
    }
    if (user.userpicLocal) {
      const { transportData: { req } } = scope;
      user.userpicLocalUrl = `${req.protocol}://${req.get('host')}/api/users/${user._id}/userpic-local`;
      delete user.userpicLocal;
    }
    if (user.userpicFtp) {
      const { transportData: { req } } = scope;
      user.userpicFtpUrl = `${req.protocol}://${req.get('host')}/api/users/${user._id}/userpic-ftp`;
      delete user.userpicFtp;
    }

    return user;
  }
}

module.exports = UserController;
