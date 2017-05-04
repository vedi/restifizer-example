'use strict';

const _ = require('lodash');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const multipart = require('connect-multiparty');

const routes = require('./routes/index');

const app = express();

/* eslint-disable import/no-dynamic-require, global-require */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(multipart());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use(require('./middleware/extract-client-oauth2')());

require('./middleware/oauthifizer')(app);
require('./middleware/restifizer')(app);
require('./middleware/restifizer-files')(app);

// init restifizer

app.use('/', routes);

require('./middleware/handle-errors')(app);

/* eslint-enable import/no-dynamic-require, global-require */

module.exports = app;
