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
            console.log(weatherResponse.list);
            displayWeather(weatherResponse);
        });
    }

    function displayWeather(weatherResponse) {
      // weatherResponse.list gives an array, so stuff in results is an array and should be accessed with results[i]
      var results = weatherResponse.list;

      for (var i=0; i<weatherResponse.list.length; i++){
        // Create new div for each forecast
        var weatherDiv = $("<div>");

        // give it a boostrap card for a boarder
        weatherDiv.addClass("card");
        // Give the data a class.
        weatherDiv.addClass("weather-data");
        // Give each forecast an id
        weatherDiv.attr("id", "weather-forecast-" + i);
        // Display the date and time the forecast is for.
        weatherDiv.append("<li> Date & Time: " + results[i].dt_txt + "</li>");
        // Display temp (needs to be converted from K to F)
        weatherDiv.append("<ul> Temperature: " + parseInt((results[i].main.temp - 273.15) * (9/5) + 32) + " F </ul>");
        // Display wind speed
        weatherDiv.append("<ul> Wind Speed: " + results[i].wind.speed + " mph </ul>");
        // Status of the sky
        weatherDiv.append("<ul>" + results[i].weather[0].main + "</ul>");

        // Send it all to the html
        $(".weather").append(weatherDiv);
      }



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
