let currentLang = localStorage.getItem("language") || "en";

const i18n = {
  title: {
    en: "WorldView",
    zh: "世界视图",
    ja: "ワールドビュー",
  },
  inputPlaceholder: {
    en: "Enter city name",
    zh: "输入城市名称",
    ja: "都市名を入力",
  },
  search: {
    en: "Search",
    zh: "搜索",
    ja: "検索",
  },
  weatherTitle: {
    en: "Weather in",
    zh: "天气：",
    ja: "天気：",
  },
  culturalInfo: {
    en: "Cultural Info",
    zh: "文化信息",
    ja: "文化情報",
  },
  languageLabel: {
    en: "Official Language(s):",
    zh: "官方语言：",
    ja: "公用語：",
  },
  food: {
    en: "Famous Food:",
    zh: "代表食物：",
    ja: "名物料理：",
  },
  greeting: {
    en: "Greeting:",
    zh: "问候语：",
    ja: "あいさつ：",
  },
  etiquette: {
    en: "Etiquette:",
    zh: "礼仪：",
    ja: "マナー：",
  },
  error: {
    en: "⚠️ Could not fetch weather data.",
    zh: "⚠️ 无法获取天气信息。",
    ja: "⚠️ 天気情報を取得できませんでした。",
  },
};

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  const weatherInfo = document.getElementById("weatherInfo");
  const cultureInfo = document.getElementById("cultureInfo");

  if (!city) {
    weatherInfo.innerHTML = i18n.error[currentLang];
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
      <h2>${i18n.weatherTitle[currentLang]} ${city}</h2>
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

    // 🎯 自定义文化模板
    const cultureTemplates = {
      JP: {
        food: "Sushi 🍣",
        greeting: "こんにちは",
        etiquette: "Bowing 🙇‍♂️",
      },
      CN: {
        food: "Dumplings 🥟",
        greeting: "你好",
        etiquette: "Respect with both hands 🤲",
      },
      US: {
        food: "Burger 🍔",
        greeting: "Hello",
        etiquette: "Handshake 🤝",
      },
      FR: {
        food: "Baguette 🥖",
        greeting: "Bonjour",
        etiquette: "Cheek kissing 👋",
      },
      KR: {
        food: "Kimchi 🥬",
        greeting: "안녕하세요",
        etiquette: "Two hands for everything 🙇",
      },
      TH: {
        food: "Pad Thai 🍜",
        greeting: "สวัสดีครับ/ค่ะ",
        etiquette: "Wai greeting 🙏",
      },
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

// 🌍 初始化地图
const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © OpenStreetMap contributors',
}).addTo(map);

map.on('click', async function (e) {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
    );
    const data = await response.json();
    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.state;

    if (city) {
      document.getElementById("cityInput").value = city;
      getWeather();
    } else {
      alert("No city found at this location.");
    }
  } catch (error) {
    console.error("Reverse geocoding failed", error);
  }
});

// 语言切换按钮监听
document.querySelectorAll(".language-switch button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    currentLang = lang;
    localStorage.setItem("language", lang);
    applyTranslations();
  });
});

// 翻译函数：应用当前语言到页面上
function applyTranslations() {
  document.title = i18n.title[currentLang];
  document.querySelector("h1").textContent = i18n.title[currentLang];
  document.getElementById("cityInput").placeholder = i18n.inputPlaceholder[currentLang];
  document.querySelector(".search-box button").textContent = i18n.search[currentLang];
}

// 页面首次加载时应用语言
applyTranslations();
async function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.state;

      if (city) {
        document.getElementById("cityInput").value = city;
        getWeather();
      } else {
        alert("Could not determine your location.");
      }
    } catch (error) {
      console.error("Location fetch failed", error);
    }
  });
}

async function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.state;

      if (city) {
        document.getElementById("cityInput").value = city;
        getWeather();

        // 地图跳过去并标记
        if (typeof map !== "undefined") {
          map.setView([lat, lon], 8);
          L.marker([lat, lon]).addTo(map);
        }
      } else {
        alert("Could not determine city from location.");
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      alert("Failed to retrieve location data.");
    }
  }, () => {
    alert("Unable to retrieve your location.");
  });
}
