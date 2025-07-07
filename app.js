// 🌐 多语言定义
let currentLang = localStorage.getItem("language") || "en";

const i18n = {
  title: { en: "WorldView", zh: "世界视图", ja: "ワールドビュー" },
  inputPlaceholder: { en: "Enter city name", zh: "输入城市名称", ja: "都市名を入力" },
  search: { en: "Search", zh: "搜索", ja: "検索" },
  useLocation: { en: "📍 Use My Location", zh: "📍 使用当前位置", ja: "📍 現在地を使う" },
  weatherTitle: { en: "Weather in", zh: "天气：", ja: "天気：" },
  culturalInfo: { en: "Cultural Info", zh: "文化信息", ja: "文化情報" },
  languageLabel: { en: "Official Language(s):", zh: "官方语言：", ja: "公用語：" },
  food: { en: "Famous Food:", zh: "代表食物：", ja: "名物料理：" },
  greeting: { en: "Greeting:", zh: "问候语：", ja: "あいさつ：" },
  etiquette: { en: "Etiquette:", zh: "礼仪：", ja: "マナー：" },
  error: { en: "⚠️ Could not fetch weather data.", zh: "⚠️ 无法获取天气信息。", ja: "⚠️ 天気情報を取得できませんでした。" },
};

const map = L.map("map").setView([20, 0], 2);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Map data © OpenStreetMap contributors",
}).addTo(map);

map.on("click", async (e) => {
  const lat = e.latlng.lat;
  const lon = e.latlng.lng;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
    const data = await res.json();
    const city = data.address.city || data.address.town || data.address.village || data.address.state;
    if (city) {
      document.getElementById("cityInput").value = city;
      getWeather(city, lat, lon);
    } else {
      alert("No city found at this location.");
    }
  } catch (err) {
    console.error("Reverse geocoding failed", err);
  }
});

async function getWeather(city = null, lat = null, lon = null) {
  const cityInput = document.getElementById("cityInput");
  const weatherInfo = document.getElementById("weatherInfo");
  const cultureInfo = document.getElementById("cultureInfo");

  city = city || cityInput.value;
  if (!city) {
    weatherInfo.innerHTML = i18n.error[currentLang];
    cultureInfo.innerHTML = "";
    return;
  }

  showLoading();
  saveSearch(city);

  const apiKey = "d0c82cf6ceae567537e0079215ab67dd";
  const url = lat && lon
    ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    : `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();

    const temperature = data.main.temp;
    const condition = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const countryCode = data.sys.country;
    const latUsed = data.coord.lat;
    const lonUsed = data.coord.lon;

    map.setView([latUsed, lonUsed], 8);
    L.marker([latUsed, lonUsed]).addTo(map);

    weatherInfo.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <h2>${i18n.weatherTitle[currentLang]} ${city}</h2>
          <img src="${iconUrl}" alt="${condition}" />
          <p>🌡 ${temperature}°C, ${condition}</p>
          <p>📌 Latitude: ${latUsed.toFixed(2)}, Longitude: ${lonUsed.toFixed(2)}</p>
        </div>
        <div class="flip-card-back">
          <p>Detailed weather info can go here.</p>
        </div>
      </div>
    `;

    const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
    const countryData = await countryRes.json();
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

    const culture = cultureTemplates[countryCode] || { food: "N/A", greeting: "N/A", etiquette: "N/A" };

    cultureInfo.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <h3>🌍 ${i18n.culturalInfo[currentLang]}: ${countryName}</h3>
          <img src="${flag}" alt="Flag of ${countryName}" style="width: 100px; margin: 10px 0;" />
          <p><strong>${i18n.languageLabel[currentLang]}</strong> ${language}</p>
        </div>
        <div class="flip-card-back">
          <p><strong>${i18n.food[currentLang]}</strong> ${culture.food}</p>
          <p><strong>${i18n.greeting[currentLang]}</strong> ${culture.greeting}</p>
          <p><strong>${i18n.etiquette[currentLang]}</strong> ${culture.etiquette}</p>
        </div>
      </div>
    `;
  } catch (err) {
    weatherInfo.innerHTML = i18n.error[currentLang];
    cultureInfo.innerHTML = "";
    console.error(err);
  } finally {
    hideLoading();
  }
}

function getLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.state;
      if (city) {
        document.getElementById("cityInput").value = city;
        getWeather(city, lat, lon);
      } else {
        alert("Could not determine city from location.");
      }
    } catch (err) {
      console.error("Location fetch failed", err);
    }
  }, () => {
    alert("Unable to retrieve your location.");
  });
}

function highlightActiveLanguage() {
  document.querySelectorAll(".language-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === currentLang);
  });
}

document.querySelectorAll(".language-switch button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    currentLang = lang;
    localStorage.setItem("language", lang);
    applyTranslations();
  });
});

function applyTranslations() {
  document.title = i18n.title[currentLang];
  document.querySelector("h1").textContent = i18n.title[currentLang];
  document.getElementById("cityInput").placeholder = i18n.inputPlaceholder[currentLang];
  const buttons = document.querySelectorAll(".search-box button");
  buttons[0].textContent = `🔍 ${i18n.search[currentLang]}`;
  buttons[1].textContent = i18n.useLocation[currentLang];
  highlightActiveLanguage();
  if (document.getElementById("weatherInfo").innerHTML) {
    const city = document.getElementById("cityInput").value;
    getWeather(city);
  }
}

applyTranslations();
renderSearchHistory();

document.getElementById("toggleMode").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function showLoading() {
  document.getElementById("loading").classList.remove("hidden");
}
function hideLoading() {
  document.getElementById("loading").classList.add("hidden");
}

function saveSearch(cityName) {
  let history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  history = [cityName, ...history.filter(c => c !== cityName)];
  if (history.length > 5) history.length = 5;
  localStorage.setItem("searchHistory", JSON.stringify(history));
  renderSearchHistory();
}

function renderSearchHistory() {
  const container = document.getElementById("recentSearches");
  if (!container) return;
  const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  if (history.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `<h3>🔁 Recent Searches</h3>`;
  const ul = document.createElement("ul");
  ul.style.listStyle = "none";
  ul.style.padding = 0;
  history.forEach(city => {
    const li = document.createElement("li");
    li.innerHTML = `<button class="history-btn">${city}</button>`;
    li.querySelector("button").onclick = () => {
      document.getElementById("cityInput").value = city;
      getWeather(city);
    };
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
