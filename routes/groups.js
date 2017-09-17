var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('groups', {
        title: 'NewStock - Groups - ' + req.query.group,
        group: req.query.group,
        css: [
            // AMCHARTS
            "https://www.amcharts.com/lib/3/plugins/export/export.css",
            "amcharts/style.css",
            // AUTOCOMPLETE
            "autocomplete/easy-autocomplete.min.css",
            "autocomplete/easy-autocomplete.themes.min.css",
        ],
        js: [
            // AMCHARTS
            "amcharts/amcharts.js",
            "amcharts/serial.js",
            "amcharts/amstock.js",
            "https://www.amcharts.com/lib/3/plugins/export/export.min.js",
            // Autocomplete
            "autocomplete/jquery.easy-autocomplete.min.js",
            // Local files
            "js/charts.js",
            "js/stock.js",
        ],
        code: req.params.code,
    });
});

module.exports = router;
