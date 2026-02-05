/*
 * Winamp Player — sandra's portfolio
 * YouTube IFrame API audio player with retro Winamp skin
 */

// Playlist: YouTube video IDs + metadata
const winampPlaylist = [
    { id: 'SpEHT9blu_0', title: 'Placebo - Teenage Angst', duration: '2:43' },
    { id: 'KlEbnOZ9DZQ', title: 'DPR IAN - Nerves', duration: '3:34' },
    { id: '-HH2VwRmVqc', title: '4s4ki - Your Dreamland', duration: '3:28' },
    { id: 'pyEfFeTN7tI', title: 'Hayloft (feat. Miku & Gumi)', duration: '3:04' },
    { id: 'NTrm_idbhUk', title: 'Kikuo - Love me, Love me, Love me', duration: '4:11' }
];

let ytPlayer = null;
let playerReady = false;
let ytApiLoading = false;    // Prevent duplicate script tags
let ytPlayerInit = false;    // Prevent re-initialization
let pendingTrackIndex = -1;
let currentTrack = -1;
let isPlaying = false;
let vizInterval = null;
let timeInterval = null;
let titleScrollInterval = null;
let titleScrollPos = 0;

// Load YouTube IFrame API
function loadYouTubeAPI() {
    // Already ready — just init the player
    if (window.YT && window.YT.Player) {
        initYTPlayer();
        return;
    }
    // Don't add duplicate script tags
    if (ytApiLoading) return;
    ytApiLoading = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
}

// Called by YouTube API when ready
window.onYouTubeIframeAPIReady = function() {
    initYTPlayer();
};

function initYTPlayer() {
    // Don't reinitialize if player already exists or is being created
    if (ytPlayerInit) return;
    ytPlayerInit = true;

    // Create a hidden div for the YT player
    let playerDiv = document.getElementById('yt-player-container');
    if (!playerDiv) {
        playerDiv = document.createElement('div');
        playerDiv.id = 'yt-player-container';
        playerDiv.style.cssText = 'position:fixed;bottom:0;left:0;width:200px;height:200px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1;';
        document.body.appendChild(playerDiv);

        const innerDiv = document.createElement('div');
        innerDiv.id = 'yt-player';
        playerDiv.appendChild(innerDiv);
    }

    ytPlayer = new YT.Player('yt-player', {
        height: '200',
        width: '200',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady() {
    playerReady = true;
    // Set initial volume
    const volSlider = document.getElementById('winamp-volume');
    if (volSlider && ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(parseInt(volSlider.value));
    }
    // Play pending track if user clicked before player was ready
    if (pendingTrackIndex >= 0) {
        const idx = pendingTrackIndex;
        pendingTrackIndex = -1;
        playTrack(idx);
    }
}

function onPlayerError(event) {
    console.error('[Winamp] YouTube error code:', event.data);
    // Error codes: 2=invalid param, 5=HTML5 error, 100=not found, 101/150=embed blocked
    // Try next track on error
    if (currentTrack >= 0) playNext();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        // Auto-play next track
        playNext();
    } else if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        startVisualizer();
        startTimeUpdate();
        updatePlayButton();
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        stopVisualizer();
        updatePlayButton();
    }
}

function playTrack(index) {
    if (index < 0 || index >= winampPlaylist.length) return;
    currentTrack = index;

    // Highlight active track
    document.querySelectorAll('.winamp-track').forEach((el, i) => {
        el.classList.toggle('active', i === index);
    });

    // Update scroll title
    const track = winampPlaylist[index];
    updateTitleScroll(track.title);

    // Load and play via YouTube
    if (playerReady && ytPlayer && ytPlayer.loadVideoById) {
        ytPlayer.loadVideoById(track.id);
        // Mobile needs explicit playVideo() call
        setTimeout(() => {
            if (ytPlayer && ytPlayer.playVideo) {
                ytPlayer.playVideo();
            }
        }, 300);
        isPlaying = true;
        updatePlayButton();
    } else {
        // Player not ready yet — queue this track and load API
        pendingTrackIndex = index;
        loadYouTubeAPI();
    }
}

function playPause() {
    if (currentTrack === -1) {
        playTrack(0);
        return;
    }

    if (!ytPlayer || !ytPlayer.getPlayerState) return;

    const state = ytPlayer.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        ytPlayer.pauseVideo();
    } else {
        ytPlayer.playVideo();
    }
}

