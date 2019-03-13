var app_firebase = {};
(function(){

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyALaUXqsRc5M7xrTBs5MoSqtQshkJmZX8M",
    authDomain: "adash-6b191.firebaseapp.com",
    databaseURL: "https://adash-6b191.firebaseio.com",
    projectId: "adash-6b191",
    storageBucket: "adash-6b191.appspot.com",
    messagingSenderId: "746468989704"
  };
  firebase.initializeApp(config);

  app_firebase = firebase;
})()