
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



});


function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}
