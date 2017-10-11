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
    apiKey: 'AIzaSyCruoCX_m38WliVCubNRBPqyCjGfwA_M8k',
    authDomain: 'newstock-4f49e.firebaseapp.com',
    databaseURL: 'https://newstock-4f49e.firebaseio.com',
    projectId: "newstock-4f49e",
    storageBucket: '',
    messagingSenderId: '877130652031'
};
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        var email = user.email;
        console.log("user: " + email);
    } else {
        console.log("no X user");
    }
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


app.post('/sign_up_user', async function(req, res, next) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var email = req.body.email;
    var password = req.body.password;
    console.log("signing up with " + email + password);
    res.contentType('json');
    try {
        console.log("hey ben");
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        console.log("Erherhehreh");
        if (result) {
            console.log(result.uid)
            await firebase.database().ref(`users/${result.uid}`).set({
                firstName: firstName,
                lastName: lastName,
                email: email,
                userId: result.uid,
                balance: 1000000,
                bio: ''
            });
            console.log("successs");
            res.send({ success: 'Saved!' });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({ error: e});
    }
});

app.post('/sign_in_user', async function(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    console.log("signing up with " + email + password);
    res.contentType('json');
    try {
        const result = await firebase.auth().signInWithEmailAndPassword(email, password);
        if (result) {
            console.log("successs login");
            res.send({ success: 'Saved!' });
        }
    } catch (e) {
        console.log(e);
        res.status(500).send({ error: e});
    }
});

app.post('/get_user_info', async function(req, res, next) {
  res.contentType('json');
  try {
    var user = firebase.auth().currentUser.uid;
    console.log("current user = " + user);
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
      var first = snapshot.val().firstName;
      var last = snapshot.val().lastName;
      var bal = snapshot.val().balance;
      var bio = snapshot.val().bio;
      console.log(`profile info: ${first}, ${last}, ${bal}, ${bio}`);
      res.send({'name': first + ' ' + last, 'balance': bal, 'bio': bio});
    });
    console.log('success');
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({'name': 'Unknown', 'balance': 'Unknown'});
  }
});

app.post('/update_bio', async function(req, res, next) {
  var newBio = req.body.bio;
  res.contentType('json');
  try {
    var user = firebase.auth().currentUser.uid;
    console.log("current user = " + user);
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref(`users/${user}`).update({bio: newBio})
    res.send({'bio': true});
    console.log('success');
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({'bio': false});
  }
});

app.post('/purchase_stock', async function(req, res, next) {
    var tradeAmount = req.body.tradeAmount;
    var companyName = req.body.companyName;
    var companyCode = req.body.companyCode;
    var share_price = req.body.share_price;
    var type = req.body.type;
    var num_units = req.body.num_units;
    console.log(companyCode);
    console.log(companyName);
    console.log(tradeAmount);
    res.contentType('json');
    var user = firebase.auth().currentUser.uid;
    console.log("current user = " + user);
    try {
        if (user) {
            console.log(user)
            firebase.database().ref(`users/${user}/purchases`).push({
                tradeAmount: parseInt(tradeAmount),
                companyName: companyName,
                companyCode: companyCode,
                date: Date.now(),
                type: type,
                num_units: num_units,
                share_price: share_price
            });
            var ref = firebase.database().ref(`users/${user}/balance`);
            ref.once('value', function(snapshot) {
                console.log(snapshot.val());
                var newBalance = snapshot.val() - tradeAmount;
                firebase.database().ref(`users/${user}`).update({balance: newBalance})
                res.send({purchase_made: true});
            });
        } else {
            res.send({purchase_made: false});
        }
        console.log("successs");
    } catch (e) {
        console.log('fail');
        console.error(e);
        res.send({purchase_made: false});
    }
});

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
