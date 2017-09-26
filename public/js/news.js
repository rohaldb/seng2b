$(document).ready(function() {
  loadArticles(document.title.replace(/.* -\s*/, ''));
});

function sentimentAnalysis(body, callback) {
  $.ajax({
    type: 'post',
    url: 'http://localhost:3001/ibm?text=' + encodeURI(body),
    dataType: 'json',
    success: callback,
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
  $('.tooltipped').tooltip('remove');
  var url = 'http://content.guardianapis.com/search?q=' + company;
  url += '&order-by=relevance&show-blocks=body&show-fields=bodyText';
  url += '&api-key=35b90e54-3944-4e4f-9b0e-a511d0dda44d';

  //download articles
  $.getJSON(url, function(data) {
    console.log(data);
    var obj = data.response.results;
    var i = 0;

    //show at most 10 articles
    while (i < 10 && Object.keys(obj)[i]) {
      var ob = Object.keys(obj)[i];
      var title = obj[ob]['webTitle'];
      var link = obj[ob]['webUrl'];
      var date = obj[ob]['webPublicationDate'].replace(/[a-z]/gi, ' ');
      var bodyText = obj[ob]['fields']['bodyText'];

      sentimentAnalysis(bodyText, function(ibm) {
        console.log(ibm.sentiment.document.score + ' ' + ibm.sentiment.document.label);
        var sentimentScore = ibm.sentiment.document.score;
        var sentimentLabel = ibm.sentiment.document.label;
        var sentimentIcon = 'images/blue-neutral-800px.png';
        if (ibm.sentiment.document.label === 'positive') {
          sentimentIcon = 'images/green-tick-800px.png';
        } else if (ibm.sentiment.document.label === 'negative') {
          sentimentIcon = 'images/red-cross-800px.png';
        }

        var summary = bodyText.substring(0, 350).replace(/\s[^\s]*$/, '').replace(/\s*[^a-z]+$/i, '');
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
          ' ... <a class="modal-trigger" href="#news-' + Object(i + 1).toString() + '">Read More</a></p></li>');

        //add news article to modal
        $('#news-article-' + Object(i + 1).toString() + '-title').html(title);
        $('#news-article-' + Object(i + 1).toString() + '-date').html(date);
        $('#news-article-' + Object(i + 1).toString() + '-body').html(body);
      });

      i++;
    }

  });

  $('.tooltipped').tooltip({delay: 50});
}
