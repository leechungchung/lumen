# Lumen Gem Duel Online

보석 엔진 빌딩과 실시간 순도 미니게임을 결합한 2인 모바일 웹게임 MVP입니다.

## 이번 버전

- 서로 다른 기기, 다른 IP에서 같은 방 코드로 접속 가능
- Firebase Realtime Database 기반 방 만들기 / 방 참가
- 플레이어 A/B 자동 배정
- 카드 시장, 보석, 명성, 턴, 카드 획득 결과 동기화
- 미니게임 입력 점수 동기화
- Vercel 정적 배포 유지

## GitHub 업로드 구조

GitHub 저장소에서 `index.html`이 있는 폴더가 Root Directory입니다.

```text
app.js
firebase-config.js
assets/jewel-atelier.png
index.html
manifest.webmanifest
README.md
styles.css
sw.js
vercel.json
```

## Firebase 설정

1. Firebase Console에서 새 프로젝트를 만듭니다.
2. Build > Realtime Database로 이동합니다.
3. 데이터베이스를 생성합니다. 테스트 단계에서는 규칙을 임시로 아래처럼 둘 수 있습니다.

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

4. Project settings > General > Your apps에서 Web app을 추가합니다.
5. Firebase가 보여주는 `firebaseConfig` 값을 `firebase-config.js`에 붙여넣습니다.
6. GitHub에 커밋하면 Vercel이 자동 배포합니다.

## Vercel 설정

이 프로젝트는 빌드 도구 없이 동작하는 정적 웹앱입니다.

- Framework Preset: Other
- Build Command: 비워두기
- Output Directory: `.`
- Root Directory: `index.html`이 들어있는 폴더

## 플레이 방법

1. 한 사람이 사이트에서 `온라인 방 만들기`를 누릅니다.
2. 화면 상단의 방 코드를 상대에게 보냅니다.
3. 상대는 같은 사이트에서 방 코드를 입력하고 `참가`를 누릅니다.
4. 세공사 A/B로 나뉘어 플레이합니다.
5. 자신의 턴에는 카드 구매/광맥 채굴을 할 수 있고, 상대 턴에는 방해자 역할을 합니다.

## 주의

이 버전은 온라인 테스트용 MVP입니다. 미니게임은 각 기기에서 버튼 입력 점수를 Firebase에 동기화하는 방식입니다. 상용 수준의 프레임 단위 물리 동기화나 부정 입력 검증은 아직 없습니다.
