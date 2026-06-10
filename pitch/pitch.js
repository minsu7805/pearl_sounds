function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function encodeAudioSrc(src) {
  const slash = src.lastIndexOf('/');
  if (slash === -1) return encodeURIComponent(src);
  return src.slice(0, slash + 1) + encodeURIComponent(src.slice(slash + 1));
}

function renderPitchPlayer(track) {
  const encodedSrc = encodeAudioSrc(track.audioSrc);
  const safeTitle = escapeHtml(track.title);

  return `
    <div class="custom-audio" data-audio-player>
      <audio
        class="custom-audio__native"
        preload="metadata"
        playsinline
        webkit-playsinline
        title="${safeTitle}"
      >
        <source src="${encodedSrc}" type="audio/mpeg">
      </audio>
      <div class="custom-audio__card">
        <button type="button" class="custom-audio__play" aria-label="${safeTitle} 재생">
          <svg class="custom-audio__icon custom-audio__icon--play" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5.14v13.72c0 .79.87 1.27 1.54.84l10.14-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" fill="currentColor"/>
          </svg>
          <svg class="custom-audio__icon custom-audio__icon--pause" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h3v14H7V5Zm7 0h3v14h-3V5Z" fill="currentColor"/>
          </svg>
          <span class="custom-audio__spinner" aria-hidden="true"></span>
        </button>
        <div class="custom-audio__body">
          <div class="custom-audio__meta">
            <span class="custom-audio__title">${safeTitle}</span>
            <span class="custom-audio__time">
              <span class="custom-audio__time-current">0:00</span>
              <span class="custom-audio__time-sep">/</span>
              <span class="custom-audio__time-duration">0:00</span>
            </span>
          </div>
          <div
            class="custom-audio__progress"
            role="slider"
            aria-label="재생 위치"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
            tabindex="0"
          >
            <div class="custom-audio__progress-track">
              <div class="custom-audio__progress-fill"></div>
              <div class="custom-audio__progress-thumb"></div>
            </div>
          </div>
        </div>
      </div>
      <p class="custom-audio__error" aria-live="polite">음원을 불러오지 못했습니다.</p>
    </div>
  `;
}

function renderPitchDescription(description) {
  const lines = Array.isArray(description) ? description : [description];
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
}

function renderPitchTracks(tracks, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = tracks.map((track) => `
    <article class="pitch-track-card">
      <div class="pitch-track-head">
        <span class="pitch-track-num">${track.num}</span>
        <div class="pitch-track-info">
          <span class="portfolio-tag">${track.genre}</span>
          <h2>${escapeHtml(track.title)}</h2>
          ${renderPitchDescription(track.description)}
        </div>
      </div>
      <div class="pitch-track-player">${renderPitchPlayer(track)}</div>
    </article>
  `).join('');

  if (typeof initCustomAudioPlayers === 'function') {
    initCustomAudioPlayers(container);
  }
}
