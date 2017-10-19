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

firebase.auth().signInWithEmailAndPassword('thor@thunder.com', 'password').catch(function(error) {
//firebase.auth().signInWithEmailAndPassword('test@feed.com', 'testfeed').catch(function(error) {
//firebase.auth().signInWithEmailAndPassword('test@hello.com', 'testhello').catch(function(error) {
//firebase.auth().signInWithEmailAndPassword('comments@test.com', 'comments').catch(function(error) {
//firebase.auth().signInWithEmailAndPassword('test@feed.com', 'testfeed').catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});


// Include each page's /routes/*.js file here
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
                balance: 100000.00,
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
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
            var first = snapshot.val().firstName;
            var last = snapshot.val().lastName;
            var bal = snapshot.val().balance;
            var bio = snapshot.val().bio;
            var purchases = snapshot.val().purchases;
            var groups = snapshot.val().groups;
            // console.log(`profile info: ${first}, ${last}, ${bal}, ${bio}, ${groups}, ${purchases}`);
            res.send({
              name: first + ' ' + last,
              balance: bal,
              bio: bio,
              groups: groups,
              purchases: purchases
            });
        });
        console.log('success');
    } catch (e) {
        console.log('fail');
        console.error(e);
        res.send({'name': 'Unknown', 'balance': 'Unknown'});
    }
});

app.post('/get_user_purchases', async function(req, res, next) {
    var userId = firebase.auth().currentUser.uid;
    if (req.body.user) {
      userId = req.body.user;
    }
    res.contentType('json');
    try {
        var userId = firebase.auth().currentUser.uid;
        var purchaseList = []
        firebase.database().ref(`/users/${userId}/purchases/`).once('value').then(function(snapshot) {
            snapshot.forEach(x => {
                purchaseList.push({
                    companyCode: x.val().companyCode,
                    companyName: x.val().companyName,
                    date: x.val().date,
                    num_units: x.val().num_units,
                    share_price: x.val().share_price,
                    tradeAmount: x.val().tradeAmount,
                    type: x.val().type,
                    id: Object.keys(snapshot.val())[0]
                })
            })
            res.send({'purchaseList': purchaseList});
        });
        console.log('success Purchases');
    } catch (e) {
        console.log('fail Purchases');
        console.error(e);
        res.send({'purchaseList': 'Unknown'});
    }
});

app.post('/get_user_purchase_history', async function(req, res, next) {
    var userId = firebase.auth().currentUser.uid;
    if (req.body.user) {
      userId = req.body.user;
    }
    res.contentType('json');
    try {
        var historyList = []
        firebase.database().ref(`/users/${userId}/history/`).once('value').then(function(snapshot) {
            snapshot.forEach(x => {
                historyList.push({
                    companyCode: x.val().companyCode,
                    companyName: x.val().companyName,
                    date: x.val().date,
                    profit_loss_dollars: x.val().profit_loss_dollars,
                    profit_loss_percent: x.val().profit_loss_percent,
                    tradeAmount: x.val().tradeAmount,
                    num_units: x.val().num_units,
                    type: x.val().type,
                    id: Object.keys(snapshot.val())[0],
                    comments: x.val().comments

                })
            })
            res.send({'historyList': historyList});
        });
        console.log('success history');
    } catch (e) {
        console.log('fail history');
        console.error(e);
        res.send({'historyList': 'Unknown'});
    }
});

app.post('/get_user_watchList', async function(req, res, next) {
    res.contentType('json');
    try {
        var userId = firebase.auth().currentUser.uid;
        var watchList = []
        firebase.database().ref(`/users/${userId}/watchList/`).once('value').then(function(snapshot) {
            snapshot.forEach(x => {
                watchList.push({
                    companyCode: x.val().companyCode,
                    companyName: x.val().companyName,
                    // share_price: x.val().share_price
                })
            })
            res.send({'watchList': watchList});
        });
        console.log('success watch');
    } catch (e) {
        console.log('fail watch');
        console.error(e);
        res.send({'watchList': 'Unknown'});
    }
});

