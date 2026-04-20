
let cityInput = document.getElementById('city-input');
let searchBtn = document.getElementById('searchBtn');
let locationBtn = document.getElementById('locationBtn');
let welcomeScreen = document.getElementById('welcomeScreen');


const api_Key = 'c435bdb279f1922f0fc85d1a9f8ca2f7';


let currentWeatherCard = document.querySelectorAll('.weather-left .card')[0];
let fiveDaysForecastCard = document.querySelector('.day-forecast');
let aqiCard = document.querySelectorAll('.highlights .card')[0];

let sunriseTime = document.getElementById('sunriseTime');
let sunsetTime = document.getElementById('sunsetTime');

let humidityVal = document.getElementById('humidityVal');
let pressureVal = document.getElementById('pressureVal');
let visibilityVal = document.getElementById('visibilityVal');
let windSpeedVal = document.getElementById('windSpeedVal');
let feelsVal = document.getElementById('feelsVal');

let hourlyForecastCard = document.querySelector('.hourly-forecast');

let aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

function getWeatherDetails(name, lat, lon, country) {

    let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_Key}`;
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_Key}`;
    let AIR_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_Key}`;

    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec'];

    
    if (welcomeScreen) welcomeScreen.style.display = "none";

    
    fetch(AIR_API_URL)
    .then(res => res.json())
    .then(data => {
        let { co, no, so2, o3, pm2_5, pm10, nh3 } = data.list[0].components;

        aqiCard.innerHTML = `
        <div class="card-head">
            <p>Air Quality Index</p>
            <p class="air-index aqi-${data.list[0].main.aqi}">
                ${aqiList[data.list[0].main.aqi - 1]}
            </p>
        </div>

        <div class="air-indices">
            <i class="fa-solid fa-wind fa-3x"></i>

            <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
            <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
            <div class="item"><p>SO2</p><h2>${so2}</h2></div>
            <div class="item"><p>CO</p><h2>${co}</h2></div>
            <div class="item"><p>NO</p><h2>${no}</h2></div>
            <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
            <div class="item"><p>O3</p><h2>${o3}</h2></div>
        </div>
        `;
    })
    .catch(() => alert("Failed to load AQI"));

    // 🌤️ CURRENT WEATHER
    fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(data => {

        let date = new Date();

        currentWeatherCard.innerHTML = `
        <div class="current-weather">
            <div class="details">
                <p>Now</p>
                <h2>${(data.main.temp - 273.15).toFixed(1)}°C</h2>
                <p>${data.weather[0].description}</p>
            </div>
            <div class="weather-icon">
                <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">
            </div>
        </div>

        <hr>

        <div class="card-footer">
            <p>${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}</p>
            <p>${name}, ${country}</p>
        </div>
        `;

        // 🌅 SUNRISE / SUNSET
        let { sunrise, sunset } = data.sys;
        let { timezone, visibility } = data;
        let { humidity, pressure, feels_like } = data.main;
        let { speed } = data.wind;

        let sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A');
        let sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');

        sunriseTime.innerHTML = sRiseTime;
        sunsetTime.innerHTML = sSetTime;

        // 🔥 animation restart
        let sunriseIcon = document.querySelector('.ri-sunrise-line');
        let sunsetIcon = document.querySelector('.ri-sunset-line');

        if (sunriseIcon && sunsetIcon) {
            sunriseIcon.style.animation = 'none';
            sunsetIcon.style.animation = 'none';

            setTimeout(() => {
                sunriseIcon.style.animation = 'sunriseFade 1.5s ease forwards';
                sunsetIcon.style.animation = 'sunsetGlow 2s infinite alternate';
            }, 10);
        }

        // 📊 OTHER DATA
        humidityVal.innerHTML = `${humidity}%`;
        pressureVal.innerHTML = `${pressure} hPa`;
        visibilityVal.innerHTML = `${(visibility / 1000).toFixed(1)} km`;
        windSpeedVal.innerHTML = `${speed} m/s`;
        feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(1)}°C`;
    })
    .catch(() => alert("Failed to load weather"));

    // 📅 FORECAST
    fetch(FORECAST_API_URL)
    .then(res => res.json())
    .then(data => {

        // ⏰ HOURLY
        hourlyForecastCard.innerHTML = '';

        for (let i = 0; i < 8; i++) {
            let hrDate = new Date(data.list[i].dt_txt);
            let hr = hrDate.getHours();

            let ampm = hr >= 12 ? 'PM' : 'AM';
            hr = hr % 12 || 12;

            hourlyForecastCard.innerHTML += `
            <div class="card">
                <p>${hr} ${ampm}</p>
                <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png">
                <p>${(data.list[i].main.temp - 273.15).toFixed(1)}°C</p>
            </div>
            `;
        }

        // 📆 5 DAYS
        let uniqueDays = [];
        let fiveDays = data.list.filter(item => {
            let d = new Date(item.dt_txt).getDate();
            if (!uniqueDays.includes(d)) {
                uniqueDays.push(d);
                return true;
            }
        });

        fiveDaysForecastCard.innerHTML = '';

        for (let i = 1; i < fiveDays.length; i++) {
            let date = new Date(fiveDays[i].dt_txt);

            fiveDaysForecastCard.innerHTML += `
            <div class="forecast-item">
                <div class="icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${fiveDays[i].weather[0].icon}.png">
                    <span>${(fiveDays[i].main.temp - 273.15).toFixed(1)}°C</span>
                </div>
                <p>${date.getDate()} ${months[date.getMonth()]}</p>
                <p>${days[date.getDay()]}</p>
            </div>
            `;
        }
    })
    .catch(() => alert("Failed to load forecast"));
}

// 🔍 SEARCH
function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    if (!cityName) return;

    let GEO_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_Key}`;

    fetch(GEO_URL)
    .then(res => res.json())
    .then(data => {
        if (!data.length) return alert("City not found");

        let { name, lat, lon, country } = data[0];
        getWeatherDetails(name, lat, lon, country);
    })
    .catch(() => alert("Error fetching city"));
}

// 📍 CURRENT LOCATION
function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(pos => {
        let { latitude, longitude } = pos.coords;

        let REVERSE_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${api_Key}`;

        fetch(REVERSE_URL)
        .then(res => res.json())
        .then(data => {
            let { name, country } = data[0];
            getWeatherDetails(name, latitude, longitude, country);
        });
    });
}

// EVENTS
searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates());
window.addEventListener('load', getUserCoordinates);