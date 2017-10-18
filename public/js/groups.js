/*
var groupsVue = new Vue({
  el: '#groupID',
  data: {
 },
  mounted() {
  }
});
*/
$('.modal').modal();

//make a comment on a feed event
$("#post-new-comment").on("click", function() {
  var comment = $('#new-comment-text').val();
  var postId = $('#post-comment-id').val();
  if (comment.match(/^\s*$/)) {
    Materialize.toast('Nothing to post.', 1250);
    $('#new-comment-text').val('');
    $('#new-comment-text').trigger('autoresize');
    return;
  } else {
    comment = comment.replace(/\s+/g, ' ').trim();
    $('#new-comment-text').val(comment);
    $('#new-comment-text').trigger('autoresize');
  }

  //TODO - don't hardcode these - get from ajax
  var whoami = 'me';
  var commentId = Math.random();

  var d = new Date();
  var timestamp = d.toDateString() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  var data = {
    'comment': comment,
    'postId': postId,
    'timestamp': timestamp
  };
  console.log(data);
/*
  $.ajax({
    url: "/comment_on_feed",
    method: "POST",
    data: data,
    dataType: "json",
    success: function(response) {
      console.log("success, result = " + JSON.stringify(response));
*/
//TODO: actually add comment to db - i.e. create this route
      Materialize.toast('Comment added.', 1250);
      var numComments = $('#num-comments-' + postId).text().match(/\d+/)[0];
      numComments++;
      var plural = (numComments === 1) ? '' : 's';
      $('#num-comments-' + postId).text(numComments + ' comment' + plural);
      $('#new-comment-text').val('');
      $('#new-comment-text').trigger('autoresize');
      $('#comment-id-' + postId).append(
      '<div id="comment-id-' + commentId + '">' +

      '<li class="collection-item avatar space-gray feed-item">' +
      '  <img src="images/sample_user.png" alt="" class="circle">' +
      '  <span class="title spaceship-text feed-username"><a href="#">' + whoami + '</a></span>' +
      '  <span class="feed-action">' + comment + '</span>' +
      '  <p><small class="feed-timestamp">' + timestamp + '</small></p>' +
      '  <a class="waves-effect waves-light btn modal-trigger secondary-content" href="#delete-comment-on-feed-form"' +
      '  onclick="document.getElementById(\'delete-comment-id\').value=\'#comment-id-' + commentId + '\'";>Delete</a>' +
      '</li></div>');
/*
    },
    error: function(response) {
      Materialize.toast('Could not add comment.', 1250);
      console.log("failed, result = " + JSON.stringify(response));
    }
  });
*/
});

//delete a comment on a feed event
$("#delete-comment-bttn").on("click", function() {
/*
  $.ajax({
    url: "/delete_comment_on_feed",
    method: "POST",
    data: data,
    dataType: "json",
    success: function(response) {
      console.log("success, result = " + JSON.stringify(response));
*/
//TODO: actually delete comment in db - i.e. create this route
  var commentId = $('#delete-comment-id').val();
  $(commentId).empty(); //TODO deletion
  $(commentId).remove();
  Materialize.toast('Comment deleted.', 1250);
/*
    },
    error: function(response) {
      Materialize.toast('Could not add comment.', 1250);
      console.log("failed, result = " + JSON.stringify(response));
    }
  });
*/
});

//load number of group members and list of group members
var data = {
  'id': getUrlParameter('id')
};
$.ajax({
  url: "/get_group_info",
  method: "POST",
  data: data,
  dataType: "json",
  success: function(response) {
    console.log("success, result = " + JSON.stringify(response));
    var numMembers = response.numMembers;
    var members = response.members;
    var memberNameIds = response.memberNameIds;
    var leaderboardIds = response.leaderboardIds;
    var memberCountText = (numMembers === 1) ? ' member' : ' members';

    $('#num-group-members').text(numMembers + memberCountText); // Update members count HTML

    var memberListText = "";
    var memberListIds = "";
    memberNameIds.forEach(x => {
      if (memberListText !== "") {
        memberListText += ", "
        memberListIds += ", "
      }
      memberListText += members[x].name;
      getFeed(x, members[x].name);
    });
    $('#group-member-names').text(memberListText); // Update member names HTML
    $('#group-member-ids').text(memberListIds); // Update member names HTML

    leaderboardIds.forEach(x => {
      $('#leaderboard-list').append(`<li><span class="name">${members[x].name}</span><span class="percent">${members[x].balance}</span></li>`)
    });

    //var name = response.name;
    //console.log('name is: ' + name);
  },
  error: function(response) {
    console.log("failed, result = " + JSON.stringify(response));
  }
});