function stopPlayback() {
    if (ytPlayer && ytPlayer.stopVideo) {
        ytPlayer.stopVideo();
    }
    isPlaying = false;
    stopVisualizer();
    stopTimeUpdate();
    updatePlayButton();
    document.getElementById('winamp-time').textContent = '00:00';
    document.getElementById('winamp-seek').value = 0;
}

function playNext() {
    const next = (currentTrack + 1) % winampPlaylist.length;
    playTrack(next);
}

function playPrev() {
    const prev = currentTrack <= 0 ? winampPlaylist.length - 1 : currentTrack - 1;
    playTrack(prev);
}

// Title scroll animation
function updateTitleScroll(text) {
    const el = document.getElementById('winamp-title-scroll');
    if (!el) return;

    const scrollText = '  ♡  ' + text + '  ♡  ' + text;
    el.textContent = text;
    titleScrollPos = 0;

    if (titleScrollInterval) clearInterval(titleScrollInterval);
    titleScrollInterval = setInterval(() => {
        titleScrollPos++;
        if (titleScrollPos > text.length + 5) titleScrollPos = 0;
        const display = scrollText.substring(titleScrollPos, titleScrollPos + 30);
        el.textContent = display;
    }, 200);
}

// Time display update
function startTimeUpdate() {
    if (timeInterval) clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        if (!ytPlayer || !ytPlayer.getCurrentTime) return;
        const time = ytPlayer.getCurrentTime();
        const duration = ytPlayer.getDuration();
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        document.getElementById('winamp-time').textContent =
            String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

        // Update seek bar
        if (duration > 0) {
            document.getElementById('winamp-seek').value = (time / duration) * 100;
        }
    }, 500);
}

function stopTimeUpdate() {
    if (timeInterval) clearInterval(timeInterval);
}

// Fake visualizer (bouncing bars)
function startVisualizer() {
    const bars = document.querySelectorAll('.viz-bar');
    if (vizInterval) clearInterval(vizInterval);
    vizInterval = setInterval(() => {
        bars.forEach(bar => {
            const h = Math.random() * 100;
            bar.style.height = h + '%';
        });
    }, 120);
}

function stopVisualizer() {
    if (vizInterval) clearInterval(vizInterval);
    const bars = document.querySelectorAll('.viz-bar');
    bars.forEach(bar => { bar.style.height = '10%'; });
}

function updatePlayButton() {
    const btn = document.getElementById('winamp-play');
    if (btn) {
        btn.textContent = isPlaying ? '▶' : '▶';
        btn.classList.toggle('playing', isPlaying);
    }
}

// Init events
document.addEventListener('DOMContentLoaded', () => {
    // Transport controls
    const playBtn = document.getElementById('winamp-play');
    const pauseBtn = document.getElementById('winamp-pause');
    const stopBtn = document.getElementById('winamp-stop');
    const nextBtn = document.getElementById('winamp-next');
    const prevBtn = document.getElementById('winamp-prev');

    if (playBtn) playBtn.addEventListener('click', playPause);
    if (pauseBtn) pauseBtn.addEventListener('click', () => {
        if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    });
    if (stopBtn) stopBtn.addEventListener('click', stopPlayback);
    if (nextBtn) nextBtn.addEventListener('click', playNext);
    if (prevBtn) prevBtn.addEventListener('click', playPrev);

    // Playlist track clicks
    document.querySelectorAll('.winamp-track').forEach((el) => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.getAttribute('data-index'));
            playTrack(idx);
        });
    });

    // Volume slider
    const volSlider = document.getElementById('winamp-volume');
    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            if (ytPlayer && ytPlayer.setVolume) {
                ytPlayer.setVolume(parseInt(e.target.value));
            }
        });
    }

    // Seek bar
    const seekSlider = document.getElementById('winamp-seek');
    if (seekSlider) {
        seekSlider.addEventListener('input', (e) => {
            if (ytPlayer && ytPlayer.getDuration && ytPlayer.seekTo) {
                const duration = ytPlayer.getDuration();
                const seekTo = (parseFloat(e.target.value) / 100) * duration;
                ytPlayer.seekTo(seekTo, true);
            }
        });
    }
});
