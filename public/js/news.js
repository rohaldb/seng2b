$(document).ready(function() {
  loadArticles(document.title.replace(/.* -\s*/, ''));
});

function sentimentAnalysis(i, titleA, linkA, dateA, bodyTextA, callback) {
  $.ajax({
    type: 'post',
    url: 'http://localhost:3001/ibm?text=' + encodeURI(bodyTextA),
    dataType: 'json',
    success: function(data) {
      callback(i, titleA, linkA, dateA, bodyTextA, data);
    },
    fail: function (data) {
      console.log(data);
    }
  });

  /*
  var url = 'https://gateway.watsonplatform.net/natural-language-understanding/ap/v1/';
  url += 'analyze?version=2017-02-27&text=' + encodeURI(body) + '&features=sentiment"';
  var username = 'b61b2519-acb6-47b8-bbb9-608226b76020';
  var password = 'Vm0fss16s7rJ';

  $.ajax({
    url: url,
    dataType: 'json',
    headers: {
      "Authorization": "Basic " + btoa(username + ":" + password)
    },
    success: function (data) {
      conole.log(data);
    },
    fail: function (data) {
      console.log(data);
    }
  });
  */

}

function loadArticles(company) {
  //$('.tooltipped').tooltip('remove');
  var url = 'http://content.guardianapis.com/search?q=' + company;
  url += '&order-by=relevance&show-blocks=body&show-fields=bodyText';
  url += '&api-key=35b90e54-3944-4e4f-9b0e-a511d0dda44d';

  //object to be sent to stock.js for graph annotations
  var sentimentJson = {};
  var sentiments = []
  sentimentJson.sentiments = sentiments;

  //download articles
  $.getJSON(url, function(data) {
    console.log(data);
    var obj = data.response.results;
    var i = 0;

    //show at most 10 articles
    while (i < 10 && Object.keys(obj)[i]) {
      var ob = Object.keys(obj)[i];
      var titleA = obj[ob]['webTitle'];
      var linkA = obj[ob]['webUrl'];
      var dateA = obj[ob]['webPublicationDate'].replace(/[a-z]/gi, ' ');
      var bodyTextA = obj[ob]['fields']['bodyText'];

      sentimentAnalysis(i, titleA, linkA, dateA, bodyTextA, function(articleNum, title, link, date, bodyText, ibm) {
        // console.log(ibm.sentiment.document.score + ' ' + ibm.sentiment.document.label);
        var sentimentScore = ibm.sentiment.document.score;
        var sentimentLabel = ibm.sentiment.document.label;
        var sentimentIcon = 'images/blue-neutral-800px.png';
        if (ibm.sentiment.document.label === 'positive') {
          sentimentIcon = 'images/green-tick-800px.png';
        } else if (ibm.sentiment.document.label === 'negative') {
          sentimentIcon = 'images/red-cross-800px.png';
        }

        var summary = bodyText.substring(0, 350).replace(/\s[^\s]*$/, '').replace(/\s*[^a-z]+$/i, '');
        var ob = Object.keys(obj)[articleNum];
        var body = obj[ob]['blocks']['body']['0']['bodyHtml'];

        //remove hyperlinks from body
        body = body.replace(/<\s*\/?\s*a\s[^>]*>/gi, '');

        //make headings smaller
        body = body.replace(/<\s*(\/?)\s*h[0-9]\s*>/gi, '<$1h5>');

        //make images half-scale
        body = body.replace(/<\s*img\s([^>]+)>/g, function(match, capture) {
          //global match wasn't working here for some reason
          var ret = capture.replace(/\sheight\s*=\s*"\s*([0-9]+)\s*"\s/gi, function(m, cap) {
            return ' height="' + cap / 2 + '" ';
          });
          ret = ret.replace(/\swidth\s*=\s*"\s*([0-9]+)\s*"\s/gi, function(m, cap) {
            return ' width="' + cap / 2 + '" ';
          });
          return '<img ' + ret + '>';
        });

        //add news list item
        $('#news-articles-list').append('<li class="collection-item avatar space-gray">' +
          '<span class="title spaceship-text"><a target="_blank" href="' + link + '">' +
          '<h5>' + title + '</h5><p>' + date + '</p></a></span>' +
          '<img src="' + sentimentIcon + '" alt="' + sentimentIcon + ' icon" title="Sentiment: ' +
          sentimentScore + ' (' + sentimentLabel + ')" height="20" width="20"><p>' + summary +
          ' ... <a class="modal-trigger" href="#news-' + Object(articleNum + 1).toString() + '">Read More</a></p></li>');

        //add news article to modal
        $('#news-article-' + Object(articleNum + 1).toString() + '-title').html(title);
        $('#news-article-' + Object(articleNum + 1).toString() + '-date').html(date);
        $('#news-article-' + Object(articleNum + 1).toString() + '-body').html(body);

        //append sentiment to json
        var sentiment = {
          "sentiment": sentimentScore,
          "label": sentimentLabel,
          "title": title,
          "url": link,
          "date": new Date(date)
        }
        sentimentJson.sentiments.push(sentiment);

        //don't load graphs until news articles are ready
        if (articleNum == 9) {
          //console.log(JSON.stringify(sentimentJson));
          getStockPriceOf(companies[getUrlParameter('stock') + " - " + getUrlParameter('company')], sentimentJson);
        }

      });

      i++;
    }

  });

  //$('.tooltipped').tooltip({delay: 50});
}
