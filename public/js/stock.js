$('.modal').modal();

var vue = new Vue({
  el: '#elem1',
  data: {
    amount: 5,
    dollars: false,
    trade_cost: 0,
    message: "Change to Dollars",
    share_price: "Loading",
    stock_symbol: getUrlParameter('stock'),
    company_name: getUrlParameter('company'),
    long: null,
    balance: 10000,
    share_percent_change: 0,
    showSpinner3: false,
    showSpinner2: true,
    showSpinner1: true,
    showSpinner0: true,
    showG4: false,
    errorMessage: "",
    stock1data: {},
    stock1name: getUrlParameter('company'),
    stock2data: {},
    stock2name: '',
    show: false,
  },
  methods: {
    addToWatchList: function() {
      var data = {
        adam: "the great",
        companyCode: getUrlParameter('stock'),
        companyName: getUrlParameter('company')
      };
      $.ajax({
        url: "/add_To_Watch_List",
        method: "POST",
        data: data,
        dataType: "json",
        success: function(response) {
          Materialize.toast('Added to watchlist', 1250);
        }
      });
    },
    toggleMessage: function() {
      if (this.dollars == false) {
        this.dollars = true;
        this.message = "Change to Units";
        this.amount = 0;
      } else {
        this.dollars = false;
        this.message = "Change to Dollars";
        this.amount = 0;
      }
    },
    tryIncreaseAmount: function() {
      this.amount++;
    },
    buyStock: function() {
      var data = {
        companyCode: this.stock_symbol,
        companyName: this.company_name,
        tradeAmount: this.balance - this.balanceAfterTransaction,
        share_price: this.share_price
      };
      if (this.long) {
        data.type = "long"
      } else {
        data.type = "short"
      }
      if (this.dollars) {
        data.num_units = parseFloat(this.amount / this.share_price)
      } else {
        data.num_units = parseFloat(this.amount)
      }
      $.ajax({
        url: "/purchase_stock",
        method: "POST",
        data: data,
        dataType: "json",
        success: function(response) {
          console.log("success, result = " + JSON.stringify(response));
          Materialize.toast('Trade successful', 1250)
          if (data.type == "long") {
            vue.balance -= data.tradeAmount;
          }
          vue.appendToSideBar();
        }
      });
    },
    appendToSideBar: function() {
      sidebarVue.purchaseList.push({
          companyCode: this.stock_symbol,
          companyName: this.company_name
      });
    }
  },
  computed: {
    calculatedCost: function() {
      if (this.dollars) {
        return parseFloat(this.amount / this.share_price)
      } else {
        return parseFloat(this.amount * this.share_price)
      }
    },
    balanceAfterTransaction: function() {
      if (this.dollars) {
        return (this.balance - this.amount)
      } else {
        return (parseFloat(this.balance) - this.calculatedCost)
      }
    }
  },
  watch: {
    amount: function(newValue, oldValue) {
    if (this.dollars && (this.balance - newValue) < 0) {
        this.amount = oldValue;
      } else if (!this.dollars && (this.balance - this.calculatedCost) < 0) {
        this.amount = oldValue;
      } else if (newValue < 0) {
        this.amount = 0;
      }
    }
  },
  mounted() {
    $('.modal').modal();
  }
});

$("#getUserInfo").on("click", function() {
  $.ajax({
    url: "/purchase_stock",
    method: "POST",
    data: "adam",
    dataType: "json",
    success: function(response) {
      console.log("success, result = " + JSON.stringify(response));
    }
  });
});

$("#confirm-buy").on("click", function() {});

$.ajax({
    url: "/get_user_info",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        vue.balance = response.balance;
    },
    error: function(response) {
        console.log("failed, result = " + JSON.stringify(response));
    }
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
  $.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=1min&symbol=" + code + "&apikey=2V4IGWVZ6W8XS8AI", function(data, status) {
    console.log(data);
    data = Object.values(data)[1];
    if (jQuery.isEmptyObject(data)) {console.warn("If you see me then no stock data has been returned.");}
    var chartData = generateChartData(data, 1);
    $("#company-name").text(stockInfo.Symbol + " | " + stockInfo.Name);
    vue.share_price = parseFloat(chartData[chartData.length - 1].close).toFixed(2);
    vue.share_percent_change  = ((chartData[chartData.length - 1].close - chartData[0].close)/chartData[0].close)*100;
    console.log(vue.share_percent_change);
  });
  console.log(code);
  $.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + code + "&apikey=2V4IGWVZ6W8XS8AI", function(data, status) {
    console.log(data);
    data = Object.values(data)[1];
    if (jQuery.isEmptyObject(data)) {console.warn("If you see me then no stock data has been returned.");}
    var chartData = generateChartData(data, 2, sentimentsJSON);
  });
}

