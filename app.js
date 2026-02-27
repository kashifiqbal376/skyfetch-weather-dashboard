function WeatherApp(apiKey) {
    this.apiKey = "ed67eb316e2862c9cbf01dacb6328734";
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    // DOM references
    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.init();
}

/* ================= INIT ================= */
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    });

    this.showWelcome();
};

/* ================= SEARCH ================= */
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    this.getWeather(city);
    this.cityInput.value = "";
};

/* ================= GET WEATHER + FORECAST ================= */
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();
    this.searchBtn.disabled = true;

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentRes, forecastRes] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentRes.data);
        this.displayForecast(forecastRes);

    } catch (error) {
        if (error.response && error.response.status === 404) {
            this.showError("City not found.");
        } else {
            this.showError("Something went wrong.");
        }
    } finally {
        this.searchBtn.disabled = false;
    }
};

/* ================= GET FORECAST ================= */
WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

/* ================= DISPLAY CURRENT WEATHER ================= */
WeatherApp.prototype.displayWeather = function (data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2>${data.name}</h2>
            <img src="${iconUrl}" />
            <h1>${Math.round(data.main.temp)}°C</h1>
            <p>${data.weather[0].description}</p>
        </div>
    `;
};

/* ================= PROCESS FORECAST ================= */
WeatherApp.prototype.processForecastData = function (data) {
    const daily = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    return daily.slice(0, 5);
};

/* ================= DISPLAY FORECAST ================= */
WeatherApp.prototype.displayForecast = function (data) {
    const daily = this.processForecastData(data);

    const forecastHTML = daily.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}" />
                <p>${Math.round(day.main.temp)}°C</p>
                <small>${day.weather[0].description}</small>
            </div>
        `;
    }).join("");

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;
};

/* ================= STATES ================= */
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading">
            <p>Loading weather data...</p>
        </div>
    `;
};

WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error">
            <p>${message}</p>
        </div>
    `;
};

WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome">
            <h2>🌤 Welcome to SkyFetch</h2>
            <p>Search for a city to see weather and forecast.</p>
        </div>
    `;
};

/* ================= CREATE INSTANCE ================= */
const app = new WeatherApp("YOUR_API_KEY");