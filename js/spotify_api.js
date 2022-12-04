const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const DEVICES = "https://api.spotify.com/v1/me/player/devices";
const PLAY = "https://api.spotify.com/v1/me/player/play";
const PAUSE = "https://api.spotify.com/v1/me/player/pause";
const NEXT = "https://api.spotify.com/v1/me/player/next";
const PREVIOUS = "https://api.spotify.com/v1/me/player/previous";
const PLAYER = "https://api.spotify.com/v1/me/player";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const THISTRACK = "https://api.spotify.com/v1/tracks/{id}";
const CURRENTLYPLAYING = "https://api.spotify.com/v1/me/player/currently-playing";

var redirectUri = "http://127.0.0.1:5500/index.html";

var clientId = "";
var clientSecret = "";

var accessToken = null;
var refreshToken = null;
var currentPlaylist = "";
var radioButtons = [];

function onPageLoad() {
  clientId = localStorage.getItem("client_id");
  clientSecret = localStorage.getItem("client_secret");
  if (window.location.search.length > 0) {
    handleRedirect();
  } else {
    accessToken = localStorage.getItem("access_token");
    if (accessToken == null) {
      // we don't have an access token so present token section
      document.getElementById("tokenSection").style.display = "flex";
      document.querySelector("footer").style.display = "none";
      document.getElementById("menuToggle").style.display = "none";
    } else {
      // we have an access token so present device section
      document.getElementById("deviceSection").style.display = "flex";
      document.querySelector("footer").style.display = "flex";
      document.getElementById("menuToggle").style.display = "flex";

      refreshDevices();
      refreshPlaylists();
      currentlyPlaying();
    }
  }
}

function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirectUri); // remove param from url
}

function getCode() {
  let code = null;
  const queryString = window.location.search;
  if (queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get("code");
  }
  return code;
}

function requestAuthorization() {
  clientId = "bea1129d18834c44958a6741231f1a80";
  clientSecret = "9d567158ce3d4484bdf79358c4a6fd62";
  localStorage.setItem("client_id", clientId);
  localStorage.setItem("client_secret", clientSecret); // In a real app you should not expose your client_secret to the user

  let url = AUTHORIZE;
  url += "?client_id=" + clientId;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirectUri);
  url += "&show_dialog=true";
  url +=
    "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  window.location.href = url;
}

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirectUri);
  body += "&client_id=" + clientId;
  body += "&client_secret=" + clientSecret;
  callAuthorizationApi(body);
}

function refreshAccessToken() {
  refreshToken = localStorage.getItem("refresh_token");
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refreshToken;
  body += "&client_id=" + clientId;
  callAuthorizationApi(body);
}

function logOut() {
  accessToken = localStorage.removeItem("access_token");
  refreshToken = localStorage.removeItem("refresh_token");
  window.location.reload();
}

function callAuthorizationApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + btoa(clientId + ":" + clientSecret)
  );
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      accessToken = data.access_token;
      localStorage.setItem("access_token", accessToken);
    }
    if (data.refresh_token != undefined) {
      refreshToken = data.refresh_token;
      localStorage.setItem("refresh_token", refreshToken);
    }
    onPageLoad();
  }
}

function refreshDevices() {
  callApi("GET", DEVICES, null, handleDevicesResponse);
}

function handleDevicesResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);

    removeAllItems("devices");
    data.devices.forEach((item) => addDevice(item));
  } else if (this.status == 401) {
    refreshAccessToken();
  }
}

function addDevice(item) {
  let node = document.createElement("option");

  node.value = item.id;
  node.innerHTML = item.name;

  document.getElementById("devices").appendChild(node);
}

function callApi(method, url, body, callback) {
  let xhr = new XMLHttpRequest();

  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
  xhr.send(body);
  xhr.onload = callback;
}

function refreshPlaylists() {
  callApi("GET", PLAYLISTS, null, handlePlaylistsResponse);
}

function handlePlaylistsResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);

    removeAllItems("playlists");
    data.items.forEach((item) => addPlaylist(item));

    document.getElementById("playlists").value = currentPlaylist;
  } else if (this.status == 401) {
    refreshAccessToken();
  }
}

function addPlaylist(item) {
  let node = document.createElement("option");
  node.value = item.id;

  node.addEventListener("click", function fetchTracks() {
    let playlistId = document.getElementById("playlists").value;

    if (playlistId.length > 0) {
      url = TRACKS.replace("{{PlaylistId}}", playlistId);
      callApi("GET", url, null, handleTracksResponse);
    }
  });

  node.innerHTML = item.name + " (" + item.tracks.total + " titles)";
  document.getElementById("playlists").appendChild(node);
}