function generateChartData(data, type, sentimentsJSON) {
  var chartData = [];
  //extract date from object
  $(data).each(function(i, val) {
    $.each(val, function(key, val) {
      chartData.unshift({
        "date": key,
        "value": parseFloat(val["4. close"]),
        "open": parseFloat(val["1. open"]),
        "high": parseFloat(val["2. high"]),
        "low": parseFloat(val["3. low"]),
        "close": parseFloat(val["4. close"]),
        "volume": parseFloat(val["5. volume"])
      });
    });
  });
  if (type == 1) {
    generateIntradayChart(chartData);
  }
  else if (type == 2) {
    generateCandlestickChart(chartData);
    getStockEventChart(chartData, sentimentsJSON);
    vue.stock1data = chartData;
  } else if (type == 3) {
    vue.stock2data = chartData;
    generateCompare()
  }
  return chartData;
}

function getStockEventChart(chartData, sentimentsJSON) {

  // convert sentiments to correct format
  events = [];
  for (var i = 0, len = sentimentsJSON.sentiments.length; i < len; i++) {
    event = {
      "date": sentimentsJSON.sentiments[i].date,
      "type": "sign",
      "graph": "g1",
      "description": sentimentsJSON.sentiments[i].title,
      "url": sentimentsJSON.sentiments[i].url,
      "urlTarget": "_blank"
    }
    if (sentimentsJSON.sentiments[i].label == "positive") {
      event["type"] = "arrowUp";
      event["backgroundColor"] = "#2bbbad";
    } else {
      event["type"] = "arrowDown";
      event["backgroundColor"] = "#e51c23";
    }
    events.push(event);
  }

  var chart = AmCharts.makeChart("chartdiv3", {
    "type": "stock",
    "theme": "light",
    "dataSets": [
      {
        "color": "#b0de09",
        "fieldMappings": [
          {
            "fromField": "value",
            "toField": "value"
          }, {
            "fromField": "volume",
            "toField": "volume"
          }
        ],
        "dataProvider": chartData,
        "categoryField": "date",
        // EVENTS
        "stockEvents": events
      }
    ],

    "panels": [
      {
        "title": "Value",
        "stockGraphs": [
          {
            "id": "g1",
            "valueField": "value"
          }
        ],
        "stockLegend": {
          "valueTextRegular": " ",
          "markerType": "none"
        }
      }
    ],

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
      "periods": [
        {
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
        }
      ]
    },

    "panelsSettings": {
      "usePrefixes": true
    },
    "export": {
      "enabled": true
    }
  });
  vue.showSpinner2 = false;
}

function generateCandlestickChart(chartData) {
  var chart = AmCharts.makeChart("chartdiv2", {
    "type": "serial",
    "theme": "light",
    "dataDateFormat": "YYYY-MM-DD",
    "valueAxes": [
      {
        "position": "left"
      }
    ],
    "graphs": [
      {
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
      }
    ],
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
  });

  vue.showSpinner1 = false;
  chart.addListener("rendered", zoomChart);
  zoomChart();
  // this method is called when chart is first inited as we listen for "dataUpdated" event
  function zoomChart() {
    // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
    chart.zoomToIndexes(chart.dataProvider.length - 50, chart.dataProvider.length - 1);
  }
}

