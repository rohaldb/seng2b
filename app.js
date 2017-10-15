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

// uncomment for easy sign in .. replace username and password
// firebase.auth().signInWithEmailAndPassword("test@gmail.com", "minimini").catch(function(error) {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // ...
// });


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
        const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
        if (result) {
            console.log(result.uid)
            await firebase.database().ref(`users/${result.uid}`).set({
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
            var purchases = snapshot.val().purchases;
            var groups;
            if (snapshot.val().groups != null) {
                groups = snapshot.val().groups[Object.keys(snapshot.val().groups)[0]];
            } else {
                groups = [];
            }
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
    res.contentType('json');
    try {
        var user = firebase.auth().currentUser.uid;
        console.log("current user = " + user);
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
                    type: x.val().type
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
    res.contentType('json');
    try {
        var user = firebase.auth().currentUser.uid;
        console.log("current user = " + user);
        var userId = firebase.auth().currentUser.uid;
        var historyList = []
        firebase.database().ref(`/users/${userId}/history/`).once('value').then(function(snapshot) {
            snapshot.forEach(x => {
                historyList.push({
                    companyCode: x.val().companyCode,
                    companyName: x.val().companyName
                })
            })
            // console.log(historyList)
            for (let items of historyList) {
                console.log(items)
            }
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
        var user = firebase.auth().currentUser.uid;
        console.log("current user = " + user);
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
            // console.log(watchList)
            for (let items of watchList) {
                console.log(items)
            }
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
    console.log("Stock to close:");
    console.log(item);
    res.contentType('json');
    try {
        // item.profit_loss_dollars
        var user = firebase.auth().currentUser.uid;
        console.log("current user = " + user);
        var userId = firebase.auth().currentUser.uid;
        firebase.database().ref(`users/${user}/history`).push({
            tradeAmount: item.trade_amount,
            companyName: item.companyName,
            companyCode: item.companyCode,
            date: Date.now(),
            type: item.type,
            num_units: item.num_units,
            profit_loss_dollars: item.profit_loss_dollars,
            profit_loss_percent: item.profit_loss_percent
        });

        firebase.database().ref(`/users/${userId}/purchases/`).once('value').then(function(snapshot) {
            var getPurchsaseId;
            snapshot.forEach(x => {
                if (item.companyCode == x.val().companyCode && x.val().num_units == item.num_units && x.val().date == item.date) {
                    console.log("remove this item");
                    getPurchsaseId = x.key
                }
            });
            console.log("Purchase id");
            console.log(getPurchsaseId)
            firebase.database().ref(`users/${user}/purchases/${getPurchsaseId}`).remove();
        });

        var ref = firebase.database().ref(`users/${user}/balance`);
        ref.once('value', function(snapshot) {
            console.log(snapshot.val());
            // var newBalance = snapshot.val();
            // var worth = item.profit_loss_percent*item.value
            var i = parseFloat(item.trade_amount);
            var newBalance = parseFloat(snapshot.val() + i).toFixed(2);
            // var newBalance = parseFloat(snapshot.val() + item.profit_loss_dollars).toFixed(2);
            firebase.database().ref(`users/${user}`).update({balance: newBalance})
        });
        res.send({'closed': true});
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
    var type = req.body.type;
    res.contentType('json');
    try {
        var user = firebase.auth().currentUser.uid;
        console.log("current user = " + user);
        var userId = firebase.auth().currentUser.uid;
        var ref = firebase.database().ref(`users/${user}/groups`);
        ref.once('value', function(snapshot) {
            var groups = snapshot.val();
            if (snapshot.val() != null) {
                groups = snapshot.val().groups[Object.keys(snapshot.val().groups)[0]];
                groups['name'] = name;
            } else {
                groups = {'name': name};
            }
            // console.log(JSON.stringify(groups));
            firebase.database().ref(`users/${user}/groups`).update({'groups': groups});
        });
        res.send({'new-group': true});
        console.log('success');
    } catch (e) {
        console.log('fail');
        console.error(e);
        res.send({'new-group': false});
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
