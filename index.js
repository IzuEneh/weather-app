const form = document.querySelector("form");
const searchBox = document.querySelector("#search-box");
const toggle = document.querySelector("#unit-toggle");
const weatherKey = "641b9ba062aa0184807b1d677283f0d9";
const unitType = "metric";
const unitTypes = {
	c: "metric",
	f: "imperial",
	k: "standard",
};
const unitSymbols = {
	metric: { temp: "&deg;C", wind: "m/s" },
	imperial: { temp: "&deg;F", wind: "miles/hour" },
	standard: { temp: "&#8490;", wind: "m/s" },
};
const backgroundImages = {
	clear: "./assets/clear-sky.jpg",
	clouds: "./assets/cloudy-sky.jpg",
	rain: "./assets/rainy-sky.jpg",
	thunderstorm: "./assets/thunderstorm.jpg",
	snow: "./assets/snowing.jpg",
	mist: "./assets/foggy.jpg",
};

async function getCoord(cityName) {
	const response = await fetch(
		`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${weatherKey}`
	);

	if (!response.ok) {
		alert("Sorry Unable to find weather for location");
		return false;
	}

	const [locationData] = await response.json();

	return locationData;
}

async function getWeather(city = "calgary", unit = "metric") {
	const { lat, lon } = await getCoord(city);

	const response = await fetch(
		`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=${unit}`
	);

	if (!response.ok) {
		alert("Sorry Unable to find weather for location");
		return;
	}

	const weatherData = await response.json();
	return { ...weatherData, unit };
}

function displayWeather(data) {
	const location = document.querySelector(".location");
	const time = document.querySelector(".time");
	const temp = document.querySelector(".temperature");
	const condition = document.querySelector(".condition");
	const tempFeels = document.querySelector("#feels-like");
	const humidity = document.querySelector("#humidity");
	const wind = document.querySelector("#wind");
	const image = document.querySelector("#image");
	const content = document.querySelector(".content");
	const date = new Date()
	const { description, icon } = data.weather[0];
	location.textContent = `${data.name}, ${data.sys.country}`;
	time.textContent = `${date.toDateString()} ${date.toTimeString()}`;
	temp.innerHTML = data.main.temp + unitSymbols[data.unit].temp;
	condition.textContent = description;
	tempFeels.innerHTML = `Feels Like: ${data.main["feels_like"]}${
		unitSymbols[data.unit].temp
	}`;
	humidity.textContent = `Humidity Levels: ${data.main.humidity}%`;
	wind.textContent = `Wind: ${data.wind.speed} ${unitSymbols[data.unit].wind}`;
	image.src = ` http://openweathermap.org/img/wn/${icon}.png`;

	document.body.style.setProperty(
		"background",
		`url(${getBackground(description)}) no-repeat center center fixed`
	);
}

function getBackground(description) {
	for (key in backgroundImages) {
		if (description.includes(key)) {
			return backgroundImages[key];
		}
	}

	return backgroundImages.mist;
}

form.reset();
getWeather().then((data) => {
	displayWeather(data);
});

searchBox.addEventListener("submit", (e) => {
	e.preventDefault();
	console.log(`Key ${e.data} input`);
});

form.addEventListener("submit", async (e) => {
	e.preventDefault();
	const data = new FormData(form);
	const location = data.get("location");
	const unit = data.get("unit");

	const weatherData = await getWeather(location, unitTypes[unit]);
	displayWeather(weatherData);
	searchBox.value = "";
});
