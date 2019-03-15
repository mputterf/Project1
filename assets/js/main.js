var mainApp = {};

(function () {
    var firebase = app_firebase;
    const db = firebase.database();
    const dbr = db.ref();
    var uid = null;
    var userName = "";
    var postal = "";
    countryCode = "us";
    let uidState = false;
    deBugger = true;

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Run once the User is signed in.
            if(deBugger){
                console.log(user);
            };
            uid = user.uid;
            userName = user.displayName;
          
            
            zipChange();
            keyFinder();
            //delay necessary due to the time it takes for the other functions to run
            setTimeout(() => {
                displayName();
                zreturn();   
                getWeather();
              getNews();
            }, 1000);

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

      // Creating weather wrapper to overwrite HTML every time new zip is made
      let weatherWrapper = $("<div/>");
      weatherWrapper.addClass("weather-wrapper");

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
        // populate the weatherWrapper
        weatherWrapper.append(weatherDiv);
      }
      
      // overwrite old news when zip is updated
      $(".cardWeather").html(newsWrapper);
      console.log("weather Updated");
    }

    function getNews(){
            var apiKey = 'ff02f8fa534944bdabc33f466133f39a';
            var queryURL = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=ff02f8fa534944bdabc33f466133f39a';
            $.ajax({
                url: queryURL,
                method: "GET"
    
            }).then(function (newsResponse) {
                console.log(newsResponse);
               displayNews(newsResponse);
            });
    }
    
     function displayNews(newsResponse){
         // Creating news wrapper to overwrite HTML every time new zip is made
         let newsWrapper = $("<div/>");
        newsWrapper.addClass("news-Wrapper");

        for(var i = 0; i < 5; i++){  
        if(deBugger){console.log("this news loop is running")};
        // The list item that will house everything
        var newsDiv = $("<li>");
        // Store the link
        var newsItem = $("<a>");
        // Giving each news item the class and an id
        newsDiv.addClass("news-data");
        newsDiv.attr("id", "news-headlines-" + i);
        // append article link
        newsItem.attr("href", newsResponse.articles[i].url);
        // So the article opens in a new tab
        newsItem.attr("target", "_blank");
        // So the user sees the article title
        newsItem.text(newsResponse.articles[i].title)
        // append the link to the new list item
        newsDiv.append(newsItem);
        // populate the newsWrapper
        newsWrapper.append(newsDiv);
    
        }

    // overwrite old news when zip is updated
        $(".news").html(newsWrapper);
        console.log("news Updated");
    }

    // sets placeholder as your zip
        let zreturn = () => {
            console.log(postal);
            $('.zip-input').attr("placeholder", "Current Zip: " + postal);
        }
        

    // set postal as a temp variable
    let zipChange = () => {
        $(".zip-btn").on("click", function() {
            let zi = $(".zip-input").val().trim();
                postal = zi;
                getWeather();
                getNews();
                console.log(postal);
        });
    }

    //error function to display prompt
    let error = (id) => {
        let tempW = $("<div/>");
        tempW.css({
            "position": "absolute",
            "top": "calc(50% - 100px)",
            "left": "calc(50% - 300px)",
            "width": "600px",
            "height": "200px",
        });
        tempW.addClass("error");
        let temp = $("<div/>");
        temp.css({
            "position" : "relative",
            "display": "grid",
            "justify-items": "center",
            "align-items": "center",
            "z-index": "100",
            "width": "600px",
            "height": "200px",
            "background-color": "red",
            "color": "black",
            "font-family": "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
            "font-weight": "bolder",
            "border": "5px inset black",
            "border-radius": "10px",
            "font-size": "30px",
            "text-align": "center"
        });
        let tempP = $("<p/>");
        let close = $("<div/>");
        close.text("X");
        close.css({
            "position": "absolute",
            "top": "0",
            "right": "10px",
            "font-family": "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
            "font-weight": "bolder",
            "font-size": "50px",
            "color": "black",
            "width": "50px",
            "height": "50px"
        });
        close.attr("id", "close");
        tempP.text(id);
        temp.append(tempP).append(close);
        tempW.append(temp);
        $("body").append(tempW).on("click", "#close", function () {
            $(this).parent().parent().remove();
        });
    }


    // push zipcode and UID to db
    let pushDB = () => {
        dbr.push({
            uid,
            postal,
        });
        
    }
    
    // finds key to current UID
    let keyFinder = () => {
        dbr.orderByChild("uid").equalTo(uid).on("value", (snap) => {
            snap.forEach((child) => {
                let uidKey = child.key;
                console.log("this is the UID Key: " + uidKey);
                console.log("Zipcode pulled from Firebase DB");
                uidState = true;
                postal = child.val().postal;
            });
        });
        setTimeout(() => {
            dbKeyChecker();
        }, 500);
        
    }

    // checks if youre in the db already
    let dbKeyChecker = () => {
        if(!uidState){
            pullPostal();
            setTimeout(() => {
                pushDB();    
            }, 500);
        }
    }

  
    //capture the users IP address and utilize it to pull news and weather
let pullPostal = () => {
    console.log("Zipcode Pulled from IP via ipinfo.io");
    $.get("https://ipinfo.io", function (response) {
        postal = response.postal;
        countryCode = response.country;
        if (deBugger) {
            console.log(response);
        };
    }, "jsonp");
}

})()
