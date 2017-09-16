$(document).ready(function(){
console.log(company_keys);
$('input.autocomplete').autocomplete({
    data: company_keys,
    limit: 10, // The max amount of results that can be shown at once. Default: Infinity.
    onAutocomplete: function(val) {
      // Callback function when value is autcompleted.
    },
    minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
  });

});