app.post('/add_To_Watch_List', async function(req, res, next) {
    var companyName = req.body.companyName;
    var companyCode = req.body.companyCode;
    console.log(companyCode);
    console.log(companyName);
    res.contentType('json');
    var user = firebase.auth().currentUser.uid;
    console.log("current user = " + user);
    try {
        if (user) {
            console.log(user)
            let ref = firebase.database().ref(`users/${user}/watchList`);
            firebase.database().ref(`/users/${user}/watchList/`).once('value').then(function(snapshot) {
                var alreadyWatching = false;
                snapshot.forEach(x => {
                    if (x.val().companyName == companyName) {
                        alreadyWatching = true;
                    }
                    // console.log(x.val().companyName)
                })
                if (!alreadyWatching) {
                    firebase.database().ref(`users/${user}/watchList`).push({
                        companyName: companyName,
                        companyCode: companyCode,
                    });
                }
            })
            res.send({watchAdded: true});
        } else {
            res.send({watchAdded: false});
        }
    } catch (e) {
        console.log('fail');
        console.error(e);
        res.send({watchAdded: false});
    }
});

app.post('/close_trade', async function(req, res, next) {
    var item = req.body;
    res.contentType('json');
    try {
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref(`users/${userId}/history`).push({
            tradeAmount: item.trade_amount,
            companyName: item.companyName,
            companyCode: item.companyCode,
            date: Date.now(),
            type: item.type,
            num_units: item.num_units,
            profit_loss_dollars: item.profit_loss_dollars,
            profit_loss_percent: item.profit_loss_percent,
            comments: []
        });

        firebase.database().ref(`/users/${userId}/purchases/`).once('value').then(function(snapshot) {
            var getPurchsaseId;
            snapshot.forEach(x => {
                if (item.companyCode == x.val().companyCode && x.val().num_units == item.num_units && x.val().date == item.date) {
                    getPurchsaseId = x.key
                }
            });
            firebase.database().ref(`users/${userId}/purchases/${getPurchsaseId}`).remove();
        });

        var ref = firebase.database().ref(`users/${userId}/balance`);
        ref.once('value', function(snapshot) {
            var i = parseFloat(item.trade_amount);
            var curBalance = parseFloat(snapshot.val());
            var newBalance = parseFloat(curBalance + i);
            var finalBalance = newBalance.toFixed(2);
            firebase.database().ref(`users/${userId}`).update({balance: finalBalance});
        });
        res.send({'closed': true});
        console.log('success');
    } catch (e) {
        console.log('fail');
        console.error(e);
        res.send({'closed': false});
    }
});

app.post('/remove_from_watchlist', async function(req, res, next) {
    var item = req.body;
    res.contentType('json');
    try {
        var userId = firebase.auth().currentUser.uid;

        firebase.database().ref(`/users/${userId}/watchList/`).once('value').then(function(snapshot) {
            var getWatchListItemId;
            snapshot.forEach(x => {
                if (item.companyCode == x.val().companyCode) {
                    getWatchListItemId = x.key
                }
            });
            firebase.database().ref(`users/${userId}/watchList/${getWatchListItemId}`).remove();
        });

        res.send({'removed': true});
        console.log('success');
    } catch (e) {
        console.log('fail');
        console.error(e);
        res.send({'closed': false});
    }
});

app.post('/update_bio', async function(req, res, next) {
    var newBio = req.body.bio;
    res.contentType('json');
    try {
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref(`users/${userId}`).update({'bio': newBio});
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
  var date = req.body.date;
  res.contentType('json');
  try {
    var user = firebase.auth().currentUser.uid;
    console.log("current user = " + user);
    var makeGroup = true;

    var make = firebase.database().ref('/groups').once('value').then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().name == name) {
          console.log("group name exists");
          makeGroup = false;
        }
      });
      if (makeGroup === true) {
        firebase.database().ref('/users/' + user).once('value').then(function(snapshot) {
          var first = snapshot.val().firstName;
          var last = snapshot.val().lastName;
          var person = first + ' ' + last;

          //create the new group
          var newGroupKey = firebase.database().ref().child('groups').push().key;
          var updates = {};
          updates[`/groups/${newGroupKey}`] = {'name': name, 'users': [user], 'history': [{'user': person, 'joined': date, 'left': '', 'created': 'created'}]};
          updates[`/users/${user}/groups/${newGroupKey}`] = name;
          firebase.database().ref().update(updates);

          res.send({'group': newGroupKey});
          console.log('success');
        });
      } else {
        res.send({'group': ''});
        console.log('group already exists');
      }
    });
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({'group': ''});
  }
});

