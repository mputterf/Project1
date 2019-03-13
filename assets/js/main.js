var mainApp = {};

(function () {
    var firebase = app_firebase;
    var uid = null;
    var userName = "";
    var postal = "";
    countryCode = "";
    deBugger = true;

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Run once the User is signed in.
            if(deBugger){
                console.log(user);
            };
            uid = user.uid;
            userName = user.displayName;
            displayName();
            getWeather();
        } else {
            //no user signed in
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

    function getWeather() {
        var apiKey = 'APPID=a7f3e822eb731f30ddbb12e9307014cb';
        var queryURL = 'http://api.openweathermap.org/data/2.5/forecast?' + apiKey + '&zip=' + postal + ',' + countryCode;
        $.ajax({
            url: queryURL,
            method: "GET"
            
        }).then(function (weatherResponse) {
            console.log(weatherResponse);
        });
    }

    //capture the users IP address and utilize it to pull news and weather

    $.get("https://ipinfo.io", function (response) {
        postal = response.postal;
        countryCode = response.country;
        if (deBugger) {
            console.log(response);
        };
    }, "jsonp")

})()