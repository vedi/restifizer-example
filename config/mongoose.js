/**
 * Created by vedi on 23/08/14.
 */

var mongoose    = require('mongoose');

mongoose.connect('mongodb://localhost/restifizerExample');
var connection = mongoose.connection;

connection.once('open', function callback () {
  console.log("connected to db.");
});
connection.on('error', function (err) {
  console.log('connection error: ' + err.message);
});

module.exports = mongoose;
