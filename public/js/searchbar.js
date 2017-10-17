$(document).ready(function(){
  $(function() {
    $('input.autocomplete-main').autocomplete({
      data: company_keys,
      limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
      onAutocomplete: function(val) {
        // Callback function when value is autcompleted.
        console.log(companies[val]);
        console.warn("Searching for stock " + companies[val].Name);
        var escapedSymbol = encodeURIComponent(companies[val].Symbol);
        var escapedName = encodeURIComponent(companies[val].Name);
        window.location.replace("/stock?stock=" + escapedSymbol + "&company=" + escapedName);
        // getStockPriceOf(escapedSymbol);
      },
      minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });
  });
});
