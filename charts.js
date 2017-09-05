$(document).ready(function(){
    // $.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=2V4IGWVZ6W8XS8AI", function(data, status){
    getStockPriceOf("amzn");

    $("#search-stock").click(function() {
      var stock = $("#stock-name").val();
      console.warn("searching for " + stock);
      getStockPriceOf(stock);
    });

});

function getStockPriceOf(code) {
  $.get("https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=" + code + "&apikey=2V4IGWVZ6W8XS8AI", function(data, status){
      console.log(data);
      var chartData = generateChartData(data);

  });
}

function generateChartData(data) {
  var chartData = [];
  $(data["Weekly Time Series"]).each(function(i,val){
    $.each(val,function(key,val){
          chartData.unshift( {
            "date": key,
            "value": parseFloat(val["1. open"]),
            "open": parseFloat(val["1. open"]),
            "high": parseFloat(val["2. high"]),
            "low": parseFloat(val["3. low"]),
            "close" : parseFloat(val["4. close"]),
            "volume": parseFloat(val["5. volume"])
          } );
    });
  });

  generateChart(chartData);
}


function generateChart(chartData) {
  var chart = AmCharts.makeChart( "chartdiv", {
  "type": "serial",
  "theme": "light",
  "dataDateFormat":"YYYY-MM-DD",
  "valueAxes": [ {
    "position": "left"
  } ],
  "graphs": [ {
    "id": "g1",
    "proCandlesticks": true,
    "balloonText": "Open:<b>[[open]]</b><br>Low:<b>[[low]]</b><br>High:<b>[[high]]</b><br>Close:<b>[[close]]</b><br>",
    "closeField": "close",
    "fillColors": "#7f8da9",
    "highField": "high",
    "lineColor": "#7f8da9",
    "lineAlpha": 1,
    "lowField": "low",
    "fillAlphas": 0.9,
    "negativeFillColors": "#db4c3c",
    "negativeLineColor": "#db4c3c",
    "openField": "open",
    "title": "Price:",
    "type": "candlestick",
    "valueField": "close"
  } ],
  "chartScrollbar": {
    "graph": "g1",
    "graphType": "line",
    "scrollbarHeight": 30
  },
  "chartCursor": {
    "valueLineEnabled": true,
    "valueLineBalloonEnabled": true
  },
  "categoryField": "date",
  "categoryAxis": {
    "parseDates": true
  },
  "dataProvider": chartData,
  "export": {
    "enabled": true,
    "position": "bottom-right"
  }
} );

  chart.addListener( "rendered", zoomChart );
  zoomChart();
  // this method is called when chart is first inited as we listen for "dataUpdated" event
  function zoomChart() {
    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
    chart.zoomToIndexes( chart.dataProvider.length - 50, chart.dataProvider.length - 1 );
  }
}


// function generateChart(chartData)  {
//   console.log(chartData);
//
//   var chart = AmCharts.makeChart( "chartdiv", {
//     "type": "stock",
//     "theme": "light",
//     "categoryAxesSettings": {
//       "minPeriod": "mm"
//     },
//
//     "dataSets": [ {
//       "color": "#b0de09",
//       "fieldMappings": [ {
//         "fromField": "value",
//         "toField": "value"
//       }, {
//         "fromField": "volume",
//         "toField": "volume"
//       } ],
//       "dataProvider": chartData,
//       "categoryField": "date"
//     } ],
//
//     "panels": [ {
//       "showCategoryAxis": false,
//       "title": "Value",
//       "percentHeight": 70,
//
//       "stockGraphs": [ {
//         "id": "g1",
//         "valueField": "value",
//         "type": "smoothedLine",
//         "lineThickness": 2,
//         "bullet": "round"
//       } ],
//
//
//       "stockLegend": {
//         "valueTextRegular": " ",
//         "markerType": "none"
//       }
//     }, {
//       "title": "Volume",
//       "percentHeight": 30,
//       "stockGraphs": [ {
//         "valueField": "volume",
//         "type": "column",
//         "cornerRadiusTop": 2,
//         "fillAlphas": 1
//       } ],
//
//       "stockLegend": {
//         "valueTextRegular": " ",
//         "markerType": "none"
//       }
//     } ],
//
//     "chartScrollbarSettings": {
//       "graph": "g1",
//       "usePeriod": "10mm",
//       "position": "top"
//     },
//
//     "chartCursorSettings": {
//       "valueBalloonsEnabled": true
//     },
//
//     "periodSelector": {
//       "position": "top",
//       "dateFormat": "YYYY-MM-DD JJ:NN",
//       "inputFieldWidth": 150,
//       "periods": [ {
//         "period": "hh",
//         "count": 1,
//         "label": "1 hour"
//       }, {
//         "period": "hh",
//         "count": 2,
//         "label": "2 hours"
//       }, {
//         "period": "hh",
//         "count": 5,
//         "selected": true,
//         "label": "5 hour"
//       }, {
//         "period": "hh",
//         "count": 12,
//         "label": "12 hours"
//       }, {
//         "period": "MAX",
//         "label": "MAX"
//       } ]
//     },
//
//     "panelsSettings": {
//       "usePrefixes": true
//     },
//
//     "export": {
//       "enabled": true,
//       "position": "bottom-right"
//     }
//   } );
// }
