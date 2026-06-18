const pitchTracks = [
  {
    num: '01',
    genre: 'Trot',
    title: '매화 (ver. Polka)',
    description: '허찬미님의 서사에 맞춰 제작한 맞춤 데모곡입니다.',
    audioSrc: '/audio/pitch-demo01-maehwa-polka.mp3'
  },
  {
    num: '02',
    genre: 'Trot',
    title: '월척',
    description: "잔잔한 잔챙이 인연은 스쳐 지나가고, 찐 사랑을 '월척'으로 빗대어 낚시 이야기로 풀어낸 곡",
    audioSrc: '/audio/pitch-demo02-wolchuk.mp3'
  },
  {
    num: '03',
    genre: 'Trot',
    title: '매화 (ver. Ballad)',
    description: '"매화"의 트로트 발라드 버전입니다. 다른 분위기로 들려드리기 위해 현재 1절까지 작업한 데모입니다.',
    audioSrc: '/audio/demo03-maehwa-ballad.mp3'
  }
];

renderPitchTracks(pitchTracks, 'pitch-track-list');
