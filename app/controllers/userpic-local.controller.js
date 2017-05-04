/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const User = require('../models/user.server.model');
const BaseFileController = require('./base-file.controller');

class UserpicLocalController extends BaseFileController {
  constructor(options = {}) {
    Object.assign(options, {
      storage: 'local',
      uploadRoot: 'upload',
      uploadPath: 'userpic',
      dataSource: {
        type: 'mongoose',
        options: {
          model: User,
        },
      },
      path: '/api/users/:_id/userpic-local',
      fileField: 'userpicLocal',
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

module.exports = UserpicLocalController;
