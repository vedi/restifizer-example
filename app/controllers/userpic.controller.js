/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const User = require('../models/user.server.model');
const BaseFileController = require('./base-file.controller');

class UserPicController extends BaseFileController {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: User,
        },
      },
      path: '/api/users/:_id/userpic',
      fileField: 'userpic',
      actions: {
        default: BaseFileController.createAction({}),
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

module.exports = UserPicController;
