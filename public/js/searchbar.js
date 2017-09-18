$(document).ready(function(){
  // Main (top) search bar autocompletion - reads data from listofcompanies.js
  $('input.autocomplete-main').autocomplete({
    data: company_keys,
    limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function(val) {
      // Callback function when value is autcompleted.
      console.log(companies[val]);
      console.warn("Searching for stock " + companies[val].Name);
      getStockPriceOf(companies[val].Symbol);
    },
    minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
  });

  // Friends search bar autocompletion (e.g. invite) - reads data from listofusers.js
  // TODO populate from Firebase when login is setup instead
  $('input.autocomplete-friends').autocomplete({
    data: user_keys,
    limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function(val) {
        // Callback function when value is autcompleted.
        console.log(val);
    },
    minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
  });
});
