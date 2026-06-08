# 온라인 모드 추가 가이드

현재 V2는 UI/룰/미니게임 검증용 로컬 2인 프로토타입입니다.
두 휴대폰에서 실시간으로 하려면 아래 상태를 서버에 저장해야 합니다.

## 저장해야 하는 상태
- roomId
- players: p1/p2 접속 상태
- currentTurn
- marketCards
- each player's gems/cards/score/discounts
- currentDuel: cardId, gemType, miniGameId, p1InputScore, p2InputScore, status

## 추천: Firebase Realtime Database
비개발자에게는 Supabase보다 Firebase가 조금 더 쉽습니다.

흐름:
1. Firebase 프로젝트 생성
2. Realtime Database 생성
3. 웹앱 추가 후 firebaseConfig 복사
4. `src/firebase.js` 생성
5. 방 만들기: rooms/{roomId} 생성
6. 참가하기: rooms/{roomId}/players/p2 등록
7. 미니게임 시작: rooms/{roomId}/currentDuel 저장
8. 각 기기에서 자기 점수 저장
9. 두 점수가 모두 들어오면 host가 결과 계산

이 작업은 별도 구현이 필요합니다.
