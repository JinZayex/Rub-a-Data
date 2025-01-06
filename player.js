let youtubePlayer;
let currentMediaIndex = -1;
const songList = document.getElementById('song-list');
const titleSearchBar = document.getElementById('search-title');
const artistSearchBar = document.getElementById('search-artist');
const selectaSearchBar = document.getElementById('search-selecta');
const progressBar = document.getElementById('progressBar');
const progressKnob = document.getElementById('progressKnob');
const progressContainer = document.querySelector('.progress-container');
let songsData = [];

// Caricamento iniziale dei dati
fetch('songs.json')
  .then(response => response.json())
  .then(data => {
    songsData = data;
    updateSongList();
  })
  .catch(error => console.error('Error loading JSON:', error));

// Funzione per aggiornare la lista dei brani in base ai filtri
function updateSongList() {
  const titleFilter = titleSearchBar.value.toLowerCase();
  const artistFilter = artistSearchBar.value.toLowerCase();
  const selectaFilter = selectaSearchBar.value.toLowerCase();

  songList.innerHTML = ""; // Svuota la lista
  songsData.forEach((song, index) => {
    if (
      song.title.toLowerCase().includes(titleFilter) &&
      song.artist.toLowerCase().includes(artistFilter) &&
      song.selecta.toLowerCase().includes(selectaFilter)
    ) {
      const songItem = document.createElement('li');
      songItem.innerHTML = `
        <img src="${song.thumbnail}" ><br/>
        <strong>${song.title}</strong><br/>
        ${song.artist}<br />
        <strong>Selecta:</strong> ${song.selecta}<br />
        <a href="#" onclick="loadMedia(${index})">Play this song</a>
      `;
      songList.appendChild(songItem);
    }
  });
}

function onYouTubeIframeAPIReady() {
  youtubePlayer = new YT.Player('youtubePlayer', {
    events: {
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
    updateProgressBar();
  }
  if (event.data == YT.PlayerState.ENDED) {
    loadNextMedia();
  }
}

function stopAllPlayers() {
  if (youtubePlayer && youtubePlayer.stopVideo) {
    youtubePlayer.stopVideo();
  }
}


// Event listener per i filtri
titleSearchBar.addEventListener('input', updateSongList);
artistSearchBar.addEventListener('input', updateSongList);
selectaSearchBar.addEventListener('input', updateSongList);

// Funzioni del player
function loadMedia(index) {
  if (index >= 0 && index < songsData.length) {
    currentMediaIndex = index;
    const media = songsData[index];
    const videoId = extractVideoId(media.yt_link);

    // Caricamento del video nel lettore YouTube
    youtubePlayer.loadVideoById(videoId);

    // Aggiorna informazioni del player
    document.getElementById('songTitle').textContent = media.title;
    document.getElementById('songArtists').textContent = media.artist;
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    updateProgressBar();
  } else if (event.data === YT.PlayerState.ENDED) {
    loadNextMedia();
  }
}

function playCurrentMedia() {
  if (youtubePlayer) {
    const state = youtubePlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
      youtubePlayer.pauseVideo();
      document.getElementById('playButton').innerHTML = '&#9205'; // Play icon
    } else {
      youtubePlayer.playVideo();
      document.getElementById('playButton').innerHTML = '&#9209'; // Pause icon
    }
  }
}

function loadNextMedia() {
  loadMedia(currentMediaIndex + 1);
}

function loadPreviousMedia() {
  loadMedia(currentMediaIndex - 1);
}

// Event listeners per i controlli
document.getElementById('playButton').addEventListener('click', playCurrentMedia);
document.getElementById('nextButton').addEventListener('click', loadNextMedia);
document.getElementById('prevButton').addEventListener('click', loadPreviousMedia);

// Progress bar aggiornamento
function updateProgressBar() {
  if (youtubePlayer) {
    const duration = youtubePlayer.getDuration();
    const currentTime = youtubePlayer.getCurrentTime();
    const progress = (currentTime / duration) * 100;

    progressBar.style.width = progress + '%';
    progressKnob.style.left = progress + '%';
  }
}

setInterval(updateProgressBar, 1000);
