import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, set, update, get, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const STORAGE_KEY = "lumen-gem-duel-state-v1";
const WIN_SCORE = 15;

const GEM_KEYS = ["ruby", "sapphire", "emerald", "topaz", "amethyst"];
const GEM = {
  ruby: { name: "루비", short: "루", fill: "#b9232d", soft: "rgba(231,91,91,.46)" },
  sapphire: { name: "사파이어", short: "사", fill: "#2367c9", soft: "rgba(88,163,255,.42)" },
  emerald: { name: "에메랄드", short: "에", fill: "#17845a", soft: "rgba(84,215,155,.38)" },
  topaz: { name: "토파즈", short: "토", fill: "#c78316", soft: "rgba(242,189,75,.44)" },
  amethyst: { name: "자수정", short: "자", fill: "#7d39b7", soft: "rgba(187,118,255,.42)" },
  stardust: { name: "별가루", short: "별", fill: "#e4dfc8", soft: "rgba(242,239,227,.34)" }
};

const GRADE_VALUE = { S: 4, A: 3, B: 2, C: 1, D: 0 };
const GRADE_CLASS = { S: "grade-s", A: "grade-a", B: "grade-b", C: "grade-c", D: "grade-d" };

const MINI_BY_COLOR = {
  ruby: "furnace",
  sapphire: "sequence",
  emerald: "tug",
  topaz: "ricochet",
  amethyst: "rhythm"
};

const MINI_LABEL = {
  furnace: "과열 광클",
  sequence: "색상 연쇄",
  tug: "공명 줄다리기",
  ricochet: "황금 리코셰",
  rhythm: "별빛 리듬"
};

const MINI_RULES = {
  furnace: {
    goal: "적정 온도 구간을 오래 유지해 순도를 높입니다.",
    owner: "열 올리기를 눌러 용광로 온도를 올리되, 초록 안정 구간을 넘기지 마세요.",
    rival: "흔들기로 온도를 요동치게 만들어 안정 구간 밖으로 밀어냅니다.",
    scoring: "세공자는 안정 구간 유지 시간과 마지막 온도 정확도로 점수를 얻고, 방해자는 과열과 이탈 시간으로 점수를 얻습니다."
  },
  sequence: {
    goal: "공개된 색 순서를 더 정확하고 빠르게 입력합니다.",
    owner: "세공 패널의 색 버튼을 왼쪽부터 순서대로 누르면 콤보가 쌓입니다.",
    rival: "견제 패널에서 같은 순서를 더 빠르게 처리해 상대 공명을 밀어냅니다.",
    scoring: "정답 수, 콤보, 오입력 페널티가 최종 점수로 합산됩니다."
  },
  tug: {
    goal: "중앙 코어의 공명을 두고 안정과 이탈을 겨룹니다.",
    owner: "당기기는 코어를 중앙으로 되돌립니다. 클릭 자체는 점수가 아니고, 중앙에 가까울수록 점수가 오릅니다.",
    rival: "밀어내기는 코어를 중앙에서 멀리 보냅니다. 멀리 벗어날수록 방해 점수가 오릅니다.",
    scoring: "세공자는 중앙 안정도, 방해자는 중심 이탈 거리와 이탈 유지 시간으로 점수를 얻습니다."
  },
  ricochet: {
    goal: "움직이는 황금핵을 반사각으로 맞힙니다.",
    owner: "쏘기를 눌러 현재 각도로 보석탄을 발사합니다. 벽 반사를 이용할 수 있습니다.",
    rival: "가드 이동으로 수비막과 바람을 바꿔 탄도를 흐트러뜨립니다.",
    scoring: "명중은 큰 점수, 수비막 차단은 방해 점수로 계산됩니다."
  },
  rhythm: {
    goal: "원형 트랙의 별빛 노트를 박자에 맞춰 탭합니다.",
    owner: "노트가 중심 링에 겹칠 때 박자를 누르면 Perfect/Great 판정이 납니다.",
    rival: "공명으로 같은 박자를 받아치며 상대 순도 리듬을 흔듭니다.",
    scoring: "Perfect, Great, 콤보, Miss가 최종 점수를 결정합니다."
  }
};

const CARD_LIBRARY = [
  { id: "ruby-hone", tier: 1, color: "ruby", name: "붉은 연마석", cost: { ruby: 2 }, prestige: 0 },
  { id: "ruby-bellows", tier: 1, color: "ruby", name: "용광로 풀무", cost: { ruby: 1, topaz: 1 }, prestige: 0 },
  { id: "sapphire-lens", tier: 1, color: "sapphire", name: "푸른 렌즈", cost: { sapphire: 2 }, prestige: 0 },
  { id: "sapphire-chart", tier: 1, color: "sapphire", name: "수정 별자리표", cost: { sapphire: 1, amethyst: 1 }, prestige: 0 },
  { id: "emerald-root", tier: 1, color: "emerald", name: "균형의 뿌리", cost: { emerald: 2 }, prestige: 0 },
  { id: "topaz-coin", tier: 1, color: "topaz", name: "황금 주화틀", cost: { topaz: 2 }, prestige: 0 },
  { id: "amethyst-tuner", tier: 1, color: "amethyst", name: "공명 조율기", cost: { amethyst: 2 }, prestige: 0 },
  { id: "ruby-crucible", tier: 2, color: "ruby", name: "이중 도가니", cost: { ruby: 4, emerald: 2 }, prestige: 1 },
  { id: "sapphire-mirror", tier: 2, color: "sapphire", name: "달빛 기억거울", cost: { sapphire: 4, amethyst: 2 }, prestige: 1 },
  { id: "emerald-bridge", tier: 2, color: "emerald", name: "생장 현수교", cost: { emerald: 4, ruby: 2 }, prestige: 1 },
  { id: "topaz-arc", tier: 2, color: "topaz", name: "태양 반사각", cost: { topaz: 4, sapphire: 2 }, prestige: 1 },
  { id: "amethyst-ring", tier: 2, color: "amethyst", name: "자정의 박자링", cost: { amethyst: 4, topaz: 2 }, prestige: 1 },
  { id: "ruby-royal", tier: 3, color: "ruby", name: "왕실 화염핵", cost: { ruby: 6, sapphire: 3, stardust: 1 }, prestige: 3 },
  { id: "sapphire-royal", tier: 3, color: "sapphire", name: "왕실 예지관", cost: { sapphire: 6, emerald: 3, stardust: 1 }, prestige: 3 },
  { id: "emerald-royal", tier: 3, color: "emerald", name: "왕실 생명정원", cost: { emerald: 6, amethyst: 3, stardust: 1 }, prestige: 3 },
  { id: "topaz-royal", tier: 3, color: "topaz", name: "왕실 황금관문", cost: { topaz: 6, ruby: 3, stardust: 1 }, prestige: 3 },
  { id: "amethyst-royal", tier: 3, color: "amethyst", name: "왕실 별의 현", cost: { amethyst: 6, topaz: 3, stardust: 1 }, prestige: 3 }
];

const COMMON_INSCRIPTIONS = [
  { id: "steady-hand", name: "안정된 손끝", kind: "mini", value: 5, text: "미니게임 점수 +5" },
  { id: "prism-cut", name: "프리즘 할인", kind: "discountAny", value: 1, text: "모든 구매 비용 -1" },
  { id: "royal-seal", name: "왕실 인증", kind: "prestige", value: 2, text: "명성 +2" },
  { id: "guard-light", name: "보호막", kind: "shield", value: 5, text: "상대 방해 점수 -5" },
  { id: "shard-master", name: "파편 장인", kind: "fragmentBoost", value: 1, text: "방해 보상 등급 +1" }
];

