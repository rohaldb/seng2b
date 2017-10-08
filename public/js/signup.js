$("#signUpSubmit").on("click", function() {
  var data = {
    firstName: $('#firstName').val(),
    lastName: $('#lastName').val(),
    email: $('#email').val(),
    password: $('#password').val(),
  };
  console.log(data);
  $.ajax({
    url: "/sign_up_user",
    method: "POST",
    data: data,
    dataType: "json",
    success: function(response){
      console.log("success, result = " + JSON.stringify(response));
    },
  });
});


$("#logInSubmit").on("click", async function() {
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
    },
  });
});
