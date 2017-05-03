'use strict';

const mongoose = require('../../config/mongoose');

const modelName = 'Client';

const schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  clientId: {
    type: String,
    unique: true,
    required: true,
  },
  clientSecret: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(modelName, schema);