const COLOR_INSCRIPTIONS = {
  ruby: [
    { id: "ruby-heat", name: "불꽃 과열", kind: "game", game: "furnace", value: 9, text: "과열 광클 점수 +9" },
    { id: "ruby-heart", name: "용암 심장", kind: "discountColor", color: "ruby", value: 1, text: "루비 비용 -1" }
  ],
  sapphire: [
    { id: "sapphire-forecast", name: "수정 예측", kind: "game", game: "sequence", value: 9, text: "색상 연쇄 점수 +9" },
    { id: "sapphire-calm", name: "차가운 판단", kind: "shield", value: 7, text: "상대 방해 점수 -7" }
  ],
  emerald: [
    { id: "emerald-rooted", name: "뿌리내림", kind: "game", game: "tug", value: 9, text: "공명 줄다리기 점수 +9" },
    { id: "emerald-afterglow", name: "생명의 잔향", kind: "fragmentBoost", value: 1, text: "방해 보상 등급 +1" }
  ],
  topaz: [
    { id: "topaz-instinct", name: "황금 직감", kind: "game", game: "ricochet", value: 9, text: "황금 리코셰 점수 +9" },
    { id: "topaz-trade", name: "황금 거래", kind: "discountAny", value: 1, text: "모든 구매 비용 -1" }
  ],
  amethyst: [
    { id: "amethyst-beat", name: "별빛 박자", kind: "game", game: "rhythm", value: 9, text: "별빛 리듬 점수 +9" },
    { id: "amethyst-time", name: "시간 왜곡", kind: "mini", value: 5, text: "미니게임 점수 +5" }
  ]
};

const PATRONS = [
  {
    id: "purity-judge",
    name: "순도 감정가",
    reward: 4,
    text: "A등급 이상 3장",
    test: (player) => player.cards.filter((card) => ["S", "A"].includes(card.grade)).length >= 3
  },
  {
    id: "royal-crafter",
    name: "왕실 세공사",
    reward: 3,
    text: "루비 2장 + 사파이어 2장",
    test: (player) => countColor(player, "ruby") >= 2 && countColor(player, "sapphire") >= 2
  },
  {
    id: "starlight-collector",
    name: "별빛 수집가",
    reward: 5,
    text: "서로 다른 색 S등급 2장",
    test: (player) => new Set(player.cards.filter((card) => card.grade === "S").map((card) => card.color)).size >= 2
  },
  {
    id: "five-prism",
    name: "오색 프리즘",
    reward: 4,
    text: "보석 색상 5종 보유",
    test: (player) => GEM_KEYS.every((color) => countColor(player, color) >= 1)
  }
];

const app = document.querySelector("#app");
let state = null;
let online = { mode: "boot", firebaseReady: false, app: null, db: null, roomCode: "", playerId: "", playerIndex: -1, unsubscribe: null, suppress: false, lastWrite: 0 };

queueMicrotask(initEntry);


function initEntry() {
  initFirebase();
  const remembered = readRememberedSession();
  if (remembered && online.firebaseReady) {
    online.roomCode = remembered.roomCode;
    online.playerId = remembered.playerId;
    online.playerIndex = remembered.playerIndex;
    attachRoom(remembered.roomCode);
    return;
  }
  renderLobby();
}

function initFirebase() {
  try {
    const keys = Object.values(firebaseConfig || {});
    if (!firebaseConfig || keys.some((value) => !value || String(value).includes("YOUR_"))) {
      online.firebaseReady = false;
      return;
    }
    online.app = initializeApp(firebaseConfig);
    online.db = getDatabase(online.app);
    online.firebaseReady = true;
  } catch (error) {
    console.warn("Firebase init failed", error);
    online.firebaseReady = false;
  }
}

function renderLobby(message = "") {
  app.innerHTML = `
    <main class="lobby-screen">
      <section class="lobby-card">
        <div class="lobby-brand">
          <span class="tag">ONLINE DUEL</span>
          <h1>루멘 젬 듀얼</h1>
          <p>서로 다른 폰, 다른 IP에서 같은 방 코드로 접속해 플레이합니다.</p>
        </div>
        ${!online.firebaseReady ? `<div class="lobby-alert"><strong>Firebase 설정 필요</strong><span>firebase-config.js에 본인 Firebase 설정값을 넣어야 온라인 방이 열립니다. 아래 로컬 체험은 바로 가능합니다.</span></div>` : ""}
        ${message ? `<div class="lobby-alert">${escapeHtml(message)}</div>` : ""}
        <div class="lobby-actions">
          <button class="primary-btn" data-action="create-online" ${online.firebaseReady ? "" : "disabled"}>온라인 방 만들기</button>
          <div class="join-box">
            <input id="roomInput" maxlength="6" placeholder="방 코드 입력" />
            <button class="ghost-btn" data-action="join-online" ${online.firebaseReady ? "" : "disabled"}>참가</button>
          </div>
          <button class="ghost-btn" data-action="local-play">한 기기에서 로컬 체험</button>
        </div>
        <ul class="rule-list">
          <li>방장은 세공사 A, 참가자는 세공사 B가 됩니다.</li>
          <li>현재 턴, 시장 카드, 보석, 명성, 카드 획득 결과가 Firebase로 동기화됩니다.</li>
          <li>미니게임은 각자 화면에서 버튼을 누르며 진행합니다. 1차 온라인 버전이라 완전한 e스포츠급 동기화는 아니고, 플레이 테스트용입니다.</li>
        </ul>
      </section>
    </main>
  `;
}

function rememberSession() {
  localStorage.setItem("lumen-online-session", JSON.stringify({ roomCode: online.roomCode, playerId: online.playerId, playerIndex: online.playerIndex }));
}

function readRememberedSession() {
  try { return JSON.parse(localStorage.getItem("lumen-online-session")); } catch { return null; }
}

function clearRememberedSession() {
  localStorage.removeItem("lumen-online-session");
}

function roomPath(code) {
  return `rooms/${code}`;
}

async function createOnlineRoom() {
  if (!online.firebaseReady) return renderLobby("Firebase 설정이 아직 없습니다.");
  const code = makeRoomCode() + Math.floor(Math.random() * 10);
  const playerId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
  const game = createGame();
  game.roomCode = code;
  game.feed = [`방 ${code}가 열렸습니다. 상대가 참가하면 시작하세요.`];
  await set(ref(online.db, roomPath(code)), {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    players: { p1: { id: playerId, name: "세공사 A", connectedAt: serverTimestamp() } },
    game
  });
  online.roomCode = code;
  online.playerId = playerId;
  online.playerIndex = 0;
  rememberSession();
  attachRoom(code);
}

async function joinOnlineRoom() {
  if (!online.firebaseReady) return renderLobby("Firebase 설정이 아직 없습니다.");
  const input = document.querySelector("#roomInput");
  const code = String(input?.value || "").trim().toUpperCase();
  if (!code) return renderLobby("방 코드를 입력하세요.");
  const snap = await get(ref(online.db, roomPath(code)));
  if (!snap.exists()) return renderLobby(`방 ${code}를 찾지 못했습니다.`);
  const data = snap.val();
  const playerId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
  let index = 1;
  if (!data.players?.p1) index = 0;
  else if (!data.players?.p2) index = 1;
  else return renderLobby("이미 2명이 들어온 방입니다.");
  await update(ref(online.db, roomPath(code)), {
    [`players/p${index + 1}`]: { id: playerId, name: index === 0 ? "세공사 A" : "세공사 B", connectedAt: serverTimestamp() },
    updatedAt: serverTimestamp()
  });
  online.roomCode = code;
  online.playerId = playerId;
  online.playerIndex = index;
  rememberSession();
  attachRoom(code);
}

function attachRoom(code) {
  if (!online.firebaseReady) return renderLobby("Firebase 설정이 없습니다.");
  if (online.unsubscribe) online.unsubscribe();
  online.mode = "online";
  online.unsubscribe = onValue(ref(online.db, roomPath(code)), (snap) => {
    if (!snap.exists()) {
      clearRememberedSession();
      online.mode = "lobby";
      renderLobby("방이 삭제되었거나 찾을 수 없습니다.");
      return;
    }
    const data = snap.val();
    if (online.suppress) return;
    state = normalizeGame(data.game || createGame());
    state.roomCode = code;
    render();
  });
}

function normalizeGame(game) {
  if (!game || typeof game !== "object") return createGame();
  game.players = Array.isArray(game.players) ? game.players : [createPlayer("p1", "세공사 A"), createPlayer("p2", "세공사 B")];
  game.players.forEach((player, index) => {
    const fallback = createPlayer(index === 0 ? "p1" : "p2", index === 0 ? "세공사 A" : "세공사 B");
    player.id = player.id || fallback.id;
    player.name = player.name || fallback.name;
    player.prestige = Number(player.prestige || 0);
    player.gems = { ...fallback.gems, ...(player.gems || {}) };
    player.discounts = { ...fallback.discounts, ...(player.discounts || {}) };
    player.anyDiscount = Number(player.anyDiscount || 0);
    player.cards = Array.isArray(player.cards) ? player.cards : [];
    player.patrons = Array.isArray(player.patrons) ? player.patrons : [];
  });
  game.feed = Array.isArray(game.feed) ? game.feed : [];
  game.market = Array.isArray(game.market) ? game.market : [];
  game.decks = game.decks || makeDecks();
  game.mineOffer = game.mineOffer || makeMineOffer();
  return game;
}

