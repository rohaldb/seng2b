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
  components[0] = components[0].replace(/^[^()]*\)/, '');
  var prev = '';
  var i = 0;

  while (len < length) {
    if (!components[i]) {
      break; //section 0 too short
    } else if (i > 0 && len + components[i].length + 1 >= length && !components[i].match('^[\s\n]')) {
      break; //avoid mid-sentence cut-off
    }
    prev = summary;
    summary += components[i] + '.';
    len = summary.length;
    i++;
  }

  if (i > 2 && components[i] && !components[i].match('^[\s\n]')) {
    //avoid mid-sentence cut-off
    if (!prev.match('[0-9]\.$') && !components[i - 1].match('^[0-9]')) {
      //but avoid if last component was the end of a number
      summary = prev;
    }
  } else if (components[i] && !components[i].match('\s')) {
    summary += components[i] + '.'; //add single trailing word
  }

  return summary.replace(/[\s\.]+$/, '.');
}

//safely unescape html
function unescapeHTML(src) {
  var e = document.createElement('div');
  e.innerHTML = src;
  return (e.childNodes.length === 0) ? "" : e.childNodes[0].nodeValue;
}

//return the canonical name for a denomination
//wiki formats it poorly sometimes, e.g. "b", "bil", "bill", ...
function getCanonical(src) {
  src = unescapeHTML(src);
  src = src.replace(/^\s*|\s*$/g, '');
  src = src.replace(/m$/i, 'million');
  src = src.replace(/b$/i, 'billion');
  src = src.replace(/ill?$/i, 'illion');
  src = src.replace(/-/g, ''); //a - is **sometimes** present for decreases
  var name = src.match(/\w+$/)[0];
  if (name) {
    src = src.replace(name, name.toLowerCase());
  }
  src = src.replace(/[0-9]([a-z]+)$/, ' $1'); //sometimes, there's no space before "billion", ...
  return src;
}

