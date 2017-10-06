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

    var email = document.getElementById('email').value
    var password = document.getElementById('password').value

    if (email && password) {

        try {
            const result = await firebase.auth().signInWithEmailAndPassword(email, password);
            if (result) {
                window.location.href = "/stock?" + result.uid;
                console.log("successs login")
            }
        } catch (e) {
            console.log('wrong username or password');
            console.error(e);
        }

    }
});
