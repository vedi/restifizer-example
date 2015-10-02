var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var OAuthifizer = require('oauthifizer');
var AuthDelegate = require('./lib/authDelegate');

var Restifizer = require('restifizer');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(OAuthifizer.passport.initialize());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var oAuth2 = new OAuthifizer(new AuthDelegate());
app.route('/oauth')
    .post(oAuth2.getToken())
;

var restifizer = new Restifizer(app, {});

app.use('/', routes);

restifizer
  .addController(require('./controllers/userController'))
;

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
