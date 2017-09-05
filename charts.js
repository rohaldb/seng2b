$(document).ready(function(){
    // $.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSFT&apikey=2V4IGWVZ6W8XS8AI", function(data, status){

    $("#search-stock").click(function() {
      var stock = $("#stock-name").val();
      console.warn("searching for " + stock);
      getStockPriceOf(stock);
    });

});

function getStockPriceOf(code) {
  $.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + code + "&interval=30min&apikey=2V4IGWVZ6W8XS8AI", function(data, status){
      var chartData = generateChartData(data);
  });
}

function generateChartData(data) {
  var chartData = [];
  $(data["Time Series (30min)"]).each(function(i,val){
    $.each(val,function(key,val){
          chartData.unshift( {
            "date": key,
            "value": parseFloat(val["1. open"]),
            "volume": parseFloat(val["5. volume"])
          } );
    });
  });

  generateChart(chartData);
}

function generateChart(chartData)  {
  console.log(chartData);

  var chart = AmCharts.makeChart( "chartdiv", {
    "type": "stock",
    "theme": "light",
    "categoryAxesSettings": {
      "minPeriod": "mm"
    },

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
}
