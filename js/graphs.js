
$(document).ready(function(){

  // autocomplete
  var options = {
  	data: companies,
  	getValue: function (element) {
      return $(element).prop("Symbol")+ " - " + $(element).prop("Name");},
  	list: {
      onChooseEvent	: function(event) {
        var stockInfo = $("#function-data").getSelectedItemData();
        //run the search
        console.warn("Searching for stock " + stockInfo.Name);
        getStockPriceOf(stockInfo);
      },
  		match: {
  			enabled: true
  		}
  	},
    // theme: "plate-dark",
  };
  $("#function-data").easyAutocomplete(options);

  $('input.autocomplete').autocomplete({
      data: {
        "Apple": null,
        "Microsoft": null,
        "Google": 'https://placehold.it/250x250'
      },
      limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
      onAutocomplete: function(val) {
        // Callback function when value is autcompleted.
      },
      minLength: 1, // The minimum length of the input for the autocomplete to start. Default: 1.
    });

    console.warn("asjdnaskjdn");

});


function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}
