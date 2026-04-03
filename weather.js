const API_KEY = "9e4105ce48c252b2e8542334415b68d0";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

//getting DOM
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const countryInput = document.getElementById("country-input");
const refreshBtn = document.getElementById("refresh-btn");
const forecastToggle = document.getElementById("forecast-btn");
const hourlyBtn = document.getElementById("hourly-btn")
const forecastSection = document.getElementById("forecast-section");
const hourlySection = document.getElementById("hourly-section");
const weatherDetails = document.getElementById("weather-data");
const loader = document.getElementById("loader");

const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feels-like");
const condition = document.getElementById("condition");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const rainChance = document.getElementById("rain-chance");
const visibilityEl = document.getElementById("visibility");
const weatherIcon = document.getElementById("weather-icon");
const dateTimeEl = document.getElementById("date-time");
const forecastContainer = document.getElementById("forecast");
const priorityCard = document.getElementById("priority-card");

const adviseeEl = document.getElementById("advisee");
const adviseeIcon = document.getElementById("advisee-icon");
const adviseeText = document.getElementById("advisee-text");
const hourlyContainer = document.getElementById("hour-container");

let currentCity = null;
let currentCoords = null;

//loading function 
function loadFn(active) {
    if (active) {
        loader.classList.remove("hidden");
        weatherDetails.classList.add("hidden");
        locationError.classList.add("hidden");
    } else {
        loader.classList.add("hidden");
    }
}

//function for location error
function showLocationError(message) {
    loader.classList.add("hidden");
    weatherDetails.classList.add("hidden");
    locationError.classList.remove("hidden");
    locationErrorText.textContent = message;
}


//search button event 
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) return alert("Please enter a city.");
    
    getWeatherForCity(city);
});

//refresh button event
refreshBtn.addEventListener("click", () => {
    if (currentCity) {
        getWeatherForCity(currentCity);
    } else if (currentCoords) {
        getWeatherForCoords(currentCoords.lat, currentCoords.lon);
    }
});


//key press event => enter key
cityInput.addEventListener("keypress", e => {
    if (e.key === "Enter") searchBtn.click();
});



forecastToggle.addEventListener("click", () => {
    forecastSection.classList.toggle("hidden");
    const chevron = forecastToggle.querySelector('.chevron-icon');
    chevron.classList.toggle('open');
});

hourlyBtn.addEventListener("click", ()=>{
   hourlySection.classList.toggle("hidden");
   const chevron = hourlyBtn.querySelector(".chevron-icon");
   chevron.classList.toggle("open");
})
//get current time
function currentTime() {
    const now = new Date();
    return now.toLocaleString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

//formatting hourly time
function hourlyTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

//function to format day name.
function dayNameFn(timestamp) {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
    } else {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
    }
}


//feels like function
function getFeelsLikeText(temp, feelsLike, humidity) {
    if (feelsLike > temp + 2) return "Feels hotter than actual temperature.";
    if (feelsLike < temp - 2) return "Feels cooler due to wind.";
    if (humidity > 75) return "Humidity makes it feel sticky.";
    return "Feels close to actual temperature.";
}

// function to display weather
function displayWeatherDataFn(data, coords = null) {
    if (coords) {
        currentCoords = coords;
        currentCity = null;
    } else {
        currentCity = data.name;
        currentCoords = null;
    }
    


    weatherDetails.classList.remove("hidden");
    
    cityName.textContent = `${data.name}, ${data.sys.country}`
    condition.textContent = data.weather[0].description;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    
    feelsLike.textContent = getFeelsLikeText(
        data.main.temp,
        data.main.feels_like,
        data.main.humidity
    );
    
    dateTimeEl.textContent = currentTime();

    // weather status
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    rainChance.textContent = `${data.clouds.all}%`;
    visibilityEl.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Weather icon
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = data.weather[0].description;

    // Resets forecast section
    forecastSection.classList.add("hidden");

    // Fetch forecast using coordinates
    getForcastByCoords(data.coord.lat, data.coord.lon);

    // Weather advise
    const advice = weatherAdvice(data);
    adviseeText.textContent = advice.text;
    adviseeIcon.className = `advisee-icon ${advice.icon}`;
    adviseeEl.classList.remove("hidden");

    // dynamic background
    DynamicBg(data);
}