function syncOnline() {
  if (!online.firebaseReady || online.mode !== "online" || !online.roomCode || !state) return;
  online.suppress = true;
  const copy = JSON.parse(JSON.stringify(state));
  set(ref(online.db, `${roomPath(online.roomCode)}/game`), copy)
    .then(() => update(ref(online.db, roomPath(online.roomCode)), { updatedAt: serverTimestamp() }))
    .finally(() => setTimeout(() => { online.suppress = false; }, 120));
}

function localPlay() {
  clearRememberedSession();
  online.mode = "local";
  state = loadGame() || createGame();
  render();
}

function myPlayerId() {
  if (online.mode !== "online") return null;
  return online.playerIndex === 0 ? "p1" : "p2";
}

function canControlTurn() {
  if (online.mode !== "online") return true;
  return currentPlayer().id === myPlayerId();
}

function canPressDuelRole(role) {
  if (online.mode !== "online" || !state?.duel) return true;
  const mine = myPlayerId();
  return role === "owner" ? state.duel.ownerId === mine : state.duel.rivalId === mine;
}

function canStartDuel() {
  if (online.mode !== "online" || !state?.duel) return true;
  return state.duel.ownerId === myPlayerId();
}

function canAdvanceResult() {
  if (online.mode !== "online") return true;
  return canControlTurn();
}

function canResetGame() {
  if (online.mode !== "online") return true;
  return online.playerIndex === 0;
}


document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-card-id], [data-duel-role], [data-seq-role]");
  if (!target) return;

  if (target.dataset.cardId) {
    if (!state || !canControlTurn()) return;
    state.selectedCardId = target.dataset.cardId;
    saveGame();
    render();
    return;
  }

  if (target.dataset.duelRole) {
    handleDuelInput(target.dataset.duelRole);
    return;
  }

  if (target.dataset.seqRole) {
    handleDuelInput(target.dataset.seqRole, target.dataset.seqColor);
    return;
  }

  const action = target.dataset.action;
  if (action === "create-online") createOnlineRoom();
  if (action === "join-online") joinOnlineRoom();
  if (action === "local-play") localPlay();
  if (action === "new-game") resetGame();
  if (action === "collect") collectGems();
  if (action === "buy") buySelectedCard();
  if (action === "start-duel") beginDuel();
  if (action === "continue-result") continueAfterResult();
});

