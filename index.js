
$(document).ready(function(){
  $("#search-stock").click(function() {
    var stock = $("#stock-name").val();
    console.warn("searching for " + stock);
    getStockPriceOf(stock);
  });
  getStockPriceOf("amzn");

});
