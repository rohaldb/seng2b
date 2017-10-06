var app = firebase.initializeApp({
  apiKey: 'AIzaSyCruoCX_m38WliVCubNRBPqyCjGfwA_M8k',
  authDomain: 'newstock-4f49e.firebaseapp.com',
  databaseURL: 'https://newstock-4f49e.firebaseio.com',
  projectId: "newstock-4f49e",
  storageBucket: '',
  messagingSenderId: '877130652031'
});

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
    method: "get",
    data: {firstName: "ben"},
    dataType: "json",
    success: function(result){
      console.log("success");
    }
  });
});

//
// if (firstName && lastName && email && password) {
//
//     try {
//         const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
//         if (result) {
//             console.log(result.uid)
//             await firebase.database().ref(`users/${result.uid}`).set({
//               firstName: firstName,
//               lastName: lastName,
//               email: email,
//               userId: result.uid
//             });
//             window.location.href = "/stock?" + result.uid;
//             console.log("successs")
//         }
//     } catch (e) {
//         console.log('The username you entered already exists');
//         console.error(e);
//     }

// }
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