document.addEventListener("keydown", (event) => {
  if (state.phase !== "duel") return;
  const duel = state.duel;
  if (duel.awaitingStart) return;
  const code = event.code;
  if (duel.game === "sequence") {
    const ownerKeys = { KeyQ: "ruby", KeyW: "sapphire", KeyE: "topaz" };
    const rivalKeys = { KeyI: "ruby", KeyO: "sapphire", KeyP: "topaz" };
    if (ownerKeys[code]) handleDuelInput("owner", ownerKeys[code]);
    if (rivalKeys[code]) handleDuelInput("rival", rivalKeys[code]);
    return;
  }
  if (["Space", "KeyA", "KeyZ"].includes(code)) {
    event.preventDefault();
    handleDuelInput("owner");
  }
  if (["Enter", "KeyL", "Slash"].includes(code)) {
    event.preventDefault();
    handleDuelInput("rival");
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

function createGame() {
  const decks = makeDecks();
  const market = [1, 2, 3].flatMap((tier) => drawCards(decks, tier, 4));
  const firstSelected = market[0]?.uid || null;
  return {
    phase: "board",
    roomCode: makeRoomCode(),
    turn: 0,
    selectedCardId: firstSelected,
    decks,
    market,
    mineOffer: makeMineOffer(),
    players: [createPlayer("p1", "세공사 A"), createPlayer("p2", "세공사 B")],
    feed: ["오색 원석이 세공대에 놓였습니다."],
    pendingResult: null,
    winnerId: null
  };
}

function makeMineOffer() {
  const colors = shuffle([...GEM_KEYS]).slice(0, 3);
  return {
    colors,
    stardust: Math.random() < 0.22
  };
}

function createPlayer(id, name) {
  return {
    id,
    name,
    prestige: 0,
    gems: { ruby: 2, sapphire: 2, emerald: 2, topaz: 2, amethyst: 2, stardust: 0 },
    discounts: { ruby: 0, sapphire: 0, emerald: 0, topaz: 0, amethyst: 0 },
    anyDiscount: 0,
    cards: [],
    patrons: []
  };
}

function makeDecks() {
  return {
    1: shuffle(CARD_LIBRARY.filter((card) => card.tier === 1)).map(toMarketCard),
    2: shuffle(CARD_LIBRARY.filter((card) => card.tier === 2)).map(toMarketCard),
    3: shuffle(CARD_LIBRARY.filter((card) => card.tier === 3)).map(toMarketCard)
  };
}

function toMarketCard(card) {
  return { ...card, uid: `${card.id}-${Math.random().toString(36).slice(2, 8)}` };
}

function drawCards(decks, tier, count) {
  const drawn = [];
  while (drawn.length < count && decks[tier].length) drawn.push(decks[tier].shift());
  return drawn;
}

function render() {
  const current = currentPlayer();
  const rival = rivalPlayer();
  const selected = selectedCard();

  app.innerHTML = `
    <main class="game-grid">
      <header class="top-bar">
        <div class="brand">
          <h1 class="brand-title">루멘 젬 듀얼</h1>
        </div>
        <div class="top-meta">
          <span class="room-pill">방 ${state.roomCode}${online.mode === "online" ? " · 온라인" : ""}</span>
          <span class="turn-pill">${current.name} 차례</span>
          <span class="score-pill">목표 명성 ${WIN_SCORE}</span>
        </div>
        <div class="top-actions">
          <button class="icon-btn" type="button" data-action="new-game" aria-label="새 게임" ${canResetGame() ? "" : "disabled"}>↻</button>
        </div>
      </header>

      ${state.winnerId ? winnerHtml() : ""}
      <section class="player-strip">
        ${playerHtml(state.players[0], current.id === state.players[0].id)}
        ${playerHtml(state.players[1], current.id === state.players[1].id)}
      </section>

      <section class="main-layout">
        <div class="market-zone">
          <div class="zone-head">
            <h2>세공 시장</h2>
            <button class="mini-btn" type="button" data-action="collect" ${state.winnerId || !canControlTurn() ? "disabled" : ""}>광맥 채굴</button>
          </div>
          ${marketHtml(current)}
        </div>

        <aside class="side-zone">
          <div class="zone-head">
            <h2>선택한 카드</h2>
          </div>
          ${selected ? selectedCardHtml(selected, current) : `<p class="empty-state">시장 카드를 선택하세요.</p>`}
          ${mineHtml(current)}
          <div class="two-column">
            ${patronHtml()}
            ${ownedHtml(current, rival)}
          </div>
          ${feedHtml()}
        </aside>
      </section>
    </main>
    ${state.phase === "duel" ? duelHtml(state.duel) : ""}
    ${state.phase === "result" && state.pendingResult ? resultHtml(state.pendingResult) : ""}
  `;

  if (state.phase === "duel") startDuelLoop();
}

function playerHtml(player, active) {
  return `
    <article class="player-card ${active ? "is-active" : ""}">
      <div>
        <div class="player-name">
          <strong>${escapeHtml(player.name)}</strong>
          ${active ? `<span class="tag">현재 차례</span>` : `<span class="tag">방해자</span>`}
        </div>
        <div class="gem-row">${Object.entries(player.gems).map(([color, value]) => gemChip(color, value)).join("")}</div>
        <div class="discount-row" aria-label="할인">
          ${GEM_KEYS.map((color) => discountChip(color, player.discounts[color])).join("")}
          ${player.anyDiscount ? `<span class="discount-chip">전체 -${player.anyDiscount}</span>` : ""}
        </div>
      </div>
      <div class="prestige">${player.prestige}<span>명성</span></div>
    </article>
  `;
}

function marketHtml(player) {
  return `
    <div class="market-lanes">
      ${[3, 2, 1]
        .map((tier) => {
          const cards = state.market.filter((card) => card.tier === tier);
          return `
            <section class="tier-lane">
              <div class="tier-head"><span>${tier}단계</span><span>${tier === 3 ? "고명성" : tier === 2 ? "콤보" : "엔진"}</span></div>
              <div class="card-row">
                ${cards.map((card) => marketCardHtml(card, player)).join("")}
              </div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function marketCardHtml(card, player) {
  const affordable = canAfford(player, card);
  return `
    <button
      type="button"
      class="market-card gem-${card.color} ${card.uid === state.selectedCardId ? "is-selected" : ""} ${affordable ? "is-affordable" : ""}"
      data-card-id="${card.uid}"
      style="${gemStyle(card.color)}"
    >
      <span class="card-art" aria-hidden="true"></span>
      <span class="card-body">
        <span class="card-title-line">
          <strong class="card-name">${escapeHtml(card.name)}</strong>
          <span class="buy-state">${affordable ? "가능" : "부족"}</span>
        </span>
        <span class="card-meta">
          <span>${GEM[card.color].name}</span>
          <span>명성 ${card.prestige}</span>
          <span>${MINI_LABEL[MINI_BY_COLOR[card.color]]}</span>
        </span>
        <span class="cost-row">${costHtml(card, player)}</span>
      </span>
    </button>
  `;
}

function selectedCardHtml(card, player) {
  const affordable = canAfford(player, card);
  const rules = MINI_RULES[MINI_BY_COLOR[card.color]];
  return `
    <section class="selected-card gem-${card.color}" style="${gemStyle(card.color)}">
      <div class="card-art" aria-hidden="true"></div>
      <div class="selected-title">
        <h3>${escapeHtml(card.name)}</h3>
        <span class="grade-chip">T${card.tier}</span>
      </div>
      <div class="cost-row">${costHtml(card, player)}</div>
      <ul class="effect-list">
        <li>S: ${GEM[card.color].name} 할인 +2, 명성 +1, 랜덤 각인</li>
        <li>A: 할인 +1, 명성 +1 · B: 할인 +1 · C: 명성 +1</li>
        <li>미니게임: ${MINI_LABEL[MINI_BY_COLOR[card.color]]} · ${rules.goal}</li>
      </ul>
      <button class="primary-btn" type="button" data-action="buy" ${affordable && !state.winnerId && canControlTurn() ? "" : "disabled"}>
        세공 시작
      </button>
    </section>
  `;
}

function mineHtml(player) {
  const offer = state.mineOffer || makeMineOffer();
  state.mineOffer = offer;
  const gain = offer.colors
    .map((color, index) => ({ color, value: index === 0 ? 2 : 1 }))
    .map(({ color, value }) => `<span class="gem-chip" style="${gemStyle(color)}">${value}</span>`)
    .join("");
  return `
    <section class="mine-panel">
      <div class="zone-head">
        <h3>이번 광맥</h3>
        <span class="tag">턴 행동</span>
      </div>
      <div class="mine-gems">${gain}${offer.stardust ? gemChip("stardust", 1) : ""}</div>
      <p class="mine-principle">
        광맥 채굴을 선택하면 공개된 광맥을 가져오고 턴이 넘어갑니다. 첫 색은 2개, 나머지 두 색은 1개이며 별가루 광맥은 낮은 확률로 함께 열립니다.
      </p>
      <button class="ghost-btn" type="button" data-action="collect" ${state.winnerId || !canControlTurn() ? "disabled" : ""}>광맥 채굴</button>
    </section>
  `;
}

function patronHtml() {
  return `
    <section class="selected-card">
      <div class="zone-head"><h3>후원자</h3></div>
      <ul class="patron-list">
        ${PATRONS.map((patron) => {
          const claimedBy = state.players.find((player) => (player.patrons || []).includes(patron.id));
          return `
            <li class="patron-item ${claimedBy ? "is-claimed" : ""}">
              <strong>${patron.name} · +${patron.reward}</strong>
              <span>${patron.text}</span>
              ${claimedBy ? `<span>${claimedBy.name} 획득</span>` : ""}
            </li>
          `;
        }).join("")}
      </ul>
    </section>
  `;
}

function ownedHtml(current, rival) {
  const cards = [...current.cards].slice(-5).reverse();
  return `
    <section class="selected-card">
      <div class="zone-head"><h3>${current.name} 카드</h3></div>
      ${
        cards.length
          ? `<ul class="owned-list">${cards.map(ownedCardHtml).join("")}</ul>`
          : `<p class="empty-state">아직 완성한 카드가 없습니다.</p>`
      }
      <div class="zone-head"><h3>${rival.name} 최근</h3></div>
      ${
        rival.cards.length
          ? `<ul class="owned-list">${rival.cards.slice(-2).reverse().map(ownedCardHtml).join("")}</ul>`
          : `<p class="empty-state">상대 카드가 없습니다.</p>`
      }
    </section>
  `;
}

function ownedCardHtml(card) {
  return `
    <li class="owned-card gem-${card.color}" style="${gemStyle(card.color)}">
      <strong>${escapeHtml(card.name)}</strong>
      <span class="grade-chip ${GRADE_CLASS[card.grade]}">${card.grade}</span>
      ${card.inscription ? `<span class="tag">${card.inscription.name}</span>` : ""}
    </li>
  `;
}

function feedHtml() {
  return `
    <section class="selected-card">
      <div class="zone-head"><h3>세공 기록</h3></div>
      <ul class="feed-list">${state.feed.slice(-6).reverse().map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function winnerHtml() {
  const winner = state.players.find((player) => player.id === state.winnerId);
  return `
    <section class="winner-banner">
      <h2>${winner.name} 승리</h2>
      <span>명성 ${winner.prestige}점으로 왕실 세공 계약을 완성했습니다.</span>
    </section>
  `;
}

function duelHtml(duel) {
  const owner = state.players.find((player) => player.id === duel.ownerId);
  const rival = state.players.find((player) => player.id === duel.rivalId);
  const rules = MINI_RULES[duel.game];
  return `
    <div class="duel-overlay">
      <section class="duel-shell gem-${duel.card.color}" style="${gemStyle(duel.card.color)}">
        <header class="duel-head">
          <div class="duel-title-row">
            <h2>${MINI_LABEL[duel.game]} · ${escapeHtml(duel.card.name)}</h2>
            <span class="tag">${GEM[duel.card.color].name}</span>
          </div>
          <div class="duel-scoreboard">
            <div class="duel-score"><strong>${owner.name}</strong><span id="ownerScore">0</span></div>
            <div class="timer-ring" id="timerRing" style="--timer: 0%">${duel.duration.toFixed(1)}</div>
            <div class="duel-score"><strong>${rival.name}</strong><span id="rivalScore">0</span></div>
          </div>
        </header>
        ${
          duel.awaitingStart
            ? duelBriefHtml(duel, owner, rival, rules)
            : `
              <div class="duel-stage">
                <canvas class="duel-canvas" id="duelCanvas"></canvas>
                ${duel.game === "sequence" ? sequenceControlsHtml() : ""}
              </div>
              <footer class="duel-controls">
                ${
                  duel.game === "sequence"
                    ? `<button class="tap-btn owner" type="button" data-duel-role="owner" ${canPressDuelRole("owner") ? "" : "disabled"}>세공 콤보</button><button class="tap-btn rival" type="button" data-duel-role="rival" ${canPressDuelRole("rival") ? "" : "disabled"}>견제 콤보</button>`
                    : `<button class="tap-btn owner" type="button" data-duel-role="owner" ${canPressDuelRole("owner") ? "" : "disabled"}>${duel.ownerButton}</button><button class="tap-btn rival" type="button" data-duel-role="rival" ${canPressDuelRole("rival") ? "" : "disabled"}>${duel.rivalButton}</button>`
                }
              </footer>
            `
        }
      </section>
    </div>
  `;
}

function duelBriefHtml(duel, owner, rival, rules) {
  return `
    <div class="duel-brief">
      <div class="brief-art" aria-hidden="true"></div>
      <section class="brief-copy">
        <span class="tag">${GEM[duel.card.color].name} 순도 대결</span>
        <h3>${rules.goal}</h3>
        <ul class="rule-list">
          <li><strong>${owner.name}</strong> ${rules.owner}</li>
          <li><strong>${rival.name}</strong> ${rules.rival}</li>
          <li>${rules.scoring}</li>
        </ul>
      </section>
      <button class="primary-btn" type="button" data-action="start-duel" ${canStartDuel() ? "" : "disabled"}>${canStartDuel() ? "대결 시작" : "세공자 시작 대기"}</button>
    </div>
    <footer class="duel-controls is-brief">
      <span class="tap-btn owner">${duel.game === "sequence" ? "세공 입력" : duel.ownerButton}</span>
      <span class="tap-btn rival">${duel.game === "sequence" ? "견제 입력" : duel.rivalButton}</span>
    </footer>
  `;
}

function sequenceControlsHtml() {
  const buttons = ["ruby", "sapphire", "topaz"];
  return `
    <div class="sequence-board">
      ${["owner", "rival"]
        .map(
          (role) => `
            <div class="sequence-panel">
              <strong>${role === "owner" ? "세공" : "견제"}</strong>
              <div class="sequence-buttons">
                ${buttons
                  .map(
                    (color) => `
                    <button
                      class="sequence-btn"
                      type="button"
                      data-seq-role="${role}"
                      data-seq-color="${color}"
                      ${canPressDuelRole(role) ? "" : "disabled"}
                      style="--seq-color:${GEM[color].fill}"
                      aria-label="${GEM[color].name}"
                    ></button>
                  `
                  )
                  .join("")}
              </div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function resultHtml(result) {
  return `
    <section class="result-sheet">
      <h2>${result.grade}등급 세공</h2>
      <div class="result-row">
        <div class="result-stat"><strong>${result.ownerName}</strong><span>${result.ownerScore}</span></div>
        <span class="grade-chip ${GRADE_CLASS[result.grade]}">${result.grade}</span>
        <div class="result-stat"><strong>${result.rivalName}</strong><span>${result.rivalScore}</span></div>
      </div>
      <p>${escapeHtml(result.summary)}</p>
      ${result.inscription ? `<p><strong>각인:</strong> ${result.inscription.name} · ${result.inscription.text}</p>` : ""}
      <button class="primary-btn" type="button" data-action="continue-result" ${canAdvanceResult() ? "" : "disabled"}>${canAdvanceResult() ? "보드로 돌아가기" : "상대 진행 대기"}</button>
    </section>
  `;
}

function collectGems() {
  if (!state || state.winnerId || state.phase !== "board" || !canControlTurn()) return;
  const player = currentPlayer();
  const offer = state.mineOffer || makeMineOffer();
  const gainText = offer.colors
    .map((color, index) => {
      const gain = index === 0 ? 2 : 1;
      player.gems[color] += gain;
      return `${GEM[color].name}+${gain}`;
    })
    .join(", ");
  if (offer.stardust) {
    player.gems.stardust += 1;
    pushFeed(`${player.name} 광맥 채굴: ${gainText}, 별가루+1`);
  } else {
    pushFeed(`${player.name} 광맥 채굴: ${gainText}`);
  }
  state.mineOffer = makeMineOffer();
  advanceTurn();
  saveGame();
  render();
}

function buySelectedCard() {
  if (!state || state.winnerId || state.phase !== "board" || !canControlTurn()) return;
  const card = selectedCard();
  const player = currentPlayer();
  if (!card || !canAfford(player, card)) return;
  payCost(player, card);
  startDuel(card);
}

function startDuel(card) {
  const game = MINI_BY_COLOR[card.color];
  state.phase = "duel";
  state.duel = {
    game,
    card,
    ownerId: currentPlayer().id,
    rivalId: rivalPlayer().id,
    ownerButton: ownerButtonLabel(game),
    rivalButton: rivalButtonLabel(game),
    duration: game === "sequence" ? 8.2 : game === "rhythm" ? 7.8 : 7.0,
    awaitingStart: true,
    startedAt: 0,
    lastAt: 0,
    ownerScore: 0,
    rivalScore: 0,
    raf: null,
    meta: setupMiniGame(game)
  };
  saveGame();
  render();
}

function beginDuel() {
  if (state.phase !== "duel" || !state.duel || !state.duel.awaitingStart) return;
  if (!canStartDuel()) return;
  state.duel.awaitingStart = false;
  state.duel.loopStarted = false;
  saveGame();
  render();
}

function setupMiniGame(game) {
  if (game === "furnace") return { heat: 0.48, velocity: 0, stable: 0, overheat: 0, combo: 0, shock: 0 };
  if (game === "sequence") {
    const keys = ["ruby", "sapphire", "topaz"];
    return {
      seq: Array.from({ length: 18 }, () => keys[Math.floor(Math.random() * keys.length)]),
      ownerIndex: 0,
      rivalIndex: 0,
      ownerCombo: 0,
      rivalCombo: 0,
      ownerMiss: 0,
      rivalMiss: 0
    };
  }
  if (game === "tug") {
    const start = Math.random() > 0.5 ? 0.26 : -0.26;
    return {
      pos: start,
      velocity: 0,
      phase: 0,
      ownerHit: 0,
      rivalHit: 0,
      ownerBad: 0,
      rivalBad: 0,
      centerTime: 0,
      awayTime: 0,
      maxDistance: Math.abs(start),
      lastOutDir: start >= 0 ? 1 : -1
    };
  }
  if (game === "ricochet") return { aim: -0.6, aimDir: 1, wind: 0, guard: 0.5, shots: [], hit: 0, blocked: 0 };
  return {
    notes: [0.85, 1.32, 1.8, 2.2, 2.72, 3.1, 3.58, 4.02, 4.52, 4.93, 5.37, 5.85, 6.3, 6.82],
    ownerHits: {},
    rivalHits: {},
    ownerCombo: 0,
    rivalCombo: 0,
    ownerMiss: 0,
    rivalMiss: 0
  };
}

function startDuelLoop() {
  const duel = state.duel;
  if (!duel || duel.awaitingStart || duel.loopStarted) return;
  duel.loopStarted = true;
  duel.startedAt = performance.now();
  duel.lastAt = duel.startedAt;
  duel.raf = setTimeout(() => duelFrame(performance.now()), 16);
}

function duelFrame(now) {
  if (state.phase !== "duel" || !state.duel) return;
  const duel = state.duel;
  const dt = Math.min(0.05, (now - duel.lastAt) / 1000);
  duel.lastAt = now;
  const elapsed = (now - duel.startedAt) / 1000;
  updateMiniGame(duel, dt, elapsed);
  drawMiniGame(duel, elapsed);
  updateDuelHud(duel, elapsed);

  if (elapsed >= duel.duration) {
    finishDuel();
    return;
  }
  duel.raf = setTimeout(() => duelFrame(performance.now()), 16);
}

function handleDuelInput(role, payload) {
  if (!state || state.phase !== "duel" || !state.duel) return;
  if (!canPressDuelRole(role)) return;
  const duel = state.duel;
  if (duel.awaitingStart) return;
  const meta = duel.meta;
  if (duel.game === "furnace") {
    if (role === "owner") {
      meta.velocity += 0.44;
      duel.ownerScore += meta.heat > 0.5 && meta.heat < 0.75 ? 2.4 : 1.1;
    } else {
      meta.velocity += Math.random() > 0.5 ? 0.34 : -0.2;
      meta.shock = 0.18;
      duel.rivalScore += 1.8;
    }
  }
  if (duel.game === "sequence") handleSequenceInput(duel, role, payload);
  if (duel.game === "tug") {
    const good = Math.sin(meta.phase) > 0.28;
    const power = good ? 0.48 : 0.16;
    if (role === "owner") {
      meta.velocity += -meta.pos * power * 1.9;
      meta.velocity *= good ? 0.7 : 0.84;
      good ? meta.ownerHit++ : meta.ownerBad++;
    } else {
      const dir = Math.abs(meta.pos) < 0.08 ? meta.lastOutDir : Math.sign(meta.pos);
      meta.lastOutDir = dir || meta.lastOutDir;
      meta.velocity += meta.lastOutDir * power;
      good ? meta.rivalHit++ : meta.rivalBad++;
    }
  }
  if (duel.game === "ricochet") {
    if (role === "owner") {
      meta.shots.push({
        x: 0.5,
        y: 0.92,
        vx: meta.aim * 0.95,
        vy: -1.28,
        life: 0
      });
      duel.ownerScore += 2;
    } else {
      meta.guard = clamp(meta.guard + (Math.random() > 0.5 ? 0.16 : -0.16), 0.16, 0.84);
      meta.wind += (Math.random() > 0.5 ? 1 : -1) * 0.06;
      duel.rivalScore += 2.2;
    }
  }
  if (duel.game === "rhythm") handleRhythmInput(duel, role);
  if (online.mode === "online" && performance.now() - online.lastWrite > 280) { online.lastWrite = performance.now(); syncOnline(); }
}

function handleSequenceInput(duel, role, color) {
  if (!color) return;
  const meta = duel.meta;
  const indexKey = role === "owner" ? "ownerIndex" : "rivalIndex";
  const comboKey = role === "owner" ? "ownerCombo" : "rivalCombo";
  const missKey = role === "owner" ? "ownerMiss" : "rivalMiss";
  const scoreKey = role === "owner" ? "ownerScore" : "rivalScore";
  const expected = meta.seq[meta[indexKey] % meta.seq.length];
  if (color === expected) {
    meta[indexKey]++;
    meta[comboKey]++;
    duel[scoreKey] += 7 + Math.min(8, meta[comboKey] * 0.8);
  } else {
    meta[comboKey] = 0;
    meta[missKey]++;
    duel[scoreKey] = Math.max(0, duel[scoreKey] - 3);
  }
}

function handleRhythmInput(duel, role) {
  const meta = duel.meta;
  const elapsed = (performance.now() - duel.startedAt) / 1000;
  const hitMap = role === "owner" ? meta.ownerHits : meta.rivalHits;
  const comboKey = role === "owner" ? "ownerCombo" : "rivalCombo";
  const missKey = role === "owner" ? "ownerMiss" : "rivalMiss";
  const scoreKey = role === "owner" ? "ownerScore" : "rivalScore";
  let bestIndex = -1;
  let bestDelta = 999;
  meta.notes.forEach((time, index) => {
    if (hitMap[index]) return;
    const delta = Math.abs(time - elapsed);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  });
  if (bestDelta <= 0.11) {
    hitMap[bestIndex] = "perfect";
    meta[comboKey]++;
    duel[scoreKey] += 12 + Math.min(9, meta[comboKey]);
  } else if (bestDelta <= 0.22) {
    hitMap[bestIndex] = "great";
    meta[comboKey]++;
    duel[scoreKey] += 7 + Math.min(6, meta[comboKey] * 0.5);
  } else {
    meta[comboKey] = 0;
    meta[missKey]++;
    duel[scoreKey] = Math.max(0, duel[scoreKey] - 2.5);
  }
}

function updateMiniGame(duel, dt, elapsed) {
  const meta = duel.meta;
  if (duel.game === "furnace") {
    meta.velocity -= 0.26 * dt;
    meta.velocity *= 0.9;
    meta.heat += meta.velocity * dt;
    meta.heat -= 0.055 * dt;
    meta.heat = clamp(meta.heat, 0.05, 1.05);
    meta.shock = Math.max(0, meta.shock - dt);
    if (meta.heat > 0.52 && meta.heat < 0.74) {
      meta.stable += dt;
      meta.combo += dt;
      duel.ownerScore += (12 + Math.min(10, meta.combo * 1.4)) * dt;
    } else {
      meta.combo = 0;
      duel.rivalScore += 4.8 * dt;
    }
    if (meta.heat > 0.88 || meta.heat < 0.18) {
      meta.overheat += dt;
      duel.rivalScore += 12 * dt;
    }
  }
  if (duel.game === "sequence") {
    duel.ownerScore += meta.ownerCombo * 0.018;
    duel.rivalScore += meta.rivalCombo * 0.018;
  }
  if (duel.game === "tug") {
    meta.phase += dt * 5.3;
    const drift = Math.sin(elapsed * 1.7) * 0.28 + Math.sin(elapsed * 3.8) * 0.09;
    meta.velocity += drift * dt;
    meta.velocity += -meta.pos * 0.34 * dt;
    meta.velocity *= 0.955;
    meta.pos = clamp(meta.pos + meta.velocity * dt, -1, 1);
    const distance = Math.abs(meta.pos);
    const closeness = clamp(1 - distance / 0.72, 0, 1);
    meta.maxDistance = Math.max(meta.maxDistance, distance);
    if (distance < 0.18) meta.centerTime += dt;
    if (distance > 0.52) meta.awayTime += dt;
    duel.ownerScore += (4 + Math.pow(closeness, 1.55) * 13) * dt;
    duel.rivalScore += (Math.pow(distance, 1.25) * 19 + (distance > 0.52 ? 5 : 0)) * dt;
  }
  if (duel.game === "ricochet") {
    meta.aim += meta.aimDir * dt * 1.1;
    if (meta.aim > 0.78 || meta.aim < -0.78) meta.aimDir *= -1;
    meta.wind *= 0.985;
    meta.guard = clamp(meta.guard + Math.sin(elapsed * 1.9) * dt * 0.12, 0.16, 0.84);
    const target = movingTarget(elapsed);
    meta.shots.forEach((shot) => {
      shot.life += dt;
      shot.vx += meta.wind * dt;
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.vy += 0.92 * dt;
      if (shot.x < 0.05 || shot.x > 0.95) shot.vx *= -0.82;
      shot.x = clamp(shot.x, 0.05, 0.95);
      const dx = shot.x - target.x;
      const dy = shot.y - target.y;
      const guardHit = Math.abs(shot.x - meta.guard) < 0.11 && shot.y > 0.44 && shot.y < 0.58;
      if (Math.hypot(dx, dy) < 0.08) {
        shot.done = true;
        meta.hit++;
        duel.ownerScore += 26;
      }
      if (guardHit) {
        shot.done = true;
        meta.blocked++;
        duel.rivalScore += 9;
      }
      if (shot.y > 1.05 || shot.life > 3.4) shot.done = true;
    });
    meta.shots = meta.shots.filter((shot) => !shot.done);
  }
  if (duel.game === "rhythm") {
    const passed = meta.notes.filter((time, index) => elapsed - time > 0.28 && !meta.ownerHits[index]).length;
    duel.rivalScore += passed * 0.003;
  }
}

function finishDuel() {
  if (online.mode === "online" && state?.duel && state.duel.ownerId !== myPlayerId()) return;
  const duel = state.duel;
  if (!duel) return;
  clearTimeout(duel.raf);
  cancelAnimationFrame(duel.raf);
  finalizeMiniScores(duel);

  const owner = state.players.find((player) => player.id === duel.ownerId);
  const rival = state.players.find((player) => player.id === duel.rivalId);
  const ownerBonus = miniBonus(owner, duel.card.color, duel.game);
  const rivalBonus = sabotageBonus(rival, duel.card.color, duel.game);
  const shield = shieldBonus(owner);
  const ownerScore = Math.max(0, Math.round(duel.ownerScore + ownerBonus));
  const rivalScore = Math.max(0, Math.round(duel.rivalScore + rivalBonus - shield));
  const diff = ownerScore - rivalScore;
  const resultGrade = gradeFromDiff(diff);
  const rewardGrade = rivalRewardFromDiff(diff, rival);
  const inscription = addCardToPlayer(owner, duel.card, resultGrade);
  addFragmentReward(rival, duel.card.color, rewardGrade);
  removeAndRefillCard(duel.card);
  checkPatrons(owner);
  checkPatrons(rival);
  checkWinner();

  const summary = `${owner.name}은 ${GEM[duel.card.color].name} ${resultGrade}등급 카드를 완성했고, ${rival.name}은 ${GEM[duel.card.color].name} ${rewardGrade} 파편을 챙겼습니다.`;
  pushFeed(summary);

  state.phase = "result";
  state.pendingResult = {
    ownerName: owner.name,
    rivalName: rival.name,
    ownerScore,
    rivalScore,
    grade: resultGrade,
    rewardGrade,
    inscription,
    summary
  };
  state.duel = null;
  saveGame();
  render();
}

function finalizeMiniScores(duel) {
  const meta = duel.meta;
  if (duel.game === "furnace") {
    duel.ownerScore += meta.stable * 8 + Math.max(0, 18 - Math.abs(meta.heat - 0.64) * 60);
    duel.rivalScore += meta.overheat * 10;
  }
  if (duel.game === "tug") {
    const finalDistance = Math.abs(meta.pos);
    duel.ownerScore += meta.centerTime * 8 + Math.max(0, 24 - finalDistance * 30);
    duel.rivalScore += meta.awayTime * 10 + meta.maxDistance * 28;
  }
  if (duel.game === "sequence") {
    duel.ownerScore += meta.ownerIndex * 2 + meta.ownerCombo * 1.6 - meta.ownerMiss * 2;
    duel.rivalScore += meta.rivalIndex * 2 + meta.rivalCombo * 1.6 - meta.rivalMiss * 2;
  }
  if (duel.game === "ricochet") {
    duel.ownerScore += meta.hit * 10;
    duel.rivalScore += meta.blocked * 5;
  }
  if (duel.game === "rhythm") {
    duel.ownerScore += meta.ownerCombo * 1.8 - meta.ownerMiss * 2;
    duel.rivalScore += meta.rivalCombo * 1.8 - meta.rivalMiss * 2;
  }
}

function continueAfterResult() {
  if (state.phase !== "result") return;
  if (!canAdvanceResult()) return;
  state.pendingResult = null;
  state.phase = "board";
  if (!state.winnerId) advanceTurn();
  saveGame();
  render();
}

function addCardToPlayer(player, card, grade) {
  const gradeEffect = effectForGrade(grade);
  let inscription = null;
  if (grade === "S") inscription = drawInscription(card.color, player);
  const owned = {
    ...card,
    grade,
    inscription,
    completedAt: Date.now()
  };
  player.cards.push(owned);
  player.discounts[card.color] += gradeEffect.discount;
  player.prestige += card.prestige + gradeEffect.prestige;
  if (inscription?.kind === "prestige") player.prestige += inscription.value;
  if (inscription?.kind === "discountAny") player.anyDiscount += inscription.value;
  if (inscription?.kind === "discountColor") player.discounts[inscription.color] += inscription.value;
  return inscription;
}

function addFragmentReward(player, color, grade) {
  player.gems[color] += Math.max(1, GRADE_VALUE[grade]);
  if (grade === "S" || grade === "A") player.gems.stardust += 1;
}

function removeAndRefillCard(card) {
  const index = state.market.findIndex((item) => item.uid === card.uid);
  if (index === -1) return;
  const tier = card.tier;
  state.market.splice(index, 1);
  const replacement = drawCards(state.decks, tier, 1)[0];
  if (replacement) state.market.push(replacement);
  state.selectedCardId = state.market.find((item) => item.tier === tier)?.uid || state.market[0]?.uid || null;
}

function checkPatrons(player) {
  PATRONS.forEach((patron) => {
    const alreadyClaimed = state.players.some((candidate) => (candidate.patrons || []).includes(patron.id));
    if (!alreadyClaimed && patron.test(player)) {
      player.patrons = player.patrons || [];
      player.patrons.push(patron.id);
      player.prestige += patron.reward;
      pushFeed(`${player.name} 후원자 획득: ${patron.name} (+${patron.reward})`);
    }
  });
}

function checkWinner() {
  const winner = [...state.players].sort((a, b) => b.prestige - a.prestige)[0];
  if (winner?.prestige >= WIN_SCORE) state.winnerId = winner.id;
}

function canAfford(player, card) {
  return Object.entries(effectiveCost(player, card)).every(([color, value]) => (player.gems[color] || 0) >= value);
}

function effectiveCost(player, card) {
  const cost = {};
  Object.entries(card.cost).forEach(([color, value]) => {
    const colorDiscount = color === "stardust" ? 0 : player.discounts[color] || 0;
    cost[color] = Math.max(0, value - colorDiscount - player.anyDiscount);
  });
  return cost;
}

function payCost(player, card) {
  Object.entries(effectiveCost(player, card)).forEach(([color, value]) => {
    player.gems[color] -= value;
  });
}

function effectForGrade(grade) {
  if (grade === "S") return { discount: 2, prestige: 1 };
  if (grade === "A") return { discount: 1, prestige: 1 };
  if (grade === "B") return { discount: 1, prestige: 0 };
  if (grade === "C") return { discount: 0, prestige: 1 };
  return { discount: 0, prestige: 0 };
}

function drawInscription(color, player) {
  const existing = new Set(player.cards.map((card) => card.inscription?.id).filter(Boolean));
  const pool = [...COLOR_INSCRIPTIONS[color], ...COMMON_INSCRIPTIONS].filter((item) => !existing.has(item.id));
  return { ...(pool[Math.floor(Math.random() * pool.length)] || COMMON_INSCRIPTIONS[0]) };
}

function gradeFromDiff(diff) {
  if (diff >= 50) return "S";
  if (diff >= 30) return "A";
  if (diff >= 10) return "B";
  if (diff >= -9) return "B";
  if (diff >= -29) return "C";
  return "D";
}

function rivalRewardFromDiff(diff, rival) {
  let grade = "D";
  if (diff >= 50) grade = "D";
  else if (diff >= 30) grade = "C";
  else if (diff >= 10) grade = "B";
  else if (diff >= -9) grade = "B";
  else if (diff >= -29) grade = "B";
  else if (diff >= -49) grade = "A";
  else grade = "A";
  const boost = rival.cards.reduce((sum, card) => sum + (card.inscription?.kind === "fragmentBoost" ? card.inscription.value : 0), 0);
  return boostGrade(grade, boost);
}

function boostGrade(grade, amount) {
  const order = ["D", "C", "B", "A", "S"];
  return order[Math.min(order.length - 1, order.indexOf(grade) + amount)];
}

function miniBonus(player, color, game) {
  return player.cards.reduce((sum, card) => {
    const ins = card.inscription;
    if (!ins) return sum;
    if (ins.kind === "mini") return sum + ins.value;
    if (ins.kind === "game" && ins.game === game) return sum + ins.value;
    if (ins.kind === "discountColor" && ins.color === color) return sum;
    return sum;
  }, 0);
}

function sabotageBonus(player, color, game) {
  return player.cards.reduce((sum, card) => {
    const ins = card.inscription;
    if (!ins) return sum;
    if (ins.kind === "game" && ins.game === game) return sum + Math.floor(ins.value / 2);
    return sum;
  }, 0);
}

function shieldBonus(player) {
  return player.cards.reduce((sum, card) => sum + (card.inscription?.kind === "shield" ? card.inscription.value : 0), 0);
}

function updateDuelHud(duel, elapsed) {
  const ownerScore = document.querySelector("#ownerScore");
  const rivalScore = document.querySelector("#rivalScore");
  const timerRing = document.querySelector("#timerRing");
  if (ownerScore) ownerScore.textContent = Math.max(0, Math.round(duel.ownerScore));
  if (rivalScore) rivalScore.textContent = Math.max(0, Math.round(duel.rivalScore));
  if (timerRing) {
    const left = Math.max(0, duel.duration - elapsed);
    timerRing.textContent = left.toFixed(1);
    timerRing.style.setProperty("--timer", `${(elapsed / duel.duration) * 100}%`);
  }
}

function drawMiniGame(duel, elapsed) {
  const canvas = document.querySelector("#duelCanvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  const { width, height } = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, width, height);
  drawBackdrop(ctx, width, height, duel.card.color);
  if (duel.game === "furnace") drawFurnace(ctx, width, height, duel.meta);
  if (duel.game === "sequence") drawSequence(ctx, width, height, duel.meta);
  if (duel.game === "tug") drawTug(ctx, width, height, duel.meta);
  if (duel.game === "ricochet") drawRicochet(ctx, width, height, duel.meta, elapsed);
  if (duel.game === "rhythm") drawRhythm(ctx, width, height, duel.meta, elapsed);
}

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.max(1, Math.floor(rect.width * dpr));
  const targetHeight = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function drawBackdrop(ctx, width, height, color) {
  const grd = ctx.createLinearGradient(0, 0, width, height);
  grd.addColorStop(0, "rgba(255,255,255,.08)");
  grd.addColorStop(0.35, GEM[color].soft);
  grd.addColorStop(1, "rgba(0,0,0,.56)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,230,185,.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 36 + i * 36, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawFurnace(ctx, width, height, meta) {
  const x = width / 2;
  const y = height * 0.55;
  const radius = Math.min(width, height) * 0.23;
  ctx.fillStyle = "rgba(0,0,0,.42)";
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 18;
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI * 0.9, Math.PI * 0.9);
  ctx.stroke();
  ctx.strokeStyle = "rgba(98,211,156,.9)";
  ctx.beginPath();
  ctx.arc(x, y, radius, -0.2, 0.58);
  ctx.stroke();
  ctx.strokeStyle = meta.heat > 0.88 ? "#ff736e" : "#e0b15f";
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI * 0.9, -Math.PI * 0.9 + meta.heat * Math.PI * 1.8);
  ctx.stroke();
  const flame = Math.max(0.12, meta.heat);
  ctx.fillStyle = meta.heat > 0.88 ? "rgba(255,70,48,.82)" : "rgba(255,178,57,.78)";
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 0.42 * flame, radius * 0.76 * flame, 0, 0, Math.PI * 2);
  ctx.fill();
  drawLabel(ctx, "적정 구간을 오래 유지", x, 34);
}

function drawSequence(ctx, width, height, meta) {
  const startX = width * 0.08;
  const gap = Math.min(42, width * 0.09);
  const y = height * 0.24;
  meta.seq.slice(0, 10).forEach((color, index) => {
    const x = startX + index * gap;
    ctx.fillStyle = GEM[color].fill;
    roundRect(ctx, x, y, gap * 0.76, gap * 0.76, 8);
    ctx.fill();
  });
  drawSequenceProgress(ctx, width, height, "세공", meta.ownerIndex, height * 0.45, "#62d39c");
  drawSequenceProgress(ctx, width, height, "견제", meta.rivalIndex, height * 0.58, "#ff736e");
}

function drawSequenceProgress(ctx, width, height, label, value, y, color) {
  ctx.fillStyle = "rgba(255,255,255,.12)";
  ctx.fillRect(width * 0.12, y, width * 0.76, 12);
  ctx.fillStyle = color;
  ctx.fillRect(width * 0.12, y, Math.min(width * 0.76, value * 13), 12);
  drawLabel(ctx, `${label} ${value}`, width / 2, y - 12);
}

function drawTug(ctx, width, height, meta) {
  const railY = height * 0.52;
  const leftX = width * 0.12;
  const rightX = width * 0.88;
  const coreX = width / 2 + meta.pos * width * 0.34;
  ctx.strokeStyle = "rgba(255,230,185,.38)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(leftX, railY);
  ctx.lineTo(rightX, railY);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,115,110,.14)";
  ctx.fillRect(leftX, railY - 32, width * 0.19, 64);
  ctx.fillRect(rightX - width * 0.19, railY - 32, width * 0.19, 64);
  ctx.fillStyle = "rgba(98,211,156,.24)";
  ctx.fillRect(width * 0.41, railY - 34, width * 0.18, 68);
  ctx.strokeStyle = "rgba(98,211,156,.76)";
  ctx.lineWidth = 2;
  ctx.strokeRect(width * 0.41, railY - 34, width * 0.18, 68);
  const pulse = (Math.sin(meta.phase) + 1) / 2;
  ctx.strokeStyle = pulse > 0.64 ? "rgba(98,211,156,.95)" : "rgba(255,255,255,.2)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(width / 2, railY, 42 + pulse * 35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#e9fff4";
  ctx.beginPath();
  ctx.arc(coreX, railY, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GEM.emerald.fill;
  ctx.lineWidth = 5;
  ctx.stroke();
  drawLabel(ctx, "세공자는 중앙, 방해자는 바깥", width / 2, 38);
  drawLabel(ctx, "안정권", width / 2, railY + 58);
}

function drawRicochet(ctx, width, height, meta, elapsed) {
  const target = movingTarget(elapsed);
  ctx.strokeStyle = "rgba(242,189,75,.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, height * 0.92);
  ctx.lineTo(width / 2 + meta.aim * width * 0.25, height * 0.7);
  ctx.stroke();
  ctx.fillStyle = "#f2bd4b";
  ctx.beginPath();
  ctx.arc(target.x * width, target.y * height, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,115,110,.78)";
  ctx.fillRect(meta.guard * width - 46, height * 0.5, 92, 14);
  meta.shots.forEach((shot) => {
    ctx.fillStyle = "#fff0a8";
    ctx.beginPath();
    ctx.arc(shot.x * width, shot.y * height, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  drawLabel(ctx, "반사각으로 황금핵 맞히기", width / 2, 34);
}

function drawRhythm(ctx, width, height, meta, elapsed) {
  const cx = width / 2;
  const cy = height * 0.48;
  const base = Math.min(width, height) * 0.27;
  ctx.strokeStyle = "rgba(187,118,255,.72)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, base, 0, Math.PI * 2);
  ctx.stroke();
  meta.notes.forEach((time, index) => {
    const delta = time - elapsed;
    if (delta < -0.45 || delta > 1.35) return;
    const t = 1 - delta / 1.35;
    const angle = index * 1.72;
    const radius = base + (1 - t) * 140;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const hit = meta.ownerHits[index] || meta.rivalHits[index];
    ctx.fillStyle = hit ? "rgba(255,255,255,.35)" : "#d8b4ff";
    ctx.beginPath();
    ctx.arc(x, y, hit ? 5 : 11, 0, Math.PI * 2);
    ctx.fill();
  });
  drawLabel(ctx, "원형 박자에 맞춰 탭", cx, 34);
}

function drawLabel(ctx, text, x, y) {
  ctx.fillStyle = "rgba(247,239,225,.92)";
  ctx.font = "700 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function movingTarget(elapsed) {
  return {
    x: 0.5 + Math.sin(elapsed * 1.3) * 0.26,
    y: 0.22 + Math.cos(elapsed * 1.8) * 0.05
  };
}

function currentPlayer() {
  return state.players[state.turn % 2];
}

function rivalPlayer() {
  return state.players[(state.turn + 1) % 2];
}

function selectedCard() {
  return state.market.find((card) => card.uid === state.selectedCardId) || state.market[0] || null;
}

function advanceTurn() {
  state.turn = (state.turn + 1) % 2;
}

function resetGame() {
  if (!canResetGame()) return;
  state = createGame();
  if (online.mode === "online") state.roomCode = online.roomCode;
  saveGame();
  render();
}

function loadGame() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed || !Array.isArray(parsed.players)) return null;
    if (parsed.phase === "duel") parsed.phase = "board";
    parsed.duel = null;
    parsed.mineOffer ||= makeMineOffer();
    return parsed;
  } catch {
    return null;
  }
}

function saveGame() {
  if (!state) return;
  if (online.mode === "online") {
    syncOnline();
    return;
  }
  if (state.phase === "duel") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function pushFeed(message) {
  state.feed.push(message);
  state.feed = state.feed.slice(-24);
}

function countColor(player, color) {
  return player.cards.filter((card) => card.color === color).length;
}

function ownerButtonLabel(game) {
  if (game === "furnace") return "열 올리기";
  if (game === "tug") return "당기기";
  if (game === "ricochet") return "쏘기";
  if (game === "rhythm") return "박자";
  return "입력";
}

function rivalButtonLabel(game) {
  if (game === "furnace") return "흔들기";
  if (game === "tug") return "밀어내기";
  if (game === "ricochet") return "가드 이동";
  if (game === "rhythm") return "공명";
  return "견제";
}

function costHtml(card, player) {
  const cost = effectiveCost(player, card);
  return Object.entries(card.cost)
    .map(([color, original]) => {
      const value = cost[color];
      const covered = (player.gems[color] || 0) >= value;
      const shown = value === original ? value : `${original}→${value}`;
      return `<span class="cost-chip ${covered ? "is-covered" : "is-missing"}" style="${gemStyle(color)}">${GEM[color].short} ${shown}</span>`;
    })
    .join("");
}

function gemChip(color, value) {
  return `<span class="gem-chip" style="${gemStyle(color)}" title="${GEM[color].name}">${value}</span>`;
}

function discountChip(color, value) {
  return `<span class="discount-chip" style="${gemStyle(color)}">${GEM[color].short} -${value}</span>`;
}

function gemStyle(color) {
  const gem = GEM[color];
  return `--gem-color:${gem.fill};--gem-soft:${gem.soft}`;
}

function makeRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
