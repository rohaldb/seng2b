$('.modal').modal();

var vue = new Vue({
    el: '#elem1',
    data: {
        purchaseList: [],
        historyList: [],
        watchList: [],
    },
    methods: {
        closeTrade: function (item) {
            console.log("closing on item:");
        },
        get_url: function (item) {
            console.log(item);
            string = "/stock?stock=" + item.companyCode + "&company=" + item.companyName;
            return string;
        }
    },
    mounted: function() {
       $("#edit-bio").modal();
    }
})

function getStockPriceOf(code, index) {
    $.get("https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + code + "&interval=1min&outputsize=compact&apikey=2V4IGWVZ6W8XS8AI", function(data, status){
        data = Object.values(data)[1];
        extractedData = [];
        $(data).each(function(i,val){
            $.each(val,function(key,val){
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
        if (extractedData[0].close) {
            profitLoss(index, extractedData[extractedData.length - 1].close);
        } else {console.warn("Couldnt find stock price");}
    });
}

function profitLoss(index, current) {
    var element = vue.purchaseList[index];
    var tradeValue = current * element.num_units;
    element.value = tradeValue;
    element.profit_loss_dollars = (tradeValue - element.trade_amount);
    element.profit_loss_percent = (element.profit_loss_dollars/element.trade_amount);
}

$.ajax({
    url: "/get_user_purchases",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        response.purchaseList.forEach(function (item, index) {
            getStockPriceOf(item.companyCode,index);
            vue.purchaseList.push({
                companyCode: item.companyCode,
                companyName: item.companyName,
                num_units: parseFloat(item.num_units),
                trade_amount: parseFloat(item.tradeAmount),
                type: item.type,
                current: 0,
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
    url: "/get_user_purchase_history",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        $('#historyList').text(response.historyList);
        var historyList = response.historyList;
        for(let items of historyList) {
            vue.historyList.push({
                companyName: items.companyName,
                companyCode: items.companyCode,
                date: items.date,
                num_units: items.num_units,
                share_price: items.share_price,
                tradeAmount: items.tradeAmount,
                type: items.type
            })
        }
    },
    error: function(response) {
        console.log("failed History, result = " + JSON.stringify(response));
    }
});


$.ajax({
    url: "/get_user_watchList",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        $('#watchList').text(response.watchList);
        var watchList = response.watchList;
        for(let items of watchList) {
            vue.watchList.push({
                companyName: items.companyName,
                companyCode: items.companyCode
            })
        }
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
        $('#current-balance').text('$' + response.balance);
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
    var data = {
        'bio': bio
    };
    $.ajax({
        url: "/update_bio",
        method: "POST",
        data: data,
        dataType: "json",
        success: function(response) {
            $('#display-bio').text(bio);
            $('#next-bio-text').text(bio);
            $('#new-bio-text').trigger('autoresize');
        },
        error: function(response) {
            console.log("failed, result = " + JSON.stringify(response));
        }
    });
});
