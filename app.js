async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const weatherInfo = document.getElementById("weatherInfo");
  const cultureInfo = document.getElementById("cultureInfo");

  if (!city) {
    weatherInfo.innerHTML = "Please enter a city name.";
    cultureInfo.innerHTML = "";
    return;
  }

  const apiKey = "d0c82cf6ceae567537e0079215ab67dd";
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

  try {
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("City not found");

    const weatherData = await weatherResponse.json();
    const temperature = weatherData.main.temp;
    const condition = weatherData.weather[0].description;
    const countryCode = weatherData.sys.country;

    weatherInfo.innerHTML = `
      <h2>Weather in ${city}</h2>
      <p>🌡 ${temperature}°C, ${condition}</p>
    `;

    // 🎌 获取文化信息（REST Countries API）
    const countryUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
    const countryResponse = await fetch(countryUrl);
    const countryData = await countryResponse.json();
    const country = countryData[0];
    const flag = country.flags.svg;
    const language = Object.values(country.languages).join(", ");
    const countryName = country.name.common;

    cultureInfo.innerHTML = `
      <h3>🌍 Cultural Info: ${countryName}</h3>
      <img src="${flag}" alt="Flag of ${countryName}" style="width: 100px; margin: 10px 0;" />
      <p><strong>Official Language(s):</strong> ${language}</p>
      <p><em>More cultural info coming soon!</em></p>
    `;
  } catch (error) {
    weatherInfo.innerHTML = "⚠️ Could not fetch weather data.";
    cultureInfo.innerHTML = "";
    console.error(error);
  }
}
