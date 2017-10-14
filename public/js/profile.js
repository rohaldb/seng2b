$('.modal').modal();

var vue = new Vue({
    el: '#elem1',
    data: {
        purchaseList: [],
        historyList: [],
        watchList: [],
    }
})

$.ajax({
    url: "/get_user_purchases",
    method: "POST",
    data: '',
    dataType: "json",
    success: function(response) {
        vue.purchaseList = response.purchaseList;
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
        console.log("success History, result = " + JSON.stringify(response));
        $('#historyList').text(response.historyList);
        var historyList = response.historyList;
        console.log("Here are your History results");
        for(let items of historyList) {
            console.log(items.companyName);
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
        console.log("print vue lsit")
        console.log(vue.historyList)
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
        console.log("success Watch, result = " + JSON.stringify(response));
        $('#watchList').text(response.watchList);
        var watchList = response.watchList;
        console.log("Here are your Watch results");
        for(let items of watchList) {
            console.log(items.companyName);
            vue.watchList.push({
                companyName: items.companyName,
                companyCode: items.companyCode
            })
        }
        console.log("print vue lsit")
        console.log(vue.watchList)
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
        console.log("hi ad")
        console.log("success, result = " + JSON.stringify(response));
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
    console.log(data);
    $.ajax({
        url: "/update_bio",
        method: "POST",
        data: data,
        dataType: "json",
        success: function(response) {
            console.log("success, result = " + JSON.stringify(response));
            $('#display-bio').text(bio);
            $('#next-bio-text').text(bio);
            $('#new-bio-text').trigger('autoresize');
        },
        error: function(response) {
            console.log("failed, result = " + JSON.stringify(response));
        }
    });
});
