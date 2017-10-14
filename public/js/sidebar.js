$('.modal').modal();

//add new group to user's profile in firebase & update displayed groups on sidebar
$("#new-group-bttn").on("click", function() {
  var name = $('#new-group-name').val();
  if (name.match(/^\s*$/)) {
    Materialize.toast('Please enter a group name first', 1250);
    $('#new-group-name').val('');
    return;
  } else {
    name = name.replace(/\s+/g, ' ').trim();
    $('#new-group-name').val('');
  }
  var data = {
    'name': name
  }
  console.log(data);
  $.ajax({
    url: "/new_group",
    method: "POST",
    data: data,
    dataType: "json",
    success: function(response) {
      console.log("success, result = " + JSON.stringify(response));
      $('#list-of-groups').append('<li><a href="/groups?group=' + name + '"><i class="material-icons ">group</i>' + name + '</a></li>');
      Materialize.toast('Group created', 1250);
    },
    error: function(response) {
      Materialize.toast('Could not create group', 1250);
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
      console.log('group: ' + name);
      $('#list-of-groups').append('<li><a href="/groups?group=' + name + '"><i class="material-icons ">group</i>' + name + '</a></li>');
    }
  },
  error: function(response) {
    console.log("failed, result = " + JSON.stringify(response));
  }
});
