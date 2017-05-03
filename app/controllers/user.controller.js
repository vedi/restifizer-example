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
        'roles',
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

}

module.exports = UserController;
