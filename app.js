async function getWeather(cityName = null, lat = null, lon = null) {
  const weatherInfo = document.getElementById("weatherInfo");
  const cultureInfo = document.getElementById("cultureInfo");
  let city = cityName;

  try {
    // 如果没有 city，就用 lat/lon 反查 city 名称
    if (!city && lat !== null && lon !== null) {
      const reverseRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const reverseData = await reverseRes.json();
      city = reverseData.address.city || reverseData.address.town || reverseData.address.village || reverseData.address.state;
    }

    if (!city) {
      weatherInfo.innerHTML = i18n.error[currentLang];
      cultureInfo.innerHTML = "";
      return;
    }

    document.getElementById("cityInput").value = city;

    const apiKey = "d0c82cf6ceae567537e0079215ab67dd";
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("City not found");

    const weatherData = await weatherResponse.json();
    const temperature = weatherData.main.temp;
    const condition = weatherData.weather[0].description;
    const countryCode = weatherData.sys.country;

    // 🗺️ 自动跳转地图
    if (lat === null || lon === null) {
      lat = weatherData.coord.lat;
      lon = weatherData.coord.lon;
    }
    if (typeof map !== "undefined") {
      map.setView([lat, lon], 8);
      L.marker([lat, lon]).addTo(map);
    }

    weatherInfo.innerHTML = `
      <h2>${i18n.weatherTitle[currentLang]} ${city}</h2>
      <p>🌡 ${temperature}°C, ${condition}</p>
    `;

    const countryUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
    const countryResponse = await fetch(countryUrl);
    const countryData = await countryResponse.json();
    const country = countryData[0];
    const flag = country.flags.svg;
    const language = Object.values(country.languages).join(", ");
    const countryName = country.name.common;

    const cultureTemplates = {
      JP: { food: "Sushi 🍣", greeting: "こんにちは", etiquette: "Bowing 🙇‍♂️" },
      CN: { food: "Dumplings 🥟", greeting: "你好", etiquette: "Respect with both hands 🤲" },
      US: { food: "Burger 🍔", greeting: "Hello", etiquette: "Handshake 🤝" },
      FR: { food: "Baguette 🥖", greeting: "Bonjour", etiquette: "Cheek kissing 👋" },
      KR: { food: "Kimchi 🥬", greeting: "안녕하세요", etiquette: "Two hands for everything 🙇" },
      TH: { food: "Pad Thai 🍜", greeting: "สวัสดีครับ/ค่ะ", etiquette: "Wai greeting 🙏" },
    };

    const culture = cultureTemplates[countryCode] || {
      food: "N/A",
      greeting: "N/A",
      etiquette: "N/A",
    };

    cultureInfo.innerHTML = `
      <h3>🌍 ${i18n.culturalInfo[currentLang]}: ${countryName}</h3>
      <img src="${flag}" alt="Flag of ${countryName}" style="width: 100px; margin: 10px 0;" />
      <p><strong>${i18n.languageLabel[currentLang]}</strong> ${language}</p>
      <p><strong>${i18n.food[currentLang]}</strong> ${culture.food}</p>
      <p><strong>${i18n.greeting[currentLang]}</strong> ${culture.greeting}</p>
      <p><strong>${i18n.etiquette[currentLang]}</strong> ${culture.etiquette}</p>
    `;
  } catch (error) {
    weatherInfo.innerHTML = i18n.error[currentLang];
    cultureInfo.innerHTML = "";
    console.error(error);
  }
}

async function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    await getWeather(null, lat, lon);
  }, () => {
    alert("Unable to retrieve your location.");
  });
}
