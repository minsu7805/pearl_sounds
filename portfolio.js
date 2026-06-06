// SoundCloud 곡 링크를 아래에 추가하세요.
// 예: 'https://soundcloud.com/아이디/곡이름'
const portfolioTracks = [
  {
    demoTitle: '신규 트로트 데모 릴리즈',
    demoDesc: '귀에 감기는 후렴과 강렬한 훅을 담은, 오래 기억되는 음악을 만듭니다.',
    youtubeSectionDesc: 'Pearl Sounds 작가들이 참여한 대표곡들입니다.',
    genre: 'Trot',
    title: '트로트 하이라이트 모음',
    description: '미발매곡의 부분 편집본입니다.',
    soundcloudUrl: '',
    youtubeVideos: [
      { title: '[MV] Seo Eun Gyo(서은교) - The Day I Find Myself(나를 찾는 날) (Always You)', videoId: '4NfUQHFVbhg' },
      { title: 'Della 丁噹 [ 命中注定 You Are My Destiny ] Official Music Video（戲劇《你是我的命中注定》片尾曲）', videoId: 'vVIPppbb3yU' },
      { title: '🎧 Gravity (feat. 주희) - Big Earth Little Me 2015', videoId: 'jgNFcIioPn4' },
      { title: 'マルシィ – 隣で（Official Music Video）', videoId: '2rX0e5ZmpwU' },
      { title: 'PINK FUN《Oh! My Oh! My》Official Music Video', videoId: '3su5TzyNuQo' },
      { title: '丁噹 Della Ding- 命中注定 MV【你是我的命中注定 OST You Are My Destiny】片尾曲', videoId: 'mpFx8xMFkAs' }
    ]
  }
];

function getYoutubeVideoId(video) {
  if (video.videoId && video.videoId.trim() !== '') {
    return video.videoId.trim();
  }
  if (video.url) {
    const match = video.url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  }
  return '';
}

function buildYoutubeEmbed(videoId) {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1'
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function buildSoundCloudEmbed(url) {
  const params = new URLSearchParams({
    url,
    color: '#c4a35a',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'true'
  });

  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

function renderPortfolio() {
  const container = document.getElementById('portfolio-list');
  if (!container) return;

  container.innerHTML = portfolioTracks.map((track) => {
    const hasUrl = track.soundcloudUrl && track.soundcloudUrl.trim() !== '';

    const player = hasUrl
      ? `<iframe
          class="portfolio-iframe"
          title="${track.title} 재생"
          scrolling="no"
          allow="autoplay"
          src="${buildSoundCloudEmbed(track.soundcloudUrl)}"
        ></iframe>`
      : `<div class="portfolio-placeholder">
          SoundCloud 링크를 <code>portfolio.js</code>에 추가하면 바로 재생됩니다.
        </div>`;

    const youtubeSection = track.youtubeVideos && track.youtubeVideos.length > 0
      ? `
        <div class="youtube-section">
          <div class="portfolio-section-header">
            <h3 class="youtube-section-title">국내외 참여곡 포트폴리오</h3>
            ${track.youtubeSectionDesc ? `<p class="portfolio-section-desc">${track.youtubeSectionDesc}</p>` : ''}
          </div>
          <div class="youtube-grid">
          ${track.youtubeVideos.map((video) => {
            const videoId = getYoutubeVideoId(video);
            let embed = `<div class="youtube-placeholder">YouTube 링크를 <code>portfolio.js</code>에 추가하세요</div>`;

            if (videoId) {
              embed = `
                <div class="youtube-embed">
                  <iframe
                    src="${buildYoutubeEmbed(videoId)}"
                    title="${video.title}"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy"
                  ></iframe>
                </div>
              `;
            }

            return `
              <article class="youtube-card">
                ${embed}
                <p class="youtube-title">${video.title}</p>
              </article>
            `;
          }).join('')}
          </div>
        </div>
      `
      : '';

    return `
      <div class="portfolio-item">
        ${track.demoTitle ? `
          <div class="portfolio-section-header">
            <h3 class="portfolio-section-title">${track.demoTitle}</h3>
            ${track.demoDesc ? `<p class="portfolio-section-desc">${track.demoDesc}</p>` : ''}
          </div>
        ` : ''}
        <article class="portfolio-card">
          <div class="portfolio-info">
            <span class="portfolio-tag">${track.genre}</span>
            <h3>${track.title}</h3>
            <p>${track.description}</p>
          </div>
          <div class="portfolio-player">${player}</div>
        </article>
        ${youtubeSection}
      </div>
    `;
  }).join('');
}

renderPortfolio();
