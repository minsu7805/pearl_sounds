let activeCustomAudio = null;

function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function setCustomAudioUiState(player, state) {
  player.classList.toggle('is-playing', state === 'playing');
  player.classList.toggle('is-loading', state === 'loading');
  player.classList.toggle('is-error', state === 'error');
  player.classList.toggle('is-ready', state === 'ready' || state === 'playing' || state === 'idle');
}

function updateCustomAudioProgress(player, audio) {
  const fill = player.querySelector('.custom-audio__progress-fill');
  const thumb = player.querySelector('.custom-audio__progress-thumb');
  const currentEl = player.querySelector('.custom-audio__time-current');
  const durationEl = player.querySelector('.custom-audio__time-duration');
  const progress = player.querySelector('.custom-audio__progress');

  const duration = audio.duration;
  const current = audio.currentTime;
  const ratio = duration ? current / duration : 0;

  if (fill) fill.style.width = `${ratio * 100}%`;
  if (thumb) thumb.style.left = `${ratio * 100}%`;
  if (currentEl) currentEl.textContent = formatAudioTime(current);
  if (durationEl) durationEl.textContent = formatAudioTime(duration);
  if (progress) {
    progress.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
  }
}

function pauseOtherCustomAudios(currentAudio) {
  document.querySelectorAll('.custom-audio__native').forEach((audio) => {
    if (audio !== currentAudio && !audio.paused) {
      audio.pause();
    }
  });
}

async function preloadAudioSource(audio, player) {
  const source = audio.querySelector('source');
  if (!source || !source.src) return;

  setCustomAudioUiState(player, 'loading');

  try {
    const response = await fetch(source.src);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    if (audio.dataset.blobUrl) {
      URL.revokeObjectURL(audio.dataset.blobUrl);
    }

    audio.dataset.blobUrl = blobUrl;
    audio.src = blobUrl;
    audio.load();
  } catch (error) {
    console.error('Audio preload failed:', error);
    setCustomAudioUiState(player, 'error');
  }
}

function bindCustomAudioPlayer(player) {
  if (player.dataset.bound === 'true') return;
  player.dataset.bound = 'true';

  const audio = player.querySelector('.custom-audio__native');
  const playBtn = player.querySelector('.custom-audio__play');
  const progress = player.querySelector('.custom-audio__progress');
  const progressTrack = player.querySelector('.custom-audio__progress-track');

  if (!audio || !playBtn || !progress || !progressTrack) return;

  let isSeeking = false;
  let wasPlayingBeforeSeek = false;

  const togglePlayback = () => {
    if (audio.paused) {
      pauseOtherCustomAudios(audio);
      setCustomAudioUiState(player, 'loading');
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setCustomAudioUiState(player, 'error');
        });
      }
    } else {
      audio.pause();
    }
  };

  playBtn.addEventListener('click', (event) => {
    event.preventDefault();
    togglePlayback();
  });

  audio.addEventListener('loadedmetadata', () => {
    setCustomAudioUiState(player, 'ready');
    updateCustomAudioProgress(player, audio);
  });

  audio.addEventListener('timeupdate', () => {
    if (isSeeking) return;
    updateCustomAudioProgress(player, audio);
  });

  audio.addEventListener('seeked', () => {
    updateCustomAudioProgress(player, audio);
  });

  audio.addEventListener('playing', () => {
    activeCustomAudio = audio;
    setCustomAudioUiState(player, 'playing');
    updateCustomAudioProgress(player, audio);
  });

  audio.addEventListener('pause', () => {
    if (activeCustomAudio === audio) activeCustomAudio = null;
    if (!isSeeking) setCustomAudioUiState(player, 'ready');
    updateCustomAudioProgress(player, audio);
  });

  audio.addEventListener('ended', () => {
    if (activeCustomAudio === audio) activeCustomAudio = null;
    setCustomAudioUiState(player, 'ready');
    audio.currentTime = 0;
    updateCustomAudioProgress(player, audio);
  });

  audio.addEventListener('waiting', () => {
    if (!audio.paused) setCustomAudioUiState(player, 'loading');
  });

  audio.addEventListener('canplay', () => {
    if (!audio.paused) setCustomAudioUiState(player, 'playing');
    else if (!player.classList.contains('is-error')) setCustomAudioUiState(player, 'ready');
  });

  audio.addEventListener('error', () => {
    setCustomAudioUiState(player, 'error');
  });

  const seekToRatio = (ratio) => {
    const clamped = Math.min(1, Math.max(0, ratio));

    const applySeek = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      audio.currentTime = clamped * audio.duration;
      updateCustomAudioProgress(player, audio);
    };

    if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
      audio.addEventListener('loadedmetadata', applySeek, { once: true });
      return;
    }

    applySeek();
  };

  const seekFromClientX = (clientX) => {
    const rect = progressTrack.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = (clientX - rect.left) / rect.width;
    seekToRatio(ratio);
  };

  const startSeek = (clientX) => {
    isSeeking = true;
    wasPlayingBeforeSeek = !audio.paused;
    if (wasPlayingBeforeSeek) audio.pause();
    player.classList.add('is-seeking');
    seekFromClientX(clientX);
  };

  const moveSeek = (clientX) => {
    if (!isSeeking) return;
    seekFromClientX(clientX);
  };

  const endSeek = () => {
    if (!isSeeking) return;
    isSeeking = false;
    player.classList.remove('is-seeking');
    if (wasPlayingBeforeSeek) {
      audio.play().catch(() => setCustomAudioUiState(player, 'error'));
    }
    wasPlayingBeforeSeek = false;
  };

  progress.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    progress.setPointerCapture(event.pointerId);
    startSeek(event.clientX);
  });

  progress.addEventListener('pointermove', (event) => {
    if (!isSeeking) return;
    event.preventDefault();
    moveSeek(event.clientX);
  });

  progress.addEventListener('pointerup', (event) => {
    if (progress.hasPointerCapture(event.pointerId)) {
      progress.releasePointerCapture(event.pointerId);
    }
    endSeek();
  });

  progress.addEventListener('pointercancel', endSeek);

  progress.addEventListener('keydown', (event) => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

    let nextRatio = audio.currentTime / audio.duration;
    if (event.key === 'ArrowRight') nextRatio += 0.05;
    else if (event.key === 'ArrowLeft') nextRatio -= 0.05;
    else return;

    event.preventDefault();
    seekToRatio(nextRatio);
  });

  setCustomAudioUiState(player, 'loading');
  preloadAudioSource(audio, player);
}

function initCustomAudioPlayers(root = document) {
  root.querySelectorAll('[data-audio-player]').forEach(bindCustomAudioPlayer);
}
