/**
 * Created by vedi on 23/08/14.
 */

'use strict';

const Bb = require('bluebird');
const mongoose = require('mongoose');

const DB_URL = 'mongodb://localhost/restifizerExample';
const TEST_DB_URL = 'mongodb://localhost/restifizerExampleTest';

mongoose.Promise = Bb;
mongoose.connect(process.env.NODE_ENV !== 'test' ? DB_URL : TEST_DB_URL);
const connection = mongoose.connection;

connection.once('open', () => {
  console.log('connected to db.');
});
connection.on('error', (err) => {
  console.log(`connection error: ${err.message}`);
});

module.exports = mongoose;
