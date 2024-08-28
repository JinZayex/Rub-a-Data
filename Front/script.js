var youtubePlayer;
var scWidget;
var mediaItems = [
  { type: 'youtube', id: 'tgbNymZ7vqY' },   // YouTube video
  { type: 'youtube', id: 'hipBlnFz95M' },   // YouTube video
  { type: 'soundcloud', id: '858345298' },  // SoundCloud track
  { type: 'soundcloud', id: '858345292' },  // SoundCloud track
  { type: 'youtube', id: 'lTTajzrSkCw' }    // YouTube video
];

var currentMediaIndex = -1;
var progressBar = document.getElementById('progressBar');
var progressKnob = document.getElementById('progressKnob');
var progressContainer = document.querySelector('.progress-container');

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
  if (scWidget && scWidget.pause) {
    scWidget.pause();
  }
}

function loadMedia(index) {
  if (index >= 0 && index < mediaItems.length) {
    currentMediaIndex = index;
    var nextMedia = mediaItems[currentMediaIndex];
    stopAllPlayers(); // Stop any currently playing media

    if (nextMedia.type === 'youtube') {
      youtubePlayer.loadVideoById(nextMedia.id);
    } else if (nextMedia.type === 'soundcloud') {
      scWidget.load('https://api.soundcloud.com/tracks/' + nextMedia.id, {
        auto_play: true,
        show_comments: true,
        show_user: true,
        show_reposts: false,
        visual: true
      });
    }
    document.getElementById('message').innerHTML = 'Canzone corrente: ' + currentMediaIndex;
  }
}

function loadNextMedia() {
  loadMedia(currentMediaIndex + 1);
}

function loadPreviousMedia() {
  loadMedia(currentMediaIndex - 1);
}

function playCurrentMedia() {
    if (currentMediaIndex >= 0 && currentMediaIndex < mediaItems.length) {
        var currentMedia = mediaItems[currentMediaIndex];
        
        if (currentMedia.type === 'youtube') {
            var playerState = youtubePlayer.getPlayerState();
            if (playerState === YT.PlayerState.PLAYING) {
                youtubePlayer.pauseVideo(); // Metti in pausa
            } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.CUED) {
                youtubePlayer.playVideo(); // Riprendi la riproduzione
            }
        } else if (currentMedia.type === 'soundcloud') {
            scWidget.isPaused(function(isPaused) {
                if (isPaused) {
                    scWidget.play(); // Riprendi la riproduzione
                } else {
                    scWidget.pause(); // Metti in pausa
                }
            });
        }
    }
  }

function formatTime(seconds) {
  var minutes = Math.floor(seconds / 60);
  var seconds = Math.floor(seconds % 60);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function updateProgressBar() {
  var timeDisplay = document.getElementById('timeDisplay');

  if (youtubePlayer) {
    var duration = youtubePlayer.getDuration();
    var currentTime = youtubePlayer.getCurrentTime();
    var progress = (currentTime / duration) * 100;
    progressBar.style.width = progress + '%';
    progressKnob.style.left = progress + '%';
    timeDisplay.innerHTML = formatTime(currentTime) + " / " + formatTime(duration);
  }

  if (scWidget) {
    // scWidget.getCurrentPosition(function(position) {
    // scWidget.getDuration(function(duration) {
    // var progress = (position / duration) * 100;
    // progressBar.style.width = progress + '%';
    // progressKnob.style.left = progress + '%';
    // timeDisplay.innerHTML = formatTime(position) + " / " + formatTime(duration);
    // });
    // });
  }
}

// Inizializza il player di SoundCloud
var iframeElement = document.getElementById('soundcloudPlayer');
scWidget = SC.Widget(iframeElement);

scWidget.bind(SC.Widget.Events.READY, function() {
  scWidget.bind(SC.Widget.Events.PLAY, function() {
    updateProgressBar();
  });
  scWidget.bind(SC.Widget.Events.FINISH, function() {
    loadNextMedia();
  });
});

// Carica il primo media
window.onload = function() {
  loadNextMedia();
};

// Aggiorna la barra di avanzamento ogni secondo
setInterval(updateProgressBar, 1000);

// Gestione del drag-and-drop del cursore di avanzamento
let isDragging = false;

progressKnob.addEventListener('mousedown', function(e) {
  isDragging = true;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
  if (isDragging) {
    let rect = progressContainer.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let progress = Math.min(Math.max(x / rect.width, 0), 1);
    progressBar.style.width = (progress * 100) + '%';
    progressKnob.style.left = (progress * 100) + '%';

    if (youtubePlayer) {
      let duration = youtubePlayer.getDuration();
      youtubePlayer.seekTo(progress * duration);
    }
    if (scWidget) {
      scWidget.getDuration(function(duration) {
        scWidget.seekTo(progress * duration);
      });
    }
  }
}

function onMouseUp() {
  isDragging = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
}
