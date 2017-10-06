var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var firebase = require('firebase');
require('firebase/auth');
require('firebase/database');

// Initialize Firebase
var config = {
  apiKey: "AIzaSyA2KtZNGyaG2W8rYwb9GRVaLD3p03_7vSs",
  authDomain: "seng2b-5c928.firebaseapp.com",
  databaseURL: "https://seng2b-5c928.firebaseio.com",
  projectId: "seng2b-5c928",
  storageBucket: "seng2b-5c928.appspot.com",
  messagingSenderId: "1080027242189"
};
firebase.initializeApp(config);

firebase.auth().createUserWithEmailAndPassword("ben@gmail.com", "password").catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
});


// Include each page's /routes/*.js file here
var indexPage = require('./routes/index');
var stockPage = require('./routes/stock');
var groupsPage = require('./routes/groups');
var profilePage = require('./routes/profile');
var signupPage = require('./routes/signup');
var loginPage = require('./routes/login');
var landingPage = require('./routes/landing');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routing for each page
app.use('/', landingPage);
app.use('/index', indexPage);
app.use('/stock', stockPage);
app.use('/groups', groupsPage);
app.use('/profile', profilePage);
app.use('/signup', signupPage);
app.use('/login', loginPage);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
