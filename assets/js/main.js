var mainApp = {};

(function () {
    var firebase = app_firebase;
    var uid = null;
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            uid = user.uid;
        } else {
            uid = null;
            window.location.replace("index.html");
        }
    });

    function logOut(){
        firebase.auth().signOut();
        console.log("I fired! Logout")
    }
    mainApp.logOut = logOut;
    $("#button").on("click", mainApp.logOut); 
})()