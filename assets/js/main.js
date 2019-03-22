var mainApp = {};

(function () {
    var firebase = app_firebase;
    const db = firebase.database();
    const dbr = db.ref();
    var uid = null;
    var userName = "";
    var postal = "";
    countryCode = "us";
    let userEmail = "";
    let userPw = "";
    let uidState = false;
    let uidKey;
    deBugger = true;
    var geocoder = new google.maps.Geocoder();

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // Run once the User is signed in.
            delayLoader();
            if(deBugger){
                console.log(user);
            };
            uid = user.uid;
            userName = user.displayName;

            //functions to execute upon page load
            setUser();
            myAccount(userName);
            zipChange();

            //delay necessary due to the time it takes for the other functions to run
            setTimeout(() => {
                displayName();
                zreturn();
                getWeather();
                getNews();
            }, 1500);

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
        newDiv.attr("id", "welcome");
        newDiv.text("Welcome " + userName + " the zip code you are viewing is " + postal);
        $(".mainContent").append(newDiv);
        var space = $("<br><br>");
        $("#welcome").append(space);
        var contentDiv = $("<div>");
        contentDiv.attr("id", "main-content");
        $("#welcome").append(contentDiv);
    }



    $('#ticketmaster').click(function(){ loadSearch(); return false; });

    // loads the search into the main content div
    function loadSearch() {
        $("#welcome").empty();
        var form = $("<form>");
        var userInstructions = $("<div>Enter a keyword to search on</div>");
        $("#welcome").append(form);
        form.append(userInstructions);
        var searchInput = $("<input type='text' id='ticketmasterkeywordsearchfield'>");
        form.append(searchInput);
        var space = $("<br><br>");
        form.append(space);
        var searchButton = $("<button id='ticketmastersearch' type='submit'>Search</button>");
        form.append(searchButton);
    }

    $(document).on("click","#ticketmastersearch", function () {
        var ticketmaster = true;
        convertZiptoLatLong(ticketmaster, function(){});
    });

    function convertZiptoLatLong(ticketmaster, callbackfunction) {
        var lat = '';
        var lng = '';
        // var address = postal;
        // geocoder.geocode( { 'address': address}, function(results, status) {
        // if (status == google.maps.GeocoderStatus.OK) {
        //     lat = results[0].geometry.location.lat();
        //     lng = results[0].geometry.location.lng();
        //     var latlng = {lat, lng};
        //     if (deBugger) {
        //         console.log("latlng: ", latlng);
        //     }
        //     // call ticketmaster here

        var geoKey = "QNsATavzcxyMxvtmbBmg8rPQRBynQnGA";
        var geocodeURL = "https://www.mapquestapi.com/geocoding/v1/address?key=" + geoKey + "&location=" + postal;

        $.ajax({
          url: geocodeURL,
          method: "GET"
        }).then( function (georesponse){
          console.log("geo", georesponse.results[0].locations[0].latLng);

          var latlng = georesponse.results[0].locations[0].latLng;
          // var latlng = {geoLatLngResponse.lat, geoLatLngResponse.lng};
        // });
            if (ticketmaster){
              getTicketmasterEvents(latlng);
            } else {
              callbackfunction(latlng);
            }
        //
        // } else {
        //     console.log("Geocode was not successful for the following reason: " + status);
        // }
        });
    }

    function googlePlaces(latlng) {
        // googlePlaces
        if (deBugger) {
           console.log(latlng);
        }

        let baseUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        let apiKey = 'AIzaSyD2fMFXXjaU_--ubFbg8T6rLWaju98eAeI';
        const keys = {
            location:`${latlng.lat},${latlng.lng}`,
            radius: 500,
            types: 'cafe',
            key: apiKey
        };
        $.ajax({
            url: `${baseUrl}?location=${keys.location}&radius=${keys.radius}&types=${keys.types}&key=${keys.key}`,
            method: "GET"

        }).then(function (data) {
            console.log(data);
        });
        //https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=34.1103407,-118.25850960000002&radius=500&types=cafe&key=AIzaSyD2fMFXXjaU_--ubFbg8T6rLWaju98eAeI
    }

    //uses link #2
    function getTicketmasterEvents(latlng) {
        if (deBugger) {
            console.log(latlng);
         }
        //https://developer.ticketmaster.com/api-explorer/v2/
        //SB: 41.7132821, -86.21076719999996
        //LA: 4.1103407,-118.25850960000002

        //https://app.ticketmaster.com/discovery/v2/events?apikey=BHuf4uL2WnsQL8kxNUsmYVVLnoKKAAE9&latlong=41.7132821,-86.21076719999996&radius=115&unit=miles&page=1&sort=name,date,asc&countryCode=US

        //var keyword = $("#ticketmasterkeywordsearchfield").val().trim().replace(/\s/g,'%20');
        var keyword = $("#ticketmasterkeywordsearchfield").val();
        if (deBugger) {
            console.log("keyword", keyword);
            //https://app.ticketmaster.com/discovery/v2/events?apikey=BHuf4uL2WnsQL8kxNUsmYVVLnoKKAAE9&keyword=basketball%20field&countryCode=US
        }
        //TODO: have user put key in search field and search for that - stuck on multi-keyword entries.
        //TODO: display all results on a page - display more result items like picture, etc
        //TODO: what if you have more than 20 results? &page= (look at page information at the top) - make a arrow container
        //TODO: make it all fit in the height of the maincontent tag
        let baseUrl = 'https://app.ticketmaster.com/discovery/v2/events';
        let apiKey = 'BHuf4uL2WnsQL8kxNUsmYVVLnoKKAAE9';
        const keys = {
            latlong:`${latlng.lat},${latlng.lng}`,
            radius: 115,
            unit: "miles",
            pages: 1,
            key: apiKey,
            keyword: keyword,
            sort: "name,date,asc",
            countryCode: "US"
        };
        if (deBugger) {
            //console.log(`${baseUrl}?apikey=${keys.key}&latlong=${keys.latlong}&radius=${keys.radius}&unit=${keys.unit}&pages=${keys.pages}&sort=${keys.sort}&keyword=${keys.keyword}&countryCode=${keys.countryCode}`);
            console.log(`${baseUrl}?apikey=${keys.key}&keyword=${keys.keyword}`);
        }
        $.ajax({
            //url: `${baseUrl}?apikey=${keys.key}&latlong=${keys.latlong}&radius=${keys.radius}&unit=${keys.unit}&pages=${keys.pages}&sort=${keys.sort}&keyword=${keys.keyword}&countryCode=${keys.countryCode}`,
            url: `${baseUrl}?apikey=${keys.key}&keyword=${keys.keyword}&radius=${keys.radius}&sort=${keys.sort}`,
            method: "GET"
        }).then(function (data) {
            if (deBugger) {
                console.log(data);
                //console.log(data._embedded.events[0].name);
            }
            displyTicketmasterResults(data);
        });
    }


    //TODO: see what page we are on.  calculate total number of pages.  if there are more events, display a right chevron.  if we are on page > 0, diesplay a left chevron.
    //TODO: when click on the event, then display details and have a back button as well.
    //when a left chevron is clicked, go to the previous page, when a right chevron is clicked, go to the next page.
    function displyTicketmasterResults(results) {
        $("#welcome").empty();
        //results._embedded.events gives an array, so stuff in results is an array and should be accessed with results[i]
        //alert(typeof results._embedded)
        if (typeof results._embedded === "undefined") {
            if (deBugger) {
                console.log("There are no results for this search term.");
            }
            var ticketmasterDiv = $("<div>");
            ticketmasterDiv.text("There are no results for this search term.")
            $("#welcome").append(ticketmasterDiv);
        }
        else {
      var results = results._embedded.events;

      // Creating weather wrapper to overwrite HTML every time new zip is made
      let ticketmasterWrapper = $("<div>");
      ticketmasterWrapper.addClass("ticketmaster-wrapper");
      // Boostrap card
      ticketmasterWrapper.addClass("card");
      ticketmasterWrapper.addClass("text-success");

      // Card header
      let ticketmasterEventsTextDiv = $("<div/>");
      ticketmasterEventsTextDiv.addClass("card-header");
      ticketmasterEventsTextDiv.html("<strong>Ticketmaster Events Near You</strong>");
      ticketmasterWrapper.append(ticketmasterEventsTextDiv);
      //TODO: need a wrapper div like below
      var rightChevron = $("<span class='right-chevron glyphicon glyphicon-chevron-right' data-page='0'></span>");
      var leftChevron = $("<span class='left-chevron glyphicon glyphicon-chevron-left' data-page='0'></span>");

      let resultsList = $("<ul>");
      resultsList.addClass("list-group");
      resultsList.addClass("list-group-flush");

      //should the be the top 20 events
      for (var i=0; i<results.length; i++){
        // Create new div for each forecast
        var listItemDiv = $("<li>");
        listItemDiv.addClass("list-group-item");
        listItemDiv.attr("id", "ticketmaster-event-" + i);


        // Display the name of the event

        var nameDiv = $("<div>");
        nameDiv.attr("id", "ticketmaster-name-div");
        nameDiv.text(results[i].name);
        listItemDiv.append(nameDiv);

        var wrapperDiv = $("<div>");
        wrapperDiv.attr("id", "ticketmaster-date-and-venue-wrapper-div");
        listItemDiv.append(wrapperDiv);

        // Display the date of the event
        var dateDiv = $("<div>");
        dateDiv.attr("id", "ticketmaster-date-div");
        dateDiv.text(results[i].dates.start.localDate);
        wrapperDiv.append(dateDiv);

        // Display the venue of the event
        var venueDiv = $("<div>");
        venueDiv.attr("id", "ticektmaster-venue-div");
        venueDiv.text(results[i]._embedded.venues[0].name);
        wrapperDiv.append(venueDiv);


        //listItemDiv.text(results[i].name)

        // populate the ticketmasterWrapper
        ticketmasterWrapper.append(listItemDiv);
      }

      // overwrite main content div
      $("#welcome").append(ticketmasterWrapper);
      console.log("Ticket Event Updated");
    }
    }


    function sleep(delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
    }



    function getWeather() {
        var weatherAPIKey = '9602d3b72d584a3fad8204559191503';
        // Max days to return is 10 days according to the docs
        var forecastDays = 5;
        var queryURL = 'https://api.apixu.com/v1/forecast.json?key=' + weatherAPIKey + '&q=' + postal + '&days=' + forecastDays;
        $.ajax({
            url: queryURL,
            method: "GET"

        }).then(function (weatherResponse) {
            console.log("Weather object", weatherResponse.forecast.forecastday);
            displayWeather(weatherResponse);
        });
    }

    function displayWeather(weatherResponse) {
      // weatherResponse.forecast.forecastday gives an array, so stuff in results is an array and should be accessed with results[i]
      var results = weatherResponse.forecast.forecastday;

      // Creating weather wrapper to overwrite HTML every time new zip is made
      let weatherWrapper = $("<div/>");
      weatherWrapper.addClass("weather-wrapper");
      // Boostrap card deck so the weather cards line up horizontally
      weatherWrapper.addClass("card-deck");

      for (var i=0; i<results.length; i++){
        // Create new div for each forecast
        var weatherDiv = $("<div>");

        //weatherDiv Styling
        weatherDiv.css({
            "width": "calc(100% - 10px)",
            "margin": "5px",
            "display": "grid",
            "align-items": "center",
            "justify-items": "center",
        });

        // give it a boostrap card for a boarder
        weatherDiv.addClass("card");
        // Own class for the card
        weatherDiv.addClass("weather-card");
        // Give the data a class.
        weatherDiv.addClass("weather-data");
        // Give each forecast an id
        weatherDiv.attr("id", "weather-forecast-" + i);
        // Display the date and time the forecast is for.
        weatherDiv.append("<img class=weather-condition src=https:" + results[i].day.condition.icon + " >");
        weatherDiv.append("<p class=weather-info>" + moment(results[i].date).format('ddd') + "</p>");
        // Display high for the day
        weatherDiv.append("<p class=weather-info> High: " + parseInt(results[i].day.maxtemp_f) + "°F </p>");
        // Display low for the day
        weatherDiv.append("<p class=weather-info> Low: " + parseInt(results[i].day.mintemp_f) + "°F </p>");
        // Display wind speed
        // weatherDiv.append("<p class=weather-info> Wind Speed: " + parseInt(results[i].day.maxwind_mph) + "mph </p>");
        // // Weather condition

        // populate the weatherWrapper
        weatherWrapper.append(weatherDiv);
      }

      // overwrite old news when zip is updated
      $(".weather").html(weatherWrapper);
      console.log("weather Updated");
    }

    function getNews(){
            var newsAPIKey = 'ff02f8fa534944bdabc33f466133f39a';
            var queryURL = 'https://newsapi.org/v2/top-headlines?country=us&apiKey=' + newsAPIKey;
            $.ajax({
                url: queryURL,
                method: "GET"

            }).then(function (newsResponse) {
                console.log("news object", newsResponse);
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
        var newsDiv = $("<div>");
        // Store the link
        var newsItem = $("<a>");
        // thumbnail
         var newsImage = $("<img>");
        // assign a news image class
         newsImage.addClass("news-img");
        // set img source
         newsImage.attr("src", newsResponse.articles[i].urlToImage);
        // clear fix for the thumbnails
         newsDiv.addClass("clearfix");
        // Giving each news item the class and an id
        newsDiv.addClass("news-data");
        newsDiv.attr("id", "news-headlines-" + i);
        // append article link
        newsItem.attr("href", newsResponse.articles[i].url);
        // So the article opens in a new tab
        newsItem.attr("target", "_blank");
        // So the user sees the article title
        newsItem.text(newsResponse.articles[i].title)
        // append the thumbnail to the new list item
        newsDiv.append(newsImage);
        // append the link to the new list item
        newsDiv.append(newsItem);
        // populate the newsWrapper
        newsWrapper.append(newsDiv);
        }


    // overwrite old news when zip is updated
        $(".news").html(newsWrapper);
        console.log("news Updated");
    }


    // Mapquest points of interest
    $(document).on("click", "#points-of-interest", function(){
      $("#welcome").empty();

      // Search box and button for place of interests
      var mapSearchDiv = $("<div>");
      mapSearchDiv.attr("id", "map-search-div");
      mapSearchDiv.text("Enter some place to search for");
      var breakLine = $("<br>");
      mapSearchDiv.append(breakLine);
      $("#welcome").append(mapSearchDiv);
      var mapSearchBox = $("<input>");
      mapSearchBox.attr("id", "map-search-box");
      mapSearchDiv.append(mapSearchBox);
      var mapSearchButton = $("<button>");
      mapSearchButton.attr("id", "map-search-button");
      mapSearchButton.text("Search");
      mapSearchDiv.append(mapSearchButton);

      makeMapDiv();

    });

    function makeMapDiv(){
      var mapDiv = $("<div>");
      mapDiv.attr("id", "map");
      $("#welcome").append(mapDiv);
    }

    $(document).on("click", "#map-search-button", function(){
        // So ticketmaster doesn't get triggers
        var ticketmaster = false;
        // get rid of any map already on the page so we can get ready for a new one
        $("#map").remove();
        makeMapDiv();
        convertZiptoLatLong(ticketmaster, getPointsOfInterest);
    });

    function getPointsOfInterest(latlng){
      var apiKeyMapSearch = "Zo2ZmNO0bAEQ22WrffsasBZg6BgcAXkm";
      var pointSearch = $("#map-search-box").val();
      var mapQueryUrl = "https://api.tomtom.com/search/2/poiSearch/"+ pointSearch +".json?&limit=20countrySet=US&lat=" + latlng.lat + "&lon=" + latlng.lng + "&radius=32187&key="+ apiKeyMapSearch;


      $.ajax({
          url: mapQueryUrl,
          method: "GET"

      }).then(function (mapquestResponse) {
        if(deBugger){
          console.log("Points of interest object", mapquestResponse);
        }

          // API key for mapquest
          L.mapquest.key = "2oBp4gFXVpa5qgpXo2Dt3XWVAFlGt13M";

          var map = L.mapquest.map('map', {
          center: [latlng.lat, latlng.lng],
          // center: [34.17490, -118.61527],
          layers: L.mapquest.tileLayer('map'),
          zoom: 12
          });

          for(var i=0; i<mapquestResponse.results.length; i++){
            L.marker([mapquestResponse.results[i].position.lat, mapquestResponse.results[i].position.lon], {
            icon: L.mapquest.icons.marker(),
            draggable: false
          }).bindPopup(mapquestResponse.results[i].poi.name + "<br>" + mapquestResponse.results[i].address.freeformAddress).addTo(map);
          }


      });
    }

    // sets placeholder as your zip
        let zreturn = () => {
            console.log("Z RETURN HAS RUN AND THE POSTAL CODE IS : " + postal);
            $('.zip-input').attr("placeholder", "Current Zip: " + postal);
            $(".zip-input").css("font-size", "12px");
        }


    // set postal as a temp variable
    let zipChange = () => {
        // for clicking the change zipcode button
        let zinput = $(".zip-input");
        $(".zip-btn").on("click", function() {
            if(zinput.val().length === 5){
                let zi = zinput.val().trim();
                postal = zi;
                zinput.val("");
               refresh();
                if (deBugger){
                    console.log(postal);
                }
            }
        });
        // for pressing enter inside the zipcode input
        zinput.on("keypress", function(e) {
            if(e.which == 13 && zinput.val().length === 5){
                e.preventDefault();
                let zi = zinput.val().trim();
                postal = zi;
                zinput.val("");
                refresh();
                if (deBugger){
                    console.log(postal);
                }
            }
        });
    }

    //function to refresh weather, news, welcome
    let refresh = () => {
        getWeather();
        getNews();
        zreturn();
        $("#welcome").remove();
        displayName();
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
            "color": "black",
            "font-weight": "bolder",
            "border-radius": "15px 50px 30px",
            "font-size": "30px",
            "text-align": "center",
            "box-shadow": "0 5px 40px 2px rgba(155,155,155,1)",
            "background-color": "rgba(255, 255, 255, .9)",
            "font-family": "Arial, Helvetica, sans-serif;",
            "border": "3px rgba(74, 170, 165, .9) solid",
            "padding": "10px",
        });
        let tempP = $("<p/>");
        let close = $("<div/>");
        close.text("x");
        close.css({
            "position": "absolute",
            "top": "10px",
            "right": "20px",
            "font-family": "Arial, Helvetica, sans-serif",
            "font-weight": "bold",
            "font-size": "50px",
            "color": "black",
            "width": "50px",
            "height": "50px"
        });
        close.attr("id", "exit");
        tempP.text(id);
        temp.append("<div>Error:</div>").append(tempP).append(close);
        tempW.append(temp);

        let h = $("html");
        h.append(tempW);
        h.on("click", "#exit", function () {
            $(this).parent().parent().remove();
        });
    }

    //sets uid as child element in db and saves the zipcode if it hasn't been saved already
    let setUser = () => {
        dbr.on("value", (snap) => {
            if(snap.hasChild(uid)){
                db.ref(uid).on("value", (s) => {
                    let ptemp = s.val().postal;
                    if(ptemp.length == 5){
                        postal = ptemp;
                        console.log("Logged Zip: " + ptemp);
                    }
                    else{
                        pullPostal();
                    }
                });
            }
            else{
                pullPostal();
                setTimeout(() => {
                    db.ref(uid).set({
                        postal,
                    });
                }, 1000);
            }
        });
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

    let delayLoader = () => {
        let s = $(".splash");
        let body = $(".b");
        setTimeout(() => {
            s.fadeOut(1500);
        }, 500);

        body.fadeIn(2000).css({
            "pointer-events": "none",
        });
        setTimeout(() => {
            body.css({
                "pointer-events": "auto",
                "opacity": "1",
            });
        }, 2000);
    }


    //open modal when clicking my account
    let myAccount = (id) => {
        $("#myAccount").on("click", function () {
            let body = $("nav, section, footer");
            body.css({
                "opacity": ".5",
                "pointer-events": "none",
            });
            let tempW = $("<div/>");
            tempW.css({

                "pointer-events": "auto",
                "position": "absolute",
                "top": "calc(50% - 225px)",
                "left": "calc(50% - 425px)",
                "width": "850px",
                "height": "450px",
                "box-shadow": "0 5px 40px 2px rgba(155,155,155,1)",
                "background-color": "rgba(102, 102, 102, .85)",
                "border-radius": "15px 50px 30px",
                "opacity": "1",
            });

            tempW.addClass("account");
            let temp = $("<div/>");
            temp.css({
                "top": "calc(50% - 200px)",
                "left": "calc(50% - 400px)",
                "position" : "relative",
                "display": "grid",
                "justify-items": "center",
                "align-items": "center",
                "z-index": "99",
                "width": "800px",
                "height": "400px",
                "padding": "30px",
                "border-radius": "0",
                "box-shadow": "0 5px 40px 2px rgba(155,155,155,1)",
                "background-color": "rgba(255, 255, 255, .9)",
                "color": "black",
                "font-family": "Arial, Helvetica, sans-serif;",
                "font-weight": "bolder",
                "border": "3px rgba(74, 170, 165, .9) solid",
                "font-size": "30px",
                "text-align": "center"
            });
            let b = $("body");
            let tempH = $("<h2/>");
            let tempD = $("<div/>");
            let close = $("<div/>");
            let pdiv = $("<div/>");
            let idiv = $("<div/>");
            let img = $("<img/>");
            let email = $("<input/>");
            let zip = $("<input/>");
            let oldpw = $("<input/>");
            let newpw = $("<input/>");
            let sub = $("<button> Update </button>");
            tempH.text("My Accounts Settings for " + id);
            tempD.css({
                "display": "grid",
                "grid-template-columns": "1fr 2fr",
                "grid-template-rows": "90%",
                "grid-gap": "10px",
                "width": "100%",
                "height": "100%",
            });
            img.attr(
                'src', "assets/img/unknownProfile.jpg").css({
                "width": "200px",
                "height": "200px",
            });
            pdiv.css({
                "grid-row": "1/1",
                "grid-column": "1/1",
                "justify-self": "center",
                "align-self": "center",
            }).append(img);
            email.attr({
                "type": "email",
                "placeholder": "   example@email.com",
                "id": "email-update"
            }).css({
                "font-size": "15px",
                "color": "rgba(74, 170, 165, .9)",
                "width": "400px",
                "height": "30px",
                "outline": "none",
            });
            oldpw.attr({
                "type": "text",
                "placeholder": "   Old Password",
                "id": "old-pw",
            }).css({
                "font-size": "15px",
                "color": "rgba(74, 170, 165, .9)",
                "width": "400px",
                "height": "30px",
                "outline": "none",
            });
            newpw.attr({
                "type": "text",
                "placeholder": "   New Password",
                "id": "pw-update",
            }).css({
                "font-size": "15px",
                "color": "rgba(74, 170, 165, .9)",
                "width": "400px",
                "height": "30px",
                "outline": "none",
            });
            zip.attr({
                "type": "text",
                "maxlength": "5",
                "id": "zip-update",
                "placeholder": "   " + postal,
            }).css({
                "font-size": "15px",
                "color": "rgba(74, 170, 165, .9)",
                "width": "400px",
                "height": "30px",
                "outline": "none",
            });
            sub.attr({
                "type": "submit",
                "id": "account-update",
            }).css({
                "box-shadow": "0 5px 10px 2px rgba(155,155,155,1)",
                "background-color": "rgba(255, 255, 255, .9)",
                "color": "black",
                "font-family": "Arial, Helvetica, sans-serif;",
                "font-weight": "bolder",
                "border": "3px rgba(74, 170, 165, .9) solid",
                "border-radius": "15px 50px 30px",
                "font-size": "15px",
                "margin": "10px 0 10px auto",
                "width": "100px",
                "height": "35px",
                "display": "block",
                "text-align": "center",
                "outline": "none",
            });
            idiv.css({
                "grid-row": "1/1",
                "grid-column": "2/2",
                "justify-self": "left",
                "align-self": "center",
                "text-align": "left",
                "font-family": "Arial, Helvetica, sans-serif;",
                "font-weight": "bold",
                "font-size": "15px",
                "margin": "20px auto"
            });
            pdiv.append(img);
            idiv.append("<p style = 'margin: 5px auto;'>Change Email</p>").append(email);
            idiv.append("<p style = 'margin: 5px auto;'>Old Password</p>").append(oldpw);
            idiv.append("<p style = 'margin: 5px auto;'>New Password</p>").append(newpw);
            idiv.append("<p style = 'margin: 5px auto;'>Change Zip Code</p>").append(zip);
            idiv.append(sub);
            tempD.append(pdiv);
            tempD.append(idiv)
            close.text("x");
            close.css({
                "position": "absolute",
                "top": "30px",
                "right": "30px",
                "font-family": "Arial, Helvetica, sans-serif;",
                "font-weight": "bold",
                "font-size": "50px",
                "color": "grey",
                "width": "50px",
                "height": "50px",
                "cursor": "crosshair",
            });
            close.attr("id", "close");
            temp.append(tempH).append(tempD).append(close);
            tempW.append(temp);

            b.append(tempW);

            b.on("click", "#close", function () {
                $(this).parent().parent().remove();
                body.css({
                    "opacity": "1",
                    "pointer-events": "auto",
                });
            });

            b.on("click", "#account-update", function() {

                //zipcode Update
                if(zip.val().length === 5){
                    postal = zip.val();
                    db.ref(uid).update({
                        postal: zip.val(),
                    });
                }
                else{
                    console.log("NO ZIP INPUT");
                }

                //ReAuthenticate User && Email/PW update
                const opw = oldpw.val().trim();
                if(opw !== ""){
                    firebase.auth().onAuthStateChanged(function(cuser) {
                        if(cuser){
                            //ReAuth
                            let cred = firebase.auth.EmailAuthProvider.credential(
                                cuser.email,
                                opw
                            );
                            cuser.reauthenticateAndRetrieveDataWithCredential(cred).then(function() {
                                console.log("USER REAUTHENTICATED!!!!!");
                                //change email
                                let einput = email.val().trim();
                                if(einput.length > 0 ){
                                    cuser.updateEmail(einput).then(function() {
                                        //console.log("USER EMAIL HAS BEEN CHANGED TO: " + einput);
                                    }).catch(function(e) {
                                        console.log(e);
                                    });
                                }
                            }).catch(function(e) {
                                error(e.message);
                           }).then(function() {
                                //reAuth in case of new email
                                const credpw = firebase.auth.EmailAuthProvider.credential(
                                    cuser.email,
                                    opw
                                );
                                cuser.reauthenticateAndRetrieveDataWithCredential(credpw).then(function() {
                                    console.log("USER REAUTHENTICATED!!!!!");
                                    //change password
                                    let pinput = newpw.val().trim();
                                    if(pinput.length > 0){
                                        cuser.updatePassword(pinput);
                                        //console.log("USER PASSWORD HAS BEEN CHANGED TO: " + pinput);
                                    }
                                });
                            });
                        }
                        else{
                            console.log("SOMETHING WENT WRONG");
                            }
                    });
                }

                $(this).parent().parent().parent().parent().remove();
                body.css({
                    "opacity": "1",
                    "pointer-events": "auto",
                });

                refresh();
            });
        });
    }
})()
