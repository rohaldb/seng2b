var vue = new Vue({
    el: '#elem1',
    data: {
        purchaseList: [],
        historyList: [],
        watchList: [],
        balance: 0,
    },
    methods: {
        closeTrade: function (item) {
            getStockPriceOf(item.companyCode, 1, 2);
            $.ajax({
                url: "/close_trade",
                method: "POST",
                data: item,
                dataType: "json",
                success: function(response) {
                    var index = vue.purchaseList.indexOf(item);
                    if (index > -1) {
                        vue.purchaseList.splice(index, 1);
                    }
                    vue.historyList.push(item);
                    var index = vue.historyList.indexOf(item);
                    if (index > -1) {
                        var d = new Date(item.date);
                        var date = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();

                        vue.historyList[index].date = date;
                    }


                    vue.balance = parseFloat(vue.balance) + parseFloat(item.trade_amount)
                    sidebarVue.removeItemFromList(item.companyCode, item.companyName)
                },
                error: function(response) {
                    console.log("failed, result = " + JSON.stringify(response));
                }
            });
        },
        removeFromWatchList: function (item) {
            console.log(item)
            $.ajax({
                url: "/remove_from_watchlist",
                method: "POST",
                data: item,
                dataType: "json",
                success: function(response) {
                    var index = vue.watchList.indexOf(item);
                    if (index > -1) {
                        vue.watchList.splice(index, 1);
                    }
                    // vue.balance = parseFloat(vue.balance) + parseFloat(item.trade_amount)
                    // sidebarVue.removeItemFromList(item.companyCode, item.companyName)
                },
                error: function(response) {
                    console.log("failed, result = " + JSON.stringify(response));
                }
            });
        },
        get_url: function (item) {
            getStockPriceOf(item.companyCode, 1, 2);
            $.ajax({
                url: "/close_trade",
                method: "POST",
                data: item,
                dataType: "json",
                success: function(response) {
                    console.log("success, result = " + JSON.stringify(response));
                    var index = vue.purchaseList.indexOf(item);
                    if (index > -1) {
                        vue.purchaseList.splice(index, 1);
                    }
                },
                error: function(response) {
                    console.log("failed, result = " + JSON.stringify(response));
                }
            });
        },
        get_url: function (item) {
            string = "/stock?stock=" + item.companyCode + "&company=" + item.companyName;
            return string;
        }
    },
    computed: {

    },
    mounted: function() {
        $("#edit-bio").modal();
    }
})

//change profile image
function newImg(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      $('#profile-image').attr('src', e.target.result);
      //TODO: firebase backend
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function getStockPriceOf(code, index, type) {
    $.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + code + "&interval=1min&outputsize=compact&apikey=2V4IGWVZ6W8XS8AI", function(data, status){
        data = Object.values(data)[1];
        if (jQuery.isEmptyObject(data)) {console.warn("If you see me then no stock data has been returned.");}
        extractedData = [];
        $(data).each(function(i,val) {
            $.each(val,function(key,val) {
                extractedData.unshift( {
                    "date": key,
                    "value": parseFloat(val["4. close"]),
                    "open": parseFloat(val["1. open"]),
                    "high": parseFloat(val["2. high"]),
                    "low": parseFloat(val["3. low"]),
                    "close" : parseFloat(val["4. close"]),
                    "volume": parseFloat(val["5. volume"])
                } );
                // return 0;
            });
        });
        if (type == 0) {
            if (extractedData[0].close) {
                profitLoss(index, extractedData[extractedData.length - 1].close);
                console.log(extractedData[extractedData.length - 1].close);
                // return extractedData[extractedData.length - 1].close;
            } else {console.warn("Couldnt find stock price");}
        } else if (type == 1) {
            vue.watchList[index].value = extractedData[extractedData.length - 1].close;
        }
    });
}