//   getting weather by city
async function getWeatherForCity(city) {
    loadFn(true);

    try {
        
        const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}&lang=en`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            if (data.cod === "404") {
                throw new Error("City not found. Please try a different search.");
            }
            throw new Error(data.message || "Unable to fetch weather data");
        }

         locationError.classList.add("hidden");
         displayWeatherDataFn(data);
    } catch (err) {
        alert(err.message);
    } finally {
        loadFn(false);
    }
}

// getting weather by coordinates 
async function getWeatherForCoords(lat, lon) {
    loadFn(true);

    try {
        const url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        locationError.classList.add("hidden");
        displayWeatherDataFn(data, { lat, lon });
    } catch (err) {
        alert("Could not load weather: " + err.message);
    } finally {
        loadFn(false);
    }
}

// detecting geolocation from the user
async function getUserLocation() {
    if (!navigator.geolocation) {
        showLocationError("Geolocation is not supported by your browser.");
        return null;
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    showLocationError("Location access was denied. Please enable location permission or search for a city.");
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    showLocationError("Location information is unavailable. Please search for a city.");
                } else if (error.code === error.TIMEOUT) {
                    showLocationError("Location request timed out. Please search for a city.");
                } else {
                    showLocationError("Unable to get your location. Please search for a city.");
                }
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        );
    });
}

// function on the on the page load 
window.addEventListener("load", async () => {
    loadFn(true);
    
    try {
        const location = await getUserLocation();
        
        if (location) {
            await getWeatherForCoords(location.lat, location.lon);
        } else {
            loadFn(false);
            return;
        }
    } catch (err) {
        console.error("Initial load error:", err);
        showLocationError("Unable to fetch weather data. Please search for a city.");
        
    } finally {
        loadFn(false);
    }
});

// Getting forecast by coordinates 
async function getForcastByCoords(lat, lon) {
    try {
        const url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        dailyForecast(data);
        hourlyForecast(data);
    } catch (err) {
        console.error("Forecast error:", err);
    }
}

// daily forecast function
function dailyForecast(data) {
    forecastContainer.innerHTML = "";

    // Group by date
    const dailyMap = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyMap[date]) dailyMap[date] = [];
        dailyMap[date].push(item);
    });

    // Get next 5 days
    const dates = Object.keys(dailyMap).slice(0, 5);

    dates.forEach(date => {
        const dayItems = dailyMap[date];
        
        // Calculate min/max temperatures
        const temps = dayItems.map(item => item.main.temp);
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));
        
        // Get middle-of-day forecast for icon/description
        const midIndex = Math.floor(dayItems.length / 2);
        const midDay = dayItems[midIndex];
        
        // Get most common weather condition for the day
        const conditions = dayItems.map(item => item.weather[0].main);
        const commonCondition = conditions.sort((a, b) =>
            conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
        ).pop();

        const icon = midDay.weather[0].icon;
        const desc = midDay.weather[0].description;
        const dayName = dayNameFn(midDay.dt);

        const card = `
            <div class="forecast-card">
                <p class="forecast-day">${dayName}</p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}">
                <p class="forecast-temp-range">${maxTemp}°C / ${minTemp}°C</p>
                <p class="forecast-desc">${desc}</p>
            </div>
        `;

        forecastContainer.innerHTML += card;
    });
}

// Function  for hourly  forecast
function hourlyForecast(data) {
    hourlyContainer.innerHTML = "";

    // Get next 24 hours (8 items from 3-hour API)
    const hourlyData = data.list.slice(0, 8);

    hourlyData.forEach(item => {
        const time = hourlyTime(item.dt);
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        const desc = item.weather[0].description;
        
        // Get precipitation probability if available
        const pop = item.pop ? Math.round(item.pop * 100) : 0;

        const card = `
            <div class="hourly-card">
                <p class="hourly-time">${time}</p>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                <p class="hourly-temp">${temp}°C</p>
                ${pop > 0 ? `<p class="hourly-pop">${pop}%</p>` : ''}
            </div>
        `;

        hourlyContainer.innerHTML += card;
    });
}

// Weather advice
function weatherAdvice(data) {
    const temp = data.main.temp;
    const condition = data.weather[0].main.toLowerCase();
    const wind = data.wind.speed;
    const humidityVal = data.main.humidity;

    let text = "Weather looks normal today.";
    let icon = "fa-solid fa-circle-info";

    if (condition.includes("rain") || condition.includes("drizzle")) {
        text = "Carry an umbrella. It might rain.";
        icon = "fa-solid fa-umbrella";
    } else if (condition.includes("thunderstorm")) {
        text = "Thunderstorm warning. Stay indoors if possible.";
        icon = "fa-solid fa-bolt";
    } else if (condition.includes("clear") && temp > 28) {
        text = "Stay hydrated. It's quite hot outside.";
        icon = "fa-solid fa-sun";
    } else if (temp < 10) {
        text = "It's cold. Wear something warm.";
        icon = "fa-solid fa-temperature-low";
    } else if (wind > 10) {
        text = "It's windy. Be cautious outdoors.";
        icon = "fa-solid fa-wind";
    } else if (humidityVal > 80) {
        text = "High humidity. It may feel uncomfortable.";
        icon = "fa-solid fa-droplet";
    }

    return { text, icon };
}

// Dynamic background
function DynamicBg(weatherData) {
    const condition = weatherData.weather[0].main.toLowerCase();
    const icon = weatherData.weather[0].icon;

    // Remove existing weather classes
    document.body.classList.remove(
        "clear", "clouds", "rain", "thunderstorm", "snow", "mist", "night"
    );

    const isNight = icon.endsWith("n");

    if (isNight) {
        document.body.classList.add("night");
    } else if (condition.includes("clear")) {
        document.body.classList.add("clear");
    } else if (condition.includes("cloud")) {
        document.body.classList.add("clouds");
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
        document.body.classList.add("rain");
    } else if (condition.includes("thunderstorm")) {
        document.body.classList.add("thunderstorm");
    } else if (condition.includes("snow")) {
        document.body.classList.add("snow");
    } else {
        document.body.classList.add("mist");
    }

    // Set priotise card image 
    const bg = BgImage(condition);
    priorityCard.style.backgroundImage = bg;
    priorityCard.style.backgroundSize = "cover";
    priorityCard.style.backgroundPosition = "center";
}

function BgImage(condition) {
    condition.toLowerCase();
    if (condition.includes("clear")) return 'url("clear.jpg")';
    if (condition.includes("cloud")) return 'url("cloudy.jpg")';
    if (condition.includes("rain") || condition.includes("drizzle"))
         return 'url("rainy.jpg")';
    if (condition.includes("thunder")) return 'url("thunderstorm.jpg")';
    if (condition.includes("snow")) return 'url("snowy.jpg")';
    return 'url("clear.jpg")';
}
