var mainApp = {};

(function () {
    var firebase = app_firebase;
    var uid = null;
    var userName = "";
    var postal = "";
    deBugger = false;

    firebase.auth().onAuthStateChanged(function (user) {
       

        if (user) {
            // User is signed in.
            if(deBugger){
                console.log(user);
            };
            uid = user.uid;
            userName = user.displayName;
            displayName();
            getWeather();
        } else {
            uid = null;
            window.location.replace("index.html");
        }
    });

    function logOut(){
        if(deBugger){
            console.log("I fired! Logout");
        };

        firebase.auth().signOut();
    }
    mainApp.logOut = logOut;
    $("#signOut").on("click", mainApp.logOut); 
    
    function displayName(){

        var newDiv = $("<div>");
        newDiv.append("Welcome " + userName + " Your Zipcode is " + postal);
        $(".mainContent").append(newDiv);

    }
    //capture the users IP address and utilize it to pull news and weather

    $.get("https://ipinfo.io", function (response) {
        postal = response.postal;
        if (deBugger) {
            console.log(response);
        };
    }, "jsonp")


    function getWeather() {
        queryURL = 'http://api.openweathermap.org/data/2.5/forecast?zip={' + postal + '};'
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (weatherResponse) {
            console.log(weatherResponse);
        }
        )
    };
})()