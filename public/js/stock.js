$('.modal').modal();

$('#tradeSlider').on(' input change', function(){
    console.log($('#tradeSlider').val());
    $('#tradeAmount').val($('#tradeSlider').val());
});

$('#tradeAmount').on('keyup', function(){
    // console.log($('#tradeAmount').val());
    $('#tradeSlider').val($('#tradeAmount').val());
});
