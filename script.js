var youtubePlayer;
var scWidget;

var BASE64Q = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-"

var ARTISTS = ["None","Militant P", "Papa Buju"];

var SONG_NAME = [
  "Struggle to live",
  "BAM BAM",
  "No CBD",
  "Tre Cassett",
  "Pisello outta R'N'S crew & Papa Buju live @ Uno GT Radio Show"
];

var MEDIAITEMS = [
  { idItem: '0', type: 'youtube', link: 'LoEKXyGd2aE', artists: '001001001' },
  { idItem: '1', type: 'youtube', link: 'Gc0HIOOnnFg', artists: '002002002' },
  { idItem: '2', type: 'youtube', link: 'hipBlnFz95M', artists: '002002002' },
  { idItem: '3', type: 'youtube', link: '9LycOp1JGvk', artists: '002002002' },
  { idItem: '4', type: 'youtube', link: 'qXpLITKdd44', artists: '002002002' }
];

var currentMediaIndex = -1;
var progressBar = document.getElementById('progressBar');
var progressKnob = document.getElementById('progressKnob');
var progressContainer = document.querySelector('.progress-container');



function fromBase64QtoInt(stringa){
    var integer = 0;
    for (let i = stringa.length-1; i > 0 ; i--) {
      var a = stringa[i];
      var t = BASE64Q.indexOf(stringa[i]);
      var b = (64**(stringa.length-i-1));
      integer += BASE64Q.indexOf(stringa[i]) * (64**(stringa.length-i-1));
    }
    return integer;
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
  if (scWidget && scWidget.pause) {
    scWidget.pause();
  }
}


function loadMedia(index) {
  if (index >= 0 && index < MEDIAITEMS.length) {
    currentMediaIndex = index;
    var nextMedia = MEDIAITEMS[currentMediaIndex];
    stopAllPlayers(); // Stop any currently playing media

    if (nextMedia.type === 'youtube') {
      youtubePlayer.loadVideoById(nextMedia.link);
    } else if (nextMedia.type === 'soundcloud') {
      //scWidget.load('https://api.soundcloud.com/tracks/' + nextMedia.id, {
      //  auto_play: true,
      //  show_comments: true,
      //  show_user: true,
      //  show_reposts: false,
      //  visual: true
      // });
    }
    document.getElementById('message').innerHTML = 'Canzone corrente: ' + currentMediaIndex;
    document.getElementById('songTitle').innerHTML = SONG_NAME[currentMediaIndex];

    var artisti = "";
    for (let i = 0; i < 3; i++){
        let artistId = fromBase64QtoInt(MEDIAITEMS[currentMediaIndex]);
        if (artistId !== 0){
          artisti += MEDIAITEMS[artistId] + ", ";
        }
    }

    document.getElementById('songArtists').innerHTML = artisti;


  }
}

function loadNextMedia() {
  loadMedia(currentMediaIndex + 1);
  var playButton = document.querySelector(".button-control:nth-child(2)");
  playButton.innerHTML = '&#9209';
}

function loadPreviousMedia() {
  loadMedia(currentMediaIndex - 1);
}

function playCurrentMedia() {
  var playButton = document.querySelector(".button-control:nth-child(2)");

  if (currentMediaIndex >= 0 && currentMediaIndex < MEDIAITEMS.length) {
    var currentMedia = MEDIAITEMS[currentMediaIndex];

    if (currentMedia.type === 'youtube') {
      var playerState = youtubePlayer.getPlayerState();
      if (playerState === YT.PlayerState.PLAYING) {
        youtubePlayer.pauseVideo();
        playButton.innerHTML = '&#9205';
      } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.CUED) {
        youtubePlayer.playVideo();
        playButton.innerHTML = '&#9209';
      }
    } else if (currentMedia.type === 'soundcloud') {
      //scWidget.isPaused(function(isPaused) {
       // if (isPaused) {
        //  scWidget.play();
        //  playButton.innerHTML = '&#9209';
        //} else {
       //   scWidget.pause();
       //   playButton.innerHTML = '&#9209';
       // }
     // });
    }
  }
}

function nextMedia() {
  loadNextMedia();
}

function previousMedia() {
  loadPreviousMedia();
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
}

window.onload = function() {
  loadNextMedia();
};

setInterval(updateProgressBar, 1000);

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


function toggleMediaVisibility() {
  const youtubeIframe = document.getElementById('youtubePlayer');

  // Toggle display for YouTube iframe
  if (youtubeIframe.style.display === 'none' || youtubeIframe.style.display === '') {
    youtubeIframe.style.display = 'block';
  } else {
    youtubeIframe.style.display = 'none';
  }


}