function profitLoss(index, current) {
    var element = vue.purchaseList[index];
    var tradeValue = current * element.num_units;
    element.value = tradeValue;
    element.profit_loss_dollars = (tradeValue - element.trade_amount);
    if (-0.0001 < element.profit_loss_dollars  && element.profit_loss_dollars < 0.001) {
        element.profit_loss_dollars = 0;
    }
    element.profit_loss_percent = ((element.profit_loss_dollars/element.trade_amount)*100);
}

$.ajax({
    url: "/get_user_purchase_history",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        response.historyList.forEach(function (item, index) {
            var d = new Date(item.date);
            var date = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
            console.log(item.num_units)
            vue.historyList.push({
                companyCode: item.companyCode,
                companyName: item.companyName,
                num_units: parseFloat(item.num_units),
                trade_amount: parseFloat(item.tradeAmount),
                type: item.type,
                current: 0,
                date: date,
                value: 0,
                profit_loss_dollars: parseFloat(item.profit_loss_dollars),
                profit_loss_percent: parseFloat(item.profit_loss_percent)
            });
        });
    },
    error: function(response) {
        console.log("failed History, result = " + JSON.stringify(response));
    }
});

$.ajax({
    url: "/get_user_purchases",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        response.purchaseList.forEach(function (item, index) {
            var d = new Date(item.date);
            var date = d.getDate() + '/' + (d.getMonth()+1) + '/' + d.getFullYear();
            getStockPriceOf(item.companyCode,index, 0);
            vue.purchaseList.push({
                companyCode: item.companyCode,
                companyName: item.companyName,
                num_units: parseFloat(item.num_units),
                trade_amount: parseFloat(item.tradeAmount),
                type: item.type,
                current: 0,
                date: item.date,
                value: 0,
                profit_loss_dollars: 0,
                profit_loss_percent: 0,
            });
        });
    },
    error: function(response) {
        console.log("failed Purchases, result = " + JSON.stringify(response));
    }
});

$.ajax({
    url: "/get_user_watchList",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        response.watchList.forEach(function (item, index) {
            getStockPriceOf(item.companyCode, index, 1);
            vue.watchList.push({
                companyCode: item.companyCode,
                companyName: item.companyName,
                value: 0
            });
        });
    },
    error: function(response) {
        console.log("failed Watch, result = " + JSON.stringify(response));
    }
});

//display profile information in top banner
$.ajax({
    url: "/get_user_info",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        $('#profile-name').text(response.name);
        vue.balance = parseFloat(response.balance);
        $('#display-bio').text(response.bio);
        if (response.bio !== 'No bio yet.') {
            $('#new-bio-text').text(response.bio);
        }
        $('#new-bio-text').trigger('autoresize');
    },
    error: function(response) {
        console.log("failed, result = " + JSON.stringify(response));
    }
});

stockValue = 0;
$("#addValue").on("click", function() {
    $("#tradeAmount").val(parseInt($("#tradeAmount").val()) + 1);
});
$("#subtractValue").on("click", function() {
    $("#tradeAmount").val(parseInt($("#tradeAmount").val()) - 1);
});

//update user's bio in firebase and update displayed bio
$("#update-bio").on("click", function() {
  var bio = $('#new-bio-text').val();
  if (bio.match(/^\s*$/)) {
    Materialize.toast('Please enter a bio first', 1250);
    $('#new-bio-text').val('');
    $('#new-bio-text').trigger('autoresize');
    return;
  } else {
    bio = bio.replace(/\s+/g, ' ').trim();
    $('#new-bio-text').val(bio);
    $('#new-bio-text').trigger('autoresize');
  }
  var data = {
    'bio': bio
  };
  console.log(data);
  $.ajax({
    url: "/update_bio",
    method: "POST",
    data: data,
    dataType: "json",
    success: function(response) {
      console.log("success, result = " + JSON.stringify(response));
      Materialize.toast('Profile bio updated', 1250);
      $('#display-bio').text(bio);
    },
    error: function(response) {
      Materialize.toast('Could not update bio', 1250);
      console.log("failed, result = " + JSON.stringify(response));
    }
  });
});
