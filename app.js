function getWeather() {
  const city = document.getElementById("cityInput").value;
  const weatherInfo = document.getElementById("weatherInfo");

  if (!city) {
    weatherInfo.innerHTML = "Please enter a city name.";
    return;
  }

  // 
  weatherInfo.innerHTML = `
    <h2>Weather in ${city}</h2>
    <p>🌤 25°C, Sunny</p>
  `;

  // 
  document.getElementById("cultureInfo").innerHTML = `
    <h3>🌍 Cultural Info for ${city}</h3>
    <p>Language: English<br>Famous food: Pizza<br>Traditional greeting: Handshake</p>
  `;
}