app.post('/invite_to_group', async function (req, res, next) {
  var invite_uids = JSON.parse(req.body['invite_uids']);
  var group_id = req.body['group_id'];
  var now = req.body['date'];
  // console.log("Inviting to group: " + group_id);
  // console.log("UIDS TO BE INVITED: " + invite_uids);
  try {
    var updates = {};

    //add new "joined" events to group history - before appending existing uids
    var allHistory = [];
    invite_uids.forEach(x => {
      firebase.database().ref('/users/' + x).once('value').then(function(snapshot) {
        var first = snapshot.val().firstName;
        var last = snapshot.val().lastName;
        var person = first + ' ' + last;
        allHistory.push({'user': person, 'joined': now, 'left': '', 'created': 'joined'});
      });
    });

    // Add all existing group members to invite_uids
    var existing_uids = [];
    firebase.database().ref(`/groups/${group_id}/users`).once('value').then(function (snapshot) {
      snapshot.forEach(x => {
        if (invite_uids.indexOf(x.val()) === -1) { // If uid not already in invite_uids
          existing_uids.push(x.val());
        }
      });
      updates[`/groups/${group_id}/users`] = existing_uids.concat(invite_uids);

      //add existing group history to allHistory
      firebase.database().ref(`/groups/${group_id}/history`).once('value').then(function (snapshot) {
        snapshot.forEach(x => {
          if (allHistory.indexOf(x.val()) === -1) {
            allHistory.push(x.val());
          }
        });
      });
      updates[`/groups/${group_id}/history`] = allHistory;

      var group_name = "unknown";
      firebase.database().ref(`/groups/${group_id}`).once('value').then(function (snapshot) {
        group_name = snapshot.val().name;    // Fetch group name from firebase
        console.log("Group name: " + group_name);

        invite_uids.forEach(function (uid) {
          updates[`/users/${uid}/groups/${group_id}`] = group_name;
        });

        firebase.database().ref().update(updates);
        res.send({'group_members': existing_uids.concat(invite_uids)});
        console.log('invite success');
      });
    });
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({'group': false});
  }
});

app.post('/leave_group', async function (req, res, next) {
  var user = firebase.auth().currentUser.uid;
  var group_id = req.body.group_id;
  var date = req.body.date;
  var updates = {};

  firebase.database().ref(`/groups/${group_id}/users`).once('value').then(function (snapshot) {
    var user_difference = [];
    snapshot.forEach(x => {
      if (x.val() !== user) { // If uid not already in invite_uids
        user_difference.push(x.val());
      }
    });

    //get current history and add leave date/time for current user
    var newHistory = [];
    firebase.database().ref('/users/' + user).once('value').then(function(snapshot) {
      var first = snapshot.val().firstName;
      var last = snapshot.val().lastName;
      var personLeaving = first + ' ' + last;

      //get current user (i.e. user that's leaving) & update history of that user
      firebase.database().ref(`/groups/${group_id}/history`).once('value').then(function (snapshot) {
        snapshot.forEach(x => {
          var updated = x.val();
          if (x.val().user === personLeaving) {
            updated = {'user': personLeaving, 'joined': x.val().joined, 'left': date, 'created': x.val().created};
          }
          if (newHistory.indexOf(updated) === -1) {
            newHistory.push(updated);
          }
        });

        updates[`/groups/${group_id}/history/`] = newHistory; //update group history
        updates[`/users/${user}/groups/${group_id}`] = null; // Remove group from user entry
        updates[`/groups/${group_id}/users/`] = user_difference; // Remove from group page
        firebase.database().ref().update(updates);
        res.send({'user_ids': user_difference});
      });
    });
  });
});

