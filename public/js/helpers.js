function timeSince(timeStamp) {
  var now = new Date(),
    secondsPast = (now.getTime() - timeStamp.getTime()) / 1000;
  if(secondsPast < 60){
    return parseInt(secondsPast) + 's ago';
  }
  if(secondsPast < 3600){
    return parseInt(secondsPast/60) + 'm ago';
  }
  if(secondsPast <= 86400){
    return parseInt(secondsPast/3600) + 'h ago';
  }
  if(secondsPast > 86400){
    var day = timeStamp.getDate();
    var month = timeStamp.toDateString().match(/ [a-zA-Z]*/)[0].replace(" ","");
    var year = timeStamp.getFullYear() == now.getFullYear() ? "" :  " "+timeStamp.getFullYear();
    var hours = timeStamp.getHours();
    var am_pm = hours >= 12 ? 'pm' : 'am';
    hours %= 12;
    hours = hours ? hours : 12;
    var minutes = timeStamp.getMinutes();
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return day + " " + month + year + " at " + hours + ":" + minutes + " " + am_pm;
  }
}