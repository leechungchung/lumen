# Lumen Gem Duel V2 Prototype

React + Vite 모바일 웹 프로토타입입니다.

## 실행
```bash
npm install
npm run dev
```

## 배포
Vercel 설정:
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist

## 현재 포함
- 카드게임 느낌의 시장/핸드/카드 상세 UI
- 보석별 기준 가격과 순도 등급 분리
- 카드 구매 후 보석 순도 대결
- S등급 랜덤 각인
- 보석별 미니게임: 과열 세공, 무조준 골넣기, 색상 연쇄, 기억 카드, 줄다리기, 균형 유지, 박자 게임, 예언 투척
- 카드 효과를 사람이 읽기 쉬운 할인/명성 문구로 표시
- 온라인 모드 안내 화면

## 온라인화
현재 코드는 같은 화면에서 2인 테스트하는 프로토타입입니다. 실제 온라인은 Firebase/Supabase가 필요합니다. `ONLINE_GUIDE.md` 참고.
