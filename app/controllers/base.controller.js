/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const _ = require('lodash');
const Restifizer = require('restifizer');

const defaultAction = {
  enabled: true,
  auth: ['bearer'],
};

class BaseController extends Restifizer.Controller {

  constructor(options) {
    super(options || { actions: { default: defaultAction } });
  }

  static createAction(options) {
    return _.defaults(options, defaultAction);
  }

  createScope(controller, transport) {
    const result = super.createScope(controller, transport);

    if (transport.transportName === 'express') {
      result.getUser = function getUser() {
        return result.transportData.req.user;
      };
      Object.defineProperties(result, {
        user: {
          get() {
            return this.getUser();
          },
          set() {
            // Do nothing, passport will inject user by access token in every request
          },
        },
      });
    } else {
      throw new Error(`Unsupported transport: ${transport.transportName}`);
    }

    return result;
  }
}

module.exports = BaseController;
