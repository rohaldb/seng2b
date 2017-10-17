var getUrlParameter = function getUrlParameter(sParam) {
  var urlString = window.location;
  var url = new URL(urlString);
  var c = url.searchParams.get(sParam);
  return (c === undefined) ? true : decodeURIComponent(c);

/*
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1].replace(/\+/g, " ");
        }
    }
*/
};
