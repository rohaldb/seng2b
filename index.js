
$(document).ready(function(){
  $("#search-stock").click(function() {
    var stock = $("#stock-name").val();
    console.warn("searching for " + stock);
    getStockPriceOf(stock);
  });
  getStockPriceOf("amzn");


});
function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
}
