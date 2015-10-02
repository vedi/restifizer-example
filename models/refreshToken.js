/**
 * Created by vedi on 23/08/14.
 */

var mongoose    = require('../config/mongoose');

// RefreshToken

var RefreshTokenSchema = new mongoose.Schema({
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
  created: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);

