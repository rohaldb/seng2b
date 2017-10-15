$('.modal').modal();

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').
  replace(/>/g, '&gt;').replace(/"/g, '&#034;').replace(/'/g, '&#039;');
}

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
      var groupLink = '<a href="/groups?group=' + encodeURIComponent(name) +
        '&id=' + encodeURIComponent(response.group) +  '"><i class="material-icons ">group</i>' +
        escapeHtml(name) + '</a>';
      $('#list-of-groups').append('<li>' + groupLink + '</li>');
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
    var obj = response.groups;
    if (obj !== undefined) {
      Object.keys(obj).forEach(function(key) {
        var name = obj[key];
        console.log('adding group "' + name + '" to sidebar');
        var groupLink = '<a href="/groups?group=' + encodeURIComponent(name) +
          '&id=' + encodeURIComponent(key) +  '"><i class="material-icons ">group</i>' +
          escapeHtml(name) + '</a>';
        $('#list-of-groups').append('<li>' + groupLink + '</li>');
      });
    }
  },
  error: function(response) {
    console.log("failed, result = " + JSON.stringify(response));
  }
});