//now load the feed events
function getFeed(id, user) {
  var data = {
    'user': id
  }
  $.ajax({
    url: "/get_user_purchases",
    method: "POST",
    data: data,
    dataType: "json",
    success: function(response) {
      response.purchaseList.forEach(function (item, index) {
        var companyCode = item.companyCode;
        var numUnits = parseFloat(item.num_units);
        var tradeAmount = parseFloat(item.tradeAmount);
        var date = item.date;
        var d = new Date(date);
        var timestamp = d.toDateString() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        var purchaseId = item.id;
        $('#group-feed-events').append(
  '<div class="col s12 feed-col">' +
  '  <li class="collection-item avatar space-gray feed-item">' +
  '    <img src="images/sample_user.png" alt="" class="circle">' +
  `    <span class="title spaceship-text feed-username"><a href="#">${user}</a></span>` +
  `    <span class="feed-action">bought ${numUnits} in ${companyCode} for $${tradeAmount}.<span>` +
  `   <p><small class="feed-timestamp">${timestamp}</small></p>` +
  `   <a href="#" id="num-comments-${purchaseId}" class="feed-comments-link">0 comments</a>` +
  `    <a class="waves-effect waves-light btn modal-trigger secondary-content" href="#comment-on-feed" onclick="document.getElementById('post-comment-id').value='${purchaseId}';">Comment</a>` +
  '    <a href="#!" class="secondary-content"><i class="material-icons orange-text">grade</i></a>' +
  '  </li>' +
  '</div>' +
  '<br>' +
  `<div class="col s11 offset-s1 feed-col" id="comment-id-${purchaseId}">` +
  '<ul>' +
  '  <!-- comments for feed event above -->' +
  '</ul>' +
  '</div>');
      });
    },
    error: function(response) {
      console.log("failed Purchases, result = " + JSON.stringify(response));
    }
  });
}

/*
var user_keys = {};
var user_ids = {};

$.ajax({
  url: "/get_user_list",
  method: "POST",
  data: '',
  dataType: "json",
  success: function(response) {
    //console.warn("hey ben success");
    //console.log("success, result = " + JSON.stringify(response));
    var name = response.name;
    //console.log(response.userList);
    response.userList.forEach(function(item){
      //console.log(item.name);
      //console.log("hey");
      user_keys[item.name] = null;
      user_ids[item.name] = item.uid;
      $('.chips-autocomplete').material_chip({
        autocompleteOptions: {
          data: user_keys,
          limit: Infinity,
          minLength: 1
        },
        placeholder: 'Enter a User',
        secondaryPlaceholder: '+ User',
      });
      //console.log(item.name + ' == ' + user_keys[item.name]);
    console.log("HERE WE ARE!!!!");
    //console.log("success, result = " + JSON.stringify(response));
    //var name = response.name;
    //console.log('and the name is: ' + name);
    response.userList.forEach(function (item,index){
      console.log("success name is = " item[index]);
    });
  },
  error: function(response) {
    //console.warn("hey ben failed");
    console.log("failed, result = " + JSON.stringify(response));
  }
});

$('.chips').on('chip.add', function(e, chip){
    console.log('chip is' + chip.tag);
    console.log('name is ' + chip.tag + 'uid is ' + user_ids[chip.tag]);

  });
*/

//load user name chips
$(document).ready(function(){
  $('.chips-autocomplete').material_chip({
    autocompleteOptions: {
      data: user_keys,
      limit: Infinity,
      minLength: 1
    },
    placeholder: 'Enter a User',
    secondaryPlaceholder: '+ User',
  });
});

/*
$.ajax({
  url: "/get_user_list",
  method: "POST"
  data: '',
  dataType: "json",
  success: function(response) {
    console.log("success, result = " + JSON.stringify(response));
    var first = response.first;
    var last = response.last;
    console.log('first = ' + first + ' last = ' + last);
  },
  error: function(response) {
    console.log("failed, result = " + JSON.stringify(response)) {
  }
});

*/
/*
$.ajax({
  url: '/get_user_list',
  type: 'GET' // this is default, but worth pointing out
}).done(function(data){
  console.log("data is = " + JSON.stringify(data));
  // you may use "data" to access the underlying data
}
*/


var chartDataMultiPanel = [];
generateChartDataMultiPanel();

function generateChartDataMultiPanel() {
    var firstDate = new Date();
    firstDate.setHours( 0, 0, 0, 0 );
    firstDate.setDate( firstDate.getDate() - 2000 );
    for ( var i = 0; i < 2000; i++ ) {
      var newDate = new Date( firstDate );
      newDate.setDate( newDate.getDate() + i );
      var open = Math.round( Math.random() * ( 30 ) + 100 );
      var close = open + Math.round( Math.random() * ( 15 ) - Math.random() * 10 );
      var low;
      if ( open < close ) {
        low = open - Math.round( Math.random() * 5 );
      } else {
        low = close - Math.round( Math.random() * 5 );
      }
      var high;
      if ( open < close ) {
        high = close + Math.round( Math.random() * 5 );
      } else {
        high = open + Math.round( Math.random() * 5 );
      }
      var volume = Math.round( Math.random() * ( 1000 + i ) ) + 100 + i;
      var value = Math.round( Math.random() * ( 30 ) + 100 );

      chartDataMultiPanel[ i ] = ( {
        "date": newDate,
        "open": open,
        "close": close,
        "high": high,
        "low": low,
        "volume": volume,
        "value": value
      } );
    }
}


