const audioPlayer = document.getElementById("audioPlayer");
const statusText = document.getElementById("statusText");
const stopBtn = document.getElementById("stopBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const stationResults = document.getElementById("stationResults");
const favoriteList = document.getElementById("favoriteList");
const customName = document.getElementById("customName");
const customUrl = document.getElementById("customUrl");
const addCustomBtn = document.getElementById("addCustomBtn");
const customList = document.getElementById("customList");

const FAVORITES_KEY = "radio-favorites-v1";
const CUSTOM_KEY = "radio-custom-v1";

const DEFAULT_STATIONS = [
  { name: "Radio Paradise", url: "https://stream-uk1.radioparadise.com/mp3-192", country: "US" },
  { name: "BBC World Service", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service", country: "UK" },
  { name: "NPR News", url: "https://npr-ice.streamguys1.com/live.mp3", country: "US" },
  { name: "Deutschlandfunk", url: "https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3", country: "Germany" },
  { name: "France Culture", url: "http://direct.franceculture.fr/live/franceculture-midfi.mp3", country: "France" },
  { name: "CBC Radio One", url: "https://cbc_r1_tor.akacast.akamaistream.net/7/385/451661/v1/rc.akacast.akamaistream.net/cbc_r1_tor", country: "Canada" },
  { name: "VOA News", url: "https://voa-ingest.akamaized.net/hls/live/2033874/voa1/master.m3u8", country: "USA" },
  { name: "Classic FM", url: "https://media-ice.musicradio.com/ClassicFMMP3", country: "UK" }
];

let favorites = [];
let customStations = [];

function saveFavorites() {
  chrome.storage.local.set({ [FAVORITES_KEY]: favorites });
}

function saveCustomStations() {
  chrome.storage.local.set({ [CUSTOM_KEY]: customStations });
}

function playStation(station) {
  const streamUrl = station.url;
  audioPlayer.src = streamUrl;
  audioPlayer.play();
  statusText.textContent = "Playing: " + station.name;
}

function renderStationRow(container, station, options = {}) {
  const row = document.createElement("div");
  row.className = "station-row";

  const playButton = document.createElement("button");
  playButton.className = "station-btn";
  playButton.textContent = options.shortLabel ? options.shortLabel : station.name;
  playButton.addEventListener("click", () => playStation(station));

  row.appendChild(playButton);

  if (options.showFavorite) {
    const favButton = document.createElement("button");
    favButton.className = "minor-btn";
    favButton.textContent = options.isFavorite ? "★" : "☆";
    favButton.title = options.isFavorite ? "Remove favorite" : "Add favorite";
    favButton.addEventListener("click", () => {
      if (options.isFavorite) {
        favorites = favorites.filter((item) => item.url !== station.url || item.name !== station.name);
      } else {
        favorites.push({ name: station.name, url: station.url, country: station.country || "" });
      }
      saveFavorites();
      renderFavorites();
    });
    row.appendChild(favButton);
  }

  if (options.showRemove) {
    const removeButton = document.createElement("button");
    removeButton.className = "minor-btn";
    removeButton.textContent = "Del";
    removeButton.title = "Remove custom station";
    removeButton.addEventListener("click", () => {
      customStations = customStations.filter((item) => item.url !== station.url || item.name !== station.name);
      saveCustomStations();
      renderCustomStations();
    });
    row.appendChild(removeButton);
  }

  container.appendChild(row);
}

function renderResults(stations) {
  stationResults.innerHTML = "";

  stations.forEach((station) => {
    const isFavorite = favorites.some((item) => item.url === station.url && item.name === station.name);
    renderStationRow(stationResults, station, {
      showFavorite: true,
      isFavorite,
      shortLabel: `${station.name}${station.country ? " (" + station.country + ")" : ""}`
    });
  });
}

function renderFavorites() {
  favoriteList.innerHTML = "";

  if (!favorites.length) {
    favoriteList.innerHTML = "<div class='status-box'>No favorites yet.</div>";
    return;
  }

  favorites.forEach((station) => {
    renderStationRow(favoriteList, station, {
      showFavorite: true,
      isFavorite: true,
      shortLabel: `${station.name}${station.country ? " (" + station.country + ")" : ""}`
    });
  });
}

function renderCustomStations() {
  customList.innerHTML = "";

  if (!customStations.length) {
    customList.innerHTML = "<div class='status-box'>No custom stations yet.</div>";
    return;
  }

  customStations.forEach((station) => {
    renderStationRow(customList, station, {
      showFavorite: true,
      isFavorite: favorites.some((item) => item.url === station.url && item.name === station.name),
      showRemove: true,
      shortLabel: station.name
    });
  });
}

async function searchPublicStations(queryText) {
  const term = (queryText || "top").trim();
  if (!term) {
    renderResults(DEFAULT_STATIONS);
    return;
  }

  try {
    const apiUrl = `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(term)}&limit=12&hidebroken=true`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const stations = Array.isArray(data)
      ? data
          .filter((station) => station && station.name && (station.url || station.url_resolved))
          .map((station) => ({
            name: station.name,
            url: station.url_resolved || station.url,
            country: station.country || ""
          }))
          .slice(0, 12)
      : [];

    renderResults(stations.length ? stations : DEFAULT_STATIONS);
  } catch (error) {
    console.error("Public station search failed", error);
    renderResults(DEFAULT_STATIONS);
    statusText.textContent = "Using built-in stations";
  }
}

function loadFromStorage() {
  chrome.storage.local.get([FAVORITES_KEY, CUSTOM_KEY], (result) => {
    favorites = result[FAVORITES_KEY] || [];
    customStations = result[CUSTOM_KEY] || [];
    renderFavorites();
    renderCustomStations();
    renderResults(DEFAULT_STATIONS);
  });
}

searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  searchPublicStations(query || "top");
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const query = searchInput.value.trim();
    searchPublicStations(query || "top");
  }
});

addCustomBtn.addEventListener("click", () => {
  const stationName = customName.value.trim();
  const stationUrl = customUrl.value.trim();

  if (!stationName || !stationUrl) {
    statusText.textContent = "Please enter a name and URL.";
    return;
  }

  const parsed = /^https?:\/\/.test(stationUrl);
  if (!parsed) {
    statusText.textContent = "Use a valid http:// or https:// URL.";
    return;
  }

  const newStation = { name: stationName, url: stationUrl, country: "Custom" };
  customStations.unshift(newStation);
  saveCustomStations();
  renderCustomStations();
  customName.value = "";
  customUrl.value = "";
  statusText.textContent = "Custom station added.";
});

stopBtn.addEventListener("click", () => {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  statusText.textContent = "Stopped";
});

audioPlayer.addEventListener("error", () => {
  statusText.textContent = "Stream failed. Try another station.";
});

loadFromStorage();
searchPublicStations("top");