function removeAllItems(elementId) {
  let node = document.getElementById(elementId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function play() {
  let playlistId = document.getElementById("playlists").value;
  let trackIndex = document.getElementById("tracks").value;
  let body = {};

  refreshDevices();
  callApi(
    "PUT",
    PLAY + "?device_id=" + deviceId(),
    JSON.stringify(body),
    handleApiResponse
  );
}

window.onSpotifyWebPlaybackSDKReady = () => {
  const player = new Spotify.Player({
    name: "SpotiPlus Player",
    getOAuthToken: (cb) => {
      cb(accessToken);
    },
    volume: 0.5,
  });

  // Ready
  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
  });

  // Not Ready
  player.addListener("not_ready", ({ device_id }) => {
    console.log("Device ID has gone offline", device_id);
  });

  player.addListener("initialization_error", ({ message }) => {
    console.error(message);
  });

  player.addListener("authentication_error", ({ message }) => {
    console.error(message);
  });

  player.addListener("account_error", ({ message }) => {
    console.error(message);
  });
  player.connect();
};

function pause() {
  refreshDevices();
  callApi("PUT", PAUSE + "?device_id=" + deviceId(), null, handleApiResponse);
}

function next() {
  refreshDevices();
  callApi("POST", NEXT + "?device_id=" + deviceId(), null, handleApiResponse);
}

function previous() {
  refreshDevices();
  callApi(
    "POST",
    PREVIOUS + "?device_id=" + deviceId(),
    null,
    handleApiResponse
  );
}

function transfer() {
  let body = {};
  body.device_ids = [];
  body.device_ids.push(deviceId());
  callApi("PUT", PLAYER, JSON.stringify(body), handleApiResponse);
}

function handleApiResponse() {
  if (this.status == 200) {
    setTimeout(currentlyPlaying, 2000);
  } else if (this.status == 204) {
    setTimeout(currentlyPlaying, 2000);
  } else if (this.status == 401) {
    refreshAccessToken();
  }
}

function deviceId() {
  return document.getElementById("devices").value;
}



function handleTracksResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    removeAllItems("tracks");
    data.items.forEach((item, index) => addTrack(item, index));
  } else if (this.status == 401) {
    refreshAccessToken();
  }
}

function addTrack(item, index) {
  let node = document.createElement("li");
  node.value = index;
  node.innerHTML =
    "<div class='musicListItem' onclick=playThis()> <img class='albumImageList' src='" +
    item.track.album.images[0].url +
    "'/><div class='trackListInfo'><p>" +
    item.track.name +
    " </p><p>(" +
    item.track.artists[0].name +
    ")</p></div><div class='trackListDuration'> <img class='durationImageList' src='./assets/time.png' /><p>" +
    msToTime(item.track.duration_ms) +
    "</div></div>";
  document.getElementById("tracks").appendChild(node);
}

function currentlyPlaying() {
  callApi("GET", PLAYER + "?market=FR", null, handleCurrentlyPlayingResponse);
}

function playThis() {
}

function timeStamp() {
  callApi("GET", PLAYER + "?market=FR", null, handleTimeStampResponse);
}

setInterval(function () {
  if (accessToken != null && accessToken.length > 0) {
    timeStamp();
  } else {
    setTimeout(() => { }, "15000");
  }
}, 1000);

setInterval(function () {
  if (accessToken != null && accessToken.length > 0) {
    currentlyPlaying();
  } else {
    setTimeout(() => { }, "15000");
  }
}, 10000);

function msToTime(duration) {
  let seconds = Math.floor(duration / 1000);
  let minutes = Math.floor(seconds / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return (
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
  );
}

function handleTimeStampResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    if (data.item != null) {
      trackDuration = msToTime(data.item.duration_ms);
      trackProgress = msToTime(data.progress_ms);

      document.getElementById("trackDuration").innerHTML = trackDuration;
      document.getElementById("trackProgress").innerHTML = trackProgress;
    }
  } else {
    document.getElementById("albumImage").style.display = "none";
    document.getElementById("trackDuration").innerHTML = "00:00";
    document.getElementById("trackProgress").innerHTML = "00:00";
  }
}

function handleCurrentlyPlayingResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    if (data.item != null) {
      document.getElementById("albumImage").src = data.item.album.images[0].url;

      document.getElementById("trackTitle").innerHTML = data.item.name;
      document.getElementById("trackArtist").innerHTML =
        data.item.artists[0].name;
    }

    if (data.device != null) {
      // select device
      currentDevice = data.device.id;
      document.getElementById("devices").value = currentDevice;
    }

    if (data.context != null) {
      currentPlaylist = data.context.uri;
      currentPlaylist = currentPlaylist.substring(
        currentPlaylist.lastIndexOf(":") + 1,
        currentPlaylist.length
      );
      document.getElementById("playlists").value = currentPlaylist;
    }
  } else if (this.status == 401) {
    refreshAccessToken();
  } else {
    document.getElementById("trackDuration").innerHTML = "0:0";
    document.getElementById("trackProgress").innerHTML = "0:0";
    document.getElementById("trackTitle").innerHTML = "No track playing";
  }
}