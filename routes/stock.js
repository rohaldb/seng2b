var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(req.query);
    console.warn("benebnebebs");
    res.render('stock', {
        title: 'NewStock - Stock',
        css: [
            // AMCHARTS
            "https://www.amcharts.com/lib/3/plugins/export/export.css",
            "amcharts/style.css",
        ],
        js: [
            // AMCHARTS
            "amcharts/amcharts.js",
            "amcharts/serial.js",
            "amcharts/amstock.js",
            "https://www.amcharts.com/lib/3/plugins/export/export.min.js",
            // Local files
            "js/charts.js",
            "js/stock.js",
            "js/info.js", //company info
        ],
        stock: req.query.stock,
        company: req.query.company,
    });
});

module.exports = router;
