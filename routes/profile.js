var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('profile', {
        title: 'NewStock - Profile',
        group: req.query.group,
        css: [
            // AMCHARTS
            "https://www.amcharts.com/lib/3/plugins/export/export.css",
            "amcharts/style.css",
        ],
        js: [
            "js/profile.js",
        ],
    });
});

module.exports = router;
