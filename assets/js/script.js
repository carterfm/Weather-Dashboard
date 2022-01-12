var searchFormEl = $("form");
var searchBarEl = $("input");
var currentEl = $("#current-weather-display");
var forecastTitleEl = $("#five-day-title");
var forecastEls = $(".five-day-weather-display");
//An array for storing our previous search queries. Will be stored into and loaded from
//localStorage. Will only contain the previous eight distinct valid search queries.
var searchHistory = [];

//const WEATHER

function fetchCityWeather(city){
    //Using city input to create links to be used in api fetch requests
    var currentUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&appid=e55bcf1a9dfbeb91667627f3095ed0b3";
    var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&appid=e55bcf1a9dfbeb91667627f3095ed0b3";
    //This boolean will be set to true if our fetch request for the city's current weather returns a non-error code
    //Since we're searching the same weather info database, there shouldn't be 5-day forecast info for
    //a city with no current weather info, so we shouldn't need to check the responses for each separately
    var validCity = false;
    //Hiding our results space again until results (or error message) load in
    currentEl.css("display", "none");
    forecastTitleEl.css("display", "none");
    forecastEls.css("display", "none");

    fetch(currentUrl)
    .then(function(response){
        if (response.ok){
            validCity = true;
            console.log("response was OK; validCity set to " + validCity);
        }
        return response.json();
    })
    .then(function(data){
        if (validCity){
            //Getting the current date in the selected city, then converting 
            currentEl.children("#city-name").text(city + " ");
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
                //setting text for UVI readout
                currentEl.children("#uv-index").text("UV index: " + data.current.uvi);
                //Revealing the current weather display now that all data are ready to be shown
                currentEl.css("display", "block");
            })
        } else {
            console.log("in the else");
            currentEl.children("#city-name").text("No such city found.");
            currentEl.css("display", "block");
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
                console.log(dayWeather);
                var dayEl = $(forecastEls[dayIndex]);
                
                //Iterating our 5-day-forecast page element tracker up; doing this here to help 
                dayIndex++;
    
                //Setting weather icon based on forecast
                dayEl.children(".weather-icon").attr("src", "http://openweathermap.org/img/wn/" + dayWeather.weather[0].icon + "@2x.png");
                //Adding appropriate text to the bodies of our forecast cards 
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

searchFormEl.on("submit", function(event){
    event.preventDefault();

    var cityInput = searchBarEl.val().trim();

    if (cityInput === ""){
        return;
    }

    fetchCityWeather(cityInput);
});

//Am I going to need the present moment?