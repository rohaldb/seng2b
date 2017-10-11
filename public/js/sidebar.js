//add new group to user's profile in firebase & update displayed groups on sidebar
$("#new-group-bttn").on("click", function() {
  var name = $('#new-group-name').val();
  var type = $('#group-type').val();
  var data = {
    'name': name,
    'type': type
  };
  console.log(data);
  $.ajax({
    url: "/new_group",
    method: "POST",
    data: data,
    dataType: "json",
    success: function(response) {
      console.log("success, result = " + JSON.stringify(response));
/*
      for (var group in response.groups) {
        var name = response.groups['name'];
        var type = response.groups['type'];
        console.log('group: ' + name + ' ' + type);
        $('#slide-out').prepend('<li><a href="/groups?group=' + name + '"><i class="material-icons ">group</i>' + name + '</a></li>');
      }
*/
    },
    error: function(response) {
      console.log("failed, result = " + JSON.stringify(response));
    }
  });
});

//get current user's groups and append to sidebar
$.ajax({
  url: "/get_user_info",
  method: "POST",
  data: '',
  dataType: "json",
  success: function(response) {
    console.log("success, result = " + JSON.stringify(response));
    for (var group in response.groups) {
      var name = response.groups['name'];
      var type = response.groups['type'];
      console.log('group: ' + name + ' ' + type);
      $('#slide-out').prepend('<li><a href="/groups?group=' + name + '"><i class="material-icons ">group</i>' + name + '</a></li>');
    }
  },
  error: function(response) {
    console.log("failed, result = " + JSON.stringify(response));
  }
});