var chartData1 = [];
var chartData2 = [];
var chartData3 = [];
var chartData4 = [];

generateChartData();

function generateChartData() {
  var firstDate = new Date();
  firstDate.setDate( firstDate.getDate() - 500 );
  firstDate.setHours( 0, 0, 0, 0 );

  var a1 = 1500;
  var b1 = 1500;
  var a2 = 1700;
  var b2  = 1700;
  var a3 = 1600;
  var b3 = 1600;
  var a4 = 1400;
  var b4 = 1400;

  for ( var i = 0; i < 500; i++ ) {
    var newDate = new Date( firstDate );
    newDate.setDate( newDate.getDate() + i );

    a1 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
    b1 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);

    a2 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
    b2 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);

    a3 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
    b3 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);

    a4 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);
    b4 += Math.round((Math.random()<0.5?1:-1)*Math.random()*10);

    chartData1.push( {
      "date": newDate,
      "value": a1,
      "volume": b1 + 1500
    } );
    chartData2.push( {
      "date": newDate,
      "value": a2,
      "volume": b2 + 1500
    } );
    chartData3.push( {
      "date": newDate,
      "value": a3,
      "volume": b3 + 1500
    } );
    chartData4.push( {
      "date": newDate,
      "value": a4,
      "volume": b4 + 1500
    } );
  }
}

//Comparing members
var chart = AmCharts.makeChart( "chartdiv2", {
  "type": "stock",
  "theme": "light",
  "dataSets": [ {
      "title": "Friend A",
      "fieldMappings": [ {
        "fromField": "value",
        "toField": "value"
      }, {
        "fromField": "volume",
        "toField": "volume"
      } ],
      "dataProvider": chartData1,
      "categoryField": "date"
    }, {
      "title": "Friend B",
      "fieldMappings": [ {
        "fromField": "value",
        "toField": "value"
      }, {
        "fromField": "volume",
        "toField": "volume"
      } ],
      "dataProvider": chartData2,
      "categoryField": "date"
    }, {
      "title": "Friend C",
      "fieldMappings": [ {
        "fromField": "value",
        "toField": "value"
      }, {
        "fromField": "volume",
        "toField": "volume"
      } ],
      "dataProvider": chartData3,
      "categoryField": "date"
    }, {
      "title": "Friend D",
      "fieldMappings": [ {
        "fromField": "value",
        "toField": "value"
      }, {
        "fromField": "volume",
        "toField": "volume"
      } ],
      "dataProvider": chartData4,
      "categoryField": "date"
    }
  ],

  "panels": [ {
    "showCategoryAxis": false,
    "title": "Value",
    "percentHeight": 70,
    "stockGraphs": [ {
      "id": "g1",
      "valueField": "value",
      "comparable": true,
      "compareField": "value",
      "balloonText": "[[title]]:<b>[[value]]</b>",
      "compareGraphBalloonText": "[[title]]:<b>[[value]]</b>"
    } ],
    "stockLegend": {
      "periodValueTextComparing": "[[percents.value.close]]%",
      "periodValueTextRegular": "[[value.close]]"
    }
  }, {
    "title": "Volume",
    "percentHeight": 30,
    "stockGraphs": [ {
      "valueField": "volume",
      "type": "column",
      "showBalloon": false,
      "fillAlphas": 1
    } ],
    "stockLegend": {
      "periodValueTextRegular": "[[value.close]]"
    }
  } ],

  "chartScrollbarSettings": {
    "graph": "g1"
  },

  "chartCursorSettings": {
    "valueBalloonsEnabled": true,
    "fullWidth": true,
    "cursorAlpha": 0.1,
    "valueLineBalloonEnabled": true,
    "valueLineEnabled": true,
    "valueLineAlpha": 0.5
  },

  "periodSelector": {
    "position": "left",
    "periods": [ {
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

  "dataSetSelector": {
    "position": "left"
  },

  "export": {
    "enabled": true
  }
} );


//function generateMultiplePanelsChart(chartData){
  var chart = AmCharts.makeChart( "chartdiv1", {
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
      "dataProvider": chartDataMultiPanel,
      "title": "West Stock",
      "categoryField": "date"
    }, {
      "fieldMappings": [ {
        "fromField": "value",
        "toField": "value"
      } ],
      "color": "#fac314",
      "dataProvider": chartDataMultiPanel,
      "compared": true,
      "title": "East Stock",
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
//}