//return a hash table of all financial information mapped to an increase/decrease icon
function getIncreaseDecrease(html) {
  var upDown = {};
  var upIcon = '<img alt="increase" src="images/11px-Increase2.svg.png" width="11" height="11">';
  var downIcon = '<img alt="decrease" src="images/11px-Decrease2.svg.png" width="11" height="11">';
  var increases = html.match(/.*upload.wikimedia.org\/wikipedia\/commons\/thumb\/b\/b0\/Increase2.svg\/11px-Increase2.svg.png[^>]+>(.*)/g);
  var i = 0;
  while (increases && increases[i]) {
    var up = increases[i].replace(/<[^>]*>/g, '');
    up = up.replace(/\[.*\]/g, '').replace(/\(.*\)/g, '').replace(/^\s*|\s*$/g, '');
    upDown[up] = upIcon;
    i++;
  }
  var decreases = html.match(/.*upload.wikimedia.org\/wikipedia\/commons\/thumb\/e\/ed\/Decrease2.svg\/11px-Decrease2.svg.png[^>]+>(.*)/g);
  i = 0;
  while (decreases && decreases[i]) {
    var down = decreases[i].replace(/<[^>]*>/g, '');
    down = down.replace(/\[.*\]/g, '').replace(/\(.*\)/g, '').replace(/^\s*|\s*$/g, '');
    upDown[down] = downIcon;
    i++;
  }
  return upDown;
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
    var extract = obj[ob]['extract'];
    summary = extractCompanySummary(extract, 450);
    $('#company-summary').text(fullName + ' ' + summary);
    companyOverview = extractCompanySummary(extract, 100);
  });

  //extract wiki infobox entries
  var upDown = {};
  $.ajax({
    type: "GET",
    url: 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&page=' + company + '&redirects&callback=?',
    contentType: "application/json; charset=utf-8",
    async: false,
    dataType: "json",
    success: function (data, textStatus, jqXHR) {
      var markup = data.parse.text["*"];

      //some financial info is poorly formatted, e.g. https://en.wikipedia.org/wiki/ConocoPhillips
      markup = markup.replace(/.*upload.wikimedia.org\/wikipedia\/commons\/thumb\/b\/b0\/Increase2.svg\/11px-Increase2.svg.png[^>]+>.*/g, function(m) {
        return m.replace(/\(([0-9]+\.[0-9]+)\)/, '$1');
      });
      markup = markup.replace(/.*upload.wikimedia.org\/wikipedia\/commons\/thumb\/e\/ed\/Decrease2.svg\/11px-Decrease2.svg.png[^>]+>.*/g, function(m) {
        return m.replace(/\(([0-9]+\.[0-9]+)\)/, '$1');
      });

      upDown = getIncreaseDecrease(markup);
      numAtAGlance = 0;

      //infobox is the first thing on the page
      markup = markup.replace(/<[^>]*>/g, '');

      //at a glance...
      $('.tooltipped').tooltip('remove');
      var industry = markup.match(/Industry.*(\n)*(.*)/g);
      if (industry) {
        numAtAGlance++;
        var industry = industry[0].replace(/Industry/, '');
        industry = industry.replace(/\[.*\]/g, '').replace(/\(.*\)/g, '');
        $('#industry').attr('value', unescapeHTML(industry));
        $('#industry').attr('data-tooltip', unescapeHTML(industry));
      }
      var founded = markup.match(/Founded.*(\n)*(.*)/g);
      if (founded) {
        numAtAGlance++;
        founded = founded[0].match(/.*?[0-9]{4}/)[0];
        founded = founded.replace(/.*\(/, ''); //filter location if present
        $('#founded').attr('value', unescapeHTML(founded));
        $('#founded').attr('data-tooltip', unescapeHTML(founded));
      }
      var foundFounder = false;
      var founder = markup.match(/Founder.*(\n)*(.*)/g);
      if (founder) {
        numAtAGlance++;
        founder = founder[0].replace(/Founder/, '');
        foundFounder = true;
      }
      var headquarters = markup.match(/Headquarters.*(\n)*(.*)/g);
      if (headquarters) {
        numAtAGlance++;
        headquarters = headquarters[0].replace(/Headquarters/i, '');
        headquarters = headquarters.replace(/\[.*\]/g, '').replace(/\(.*\)/g, '').replace(/,$/, '');
        $('#headquarters').attr('value', unescapeHTML(headquarters));
        $('#headquarters').attr('data-tooltip', unescapeHTML(headquarters));
      }
      var ceo = markup.match(/Key( |&#\d+;)People(.|\n)*/gi);
      if (ceo) {
        ceo = ceo[0].replace(/\([^(]*CEO(.|\n)*/, '').replace(/(.|\n)*\)/, '').replace(/Key( |&#\d+;)People/i, '').replace(/,\s*$/, '');
        if (ceo.length > 30) {
          numAtAGlance++;
          ceo = 'Unknown';
        }
        $('#ceo').attr('value', unescapeHTML(ceo));
        $('#ceo').attr('data-tooltip', unescapeHTML(ceo));
      }
      if ($('#ceo').attr('value') === 'Unknown' && foundFounder === true) {
        //substitute ceo for founder if possible
        $('#ceo').attr('value', unescapeHTML(founder));
        $('#ceo').attr('data-tooltip', unescapeHTML(founder));
        $('#ceo-label').html('Founder');
      }
      var employees = markup.match(/(Employees|Number of [Ee]mployees).*(\n)*(.*)/g);
      if (employees) {
        numAtAGlance++;
        employees = employees[0].replace(/[,;]\s+.*/, '').replace(/.*Employees/i, '');
        employees = employees.replace(/\[.*\]/, '').replace(/\(.*\)/, '').replace(/\(.*/, '');
        $('#employees').attr('value', unescapeHTML(employees));
        $('#employees').attr('data-tooltip', unescapeHTML(employees));
      }
      $('.tooltipped').tooltip({delay: 50});

      //finances...
      var revenue = markup.match(/Revenue.*\n+(.*)/g);
      if (revenue) {
        revenue = revenue[0].replace(/Revenue/, '');
        var year = revenue.match(/[0-9]{4}/)[0];
        revenue = revenue.replace(/\[.*\]/, '').replace(/\(.*\)/, '').replace(/^\s*|\s*$/g, '');
        if (revenue === '' || revenue.length > 40) {
          return;
        }
        $('#finances-year').html('Finances (' + year + ')');
        $('#revenue').html(upDown[revenue] + getCanonical(revenue));
      } else if (numAtAGlance < 2) {
        getPageName(company + ' Inc.'); //try again by appending Inc. to company name
        return;
      }

      //rest of finances
      markup = markup.replace(/\[.*\]/g, '').replace(/\(.*\)/g, '');
      var operating = markup.match(/Operating Income.*\n+(.*)/gi);
      if (operating) {
        operating = operating[0].replace(/Operating Income/i, '').replace(/^\s*|\s*$/g, '');
        $('#operating-income').html(upDown[operating] + getCanonical(operating));
      }
      var net = markup.match(/Net Income.*\n+(.*)/gi);
      if (net) {
        net = net[0].replace(/Net Income/i, '').replace(/^\s*|\s*$/g, '');
        $('#net-income').html(upDown[net] + getCanonical(net));
      }
      var total = markup.match(/Total Assets.*\n+(.*)/gi);
      if (total) {
        total = total[0].replace(/Total Assets/i, '').replace(/^\s*|\s*$/g, '');
        $('#total-assets').html(upDown[total] + getCanonical(total));
      }
      var equity = markup.match(/Total Equity.*\n+(.*)/gi);
      if (equity) {
        equity = equity[0].replace(/Total Equity/i, '').replace(/^\s*|\s*$/g, '');
        $('#total-equity').html(upDown[equity] + getCanonical(equity));
      }

      //display company overview at the end
      if (companyOverview === '') {
        fullName = '';
      }
      $('#company-overview').text(fullName + ' ' + companyOverview);
    },
    error: function (errorMessage) {
    }
  });

}
