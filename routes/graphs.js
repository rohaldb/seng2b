var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('graphs', { title: 'NewStock - Graphs',
        css: [
            // AMCHARTS
            "https://www.amcharts.com/lib/3/plugins/export/export.css",
            "amcharts/style.css",
            // AUTOCOMPLETE
            "autocomplete/easy-autocomplete.min.css",
            "autocomplete/easy-autocomplete.themes.min.css",
        ],
        js: [
            // JQuery
            "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js",
            // AMCHARTS
            "amcharts/amcharts.js",
            "amcharts/serial.js",
            "amcharts/amstock.js",
            "https://www.amcharts.com/lib/3/plugins/export/export.min.js",
            // Autocomplete
            "autocomplete/jquery.easy-autocomplete.min.js",
            // Local files
            "js/listofcompanies.js",
            "js/graphs.js",
            "js/charts.js",
        ],
    });
});

module.exports = router;
