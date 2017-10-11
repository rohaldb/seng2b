var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'NewStock - Home',
        js: [
            "js/sidebar.js"
        ]
    });
});

module.exports = router;
