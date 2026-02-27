//ed67eb316e2862c9cbf01dacb6328734
function WeatherApp(apiKey) {
    this.apiKey = "ed67eb316e2862c9cbf01dacb6328734";
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentSearchesSection = document.getElementById("recent-searches-section");
    this.recentSearchesContainer = document.getElementById("recent-searches-container");

    this.recentSearches = [];
    this.maxRecentSearches = 5;

    this.init();
}

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));

    this.cityInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    }.bind(this));

    const clearBtn = document.getElementById("clear-history-btn");
    clearBtn.addEventListener("click", this.clearHistory.bind(this));

    this.loadRecentSearches();
    this.loadLastCity();
};

WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();
    if (!city) return;

    this.getWeather(city);
    this.cityInput.value = "";
};

WeatherApp.prototype.getWeather = async function (city) {
    this.weatherDisplay.innerHTML = "<p>Loading...</p>";
    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentRes, forecastRes] = await Promise.all([
            axios.get(currentUrl),
            axios.get(`${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`)
        ]);

        this.displayWeather(currentRes.data);
        this.displayForecast(forecastRes.data);

        this.saveRecentSearch(city);
        localStorage.setItem("lastCity", city);

    } catch (error) {
        this.weatherDisplay.innerHTML = "<p>City not found.</p>";
    }
};

WeatherApp.prototype.displayWeather = function (data) {
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    this.weatherDisplay.innerHTML = `
        <div class="weather-info">
            <h2>${data.name}</h2>
            <img src="${iconUrl}">
            <h1>${Math.round(data.main.temp)}°C</h1>
            <p>${data.weather[0].description}</p>
        </div>
    `;
};

WeatherApp.prototype.displayForecast = function (data) {
    const daily = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    ).slice(0, 5);

    const forecastHTML = daily.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}">
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

WeatherApp.prototype.loadRecentSearches = function () {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
        this.recentSearches = JSON.parse(saved);
    }
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    const cityName =
        city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    const index = this.recentSearches.indexOf(cityName);
    if (index > -1) {
        this.recentSearches.splice(index, 1);
    }

    this.recentSearches.unshift(cityName);

    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentSearchesContainer.innerHTML = "";

    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = "none";
        return;
    }

    this.recentSearchesSection.style.display = "block";

    this.recentSearches.forEach(function (city) {
        const btn = document.createElement("button");
        btn.className = "recent-search-btn";
        btn.textContent = city;

        btn.addEventListener("click", function () {
            this.getWeather(city);
        }.bind(this));

        this.recentSearchesContainer.appendChild(btn);
    }.bind(this));
};

WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
        this.getWeather(lastCity);
    } else {
        this.weatherDisplay.innerHTML = "<p>Search for a city to get started 🌤️</p>";
    }
};

WeatherApp.prototype.clearHistory = function () {
    this.recentSearches = [];
    localStorage.removeItem("recentSearches");
    this.displayRecentSearches();
};

const app = new WeatherApp("YOUR_API_KEY");