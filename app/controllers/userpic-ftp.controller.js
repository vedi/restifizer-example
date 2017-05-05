/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const User = require('../models/user.server.model');
const BaseFileController = require('./base-file.controller');

class UserpicFtpController extends BaseFileController {
  constructor(options = {}) {
    Object.assign(options, {
      storage: 'ftp',
      host: 'localhost',
      dataSource: {
        type: 'mongoose',
        options: {
          model: User,
        },
      },
      path: '/api/users/:_id/userpic-ftp',
      fileField: 'userpicFtp',
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

module.exports = UserpicFtpController;
