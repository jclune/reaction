var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('./config/config');

var expressLivereload = require('express-livereload');

var app = express();

require('./config/mongoose')(app, config);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(methodOverride(function (req, res) {
  if(req.body && typeof req.body == 'object' && '_method' in req.body) {
    var method = req.body['_method'];
    delete req.body['_method'];
    return method;
  }
}));

app.use(cookieParser());
app.use(session({
  secret: 'iYrGXU6oHwLPYry764c9eIsBg0lbozgv',
  resave: true,
  saveUninitialized: true,
  store: new mongoStore({
    url: config.mongo.uri,
    collection: 'session'
  })
}));
app.use(flash());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'test')));

// Bootstrap passport config
var passport = require('./config/passport')(app, config);
expressLivereload(app, config={});

// Bootstrap routes
require('./routes/routes')(app, passport);


module.exports = app;
