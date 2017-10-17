var vue = new Vue({
  el: '#elem1',
  data: {
    errorMessage: "",
  }
});

$("#signUpSubmit").on("click", function() {
  var data = {
    firstName: $('#firstName').val(),
    lastName: $('#lastName').val(),
    email: $('#email').val(),
    password: $('#password').val(),
  };
  if (data.firstName.match(/^\s*$/) || data.lastName.match(/^\s*$/) || data.email.match(/^\s*$/) || data.password === '') {
    vue.errorMessage = 'All fields required';
  } else {
    console.log(data);
    $.ajax({
      url: "/sign_up_user",
      method: "POST",
      data: data,
      dataType: "json",
      success: function(response){
        console.log("success, result = " + JSON.stringify(response));
        window.location.href = "/profile";
      },
      error: function(response){
        vue.errorMessage = response.responseJSON.error.message;
      },
    });
  }
});


async function login () {
  var data = {
    email: $('#email').val(),
    password: $('#password').val(),
  };
  console.log(data);
  $.ajax({
    url: "/sign_in_user",
    method: "POST",
    data: data,
    dataType: "json",
    success: function(response){
      console.log("success, result = " + JSON.stringify(response));
      window.location.href = "/profile";
    },
    error: function(response){
      vue.errorMessage = "Invalid username or password";
    },
  });
}

$("#logInSubmit").on("click", login);
$("#loginForm").keydown(function (e) {
    if (e.which === 13) { // If enter pressed
        login();
    }
});
