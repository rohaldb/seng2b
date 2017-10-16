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

// firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//         // User is signed in.
//         var email = user.email;
//         console.log("user: " + email);
//     } else {
//         console.log("no X user");
//     }
// });

firebase.auth().signInWithEmailAndPassword('jblogg@gmail.com', '123456').catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
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
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(result) {
        if (result) {
            console.log(result.uid);
            firebase.database().ref(`users/${result.uid}`).set({
                firstName: firstName,
                lastName: lastName,
                email: email,
                userId: result.uid,
                balance: 1000000,
                bio: 'No bio yet.'
            });
            console.log("successs");
            res.send({ success: 'Saved!' });
        }
    }, function(error) {
        console.log('cannot sign up');
        console.log(error);
        res.status(500).send({ error: error });
    });
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
      var groups;
      if (snapshot.val().groups != null) {
        groups = snapshot.val().groups;
      } else {
        groups = {};
      }
      console.log(`profile info: ${first}, ${last}, ${bal}, ${bio}, ${groups}`);
      res.send({'name': first + ' ' + last, 'balance': bal, 'bio': bio, 'groups': groups});
    });
    console.log('success');
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({'name': 'Unknown', 'balance': 'Unknown', 'bio': 'Unknown', 'groups': 'Unknown'});
  }
});


app.post('/update_bio', async function(req, res, next) {
  var newBio = req.body.bio;
  res.contentType('json');
  try {
    var user = firebase.auth().currentUser.uid;
    console.log("current user = " + user);
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref(`users/${user}`).update({'bio': newBio});
    res.send({'bio': true});
    console.log('success');
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({'bio': false});
  }
});

app.post('/new_group', async function(req, res, next) {
  var name = req.body.name;
  res.contentType('json');
  try {
    var user = firebase.auth().currentUser.uid;
    console.log("current user = " + user);

    //create the new group
    var newGroupKey = firebase.database().ref().child('groups').push().key;
    var updates = {};
    updates[`/groups/${newGroupKey}`] = {'name': name, users: [user]};
    updates[`/users/${user}/groups/${newGroupKey}`] = name;
    firebase.database().ref().update(updates);

    res.send({'group': newGroupKey});
    console.log('success');
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({'group': false});
  }
});

// app.post('/get_user_list', async function(req, res, next) {
//   res.contentType('json');
//   console.log("@!$#!@$H!@H$!@H#H!@$@");
//   try {
//     var usersRef = firebase.database().ref('users').once('value', function(snapshot){
//       console.log(snapshot.val());
//       // snapshot.forEach(function(childSnapshot) {
//       //   //var key = childSnapshot.key;
//       //   //var childData = childSnapshot.val();
//       //   var first = childSnapshot.val().firstName;
//       //   var last = childSnapshot.val().lastName;
//       //
//       //   //console.log('heres a key: ' + key);
//       //   console.log('name ' + first + ' ' + last);
//       //   //console.log('heres data: ' + childData);
//       //   res.send({'name': first + ' ' + last});
//       // });
//       users = {}
//
//     });
//   } catch (e) {
//     console.log('fail');
//     console.error(e);
//     res.send({'name': 'unknown'});
//   }
// });

app.post('/get_user_list', async function(req, res, next) {
  res.contentType('json');
  try {
      var userList = [];
      firebase.database().ref('/users').once('value').then(function(snapshot) {
      //console.log(snapshot.val());
      //console.log("PLEASEPALEASEAE");
      snapshot.forEach(x => {
        userList.push({
          name: x.val().firstName + ' ' + x.val().lastName,
          uid: x.val().userId
        })
      })
      res.send({'userList': userList});
    });
    console.log('success user list');
  } catch (e) {
    console.log('fail user list');
    console.error(e);
    res.send({'userList': 'unknown'});
  }
});

app.post('/get_group_info', async function(req, res, next) {
  var id = req.body.id;
  res.contentType('json');
  var num,first,last; //adding this stopped (node:24272) UnhandledPromiseRejectionWarning: Unhandled promise rejection (rejection id: 2): ReferenceError: first is not defined
  try {
    var numMembers = 0;
    var memberIds = [];
    var members = {};

    firebase.database().ref('/groups/' + id).once('value').then(function(snapshot) {
      memberIds = snapshot.val().users;
      numMembers = snapshot.val().users.length;
      console.log(`number of users: ${num}`);
    });


    var usersRef = firebase.database().ref('/users').once('value').then(function(snapshot){
      //console.log(snapshot.val());
      snapshot.forEach(function(childSnapshot) {
        // If user id is in memberIds, add to memberNames
        if (memberIds.indexOf(childSnapshot.val().userId) !== -1) {
          console.log("USERID: "  + childSnapshot.val().userId);
          var first = childSnapshot.val().firstName;
          var last = childSnapshot.val().lastName;
          var name = first + ' ' + last;
          console.log('name ' + name);
          members[childSnapshot.val().userId] = {
            name: name
          }
        }
      });

      res.send({'numMembers': numMembers, 'members': members});
    });
    console.log('success');
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({'numMembers': 'Unknown', 'members': {}});
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

app.post('/ibm', async function(req, res, next) {
  var articleText = req.body.text;
  //console.log(articleText);
  var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

  //use ibm analytics module
  var natural_language_understanding = new NaturalLanguageUnderstandingV1({
    'username': 'b61b2519-acb6-47b8-bbb9-608226b76020',
    'password': 'Vm0fss16s7rJ',
    'version_date': '2017-02-27'
  });

  //request sentiment for the article
  var parameters = {
    'text': articleText,
    'features': {
      'sentiment': {
      }
    }
  };

  natural_language_understanding.analyze(parameters, function(err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      //send back the flat json
      var data = JSON.stringify(response, null, 2);
      //console.log('sentiment result: ' + JSON.stringify(data));
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': data.length
      });
      res.write(data);
      res.end();
    }
  });

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
