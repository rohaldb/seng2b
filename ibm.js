var express = require('express');
var app = express();

//allow from port 3000
var cors = require('cors');
app.use(cors({origin: 'http://localhost:3000'}));

app.post('/ibm', function(req, res) {
  var articleText = req.query.text;
  //console.log(articleText);
  var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');

  //use ibm analytics module
  var natural_language_understanding = new NaturalLanguageUnderstandingV1({
    'username': 'b61b2519-acb6-47b8-bbb9-608226b76020',
    'password': 'Vm0fss16s7rJ',
    'version_date': '2017-02-27'
  });

  //request sentiment for the article
  var parameters = {
    'text': articleText,
    'features': {
      'sentiment': {
      }
    }
  };

  natural_language_understanding.analyze(parameters, function(err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      //send back the flat json
      var data = JSON.stringify(response, null, 2);
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': data.length
      });
      res.write(data);
      res.end();
    }
  });

});

app.listen(3001);
