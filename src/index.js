import format from 'date-fns/format';

const form = document.querySelector('form');
const searchBox = document.querySelector('#search-box');
const weatherKey = '641b9ba062aa0184807b1d677283f0d9';
const error = document.querySelector('.error');
const unitTypes = {
  c: 'metric',
  f: 'imperial',
  k: 'standard',
};
const unitSymbols = {
  metric: { temp: '&deg;C', wind: 'm/s' },
  imperial: { temp: '&deg;F', wind: 'miles/hour' },
  standard: { temp: '&#8490;', wind: 'm/s' },
};
const backgroundImages = {
  clear: '../src/assets/clear-sky.jpg',
  clouds: '../src/assets/cloudy-sky.jpg',
  rain: '../src/assets/rainy-sky.jpg',
  thunderstorm: '../src/assets/thunderstorm.jpg',
  snow: '../src/assets/snowing.jpg',
  mist: '../src/assets/foggy.jpg',
};

function setError(message) {
  error.textContent = message;
}

function clearError() {
  error.textContent = '';
}

async function getCoord(cityName) {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${weatherKey}`
  );

  if (!response.ok) {
    setError('Unable to locate. Please double check your spelling.');
    return false;
  }

  clearError();
  const [locationData] = await response.json();

  return locationData;
}

async function getWeather(city = 'calgary', unit = 'metric') {
  try {
    const { lat, lon } = await getCoord(city);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=${unit}`
    );

    if (!response.ok) {
      return false;
    }

    const weatherData = await response.json();
    return { ...weatherData, unit };
  } catch (e) {
    setError('Sorry, Unable to get weather, please try again.');
    return false;
  }
}

function getBackground(description) {
  const background = Object.keys(backgroundImages).find((key) => description.includes(key));
  return backgroundImages[background] || backgroundImages.mist;
}

function displayWeather(data) {
  const location = document.querySelector('.location');
  const time = document.querySelector('.time');
  const temp = document.querySelector('.temperature');
  const condition = document.querySelector('.condition');
  const tempFeels = document.querySelector('#feels-like');
  const humidity = document.querySelector('#humidity');
  const wind = document.querySelector('#wind');
  const image = document.querySelector('#image');

  const { description, icon } = data.weather[0];
  location.textContent = `${data.name}, ${data.sys.country}`;
  time.textContent = format(new Date(), 'EEE, MMM do hh:mm bbbb');
  temp.innerHTML = Math.round(data.main.temp) + unitSymbols[data.unit].temp;
  condition.textContent = description;
  tempFeels.innerHTML = `Feels Like: ${Math.round(data.main.feels_like)}${
    unitSymbols[data.unit].temp
  }`;
  humidity.textContent = `Humidity Levels: ${data.main.humidity}%`;
  wind.textContent = `Wind: ${data.wind.speed} ${unitSymbols[data.unit].wind}`;
  image.src = ` https://openweathermap.org/img/wn/${icon}.png`;

  document.body.style.setProperty(
    'background',
    `url(${getBackground(description)}) no-repeat center center fixed`
  );
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const location = data.get('location');
  const unit = data.get('unit');

  const weatherData = await getWeather(location, unitTypes[unit]);
  displayWeather(weatherData);
  searchBox.value = '';
});

form.reset();
getWeather().then((data) => {
  displayWeather(data);
});
