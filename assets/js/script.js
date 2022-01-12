var searchFormEl = $("form");
var searchBarEl = $("input");
var favoritesEl = $("#favorites");
var errorEl = $("#error-message-container");
var currentEl = $("#current-weather-display");
var forecastTitleEl = $("#five-day-title");
var forecastEls = $(".five-day-weather-display");
//An array for storing our previous search queries. Will be stored into and loaded from
//localStorage. Will only contain the previous eight distinct valid search queries.
var searchHistory = [];

//function for rendering recent history after g
function initialize(){
    var storedSearchHistory = JSON.parse(localStorage.getItem("searchHistory"));

    if (storedSearchHistory !== null){
        searchHistory = storedSearchHistory;
        for (var i = 0; i < searchHistory.length; i++){
            var newButton = $("<button>");
            newButton.text(searchHistory[i]);
            newButton.addClass("btn btn-secondary");
            favoritesEl.append(newButton);
        }
    }
}

//Our function for obtaining weather data for a city the user has searched for
function fetchCityWeather(city){
    //Using city input to create links to be used in api fetch requests
    var currentUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=e55bcf1a9dfbeb91667627f3095ed0b3";
    var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=e55bcf1a9dfbeb91667627f3095ed0b3";
    //This boolean will be set to true if our fetch request for the city's current weather returns a non-error code
    //Since we're searching the same weather info database, there shouldn't be 5-day forecast info for
    //a city with no current weather info, so we shouldn't need to check the responses for each separately
    var validCity = false;
    //Hiding our results and error message spaces again until results (or error message) load in
    errorEl.css("display", "none");
    currentEl.css("display", "none");
    forecastTitleEl.css("display", "none");
    forecastEls.css("display", "none");

    fetch(currentUrl)
    .then(function(response){
        if (response.ok){
            validCity = true;
            addSearchToHistory(city);
        }
        return response.json();
    })
    .then(function(data){
        if (validCity){
            //Setting the leading text to the city's name and the current date at user's location
            currentEl.children("#city-name").text(city + ", " + moment.unix(data.dt).format("MMM Do, YYYY") + " (date at user's location)");
            //Setting weather icon based on current weather
            currentEl.children(".weather-icon").attr("src", "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png");
            //Setting text for children of currentEls based on the current weather data (except UVI)
            currentEl.children(".temp").text("Temp: " + data.main.temp + " °F");
            currentEl.children(".wind-speed").text("Wind: " + data.wind.speed + " MPH" );
            currentEl.children(".humidity").text("Humidity: " + data.main.humidity + "%");

            //Setting up api url that we'll need to fetch UVI data 
            var oneCallUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data.coord.lat + "&lon=" + data.coord.lon + "&appid=e55bcf1a9dfbeb91667627f3095ed0b3";

            fetch(oneCallUrl)
            .then(function(response){
                return response.json();
            })
            .then(function(data){
                var uviEl = currentEl.children("#uv-index");
                var uvi = data.current.uvi
                //setting text for UVI readout
                uviEl.text("UV index: " + uvi);
                //setting color of UVI readout: green for low (<3), yellow for moderate (>2 and <6), red for anything higher
                if (uvi < 3){
                    uviEl.css("background-color", "green");
                    uviEl.css("color", "white");
                } else if (uvi < 6){
                    uviEl.css("background-color", "yellow");
                    uviEl.css("color", "black");
                } else {
                    uviEl.css("background-color", "red");
                    uviEl.css("color", "white");
                }
                //Revealing the current weather display now that all data are ready to be shown
                currentEl.css("display", "block");
            })
        } else {
            errorEl.css("display", "block");
        }
    });

    fetch(forecastUrl)
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        if (validCity){
            var dataList = data.list;
            //A variable to track which day element on the page we should be working with
            var dayIndex = 0;
            //The 5-day forecast includes a prediction for every third hour in a 120-hour period. 
            //Now, we only want to access every 24th hour, so we're gonna start at the eighth entry in the array
            //And go up eight entries per step. 
            for (var i = 7; i < dataList.length; i += 8){
                var dayWeather = dataList[i];
                var dayEl = $(forecastEls[dayIndex]);
                
                //Iterating our 5-day-forecast page element tracker up; doing this here to help 
                dayIndex++;
    
                //Adding appropriate text to the bodies of our forecast cards and setting weather icon based on forecast
                dayEl.children("h5").text(moment.unix(dayWeather.dt).format("MMM Do, YYYY"));
                dayEl.children(".weather-icon").attr("src", "http://openweathermap.org/img/wn/" + dayWeather.weather[0].icon + "@2x.png");
                dayEl.children(".temp").text("Temp: " + dayWeather.main.temp + " °F");
                dayEl.children(".wind-speed").text("Wind: " + dayWeather.wind.speed + " MPH");
                dayEl.children(".humidity").text("Humidity: " + dayWeather.main.humidity + "%");
            }

            //Displaying our 5-day-forecast blocks now that their info has been filled in
            forecastTitleEl.css("display", "block");
            forecastEls.css("display", "block");
        }

    });
}

function addSearchToHistory(search){
    //For loop to verify that this search isn't already present in the searchHistory array
    for (var i = 0; i < searchHistory.length; i++){
        if (search === searchHistory[i]){
            return;
        }
    }

    //Using .splice() to add this to the start of the searchHistory array (doing it this way to facilitate
    //rendering it to the page upon page load)
    searchHistory.splice(0, 0, search);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    
    //Making a button for this search and prepending to (that is, adding to the beginning of) our history list on the page
    var newButton = $("<button>");
    newButton.text(search);
    newButton.addClass("btn btn-secondary");
    favoritesEl.prepend(newButton);


    //I only want to keep track of a maximum of eight distinct cities in my history array, since that looks nice on the page.
    //So, if it's longer, we'll remove the would-be ninth element
    if (searchHistory.length > 8){
        searchHistory.pop();
        favoritesEl.children().eq(8).remove()
    }

    //storing to local storage
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

favoritesEl.on("click", "button", function(event){
    var buttonText = $(event.target).text()
    fetchCityWeather(buttonText);
});

searchFormEl.on("submit", function(event){
    event.preventDefault();

    var cityInput = searchBarEl.val().trim();

    if (cityInput === ""){
        return;
    }

    fetchCityWeather(cityInput);
});

initialize();