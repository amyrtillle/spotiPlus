var redirect_uri = "http://127.0.0.1:5500/index.html";

var client_id = "";
var client_secret = "";

var access_token = null;
var refresh_token = null;
var currentPlaylist = "";
var radioButtons = [];

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
const CURRENTLYPLAYING =
  "https://api.spotify.com/v1/me/player/currently-playing";

function onPageLoad() {
  client_id = localStorage.getItem("client_id");
  client_secret = localStorage.getItem("client_secret");
  if (window.location.search.length > 0) {
    handleRedirect();
  } else {
    access_token = localStorage.getItem("access_token");
    if (access_token == null) {
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
  window.history.pushState("", "", redirect_uri); // remove param from url
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
  client_id = "bea1129d18834c44958a6741231f1a80";
  client_secret = "9d567158ce3d4484bdf79358c4a6fd62";
  localStorage.setItem("client_id", client_id);
  localStorage.setItem("client_secret", client_secret); // In a real app you should not expose your client_secret to the user

  let url = AUTHORIZE;
  url += "?client_id=" + client_id;
  url += "&response_type=code";
  url += "&redirect_uri=" + encodeURI(redirect_uri);
  url += "&show_dialog=true";
  url +=
    "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
  window.location.href = url;
}

function fetchAccessToken(code) {
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + encodeURI(redirect_uri);
  body += "&client_id=" + client_id;
  body += "&client_secret=" + client_secret;
  callAuthorizationApi(body);
}

function refreshAccessToken() {
  refresh_token = localStorage.getItem("refresh_token");
  let body = "grant_type=refresh_token";
  body += "&refresh_token=" + refresh_token;
  body += "&client_id=" + client_id;
  callAuthorizationApi(body);
}

function logOut() {
  access_token = localStorage.removeItem("access_token");
  refresh_token = localStorage.removeItem("refresh_token");
  window.location.reload();
}

function callAuthorizationApi(body) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", TOKEN, true);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.setRequestHeader(
    "Authorization",
    "Basic " + btoa(client_id + ":" + client_secret)
  );
  xhr.send(body);
  xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    var data = JSON.parse(this.responseText);
    if (data.access_token != undefined) {
      access_token = data.access_token;
      localStorage.setItem("access_token", access_token);
    }
    if (data.refresh_token != undefined) {
      refresh_token = data.refresh_token;
      localStorage.setItem("refresh_token", refresh_token);
    }
    onPageLoad();
  } else {
    alert(this.responseText);
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
  } else {
    alert(this.responseText);
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
  xhr.setRequestHeader("Authorization", "Bearer " + access_token);
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
  } else {
    alert(this.responseText);
  }
}

function addPlaylist(item) {
  let node = document.createElement("option");
  node.value = item.id;
  node.innerHTML = item.name + " (" + item.tracks.total + ")";
  document.getElementById("playlists").appendChild(node);
}

function removeAllItems(elementId) {
  let node = document.getElementById(elementId);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function play() {
  let playlist_id = document.getElementById("playlists").value;
  let trackindex = document.getElementById("tracks").value;
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
      cb(access_token);
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

  document.getElementById("togglePlay").onclick = function () {
    player.togglePlay();
  };

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

function fetchTracks() {
  let playlist_id = document.getElementById("playlists").value;
  if (playlist_id.length > 0) {
    url = TRACKS.replace("{{PlaylistId}}", playlist_id);
    callApi("GET", url, null, handleTracksResponse);
  }
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
  let node = document.createElement("option");
  node.value = index;
  node.innerHTML = item.track.name + " (" + item.track.artists[0].name + ")";
  document.getElementById("tracks").appendChild(node);
}

function currentlyPlaying() {
  callApi("GET", PLAYER + "?market=FR", null, handleCurrentlyPlayingResponse);
}

function timeStamp() {
  callApi("GET", PLAYER + "?market=FR", null, handleTimeStampResponse);
}

setInterval(function () {
  if (access_token != null && access_token.length > 0) {
    timeStamp();
  } else {
    setTimeout(() => {}, "15000");
  }
}, 1000);

setInterval(function () {
  if (access_token != null && access_token.length > 0) {
    currentlyPlaying();
  } else {
    setTimeout(() => {}, "15000");
  }
}, 10000);

function handleTimeStampResponse() {
  if (this.status == 200) {
    var data = JSON.parse(this.responseText);
    if (data.item != null) {
      let trackMsTot = data.item.duration_ms;
      let trackMs = trackMsTot % 1000;
      let trackStot = (trackMsTot - trackMs) / 1000;
      let trackS = trackStot % 60;
      let trackMtot = (trackStot - trackS) / 60;
      let trackM = trackMtot % 60;

      let progressMsTot = data.progress_ms;
      let progressMs = progressMsTot % 1000;
      let progressStot = (progressMsTot - progressMs) / 1000;
      let progressS = progressStot % 60;
      let progressMtot = (progressStot - progressS) / 60;
      let progressM = progressMtot % 60;

      document.getElementById("trackDuration").innerHTML =
        trackM + ":" + trackS;
      document.getElementById("trackProgress").innerHTML =
        progressM + ":" + progressS;
    }
  } else {
    document.getElementById("trackDuration").innerHTML = "0:0";
    document.getElementById("trackProgress").innerHTML = "0:0";
    document.getElementById("albumImage").style.display = "none";
    document.getElementById("trackTitle").innerHTML = "No track playing";
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
    document.getElementById("albumImage").style.display = "none";
    document.getElementById("trackTitle").innerHTML = "No track playing";
  }
}

function onRadioButton(deviceId, playlistId) {
  let body = {};
  body.context_uri = "spotify:playlist:" + playlistId;
  body.offset = {};
  body.offset.position = 0;
  body.offset.position_ms = 0;
  callApi(
    "PUT",
    PLAY + "?device_id=" + deviceId,
    JSON.stringify(body),
    handleApiResponse
  );
}
