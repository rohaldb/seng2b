$(document).ready(function(){
  console.warn("should be second");
$('input.autocomplete').autocomplete({
    data: company_keys,
    limit: 10, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function(val) {
      // Callback function when value is autcompleted.
      console.log(companies[val]);
      console.warn("Searching for stock " + companies[val].Name);
      getStockPriceOf(companies[val].Symbol);
    },
    minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
  });
});
