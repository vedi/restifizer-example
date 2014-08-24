/**
 * Created by vedi on 23/08/14.
 */

var mongoose    = require('../config/mongoose');

// AccessToken

var AccessTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scopes: {
    type: [String],
    required: true
  }
});

module.exports = mongoose.model('AccessToken', AccessTokenSchema);