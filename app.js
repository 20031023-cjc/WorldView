async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const weatherInfo = document.getElementById("weatherInfo");
  const cultureInfo = document.getElementById("cultureInfo");

  if (!city) {
    weatherInfo.innerHTML = "Please enter a city name.";
    cultureInfo.innerHTML = "";
    return;
  }

  const apiKey = "d0c82cf6ceae567537e0079215ab67dd"; // ← 你的真实 API Key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    const temperature = data.main.temp;
    const condition = data.weather[0].description;
    const countryCode = data.sys.country;

    weatherInfo.innerHTML = `
      <h2>Weather in ${city}</h2>
      <p>🌡 ${temperature}°C, ${condition}</p>
    `;

    cultureInfo.innerHTML = `
      <h3>🌍 Cultural Info</h3>
      <p>Country Code: ${countryCode}</p>
      <p>(真实文化信息将在下一步实现)</p>
    `;
  } catch (error) {
    weatherInfo.innerHTML = "⚠️ Could not fetch weather data.";
    cultureInfo.innerHTML = "";
    console.error(error);
  }
}
