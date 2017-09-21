$(document).ready(function() {
  getPageName(document.title.replace(/.* -\s*/, ''));
});

function getPageName(c) {
  var company = c;
  var url = 'http://en.wikipedia.org/w/api.php?action=query&generator=allpages&search=';
  url += company + '&format=json&gapfrom=' + company + '&gapto=' + company + '&prop=info&inprop=url';

  //get wiki link to page from name of company
  $.ajax({
    url: url,
    dataType: 'jsonp',
    success: function (data) {
      console.log('wiki', data.query.pages);
      $.each(data.query.pages, function (key, val) {
        var url = val.fullurl;
        url = url.replace(/.*\//, '');
        getCompanyInfo(url, company);
      });
    },
    fail: function (data) {
      console.log(data);
    }
  });

}

//extract summary of company from section 0 of wiki
function extractCompanySummary(src, length) {
  var len = 0;
  var summary = '';
  var src = src.substring(src.indexOf('is'), src.length);
  var components = src.split('.');
  var i = 0;
  while (len < length) {
    if (!components[i].match(/[^\s]+\s/)) {
      break;
    }
    summary += components[i] + '.';
    len = summary.length;
    i++;
  }
  return summary;
}

function getCompanyInfo(company, fullName) {
  console.log(company);
  var url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts';
  url += '&format=json&exintro=&explaintext=&titles=' + company + '&rvprop=content&redirects&callback=?';
  //var url = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=amazon.com&limit=1&format=json';

  //delay displaying overview until correct page is found
  var companyOverview = '';

  //fill in summary of company
  $.getJSON(url, function (data) {
    console.log(data);
    var obj = data.query.pages;
    var ob = Object.keys(obj)[0];
    var extract = obj[ob]['extract']
    summary = extractCompanySummary(extract, 250);
    $('#company-summary').text(fullName + ' ' + summary);
    companyOverview = extractCompanySummary(extract, 100);
  });

  //extract wiki infobox entries
  $.ajax({
    type: "GET",
    url: 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&page=' + company + '&redirects&callback=?',
    contentType: "application/json; charset=utf-8",
    async: false,
    dataType: "json",
    success: function (data, textStatus, jqXHR) {
      var markup = data.parse.text["*"];

      //infobox is the first thing on the page
      markup = markup.replace(/<[^>]*>/g, '');

      //at a glance...
      var industry = markup.match(/Industry.*(\n)*(.*)/g);
      if (industry) {
        industry = industry[0].replace(/Industry/, '');
        $('#industry').html(industry);
      }
      var founded = markup.match(/Founded.*\n(.*)/g);
      if (founded) {
        founded = founded[0].match(/.*?[0-9]{4}/);
        $('#founded').html(founded);
      }
      var founder = markup.match(/Founder.*\n(.*)/g);
      if (founder) {
        founder = founder[0];
        $('#founder').html(founder);
      }
      var headquarters = markup.match(/Headquarters.*\n(.*)/g);
      if (headquarters) {
        headquarters = headquarters[0].replace(/Headquarters/i, '');
        headquarters = headquarters.replace(/\[.*\]/g, '').replace(/\(.*\)/g, '');
        $('#headquarters').html(headquarters);
      }
      var ceo = markup.match(/Key( |&#\d+;)People(.|\n)*/gi);
      if (ceo) {
        ceo = ceo[0].replace(/\([^(]*CEO(.|\n)*/, '').replace(/(.|\n)*\)/, '').replace(/Key( |&#\d+;)People/i, '');
        $('#ceo').html(ceo);
      }
      var employees = markup.match(/Number of Employees.*(\n)*(.*)/gi);
      if (employees) {
        employees = employees[0].replace(/[,;]\s+.*/, '').replace(/Number of Employees/i, '');
        employees = employees.replace(/\[.*\]/, '').replace(/\(.*\)/, '');
        $('#employees').html(employees);
      }

      //finances...
      var revenue = markup.match(/Revenue.*\n.*\n(.*)/g);
      if (revenue) {
        revenue = revenue[0].replace(/Revenue/, '');
      } else {
        getPageName(company + ' Inc.'); //try again by appending Inc. to company name
        return;
      }
      var year = revenue.match(/[0-9]{4}/)[0];
      revenue = revenue.replace(/\[.*\]/, '').replace(/\(.*\)/, '');
      if (revenue === '' || revenue.length > 40) {
        return;
      }
      $('#finances-year').html('Finances (' + year + ')');
      $('#revenue').html(revenue);
      markup = markup.replace(/\[.*\]/g, '').replace(/\(.*\)/g, '');
      var operating = markup.match(/Operating Income.*\n.*\n(.*)/gi);
      if (operating) {
        operating = operating[0].replace(/Operating Income/i, '');
        $('#operating-income').html(operating);
      }
      var net = markup.match(/Net Income.*\n.*\n(.*)/gi);
      if (net) {
        net = net[0].replace(/Net Income/i, '');
        $('#net-income').html(net);
      }
      var total = markup.match(/Total Assets.*\n.*\n(.*)/gi);
      if (total) {
        total = total[0].replace(/Total Assets/i, '');
        $('#total-assets').html(total);
      }
      var equity = markup.match(/Total Equity.*\n.*\n(.*)/gi);
      if (equity) {
        equity = equity[0].replace(/Total Equity/i, '');
        $('#total-equity').html(equity);
      }

      //display company overview at the end
      $('#company-overview').text(fullName + ' ' + companyOverview);
    },
    error: function (errorMessage) {
    }
  });

}
