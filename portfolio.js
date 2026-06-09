// SoundCloud 곡 링크를 아래에 추가하세요.
// 예: 'https://soundcloud.com/아이디/곡이름'
const portfolioTracks = [
  {
    demoTitle: '신규 트로트 데모 릴리즈',
    demoDescLead: '중독성 있는 멜로디와 강렬한 훅, 아티스트의 개성을 살리는 음악을 지향합니다.',
    demoDesc: '현재 공개된 데모 버전은 곡의 방향성과 분위기를 전달하기 위한 러프한 작업물이며, 정식 발매 시에는 세션 녹음과 고품질 사운드 프로덕션을 통해 더욱 디테일하고 완성도 높은 결과물로 업그레이드됩니다.',
    youtubeSectionDesc: 'Pearl Sounds 작가들이 참여한 곡들입니다.',
    soundcloudFeatured: {
      genre: 'Trot',
      title: 'Trot_하이라이트 모음',
      description: '미발매곡의 부분 편집본입니다.',
      soundcloudUrl: 'https://soundcloud.com/pearl_sounds/trot/s-BLw5PGboOUy',
      soundcloudTrackId: '2335388465'
    },
    soundcloudTracks: [
      {
        genre: 'Trot',
        title: '월척_Part1',
        description: '낚시에 비유한 사랑 노래 "월척"입니다. 완곡 데모가 필요하시면 요청해주세요.',
        soundcloudUrl: 'https://soundcloud.com/pearl_sounds/part1-1/s-ytoAJds8B5D',
        soundcloudTrackId: '2335388273'
      },
      {
        genre: 'Trot',
        title: '매화(ver_가요무대).mp3',
        description: '"매화"의 트로트 발라드 버전입니다.',
        soundcloudUrl: 'https://soundcloud.com/pearl_sounds/ver-mp3/s-uxwNCUAmr4g',
        soundcloudTrackId: '2335388126'
      },
      {
        genre: 'Trot',
        title: '매화(ver_polka)_Part1',
        description: '"매화"의 행사 공연용 폴카 버전입니다.',
        soundcloudUrl: 'https://soundcloud.com/pearl_sounds/ver_polka-part1/s-qyQldyZSX8s',
        soundcloudTrackId: '2335387973'
      },
      {
        genre: 'Trot',
        title: '참참참내_Part1',
        description: '입에 착착 감기는 후렴의 신나는 떼창 유도 트로트입니다.',
        soundcloudUrl: 'https://soundcloud.com/pearl_sounds/part1/s-hSEOyU4u0Lr',
        soundcloudTrackId: '2335387667'
      }
    ],
    youtubeVideos: [
      { title: '[MV] Seo Eun Gyo(서은교) - The Day I Find Myself(나를 찾는 날) (Always You)', videoId: '4NfUQHFVbhg' },
      { title: 'Della 丁噹 [ 命中注定 You Are My Destiny ] Official Music Video（戲劇《你是我的命中注定》片尾曲）', videoId: 'vVIPppbb3yU' },
      { title: '手嶌葵 - 風につつまれて（Official Video）', videoId: '63YMyqnhb0Q' },
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

function parseSoundCloudUrl(rawUrl) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { shareUrl: '', secretToken: '' };

  try {
    const url = new URL(trimmed);
    const secretMatch = url.pathname.match(/\/(s-[A-Za-z0-9]+)/);

    return {
      shareUrl: `${url.origin}${url.pathname}`,
      secretToken: secretMatch ? secretMatch[1] : ''
    };
  } catch {
    return { shareUrl: trimmed, secretToken: '' };
  }
}

function buildSoundCloudEmbed(rawUrl, trackId) {
  const { shareUrl, secretToken } = parseSoundCloudUrl(rawUrl);
  const trackUrl = trackId
    ? `https://api.soundcloud.com/tracks/${trackId}`
    : shareUrl;

  const params = new URLSearchParams({
    url: trackUrl,
    color: '#c4a35a',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'true'
  });

  if (secretToken) {
    params.set('secret_token', secretToken);
  }

  return `https://w.soundcloud.com/player/?${params.toString()}`;
}

function renderSoundCloudPlayer(track) {
  const hasUrl = track.soundcloudUrl && track.soundcloudUrl.trim() !== '';

  if (hasUrl) {
    return `<iframe
      class="portfolio-iframe"
      title="${track.title} 재생"
      scrolling="no"
      frameborder="no"
      allow="autoplay; encrypted-media"
      loading="lazy"
      src="${buildSoundCloudEmbed(track.soundcloudUrl, track.soundcloudTrackId)}"
    ></iframe>`;
  }

  return `<div class="portfolio-placeholder">
    SoundCloud 링크를 <code>portfolio.js</code>에 추가하면 바로 재생됩니다.
  </div>`;
}

function renderSoundCloudCard(track, layout) {
  const cardClass = layout === 'wide'
    ? 'portfolio-card portfolio-card--wide'
    : 'portfolio-card portfolio-card--compact';

  return `
    <article class="${cardClass}">
      <div class="portfolio-info">
        <span class="portfolio-tag">${track.genre}</span>
        <h3>${track.title}</h3>
        <p>${track.description}</p>
      </div>
      <div class="portfolio-player">${renderSoundCloudPlayer(track)}</div>
    </article>
  `;
}

function renderSoundCloudSection(featured, tracks) {
  const featuredSection = featured
    ? `<div class="soundcloud-featured">${renderSoundCloudCard(featured, 'wide')}</div>`
    : '';

  const gridSection = tracks && tracks.length > 0
    ? `
      <div class="soundcloud-grid">
        ${tracks.map((track) => renderSoundCloudCard(track, 'compact')).join('')}
      </div>
    `
    : '';

  if (!featuredSection && !gridSection) return '';

  return `
    <div class="soundcloud-sections">
      ${featuredSection}
      ${gridSection}
    </div>
  `;
}

function renderPortfolio() {
  const container = document.getElementById('portfolio-list');
  if (!container) return;

  container.innerHTML = portfolioTracks.map((track) => {
    const soundcloudSection = renderSoundCloudSection(track.soundcloudFeatured, track.soundcloudTracks);

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
            ${track.demoDescLead ? `<p class="portfolio-section-lead">${track.demoDescLead}</p>` : ''}
            ${track.demoDesc ? `<p class="portfolio-section-desc">${track.demoDesc}</p>` : ''}
          </div>
        ` : ''}
        ${soundcloudSection}
        ${youtubeSection}
      </div>
    `;
  }).join('');
}

renderPortfolio();
