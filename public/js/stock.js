$('.modal').modal();

stockValue = 0;
$("#addValue").on("click", function() {
  $("#tradeAmount").val(parseInt($("#tradeAmount").val()) + 1);
});
$("#subtractValue").on("click", function() {
  $("#tradeAmount").val(parseInt($("#tradeAmount").val()) - 1);
});


var dollar = true;
$("#toggleUnits").on("click", function() {
  if (dollar) {
    dollar = false;
    $(this).text("Units");
  } else {
    dollar = true;
    $(this).text("Dollars");
  }
});

//getStockPriceOf(companies[getUrlParameter('stock') + " - " + getUrlParameter('company')]);
function getStockPriceOf(stockInfo, sentimentsJSON) {
  var code = stockInfo.Symbol;
  $.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=1min&symbol=" + code + "&apikey=2V4IGWVZ6W8XS8AI", function(data, status){
    console.log(data);
    data = Object.values(data)[1];
    var chartData = generateChartData(data, 1);
    $("#company-name").text(stockInfo.Symbol + " | " + stockInfo.Name);

    $(".company-price").each(function( index ) {
      $( this ).text(chartData[chartData.length - 1].close);
    });

    // $("#company-change").text();
    stockValue = chartData[chartData.length - 1].close;
  });
  console.log(code);
  $.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + code + "&apikey=2V4IGWVZ6W8XS8AI", function(data, status){
    console.log(data);
    data = Object.values(data)[1];
    var chartData = generateChartData(data, 2,sentimentsJSON);
  });
}

function generateChartData(data, type,sentimentsJSON) {
  var chartData = [];
  //extract date from object
  $(data).each(function(i,val){
    $.each(val,function(key,val){
          chartData.unshift( {
            "date": key,
            "value": parseFloat(val["4. close"]),
            "open": parseFloat(val["1. open"]),
            "high": parseFloat(val["2. high"]),
            "low": parseFloat(val["3. low"]),
            "close" : parseFloat(val["4. close"]),
            "volume": parseFloat(val["5. volume"])
          } );
    });
  });
  console.warn("" + chartData[0].date);
  if (type == 1) { generateIntradayChart(chartData);}
  if (type == 2) { generateCandlestickChart(chartData); getStockEventChart(chartData,sentimentsJSON);}
  return chartData;
}


function getStockEventChart(chartData,sentimentsJSON) {

// convert sentiments to correct format
console.log(sentimentsJSON);
events = [];
for (var i = 0, len = sentimentsJSON.sentiments.length; i < len; i++) {
  event = {
    "date": sentimentsJSON.sentiments[i].date,
    "type": "sign",
    "graph": "g1",
    "description": sentimentsJSON.sentiments[i].title,
    "url": sentimentsJSON.sentiments[i].url,
    "urlTarget": "_blank",
  }
  if (sentimentsJSON.sentiments[i].label == "positive") {
    event["type"] = "arrowUp";
    event["backgroundColor"] = "#2bbbad";
  }
  else {
    event["type"] = "arrowDown";
    event["backgroundColor"] = "#e51c23";
  }
  events.push(event);
}

var chart = AmCharts.makeChart( "chartdiv3", {
  "type": "stock",
  "theme": "light",
  "dataSets": [ {
    "color": "#b0de09",
    "fieldMappings": [ {
      "fromField": "value",
      "toField": "value"
    }, {
      "fromField": "volume",
      "toField": "volume"
    } ],
    "dataProvider": chartData,
    "categoryField": "date",
    // EVENTS
    "stockEvents": events,
  } ],


  "panels": [ {
    "title": "Value",
    "stockGraphs": [ {
      "id": "g1",
      "valueField": "value"
    } ],
    "stockLegend": {
      "valueTextRegular": " ",
      "markerType": "none"
    }
  } ],

  "chartScrollbarSettings": {
    "graph": "g1"
  },

  "chartCursorSettings": {
    "valueBalloonsEnabled": true,
    "graphBulletSize": 1,
    "valueLineBalloonEnabled": true,
    "valueLineEnabled": true,
    "valueLineAlpha": 0.5
  },

  "periodSelector": {
    "periods": [ {
      "period": "DD",
      "count": 10,
      "label": "10 days"
    }, {
      "period": "MM",
      "count": 1,
      "label": "1 month"
    }, {
      "period": "YYYY",
      "count": 1,
      "label": "1 year"
    }, {
      "period": "YTD",
      "label": "YTD"
    }, {
      "period": "MAX",
      "label": "MAX"
    } ]
  },

  "panelsSettings": {
    "usePrefixes": true
  },
  "export": {
    "enabled": true
  }
} );
$("#graph3Loader").hide();

}

function generateCandlestickChart(chartData) {
  var chart = AmCharts.makeChart( "chartdiv2", {
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

  $("#graph2Loader").hide();
  chart.addListener( "rendered", zoomChart );
  zoomChart();
  // this method is called when chart is first inited as we listen for "dataUpdated" event
  function zoomChart() {
    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
    chart.zoomToIndexes( chart.dataProvider.length - 50, chart.dataProvider.length - 1 );
  }
}


function generateIntradayChart(chartData)  {
  var chart = AmCharts.makeChart( "chartdiv1", {
    "type": "stock",
    "theme": "light",
    "categoryAxesSettings": {
      "minPeriod": "mm"
    },
    "stockEvents": [ {
          "date": new Date( 2017, 9, 3, 15),
          "type": "sign",
          "backgroundColor": "#85CDE6",
          "graph": "g1",
          "text": "S",
          "description": "This is description of an event"
        }],
    "dataSets": [ {
      "color": "#b0de09",
      "fieldMappings": [ {
        "fromField": "value",
        "toField": "value"
      }, {
        "fromField": "volume",
        "toField": "volume"
      } ],
      "dataProvider": chartData,
      "categoryField": "date"
    } ],

    "panels": [ {
      "showCategoryAxis": false,
      "title": "Value",
      "percentHeight": 70,

      "stockGraphs": [ {
        "id": "g1",
        "valueField": "value",
        "type": "smoothedLine",
        "lineThickness": 2,
        "bullet": "round"
      } ],
      "stockLegend": {
        "valueTextRegular": " ",
        "markerType": "none"
      }
    }, {
      "title": "Volume",
      "percentHeight": 30,
      "stockGraphs": [ {
        "valueField": "volume",
        "type": "column",
        "cornerRadiusTop": 2,
        "fillAlphas": 1
      } ],

      "stockLegend": {
        "valueTextRegular": " ",
        "markerType": "none"
      }
    } ],

    "chartScrollbarSettings": {
      "graph": "g1",
      "usePeriod": "10mm",
      "position": "top"
    },

    "chartCursorSettings": {
      "valueBalloonsEnabled": true
    },

    "periodSelector": {
      "position": "top",
      "dateFormat": "YYYY-MM-DD JJ:NN",
      "inputFieldWidth": 150,
      "periods": [ {
        "period": "hh",
        "count": 1,
        "label": "1 hour"
      }, {
        "period": "hh",
        "count": 2,
        "label": "2 hours"
      }, {
        "period": "hh",
        "count": 5,
        "selected": true,
        "label": "5 hour"
      }, {
        "period": "hh",
        "count": 12,
        "label": "12 hours"
      }, {
        "period": "MAX",
        "label": "MAX"
      } ]
    },

    "panelsSettings": {
      "usePrefixes": true
    },

    "export": {
      "enabled": true,
      "position": "bottom-right"
    }
  } );
  $("#graph1Loader").hide();
}
