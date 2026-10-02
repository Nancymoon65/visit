import { GuestbookEntry } from '../types';

export const INITIAL_MOCK_ENTRIES: GuestbookEntry[] = [
  {
    id: 'mock_1',
    name: '개발자 민우',
    message: '구글 시트 하나만으로 이렇게 빠르고 깔끔한 방명록이 완성되다니 신기하네요! 서버 없이 가볍게 운영하기 딱 좋습니다 🎉',
    tag: '응원·격려',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12 mins ago
    likes: 5,
  },
  {
    id: 'mock_2',
    name: '디자이너 수진',
    message: '새로운 프로젝트 오픈을 진심으로 축하드립니다! UI도 너무 아기자기하고 보기 편해요. 대박 나시길 응원합니다 ✨🍀',
    tag: '축하',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    likes: 8,
  },
  {
    id: 'mock_3',
    name: '초보 코더 지호',
    message: 'Apps Script 코드 가이드 덕분에 5분 만에 구글 시트랑 연결 성공했어요! 상세한 설명 감사합니다 ☕',
    tag: '감사',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    likes: 12,
  },
  {
    id: 'mock_4',
    name: '행복한 쿼카',
    message: '오늘 하루도 모두 고생 많으셨습니다. 내일도 힘내서 원하는 목표 꼭 이루시길 바랄게요! 화이팅 💪',
    tag: '자유',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    likes: 3,
  },
  {
    id: 'mock_5',
    name: '스타트업 지망생',
    message: '사이드 프로젝트 사전 랜딩페이지에 방문자 피드백 수집용으로 붙였는데 정말 유용합니다. 좋은 템플릿 공유해주셔서 고맙습니다!',
    tag: '응원·격려',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    likes: 9,
  }
];

export const CUTE_NICKNAMES = [
  '행복한 쿼카', '따뜻한 판다', '달리는 치타', '열정의 호랑이',
  '커피 마시는 부엉이', '노래하는 고양이', '꿈꾸는 고래', '웃는 수달',
  '빛나는 별빛', '친절한 토끼', '다정한 강아지', '바람 부는 숲'
];
