getCompanyInfo(companies["AMZN - Amazon.com Inc"]);

function getCompanyInfo(company) {
  company = 'amazon.com';
  console.log(company);

  var url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts';
  url += '&format=json&exintro=&explaintext=&titles=' + company + '&rvprop=content&callback=?';
  //var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=amazon.com&limit=1&format=json';

  //one-line summary of company
  $.getJSON(url, function (data) {
    console.log(data);
    var obj = data.query.pages;
    var ob = Object.keys(obj)[0];
    var extract = obj[ob]['extract']
    try {
      var len = 0;
      var summary = '';
      var extract = extract.substring(extract.indexOf('is'), extract.length);
      var components = extract.split('.');
      var i = 0;

      while (len < 250) {
        if (!components[i].match(/[^\s]+\s/)) {
          break;
        }
        summary += components[i] + '.';
        len = summary.length;
        i++;
      }

      $('#company-summary').text(company + ' ' + summary);
    } catch (err) {
      $('#company-summary').text(err.message);
    }
  });

  //extract wiki infobox entries
  $.ajax({
    type: "GET",
    url: 'http://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&page=' + company + '&callback=?',
    contentType: "application/json; charset=utf-8",
    async: false,
    dataType: "json",
    success: function (data, textStatus, jqXHR) {
      var markup = data.parse.text["*"];

      //infobox is the first thing on the page
      markup = markup.replace(/<[^>]*>/g, '');

      //not highly robust
      var industry = markup.match(/Industry.*(\n)*(.*)/g)[0].replace(/Industry/, '');
      var founded = markup.match(/Founded.*\n(.*)/g)[0].match(/.*?[0-9]{4}/);
      var founder = markup.match(/Founder.*\n(.*)/g)[0];
      var headquarters = markup.match(/Headquarters.*\n(.*)/g)[0].replace(/Headquarters/i, '');
      var ceo = markup.match(/Key People(.|\n)*/gi)[0].replace(/\([^(]*CEO(.|\n)*/, '').replace(/(.|\n)*\)/, '').replace(/Key People/i, '');
      var employees = markup.match(/Number of Employees.*(\n)*(.*)/gi)[0].replace(/[,;]\s+.*/, '').replace(/Number of Employees/i, '');
      employees = employees.replace(/\[.*\]/, '').replace(/\(.*\)/, '');

      //at a glance...
      $('#industry').html(industry);
      $('#founded').html(founded);
      $('#founder').html(founder);
      $('#headquarters').html(headquarters);
      $('#ceo').html(ceo);
      $('#employees').html(employees);

      //finances...
      var revenue = markup.match(/Revenue.*\n.*\n(.*)/g)[0].replace(/Revenue/, '');
      var year = revenue.match(/[0-9]{4}/)[0];
      revenue = revenue.replace(/\[.*\]/, '').replace(/\(.*\)/, '');
      $('#finances-year').html('Finances (' + year + ')');
      $('#revenue').html(revenue);

      markup = markup.replace(/\[.*\]/g, '').replace(/\(.*\)/g, '');
      var operating = markup.match(/Operating Income.*\n.*\n(.*)/gi)[0].replace(/Operating Income/i, '');
      $('#operating-income').html(operating);
      var net = markup.match(/Net Income.*\n.*\n(.*)/gi)[0].replace(/Net Income/i, '');
      $('#net-income').html(net);
      var total = markup.match(/Total Assets.*\n.*\n(.*)/gi)[0].replace(/Total Assets/i, '');
      $('#total-assets').html(total);
      var equity = markup.match(/Total Equity.*\n.*\n(.*)/gi)[0].replace(/Total Equity/i, '');
      $('#total-equity').html(equity);

    },
    error: function (errorMessage) {
    }
  });

}