app.post('/comment_on_feed', async function (req, res, next) {
  var user = firebase.auth().currentUser.uid;
  var comment = req.body.comment;
  var feedItemUser = req.body.postId.replace(/.*\./, '');
  var historyItem = req.body.postId.replace(/\..*/, '');
  var date = req.body.timestamp;
  console.log('comment: ' + comment + ' feedItemUser: ' + feedItemUser + ' historyItem: ' + historyItem + ' date: ' + date);

  var updates = {};
  firebase.database().ref('/users/' + user).once('value').then(function(snapshot) {
    var first = snapshot.val().firstName;
    var last = snapshot.val().lastName;
    var person = first + ' ' + last;

    //add new comment to the historyItem of feedItemUser
    var newCommentId = firebase.database().ref(`/users/${feedItemUser}/history/${historyItem}/comments`).push().key;
    var c = {
      'poster': person,
      'comment': comment,
      'date': date
    };
    console.log('adding comment: ' + c);
    updates[`/users/${feedItemUser}/history/${historyItem}/comments/${newCommentId}`] = c;
    firebase.database().ref().update(updates);
    res.send({'me': person, 'id': newCommentId});
    console.log('success');
  });

});

app.post('/delete_comment_on_feed', async function (req, res, next) {
  var user = firebase.auth().currentUser.uid;
  var commId = req.body.comm;
  var userId = req.body.user;
  var historyId = req.body.history;
  console.log('comm: ' + commId + ' userId: ' + userId + ' historyId: ' + historyId);

  //delete comment from the historyId of userId
  firebase.database().ref(`/users/${userId}/history/${historyId}/comments/${commId}`).remove();

  res.send({'removed': 'success'});
  console.log('success');
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
      res.send({'userList': userList, 'myuid': firebase.auth().currentUser.uid});
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
  var num, first, last, history;
  try {
    var numMembers = 0;
    var memberIds = [];
    var members = {};

    firebase.database().ref('/groups/' + id).once('value').then(function(snapshot) {
      memberIds = snapshot.val().users;
      numMembers = snapshot.val().users.length;
      history = snapshot.val().history;
      console.log(`number of users: ${num}`);
    });


    var usersRef = firebase.database().ref('/users').once('value').then(function(snapshot){
      //console.log(snapshot.val());
      snapshot.forEach(function(childSnapshot) {
        var userId = childSnapshot.val().userId;
        if (memberIds.indexOf(userId) !== -1) { // If user id is in memberIds, add to memberNames
          var first = childSnapshot.val().firstName;
          var last = childSnapshot.val().lastName;
          var name = first + ' ' + last;
          var balance = childSnapshot.val().balance;

          members[userId] = {
            name: name,
            balance: balance,
          }
        }
      });

      // MOCK DATA - TODO REMOVE
      /*members['User1'] = {
        name: 'User 1',
        balance: '123'
      };
      members['User2'] = {
        name: 'User 2',
        balance: '456'
      };*/

      // Generates an array of member user ids in alphabetical order
      var memberNameIds = Object.keys(members).sort(function (a, b) {
        return members[a].name - members[b].name;
      });

      // Generate leaderboard based on balance - TODO use better formula
      // This generates an array of member user ids in descending order of balance
      var leaderboardIds = Object.keys(members).sort(function (a, b) {
        return members[b].balance - members[a].balance;
      });

      res.send({
        'numMembers': numMembers,
        'members': members,
        'memberNameIds': memberNameIds,
        'leaderboardIds': leaderboardIds,
        'history': history
      });
    });
    console.log('success');
  } catch (e) {
    console.log('fail');
    console.error(e);
    res.send({
      'numMembers': 'Unknown',
      'members': {},
      'memberNameIds': [],
      'leaderboardIds': [],
      'history': []
    });
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
                tradeAmount: tradeAmount,
                companyName: companyName,
                companyCode: companyCode,
                date: Date.now(),
                type: type,
                num_units: num_units,
                share_price: share_price
            });
            var ref = firebase.database().ref(`users/${user}/balance`);
            ref.once('value', function(snapshot) {
                // console.log(snapshot.val());
                var newBalance = snapshot.val() - tradeAmount;
                var finalBalance = newBalance.toFixed(2);
                firebase.database().ref(`users/${user}`).update({balance: finalBalance})
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