function generateIntradayChart(chartData) {
  var chart = AmCharts.makeChart("chartdiv1", {
    "type": "stock",
    "theme": "light",
    "categoryAxesSettings": {
      "minPeriod": "mm"
    },
    "stockEvents": [
      {
        "date": new Date(2017, 9, 3, 15),
        "type": "sign",
        "backgroundColor": "#85CDE6",
        "graph": "g1",
        "text": "S",
        "description": "This is description of an event"
      }
    ],
    "dataSets": [
      {
        "color": "#b0de09",
        "fieldMappings": [
          {
            "fromField": "value",
            "toField": "value"
          }, {
            "fromField": "volume",
            "toField": "volume"
          }
        ],
        "dataProvider": chartData,
        "categoryField": "date"
      }
    ],

    "panels": [
      {
        "showCategoryAxis": false,
        "title": "Value",
        "percentHeight": 70,

        "stockGraphs": [
          {
            "id": "g1",
            "valueField": "value",
            "type": "smoothedLine",
            "lineThickness": 2,
            "bullet": "round"
          }
        ],
        "stockLegend": {
          "valueTextRegular": " ",
          "markerType": "none"
        }
      }, {
        "title": "Volume",
        "percentHeight": 30,
        "stockGraphs": [
          {
            "valueField": "volume",
            "type": "column",
            "cornerRadiusTop": 2,
            "fillAlphas": 1
          }
        ],

        "stockLegend": {
          "valueTextRegular": " ",
          "markerType": "none"
        }
      }
    ],

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
      "periods": [
        {
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
        }
      ]
    },

    "panelsSettings": {
      "usePrefixes": true
    },

    "export": {
      "enabled": true,
      "position": "bottom-right"
    }
  });
  vue.showSpinner0 = false;
}
$(function() {
  $('input.autocomplete2').autocomplete({
    data: company_keys,
    limit: 3, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function(val) {
      vue.showSpinner3 = true;
      vue.showG4 = false;
      vue.stock2name = val.split(' - ')[1];
      $.get("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + val.split(' ')[0] + "&apikey=2V4IGWVZ6W8XS8AI", function(data, status) {
        console.log(data);
        data = Object.values(data)[1];
        if (jQuery.isEmptyObject(data)) {console.warn("If you see me then no stock data has been returned.");}
        var chartData = generateChartData(data, 3);
      });
    },
    minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
  });
});

function generateCompare(){
  var chart = AmCharts.makeChart( "chartdiv4", {
    "type": "stock",
    "theme": "light",
    "dataSets": [ {
      "fieldMappings": [ {
        "fromField": "open",
        "toField": "open"
      }, {
        "fromField": "close",
        "toField": "close"
      }, {
        "fromField": "high",
        "toField": "high"
      }, {
        "fromField": "low",
        "toField": "low"
      }, {
        "fromField": "volume",
        "toField": "volume"
      }, {
        "fromField": "value",
        "toField": "value"
      } ],
      "color": "#7f8da9",
      "dataProvider": vue.stock1data,
      "title": vue.stock1name,
      "categoryField": "date"
    }, {
    "fieldMappings": [ {
      "fromField": "value",
      "toField": "value"
    } ],
    "color": "#fac314",
    "dataProvider": vue.stock2data,
    "compared": true,
    "title": vue.stock2name,
    "categoryField": "date"
  } ],


    "panels": [ {
        "title": "Value",
        "showCategoryAxis": false,
        "percentHeight": 70,
        "valueAxes": [ {
          "id": "v1",
          "dashLength": 5
        } ],

        "categoryAxis": {
          "dashLength": 5
        },

        "stockGraphs": [ {
          "type": "candlestick",
          "id": "g1",
          "openField": "open",
          "closeField": "close",
          "highField": "high",
          "lowField": "low",
          "valueField": "close",
          "lineColor": "#7f8da9",
          "fillColors": "#7f8da9",
          "negativeLineColor": "#db4c3c",
          "negativeFillColors": "#db4c3c",
          "fillAlphas": 1,
          "useDataSetColors": false,
          "comparable": true,
          "compareField": "value",
          "showBalloon": false,
          "proCandlesticks": true
        } ],

        "stockLegend": {
          "valueTextRegular": undefined,
          "periodValueTextComparing": "[[percents.value.close]]%"
        }
      },

      {
        "title": "Volume",
        "percentHeight": 30,
        "marginTop": 1,
        "showCategoryAxis": true,
        "valueAxes": [ {
          "dashLength": 5
        } ],

        "categoryAxis": {
          "dashLength": 5
        },

        "stockGraphs": [ {
          "valueField": "volume",
          "type": "column",
          "showBalloon": false,
          "fillAlphas": 1
        } ],

        "stockLegend": {
          "markerType": "none",
          "markerSize": 0,
          "labelText": "",
          "periodValueTextRegular": "[[value.close]]"
        }
      }
    ],

    "chartScrollbarSettings": {
      "graph": "g1",
      "graphType": "line",
      "usePeriod": "WW"
    },

    "chartCursorSettings": {
      "valueLineBalloonEnabled": true,
      "valueLineEnabled": true
    },

    "periodSelector": {
      "position": "bottom",
      "periods": [ {
        "period": "DD",
        "count": 10,
        "label": "10 days"
      }, {
        "period": "MM",
        "selected": true,
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
    "export": {
      "enabled": true
    }
  } );
  vue.showSpinner3 = false;
  vue.showG4 = true;
}
