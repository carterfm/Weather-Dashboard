var searchFormEl = $("form");
var searchBarEl = $("input");

//
var searchHistory = [];

function fetchCityWeather(url){
    fetch(url)
    .then(function(response){
        /*if (response.ok){
            //
        }*/
        return response.json();

    })
    .then(function(data){
        console.log(data);
        console.log(data.name);
        console.log(data.main.temp);
    });
}

searchFormEl.on("submit", function(event){
    event.preventDefault();

    var cityInput = searchBarEl.val().trim();
    if (cityInput === ""){
        return;
    }
    var searchUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityInput + "&units=imperial&appid=e55bcf1a9dfbeb91667627f3095ed0b3";

    fetchCityWeather(searchUrl);
});

//I'm gonna need the present moment 