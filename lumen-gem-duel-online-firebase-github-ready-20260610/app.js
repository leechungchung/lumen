import { firebaseConfig } from "./firebase-config.js";

const STORAGE_KEY = "lumen-gem-duel-online-v4";
const SESSION_KEY = "lumen-online-session";
const STATE_VERSION = 4;
const WIN_SCORE = 20;

const GEM_KEYS = ["ruby", "sapphire", "emerald", "topaz", "amethyst"];
const ALL_GEMS = [...GEM_KEYS, "stardust"];
const GEM = {
  ruby: { name: "루비", short: "루", fill: "#c8303a", soft: "rgba(231,91,91,.46)" },
  sapphire: { name: "사파이어", short: "사", fill: "#2f71da", soft: "rgba(88,163,255,.42)" },
  emerald: { name: "에메랄드", short: "에", fill: "#1f9b68", soft: "rgba(84,215,155,.38)" },
  topaz: { name: "토파즈", short: "토", fill: "#d49222", soft: "rgba(242,189,75,.44)" },
  amethyst: { name: "자수정", short: "자", fill: "#8742c8", soft: "rgba(187,118,255,.42)" },
  stardust: { name: "별가루", short: "별", fill: "#e4dfc8", soft: "rgba(242,239,227,.34)" }
};

const OUTCOME = {
  great: { label: "대성공", chip: "outcome-great", item: "완전한 걸작", result: "세공이 폭발적으로 안정되어 추가 보상이 붙습니다." },
  success: { label: "성공", chip: "outcome-success", item: "완성품", result: "세공품이 정상 완성됩니다." },
  fail: { label: "패배", chip: "outcome-fail", item: "균열품", result: "완성은 실패하고 균열품만 남습니다." }
};

const MINI_POOLS = {
  ruby: ["furnace", "fortress", "goal"],
  sapphire: ["sequence", "goal", "hockey", "fishing"],
  emerald: ["tug", "mover", "chase", "fishing"],
  topaz: ["ricochet", "hockey", "mining", "fortress"],
  amethyst: ["rhythm", "chase", "mover", "fishing"]
};

const MINI_GAMES = {
  furnace: {
    label: "용광로 온도 봉인",
    duration: 6.4,
    ownerButton: "송풍",
    rivalButton: "흔들기",
    goal: "초록 안정 구간에 열을 오래 머물게 하세요.",
    owner: "송풍은 열을 올리지만 점수 자체가 아닙니다. 안정 구간 유지 시간이 점수입니다.",
    rival: "흔들기는 열 흐름을 흔들어 안정 구간 밖으로 밀어냅니다.",
    scoring: "안정 시간, 마지막 온도 정확도, 과열/냉각 시간이 결과를 나눕니다."
  },
  sequence: {
    label: "프리즘 색상 연쇄",
    duration: 7.2,
    ownerButton: "세공 연쇄",
    rivalButton: "왜곡 연쇄",
    goal: "공개된 보석 패턴을 순서대로 입력해 프리즘을 닫으세요.",
    owner: "정확한 색을 누르면 연쇄가 전진합니다. 틀리면 연쇄가 흔들립니다.",
    rival: "같은 패턴을 빠르게 왜곡해 세공자의 프리즘을 교란합니다.",
    scoring: "완성한 패턴 수, 콤보 유지, 오입력 수로 계산합니다."
  },
  tug: {
    label: "공명 줄다리기",
    duration: 6.8,
    ownerButton: "중앙 고정",
    rivalButton: "외곽 밀기",
    goal: "공명 코어를 중앙 안정권에 묶어두세요.",
    owner: "입력은 코어를 중앙으로 되돌릴 뿐입니다. 중앙에 가까울수록 점수가 오릅니다.",
    rival: "입력은 코어를 외곽으로 밀 뿐입니다. 멀리 벗어날수록 방해 점수가 오릅니다.",
    scoring: "중앙 유지 시간과 외곽 이탈 거리/시간이 승부를 가릅니다."
  },
  ricochet: {
    label: "반사 보석 사격",
    duration: 7.4,
    ownerButton: "보석탄 발사",
    rivalButton: "방패 이동",
    goal: "예측선이 표적 보석을 향할 때 보석탄을 쏴 맞히세요.",
    owner: "한 번 누를 때마다 현재 예측선 방향으로 보석탄이 나갑니다. 표적 명중과 근접탄만 점수가 됩니다.",
    rival: "방패를 움직이고 바람을 바꿔 탄도를 막습니다. 방패가 과하게 움직이면 빈틈이 생깁니다.",
    scoring: "표적 명중, 근접탄, 방패 차단, 빗나간 탄도를 합산합니다."
  },
  rhythm: {
    label: "별빛 박자 절단",
    duration: 8.6,
    ownerButton: "절단",
    rivalButton: "역박",
    goal: "링에 겹치는 순간만 절단해 별빛 결을 맞추세요.",
    owner: "정확한 타이밍만 기록됩니다. 광클은 오입력으로 콤보를 끊습니다.",
    rival: "역박으로 같은 노트를 방해 표식으로 먼저 찍어 세공자의 박자를 흐립니다.",
    scoring: "Perfect/Great, 콤보, Miss, 선점된 노트 수로 계산합니다."
  },
  mover: {
    label: "자력 광물 운반",
    duration: 8.2,
    ownerButton: "목적지 극성 전환",
    rivalButton: "광물 극성 전환",
    goal: "멀리 있는 광물을 목적지 자석으로 끌어와 슬롯에 넣으세요.",
    owner: "목적지 자석의 N/S극을 바꿔 광물을 끌어옵니다. 목적지와 광물 극성이 다르면 끌리고 같으면 밀립니다.",
    rival: "광물 자체의 N/S극을 바꿔 끌림을 뒤집습니다. 너무 연속으로 바꾸면 과부하가 걸려 잠시 조작할 수 없습니다.",
    scoring: "광물이 목적지에 가까워진 거리, 슬롯 도착, 방해 과부하, 뒤로 밀린 거리를 계산합니다."
  },
  hockey: {
    label: "에어하키 원석전",
    duration: 8.0,
    ownerButton: "스매시",
    rivalButton: "스매시",
    goal: "원석 퍽을 상대 게이트에 밀어 넣으세요. 경기 중 아이템이 생성됩니다.",
    owner: "퍽이 가까울 때 스매시하면 강하게 튕깁니다. 아이템을 먹으면 다음 스매시가 강화됩니다.",
    rival: "같은 조건으로 막고 되받아칩니다. 단, 세공자 쪽 게이트가 더 좁아 약간 유리합니다.",
    scoring: "득점, 세이브, 아이템 사용 성공 여부로 계산합니다."
  },
  mining: {
    label: "광산캐기",
    duration: 7.0,
    ownerButton: "채굴",
    rivalButton: "낙석",
    goal: "드릴이 균열선과 겹칠 때만 채굴해 원석맥을 뚫으세요.",
    owner: "정확한 균열 채굴만 광맥을 전진시킵니다. 빗나가면 드릴이 무뎌집니다.",
    rival: "낙석으로 균열선을 가리거나 드릴 경로를 흔듭니다.",
    scoring: "정확한 채굴, 무딘 드릴, 낙석 방해 성공이 반영됩니다."
  },
  fortress: {
    label: "포트리스 세공포",
    duration: 28,
    ownerButton: "곡사 발사",
    rivalButton: "방벽",
    goal: "곡선 궤적을 읽고 성벽 뒤 보석핵의 체력을 깎으세요.",
    owner: "조준선은 계속 움직입니다. 예측 곡선이 핵을 향할 때 발사하면 포탄이 포물선으로 날아갑니다.",
    rival: "방벽 위치와 바람을 바꿔 포물선을 틀어냅니다. 핵 체력이 0이 되면 세공자가 크게 이깁니다.",
    scoring: "시간 점수가 아니라 핵 체력, 직격 피해, 근접 피해, 방벽 차단으로 결과가 정해집니다."
  },
  chase: {
    label: "별가루 술래잡기",
    duration: 8.4,
    ownerButton: "회피 대시",
    rivalButton: "추격 대시",
    goal: "역할이 바뀌는 추격전에서 별가루를 오래 지키세요.",
    owner: "세공자는 먼저 도망자입니다. 중간에 술래가 바뀌며, 안전권 체류가 점수입니다.",
    rival: "방해자는 먼저 술래입니다. 가까이 붙어 태그하면 방해 점수가 오릅니다.",
    scoring: "거리 유지, 태그 성공, 역할 교대 뒤 반격 시간이 계산됩니다."
  },
  goal: {
    label: "프리즘 승부차기",
    duration: 9.2,
    ownerButton: "내 방향 확정",
    rivalButton: "상대 방향 확정",
    goal: "왼쪽/중앙/오른쪽 세 방향을 읽는 짧은 승부차기입니다.",
    owner: "세공자가 슈터인 라운드는 골을 노리고, 골키퍼인 라운드는 같은 방향을 골라 막습니다. 세공자 슈팅 라운드가 한 번 더 많습니다.",
    rival: "방해자는 골키퍼로 막거나 역습 슈터로 골을 노립니다. 다음 라운드 역할이 화면 중앙에 표시됩니다.",
    scoring: "골은 큰 점수, 선방은 작은 점수입니다. 같은 방향이면 선방, 다른 방향이면 골입니다."
  },
  fishing: {
    label: "심해 루멘 낚시",
    duration: 7.6,
    ownerButton: "찌 던지기/감기",
    rivalButton: "물살 뒤집기",
    goal: "한 번 던진 찌로 지나가는 물고기 무리를 최대한 많이 걸어 올리세요.",
    owner: "첫 입력은 찌를 던지고, 다음 입력은 감아올립니다. 찌가 물고기 경로와 겹칠수록 많이 잡힙니다.",
    rival: "물살을 뒤집어 물고기 줄을 흩뜨립니다. 연속 방해를 남발하면 물살이 과열되어 세공자에게 안정 시간이 생깁니다.",
    scoring: "잡은 물고기 수, 큰 물고기, 감아올린 타이밍, 물살 과열을 계산합니다."
  }
};

const CARD_LIBRARY = [
  { id: "ruby-hone", tier: 1, color: "ruby", name: "붉은 연마석", cost: { ruby: 2 }, prestige: 0, tags: ["연마", "화염"], art: [4, 31] },
  { id: "ruby-bellows", tier: 1, color: "ruby", name: "용광로 풀무", cost: { ruby: 1, topaz: 1 }, prestige: 0, tags: ["화염", "장치"], art: [15, 42] },
  { id: "ruby-guard", tier: 1, color: "ruby", name: "불꽃 결투장갑", cost: { ruby: 1, emerald: 1 }, prestige: 0, tags: ["화염", "결투"], art: [28, 32] },
  { id: "sapphire-lens", tier: 1, color: "sapphire", name: "푸른 렌즈", cost: { sapphire: 2 }, prestige: 0, tags: ["예지", "거울"], art: [88, 31] },
  { id: "sapphire-chart", tier: 1, color: "sapphire", name: "수정 별자리표", cost: { sapphire: 1, amethyst: 1 }, prestige: 0, tags: ["별빛", "예지"], art: [72, 26] },
  { id: "sapphire-whistle", tier: 1, color: "sapphire", name: "빙결 휘슬", cost: { sapphire: 1, ruby: 1 }, prestige: 0, tags: ["결투", "예지"], art: [78, 38] },
  { id: "emerald-root", tier: 1, color: "emerald", name: "균형의 뿌리", cost: { emerald: 2 }, prestige: 0, tags: ["생장", "균형"], art: [9, 67] },
  { id: "emerald-cart", tier: 1, color: "emerald", name: "이끼 수레", cost: { emerald: 1, topaz: 1 }, prestige: 0, tags: ["생장", "장치"], art: [18, 72] },
  { id: "topaz-coin", tier: 1, color: "topaz", name: "황금 주화틀", cost: { topaz: 2 }, prestige: 0, tags: ["황금", "교역"], art: [86, 65] },
  { id: "topaz-puck", tier: 1, color: "topaz", name: "태양 퍽", cost: { topaz: 1, sapphire: 1 }, prestige: 0, tags: ["황금", "결투"], art: [69, 63] },
  { id: "amethyst-tuner", tier: 1, color: "amethyst", name: "공명 조율기", cost: { amethyst: 2 }, prestige: 0, tags: ["별빛", "공명"], art: [77, 73] },
  { id: "amethyst-chime", tier: 1, color: "amethyst", name: "자정의 차임", cost: { amethyst: 1, emerald: 1 }, prestige: 0, tags: ["별빛", "균형"], art: [61, 77] },

  { id: "ruby-crucible", tier: 2, color: "ruby", name: "이중 도가니", cost: { ruby: 4, emerald: 2 }, prestige: 1, tags: ["화염", "장치", "연마"], art: [33, 46] },
  { id: "ruby-siege", tier: 2, color: "ruby", name: "홍염 세공포", cost: { ruby: 3, topaz: 3 }, prestige: 1, tags: ["화염", "결투", "장치"], art: [43, 38] },
  { id: "sapphire-mirror", tier: 2, color: "sapphire", name: "달빛 기억거울", cost: { sapphire: 4, amethyst: 2 }, prestige: 1, tags: ["거울", "예지", "별빛"], art: [61, 35] },
  { id: "sapphire-keeper", tier: 2, color: "sapphire", name: "푸른 골문 문장", cost: { sapphire: 3, topaz: 2, emerald: 1 }, prestige: 1, tags: ["결투", "예지", "왕실"], art: [84, 44] },
  { id: "emerald-bridge", tier: 2, color: "emerald", name: "생장 현수교", cost: { emerald: 4, ruby: 2 }, prestige: 1, tags: ["생장", "균형", "장치"], art: [25, 66] },
  { id: "emerald-hunt", tier: 2, color: "emerald", name: "숲의 추격 인장", cost: { emerald: 3, amethyst: 2, ruby: 1 }, prestige: 1, tags: ["생장", "결투", "균형"], art: [38, 71] },
  { id: "topaz-arc", tier: 2, color: "topaz", name: "태양 반사각", cost: { topaz: 4, sapphire: 2 }, prestige: 1, tags: ["황금", "연마", "예지"], art: [76, 58] },
  { id: "topaz-mine", tier: 2, color: "topaz", name: "황금 광맥 지도", cost: { topaz: 3, emerald: 2, sapphire: 1 }, prestige: 1, tags: ["황금", "교역", "생장"], art: [91, 71] },
  { id: "amethyst-ring", tier: 2, color: "amethyst", name: "자정의 박자링", cost: { amethyst: 4, topaz: 2 }, prestige: 1, tags: ["별빛", "공명", "연마"], art: [51, 78] },
  { id: "amethyst-veil", tier: 2, color: "amethyst", name: "그림자 베일", cost: { amethyst: 3, sapphire: 2, emerald: 1 }, prestige: 1, tags: ["별빛", "거울", "균형"], art: [67, 82] },

  { id: "ruby-royal", tier: 3, color: "ruby", name: "왕실 화염핵", cost: { ruby: 6, sapphire: 3, stardust: 1 }, prestige: 3, tags: ["왕실", "화염", "연마"], art: [20, 24] },
  { id: "sapphire-royal", tier: 3, color: "sapphire", name: "왕실 예지관", cost: { sapphire: 6, emerald: 3, stardust: 1 }, prestige: 3, tags: ["왕실", "예지", "거울"], art: [73, 22] },
  { id: "emerald-royal", tier: 3, color: "emerald", name: "왕실 생명정원", cost: { emerald: 6, amethyst: 3, stardust: 1 }, prestige: 3, tags: ["왕실", "생장", "균형"], art: [31, 60] },
  { id: "topaz-royal", tier: 3, color: "topaz", name: "왕실 황금관문", cost: { topaz: 6, ruby: 3, stardust: 1 }, prestige: 3, tags: ["왕실", "황금", "교역"], art: [81, 55] },
  { id: "amethyst-royal", tier: 3, color: "amethyst", name: "왕실 별의 현", cost: { amethyst: 6, topaz: 3, stardust: 1 }, prestige: 3, tags: ["왕실", "별빛", "공명"], art: [58, 86] },
  { id: "prism-crown", tier: 3, color: "stardust", name: "프리즘 왕관 원석", cost: { ruby: 2, sapphire: 2, emerald: 2, topaz: 2, amethyst: 2, stardust: 2 }, prestige: 4, tags: ["왕실", "프리즘", "별빛"], art: [50, 50] }
];

const CARD_BY_ID = Object.fromEntries(CARD_LIBRARY.map((card) => [card.id, card]));

const SYNERGIES = [
  {
    id: "royal",
    name: "왕실 세공단",
    source: "왕실 이름표",
    type: "tag",
    tags: ["왕실"],
    levels: [
      { need: 2, effect: "세공 성공 이상이면 명성 +1", bonus: { prestigeOnSuccess: 1, ownerScore: 4 } },
      { need: 4, effect: "대성공이면 추가 명성 +2", bonus: { prestigeOnSuccess: 1, prestigeOnGreat: 2, ownerScore: 9 } }
    ]
  },
  {
    id: "prism",
    name: "오색 프리즘",
    source: "서로 다른 광물 색",
    type: "colors",
    levels: [
      { need: 3, effect: "모든 구매 비용 -1", bonus: { costAny: 1 } },
      { need: 5, effect: "대성공 때 별가루 +1", bonus: { costAny: 1, stardustOnGreat: 1, ownerScore: 5 } }
    ]
  },
  {
    id: "forge",
    name: "용광로 연맹",
    source: "화염/장치",
    type: "tag",
    tags: ["화염", "장치"],
    levels: [
      { need: 2, effect: "용광로/포트리스 세공 점수 +8", bonus: { game: { furnace: 8, fortress: 8 } } },
      { need: 4, effect: "루비 또는 토파즈 광맥 채굴 +1", bonus: { mineColors: ["ruby", "topaz"], mineBonus: 1, game: { furnace: 13, fortress: 13 } } }
    ]
  },
  {
    id: "astral",
    name: "별빛 합창단",
    source: "별빛/공명",
    type: "tag",
    tags: ["별빛", "공명"],
    levels: [
      { need: 2, effect: "리듬/술래잡기 세공 판정 완화", bonus: { game: { rhythm: 7, chase: 6 }, rhythmWindow: 0.035 } },
      { need: 4, effect: "대성공 때 별가루 +1, 방해 점수 -4", bonus: { game: { rhythm: 12, chase: 10 }, rhythmWindow: 0.055, stardustOnGreat: 1, shield: 4 } }
    ]
  },
  {
    id: "verdant",
    name: "생명 균형단",
    source: "생장/균형",
    type: "tag",
    tags: ["생장", "균형"],
    levels: [
      { need: 2, effect: "방해 점수 -6", bonus: { shield: 6 } },
      { need: 4, effect: "줄다리기/광물 옮기기 점수 +12", bonus: { shield: 9, game: { tug: 12, mover: 12 } } }
    ]
  },
  {
    id: "goldRoute",
    name: "황금 교역로",
    source: "황금/교역",
    type: "tag",
    tags: ["황금", "교역"],
    levels: [
      { need: 2, effect: "광맥 채굴 때 첫 광물 +1", bonus: { mineBonus: 1 } },
      { need: 4, effect: "성공 이상이면 해당 색 파편 +1", bonus: { mineBonus: 1, fragmentOnSuccess: 1, sabotage: 4 } }
    ]
  },
  {
    id: "mirror",
    name: "거울 예지회",
    source: "거울/예지",
    type: "tag",
    tags: ["거울", "예지"],
    levels: [
      { need: 2, effect: "색상 연쇄/슈터 게임 점수 +7", bonus: { game: { sequence: 7, goal: 7 } } },
      { need: 4, effect: "방해 점수 -8, 모든 세공 점수 +4", bonus: { shield: 8, ownerScore: 4, game: { sequence: 10, goal: 10 } } }
    ]
  },
  {
    id: "arena",
    name: "결투장 맹세",
    source: "결투 이름표",
    type: "tag",
    tags: ["결투"],
    levels: [
      { need: 2, effect: "에어하키/슈터/술래잡기 점수 +8", bonus: { game: { hockey: 8, goal: 8, chase: 8 } } },
      { need: 4, effect: "방해자일 때 방해 점수 +7", bonus: { game: { hockey: 12, goal: 12, chase: 12 }, sabotage: 7 } }
    ]
  }
];

const SYNERGY_ACCENTS = {
  royal: "#f2bd4b",
  prism: "#f2efe3",
  forge: "#ff736e",
  astral: "#bb76ff",
  verdant: "#62d39c",
  goldRoute: "#e0b15f",
  mirror: "#58a3ff",
  arena: "#ff8d71"
};

const COMMON_INSCRIPTIONS = [
  { id: "steady-hand", name: "안정된 손끝", kind: "mini", value: 5, text: "세공 점수 +5" },
  { id: "prism-cut", name: "프리즘 절인", kind: "discountAny", value: 1, text: "모든 구매 비용 -1" },
  { id: "royal-seal", name: "왕실 인증", kind: "prestige", value: 2, text: "명성 +2" },
  { id: "guard-light", name: "보호막", kind: "shield", value: 5, text: "상대 방해 점수 -5" },
  { id: "shard-master", name: "파편 장인", kind: "fragmentBoost", value: 1, text: "방해 보상 +1" }
];

const COLOR_INSCRIPTIONS = {
  ruby: [{ id: "ruby-heat", name: "불꽃 과열", kind: "game", game: "furnace", value: 9, text: "용광로 세공 점수 +9" }],
  sapphire: [{ id: "sapphire-forecast", name: "수정 예측", kind: "game", game: "sequence", value: 9, text: "색상 연쇄 점수 +9" }],
  emerald: [{ id: "emerald-rooted", name: "뿌리내림", kind: "game", game: "tug", value: 9, text: "공명 줄다리기 점수 +9" }],
  topaz: [{ id: "topaz-instinct", name: "황금 직감", kind: "game", game: "ricochet", value: 9, text: "리코셰 점수 +9" }],
  amethyst: [{ id: "amethyst-beat", name: "별빛 박자", kind: "game", game: "rhythm", value: 9, text: "리듬 세공 점수 +9" }],
  stardust: [{ id: "star-oath", name: "별가루 서약", kind: "mini", value: 8, text: "세공 점수 +8" }]
};

const PATRONS = [
  {
    id: "purity-judge",
    name: "순도 감정가",
    reward: 3,
    text: "대성공 2개",
    test: (player) => player.cards.filter((card) => card.outcome === "great").length >= 2
  },
  {
    id: "royal-crafter",
    name: "왕실 의뢰인",
    reward: 3,
    text: "왕실 세공단 2단계",
    test: (player) => activeSynergies(player).some((item) => item.id === "royal" && item.levelIndex >= 1)
  },
  {
    id: "starlight-collector",
    name: "별빛 수집가",
    reward: 4,
    text: "별가루 3개 보유",
    test: (player) => (player.gems.stardust || 0) >= 3
  },
  {
    id: "five-prism",
    name: "오색 프리즘 후원자",
    reward: 4,
    text: "서로 다른 광물색 5종 완성",
    test: (player) => new Set(player.cards.filter((card) => !card.cracked).map((card) => card.color)).size >= 5
  }
];

const app = document.querySelector("#app");
let state = null;
let activeLoopId = "";
let loopTimer = null;
let briefTimer = null;
let briefLoopId = "";

let online = {
  mode: "boot",
  firebaseReady: false,
  app: null,
  db: null,
  api: null,
  roomCode: "",
  playerId: "",
  playerIndex: -1,
  roomPlayers: {},
  notice: "",
  unsubscribe: null,
  lastWrite: 0
};

initEntry();

async function initEntry() {
  await initFirebase();
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

async function initFirebase() {
  try {
    const keys = Object.values(firebaseConfig || {});
    if (!firebaseConfig || keys.some((value) => !value || String(value).includes("YOUR_"))) {
      online.firebaseReady = false;
      return;
    }
    const [appMod, dbMod] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js")
    ]);
    online.app = appMod.initializeApp(firebaseConfig);
    online.db = dbMod.getDatabase(online.app);
    online.api = dbMod;
    online.firebaseReady = true;
  } catch (error) {
    console.warn("Firebase init failed", error);
    online.firebaseReady = false;
  }
}

function renderLobby(message = "") {
  cancelLoops();
  app.innerHTML = `
    <main class="lobby-screen">
      <section class="lobby-card">
        <div class="lobby-brand">
          <span class="tag">ONLINE DUEL</span>
          <h1>루멘 젬 듀얼</h1>
          <p>초대 코드로 같은 방에 입장해 카드 엔진과 실시간 세공 미니게임으로 왕실 계약을 먼저 완성하세요.</p>
        </div>
        ${!online.firebaseReady ? `<div class="lobby-alert"><strong>Firebase 연결 대기</strong><span>Firebase 설정이나 네트워크가 준비되지 않으면 로컬 체험만 가능합니다.</span></div>` : ""}
        ${message ? `<div class="lobby-alert">${escapeHtml(message)}</div>` : ""}
        <div class="lobby-actions">
          <button class="primary-btn" data-action="create-online" ${online.firebaseReady ? "" : "disabled"}>온라인 방 만들기</button>
          <div class="join-box">
            <input id="roomInput" maxlength="6" placeholder="초대 코드 입력" />
            <button class="ghost-btn" data-action="join-online" ${online.firebaseReady ? "" : "disabled"}>참가</button>
          </div>
          <button class="ghost-btn" data-action="local-play">한 기기에서 로컬 체험</button>
        </div>
        <ul class="rule-list">
          <li>세공시장은 미니게임을 미리 보여주지 않습니다. 구매 후 세공법과 역할이 공개됩니다.</li>
          <li>시너지는 카드 이름표와 광물색으로 발동합니다. 롤토체스처럼 조합을 보고 시장을 선점하세요.</li>
          <li>결과는 대성공, 성공, 패배 세 가지로만 표시되며 획득물이 결과창에 정확히 정리됩니다.</li>
        </ul>
      </section>
    </main>
  `;
}

function roomPath(code) {
  return `rooms/${code}`;
}

async function createOnlineRoom() {
  if (!online.firebaseReady) return renderLobby("Firebase 설정이 아직 준비되지 않았습니다.");
  const code = makeRoomCode() + Math.floor(Math.random() * 10);
  const playerId = makeId();
  const game = createGame();
  game.roomCode = code;
  game.players[0].id = playerId;
  await online.api.set(online.api.ref(online.db, roomPath(code)), {
    createdAt: online.api.serverTimestamp(),
    updatedAt: online.api.serverTimestamp(),
    players: {
      p1: { id: playerId, name: "세공사 A", joinedAt: Date.now(), locked: true }
    },
    game
  });
  online.mode = "online";
  online.roomCode = code;
  online.playerId = playerId;
  online.playerIndex = 0;
  rememberSession();
  attachRoom(code);
}

async function joinOnlineRoom() {
  if (!online.firebaseReady) return renderLobby("Firebase 설정이 아직 준비되지 않았습니다.");
  const input = document.querySelector("#roomInput");
  const code = String(input?.value || "").trim().toUpperCase();
  if (code.length < 4) return renderLobby("초대 코드를 입력해주세요.");
  const snap = await online.api.get(online.api.ref(online.db, roomPath(code)));
  if (!snap.exists()) return renderLobby("해당 방을 찾지 못했습니다.");

  const data = snap.val();
  const players = data.players || {};
  const playerId = makeId();
  let index = -1;
  let patch = {};
  const game = normalizeGame(data.game || createGame());
  if (!players.p1) {
    index = 0;
    game.players[0].id = playerId;
    patch = { "players/p1": { id: playerId, name: "세공사 A", joinedAt: Date.now(), locked: true }, game };
  } else if (!players.p2) {
    index = 1;
    game.players[1].id = playerId;
    patch = { "players/p2": { id: playerId, name: "세공사 B", joinedAt: Date.now(), locked: true }, game };
  } else {
    index = -1;
  }
  if (index !== -1) await online.api.update(online.api.ref(online.db, roomPath(code)), patch);
  online.mode = "online";
  online.roomCode = code;
  online.playerId = playerId;
  online.playerIndex = index;
  rememberSession();
  attachRoom(code);
}

function attachRoom(code) {
  if (!online.firebaseReady) return renderLobby("Firebase 연결이 끊겼습니다.");
  if (online.unsubscribe) online.unsubscribe();
  online.unsubscribe = online.api.onValue(online.api.ref(online.db, roomPath(code)), (snap) => {
    if (!snap.exists()) {
      clearRememberedSession();
      return renderLobby("방이 사라졌습니다. 새 방을 만들어주세요.");
    }
    const data = snap.val();
    online.mode = "online";
    online.roomCode = code;
    online.roomPlayers = data.players || {};
    state = normalizeGame(data.game || createGame());
    state.roomCode = code;
    render();
  });
}

function syncOnline(force = false) {
  if (!online.firebaseReady || online.mode !== "online" || !online.roomCode || !state) return;
  const now = performance.now();
  if (!force && now - online.lastWrite < 240) return;
  online.lastWrite = now;
  const copy = JSON.parse(JSON.stringify(state));
  online.api
    .set(online.api.ref(online.db, `${roomPath(online.roomCode)}/game`), copy)
    .then(() => online.api.update(online.api.ref(online.db, roomPath(online.roomCode)), { updatedAt: online.api.serverTimestamp() }))
    .catch((error) => console.warn("sync failed", error));
}

function localPlay() {
  online.mode = "local";
  online.roomCode = "";
  online.playerId = "";
  online.playerIndex = -1;
  state = loadGame() || createGame();
  render();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-card-id], [data-duel-role], [data-seq-role], [data-lane-role]");
  if (!target) return;

  if (target.dataset.cardId) {
    if (!state || state.phase !== "board") return;
    state.selectedCardId = target.dataset.cardId;
    saveGame();
    render();
    return;
  }

  if (target.dataset.seqRole) {
    handleDuelInput(target.dataset.seqRole, { color: target.dataset.seqColor });
    return;
  }

  if (target.dataset.laneRole) {
    handleDuelInput(target.dataset.laneRole, { lane: Number(target.dataset.lane) });
    return;
  }

  if (target.dataset.duelRole) {
    handleDuelInput(target.dataset.duelRole, {});
    return;
  }

  const action = target.dataset.action;
  if (action === "create-online") createOnlineRoom();
  if (action === "join-online") joinOnlineRoom();
  if (action === "local-play") localPlay();
  if (action === "new-game") resetGame();
  if (action === "new-room") createFreshOnlineRoom();
  if (action === "leave-lobby") leaveToLobby();
  if (action === "copy-code") copyRoomCode();
  if (action === "copy-invite") copyInvite();
  if (action === "collect") collectGems();
  if (action === "buy") buySelectedCard();
  if (action === "start-duel") beginDuel();
  if (action === "continue-result") continueAfterResult();
});

document.addEventListener("keydown", (event) => {
  if (!state || state.phase !== "duel" || !state.duel || state.duel.awaitingStart) return;
  const duel = state.duel;
  if (duel.game === "sequence") {
    const ownerKeys = { KeyQ: "ruby", KeyW: "sapphire", KeyE: "topaz" };
    const rivalKeys = { KeyI: "ruby", KeyO: "sapphire", KeyP: "topaz" };
    if (ownerKeys[event.code]) handleDuelInput("owner", { color: ownerKeys[event.code] });
    if (rivalKeys[event.code]) handleDuelInput("rival", { color: rivalKeys[event.code] });
    return;
  }
  if (duel.game === "goal") {
    const lanes = { KeyA: 0, KeyS: 1, KeyD: 2, KeyJ: 0, KeyK: 1, KeyL: 2 };
    if (event.code in lanes) handleDuelInput(["KeyA", "KeyS", "KeyD"].includes(event.code) ? "owner" : "rival", { lane: lanes[event.code] });
    return;
  }
  if (["Space", "KeyA", "KeyZ"].includes(event.code)) {
    event.preventDefault();
    handleDuelInput("owner", {});
  }
  if (["Enter", "KeyL", "Slash"].includes(event.code)) {
    event.preventDefault();
    handleDuelInput("rival", {});
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
  return {
    version: STATE_VERSION,
    phase: "board",
    roomCode: makeRoomCode(),
    turn: 0,
    selectedCardId: market[0]?.uid || null,
    decks,
    market,
    mineOffer: makeMineOffer(),
    players: [createPlayer("p1", "세공사 A"), createPlayer("p2", "세공사 B")],
    feed: ["왕실 계약 명성 20점을 먼저 완성하세요."],
    recentGames: [],
    winnerId: null,
    duel: null,
    pendingResult: null
  };
}

function normalizeGame(game) {
  if (!game || typeof game !== "object" || game.version !== STATE_VERSION) {
    const fresh = createGame();
    if (game?.roomCode) fresh.roomCode = game.roomCode;
    return fresh;
  }
  game.players = [0, 1].map((index) => {
    const fallback = createPlayer(index === 0 ? "p1" : "p2", index === 0 ? "세공사 A" : "세공사 B");
    const player = { ...fallback, ...(game.players?.[index] || {}) };
    player.gems = { ...fallback.gems, ...(player.gems || {}) };
    player.discounts = { ...fallback.discounts, ...(player.discounts || {}) };
    player.cards = Array.isArray(player.cards) ? player.cards : [];
    player.patrons = Array.isArray(player.patrons) ? player.patrons : [];
    player.synergyClaims = Array.isArray(player.synergyClaims) ? player.synergyClaims : [];
    return player;
  });
  game.decks = game.decks || makeDecks();
  game.market = Array.isArray(game.market) && game.market.length ? game.market : [1, 2, 3].flatMap((tier) => drawCards(game.decks, tier, 4));
  game.market = game.market.map((card) => normalizeCard(card));
  game.mineOffer = game.mineOffer || makeMineOffer();
  game.feed = Array.isArray(game.feed) ? game.feed : [];
  game.recentGames = Array.isArray(game.recentGames) ? game.recentGames : [];
  game.selectedCardId = game.market.some((card) => card.uid === game.selectedCardId) ? game.selectedCardId : game.market[0]?.uid || null;
  return game;
}

function normalizeCard(card) {
  const base = CARD_BY_ID[card.id] || card;
  return { ...base, ...card, tags: base.tags || card.tags || [], art: base.art || card.art || [50, 50] };
}

function createPlayer(id, name) {
  return {
    id,
    name,
    gems: { ruby: 2, sapphire: 2, emerald: 2, topaz: 2, amethyst: 2, stardust: 0 },
    discounts: { ruby: 0, sapphire: 0, emerald: 0, topaz: 0, amethyst: 0 },
    anyDiscount: 0,
    prestige: 0,
    cards: [],
    patrons: [],
    synergyClaims: []
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
  while (drawn.length < count && decks[tier]?.length) drawn.push(decks[tier].shift());
  return drawn;
}

function makeMineOffer() {
  const colors = shuffle([...GEM_KEYS]).slice(0, 3);
  return { colors, stardust: Math.random() < 0.18 };
}

function render() {
  if (!state) return;
  const current = currentPlayer();
  const rival = rivalPlayer();
  const selected = selectedCard();
  app.innerHTML = `
    <main class="game-grid">
      <header class="top-bar">
        <div class="brand">
          <span class="room-pill">방 ${escapeHtml(state.roomCode)}${online.mode === "online" ? " · 온라인" : " · 로컬"}</span>
          <h1 class="brand-title">루멘 젬 듀얼</h1>
        </div>
        <div class="top-meta">
          <span class="turn-pill">${current.name} 턴</span>
          <span class="score-pill">왕실 계약 ${Math.max(current.prestige, rival.prestige)} / ${WIN_SCORE}</span>
          ${online.mode === "online" ? `<span class="score-pill">${roleLabel()}</span>` : ""}
        </div>
        <div class="top-actions">
          <button class="mini-btn" type="button" data-action="new-game" ${canResetGame() ? "" : "disabled"}>새 판</button>
          ${online.mode === "online" ? `<button class="mini-btn" type="button" data-action="new-room">새 방</button><button class="mini-btn" type="button" data-action="leave-lobby">로비</button>` : ""}
        </div>
      </header>

      ${online.mode === "online" ? invitePanelHtml() : ""}
      ${state.winnerId ? winnerHtml() : goalPanelHtml()}
      <section class="player-strip">${state.players.map((player, index) => playerHtml(player, index === state.turn)).join("")}</section>

      <div class="main-layout">
        <section class="market-zone">
          <div class="zone-head">
            <div>
              <span class="tag">세공시장</span>
              <h2>조합을 보고 선점하세요</h2>
            </div>
            <button class="mini-btn" type="button" data-action="collect" ${state.winnerId || !canControlTurn() ? "disabled" : ""}>광맥 채굴</button>
          </div>
          ${marketHtml(current, rival)}
        </section>

        <aside class="side-zone">
          ${selected ? selectedCardHtml(selected, current, rival) : ""}
          ${mineHtml(current)}
          ${synergyBookHtml(current, rival)}
          ${patronHtml()}
          ${ownedHtml(current, rival)}
          ${feedHtml()}
        </aside>
      </div>
    </main>
    ${state.phase === "duel" && state.duel ? duelHtml(state.duel) : ""}
    ${state.phase === "result" && state.pendingResult ? resultHtml(state.pendingResult) : ""}
  `;
  if (state.phase === "duel" && state.duel) {
    if (state.duel.awaitingStart) startBriefDemo(state.duel);
    else startDuelLoop();
  } else {
    cancelDuelLoop();
    cancelBriefDemo();
  }
}

function playerHtml(player, active) {
  const syn = activeSynergies(player).filter((item) => item.activeLevel);
  return `
    <article class="player-card ${active ? "is-active" : ""}">
      <div>
        <div class="player-name">
          <strong>${escapeHtml(player.name)}</strong>
          ${active ? `<span class="tag">현재 턴</span>` : ""}
        </div>
        <div class="gem-row">${ALL_GEMS.map((color) => gemChip(color, player.gems[color] || 0)).join("")}</div>
        <div class="discount-row">${GEM_KEYS.map((color) => discountChip(color, player.discounts[color] || 0)).join("")}</div>
        <div class="synergy-mini">${syn.length ? syn.slice(0, 4).map((item) => `<span>${item.name} ${item.activeLevel.need}</span>`).join("") : `<span>활성 시너지 없음</span>`}</div>
      </div>
      <div class="prestige">
        <span>${player.prestige}</span>
        <small>명성</small>
      </div>
    </article>
  `;
}

function marketHtml(player, rival) {
  return `
    <div class="market-lanes">
      ${[3, 2, 1]
        .map((tier) => {
          const cards = state.market.filter((card) => card.tier === tier);
          return `
            <section class="tier-lane">
              <div class="tier-head"><span>Tier ${tier}</span><span>${tier === 3 ? "왕실급" : tier === 2 ? "전문 세공" : "초기 장비"}</span></div>
              <div class="card-row">${cards.map((card) => marketCardHtml(card, player, rival)).join("")}</div>
            </section>
          `;
        })
        .join("")}
    </div>
  `;
}

function marketCardHtml(card, player, rival) {
  const affordable = canAfford(player, card);
  const preview = synergyPreview(player, card);
  const threat = synergyPreview(rival, card);
  const classes = [
    "market-card",
    `gem-${card.color}`,
    card.uid === state.selectedCardId ? "is-selected" : "",
    affordable ? "is-affordable" : "",
    preview.activates ? "has-synergy-pick" : "",
    threat.activates ? "is-rival-threat" : ""
  ]
    .filter(Boolean)
    .join(" ");
  return `
    <button class="${classes}" data-card-id="${card.uid}" style="${gemStyle(card.color)};${artStyle(card)};${synergyStyle(card)}">
      <span class="card-art" aria-hidden="true"></span>
      <span class="card-body">
        <span class="card-title-line">
          <strong class="card-name">${escapeHtml(card.name)}</strong>
          <span class="buy-state">${affordable ? "구매 가능" : "재료 부족"}</span>
        </span>
        <span class="tag-row">${card.tags.slice(0, 3).map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}</span>
        <span class="card-meta">
          <span>${GEM[card.color].name}</span>
          <span>명성 ${card.prestige}</span>
          <span>세공법 비공개</span>
        </span>
        <span class="cost-row">${costHtml(card, player)}</span>
        <span class="market-signal">
          ${preview.activates ? `<b>시너지 발동</b>` : preview.delta > 0 ? `<span>조합 진척 +${preview.delta}</span>` : `<span>조합 후보</span>`}
          ${threat.activates ? `<em>상대 발동 위험</em>` : ""}
        </span>
      </span>
    </button>
  `;
}

function selectedCardHtml(card, player, rival) {
  const affordable = canAfford(player, card);
  const preview = synergyPreview(player, card);
  const threat = synergyPreview(rival, card);
  return `
    <section class="selected-card gem-${card.color}" style="${gemStyle(card.color)};${artStyle(card)};${synergyStyle(card)}">
      <div class="card-art" aria-hidden="true"></div>
      <div class="selected-title">
        <h3>${escapeHtml(card.name)}</h3>
        <span class="grade-chip">T${card.tier}</span>
      </div>
      <div class="tag-row">${card.tags.map((tag) => `<span class="mini-tag">${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="cost-row">${costHtml(card, player)}</div>
      <ul class="effect-list">
        <li><strong>세공법:</strong> 구매 후 공개됩니다. 시작 전 5초 데모와 목표가 표시됩니다.</li>
        <li><strong>기본 획득:</strong> 성공 시 ${GEM[card.color].name} 할인 +1, 명성 +${card.prestige}</li>
        <li><strong>대성공:</strong> 할인 +2, 추가 명성, 각인과 시너지 보너스 가능</li>
        <li><strong>패배:</strong> 완성 실패. 균열품과 일부 부산물만 남고 상대가 파편을 더 챙깁니다.</li>
      </ul>
      ${previewHtml("내 조합", preview)}
      ${threat.activates ? previewHtml("상대가 고르면 위험", threat, true) : ""}
      <button class="primary-btn" type="button" data-action="buy" ${affordable && !state.winnerId && canControlTurn() ? "" : "disabled"}>
        세공 도전
      </button>
    </section>
  `;
}

function previewHtml(title, preview, danger = false) {
  if (!preview.items.length) return "";
  return `
    <div class="synergy-preview ${danger ? "is-danger" : ""}">
      <strong>${title}</strong>
      ${preview.items
        .slice(0, 3)
        .map((item) => `<span>${item.name}: ${item.before} → ${item.after}${item.changed ? " · 발동/강화" : ""}</span>`)
        .join("")}
    </div>
  `;
}

function mineHtml(player) {
  const offer = state.mineOffer || makeMineOffer();
  const bonus = synergyBonuses(player);
  const gain = offer.colors
    .map((color, index) => {
      const extra = index === 0 ? bonus.mineBonus || 0 : 0;
      return { color, value: (index === 0 ? 2 : 1) + extra };
    })
    .map(({ color, value }) => `<span class="gem-chip" style="${gemStyle(color)}">${GEM[color].short} ${value}</span>`)
    .join("");
  return `
    <section class="mine-panel">
      <div class="selected-title">
        <h3>이번 광맥</h3>
        <button class="ghost-btn" type="button" data-action="collect" ${state.winnerId || !canControlTurn() ? "disabled" : ""}>광맥 채굴</button>
      </div>
      <div class="mine-gems">${gain}${offer.stardust ? `<span class="gem-chip" style="${gemStyle("stardust")}">별 1</span>` : ""}</div>
      <p class="mine-principle">공개된 광맥을 가져오면 턴이 넘어갑니다. 첫 색은 2개, 나머지는 1개이며 황금 교역로 시너지가 있으면 첫 색이 증가합니다.</p>
    </section>
  `;
}

function synergyBookHtml(current, rival) {
  const currentItems = activeSynergies(current);
  const rivalItems = activeSynergies(rival);
  return `
    <section class="selected-card synergy-book">
      <div class="selected-title">
        <h3>시너지 족보</h3>
        <span class="tag">조합표</span>
      </div>
      <ul class="synergy-list">
        ${SYNERGIES.map((syn) => {
          const mine = currentItems.find((item) => item.id === syn.id);
          const theirs = rivalItems.find((item) => item.id === syn.id);
          const top = syn.levels[syn.levels.length - 1];
          return `
            <li class="${mine?.activeLevel ? "is-active" : ""} ${theirs?.activeLevel && !mine?.activeLevel ? "is-threat" : ""}">
              <strong>${syn.name}</strong>
              <span>${syn.source} · 내 ${mine?.count || 0}/${top.need} · 상대 ${theirs?.count || 0}/${top.need}</span>
              <small>${syn.levels.map((level) => `${level.need}: ${level.effect}`).join(" / ")}</small>
            </li>
          `;
        }).join("")}
      </ul>
    </section>
  `;
}

function patronHtml() {
  return `
    <section class="selected-card">
      <div class="selected-title"><h3>후원자</h3><span class="tag">명성 보너스</span></div>
      <ul class="patron-list">
        ${PATRONS.map((patron) => {
          const claimedBy = state.players.find((player) => (player.patrons || []).includes(patron.id));
          return `
            <li class="patron-item ${claimedBy ? "is-claimed" : ""}">
              <strong>${patron.name} · +${patron.reward}</strong>
              <span>${patron.text}${claimedBy ? ` · ${claimedBy.name} 획득` : ""}</span>
            </li>
          `;
        }).join("")}
      </ul>
    </section>
  `;
}

function ownedHtml(current, rival) {
  return `
    <section class="selected-card">
      <div class="selected-title"><h3>최근 획득</h3><span class="tag">결과물</span></div>
      <div class="two-column">
        <div>
          <strong>${current.name}</strong>
          ${current.cards.length ? `<ul class="owned-list">${current.cards.slice(-5).reverse().map(ownedCardHtml).join("")}</ul>` : `<p class="empty-copy">완성품 없음</p>`}
        </div>
        <div>
          <strong>${rival.name}</strong>
          ${rival.cards.length ? `<ul class="owned-list">${rival.cards.slice(-3).reverse().map(ownedCardHtml).join("")}</ul>` : `<p class="empty-copy">완성품 없음</p>`}
        </div>
      </div>
    </section>
  `;
}

function ownedCardHtml(card) {
  const outcome = OUTCOME[card.outcome || "success"];
  return `
    <li class="owned-card gem-${card.color}" style="${gemStyle(card.color)}">
      <strong>${escapeHtml(card.cracked ? `균열품: ${card.name}` : card.name)}</strong>
      <span class="grade-chip ${outcome.chip}">${outcome.label}</span>
      ${card.inscription ? `<span class="tag">${card.inscription.name}</span>` : ""}
    </li>
  `;
}

function feedHtml() {
  return `
    <section class="selected-card">
      <div class="selected-title"><h3>기록</h3><span class="tag">최근 6개</span></div>
      <ul class="feed-list">${state.feed.slice(-6).reverse().map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
  `;
}

function goalPanelHtml() {
  const [a, b] = state.players;
  return `
    <section class="goal-panel">
      <div>
        <span class="tag">최종 목표</span>
        <h2>왕실 계약 명성 ${WIN_SCORE}</h2>
        <p>명성은 카드 완성, 대성공, 후원자, 왕실 시너지로 오릅니다. 지금 필요한 명성: ${Math.max(0, WIN_SCORE - Math.max(a.prestige, b.prestige))}</p>
      </div>
      <div class="goal-track">
        <span style="--goal:${Math.min(100, (a.prestige / WIN_SCORE) * 100)}%"><b>${a.name}</b></span>
        <span style="--goal:${Math.min(100, (b.prestige / WIN_SCORE) * 100)}%"><b>${b.name}</b></span>
      </div>
    </section>
  `;
}

function winnerHtml() {
  const winner = state.players.find((player) => player.id === state.winnerId);
  return `
    <section class="winner-banner">
      <h2>${winner.name} 승리</h2>
      <span>명성 ${winner.prestige}점으로 왕실 계약을 완성했습니다.</span>
    </section>
  `;
}

function invitePanelHtml() {
  const code = escapeHtml(online.roomCode || state.roomCode || "");
  const hasGuest = Boolean(online.roomPlayers?.p2);
  return `
    <section class="invite-panel">
      <div>
        <strong>초대 코드 ${code}</strong>
        <p>${roleLabel()} · ${hasGuest ? "상대 입장 완료" : "상대 입장 대기 중"}</p>
        ${online.notice ? `<div class="copy-notice">${escapeHtml(online.notice)}</div>` : ""}
      </div>
      <div class="invite-actions">
        <button class="ghost-btn" type="button" data-action="copy-code">코드 복사</button>
        <button class="ghost-btn" type="button" data-action="copy-invite">초대문 복사</button>
      </div>
    </section>
  `;
}

function duelHtml(duel) {
  const owner = state.players.find((player) => player.id === duel.ownerId) || currentPlayer();
  const rival = state.players.find((player) => player.id === duel.rivalId) || rivalPlayer();
  const rules = MINI_GAMES[duel.game];
  return `
    <div class="duel-overlay">
      <section class="duel-shell gem-${duel.card.color}" style="${gemStyle(duel.card.color)};${artStyle(duel.card)}">
        <header class="duel-head">
          <div class="duel-title-row">
            <h2>${rules.label} · ${escapeHtml(duel.card.name)}</h2>
            <span class="tag">${GEM[duel.card.color].name} 세공</span>
          </div>
          <div class="duel-scoreboard">
            <div class="duel-score"><strong>${owner.name}</strong><span id="ownerScore">0</span></div>
            <div class="timer-ring" id="timerRing" style="--timer:0%">${duel.duration.toFixed(1)}</div>
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
                ${duel.game === "goal" ? laneControlsHtml(duel) : ""}
              </div>
              <footer class="duel-controls">
                <button class="tap-btn owner" type="button" data-duel-role="owner" ${canPressDuelRole("owner") ? "" : "disabled"}>${duel.ownerButton}</button>
                <button class="tap-btn rival" type="button" data-duel-role="rival" ${canPressDuelRole("rival") ? "" : "disabled"}>${duel.rivalButton}</button>
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
      <div class="brief-video">
        <canvas id="briefDemoCanvas" class="brief-canvas"></canvas>
        <div class="brief-progress"><span id="briefDemoBar"></span></div>
        <strong>5초 데모</strong>
      </div>
      <section class="brief-copy">
        <span class="tag">세공법 공개</span>
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
      <span class="tap-btn owner">${duel.ownerButton}</span>
      <span class="tap-btn rival">${duel.rivalButton}</span>
    </footer>
  `;
}

function sequenceControlsHtml() {
  const buttons = ["ruby", "sapphire", "topaz"];
  return `
    <div class="sequence-board">
      ${["owner", "rival"].map((role) => `
        <div class="sequence-panel">
          <strong>${role === "owner" ? "세공" : "견제"}</strong>
          <div class="sequence-buttons">
            ${buttons.map((color) => `
              <button class="sequence-btn" type="button" data-seq-role="${role}" data-seq-color="${color}" ${canPressDuelRole(role) ? "" : "disabled"} style="--seq-color:${GEM[color].fill}" aria-label="${GEM[color].name}"></button>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function laneControlsHtml(duel) {
  return `
    <div class="lane-board">
      ${["owner", "rival"].map((role) => `
        <div class="sequence-panel">
          <strong>${role === "owner" ? "세공 방향" : "방해 방향"}</strong>
          <div class="sequence-buttons">
            ${["왼쪽", "중앙", "오른쪽"].map((label, lane) => `
              <button class="lane-btn ${duel.meta?.[role + "Lane"] === lane ? "is-picked" : ""}" type="button" data-lane-role="${role}" data-lane="${lane}" ${canPressDuelRole(role) ? "" : "disabled"}>${label}</button>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function resultHtml(result) {
  const outcome = OUTCOME[result.outcome];
  return `
    <section class="result-sheet ${outcome.chip}">
      <div class="result-hero gem-${result.cardColor}" style="${gemStyle(result.cardColor)};${artStyle(result.card)}">
        <span class="card-art" aria-hidden="true"></span>
        <div>
          <span class="tag">${outcome.item}</span>
          <h2>${outcome.label}</h2>
          <p>${escapeHtml(result.itemName)}</p>
        </div>
      </div>
      <div class="result-row">
        <div class="result-stat"><strong>${result.ownerName}</strong><span>${result.ownerScore}</span></div>
        <span class="grade-chip ${outcome.chip}">${outcome.label}</span>
        <div class="result-stat"><strong>${result.rivalName}</strong><span>${result.rivalScore}</span></div>
      </div>
      <ul class="result-gain-list">
        ${result.ownerGains.map((gain) => `<li><strong>세공자 획득</strong><span>${escapeHtml(gain)}</span></li>`).join("")}
        ${result.rivalGains.map((gain) => `<li><strong>방해자 획득</strong><span>${escapeHtml(gain)}</span></li>`).join("")}
        ${result.synergyGains.map((gain) => `<li><strong>시너지</strong><span>${escapeHtml(gain)}</span></li>`).join("")}
        ${result.inscription ? `<li><strong>각인</strong><span>${result.inscription.name} · ${result.inscription.text}</span></li>` : ""}
      </ul>
      <p>${escapeHtml(result.summary)}</p>
      <button class="primary-btn" type="button" data-action="continue-result" ${canAdvanceResult() ? "" : "disabled"}>${canAdvanceResult() ? "보드로 돌아가기" : "상대 진행 대기"}</button>
    </section>
  `;
}

function collectGems() {
  if (!state || state.winnerId || state.phase !== "board" || !canControlTurn()) return;
  const player = currentPlayer();
  const offer = state.mineOffer || makeMineOffer();
  const bonus = synergyBonuses(player);
  const gains = offer.colors.map((color, index) => {
    const gain = (index === 0 ? 2 : 1) + (index === 0 ? bonus.mineBonus || 0 : 0);
    player.gems[color] += gain;
    return `${GEM[color].name}+${gain}`;
  });
  if (offer.stardust) {
    player.gems.stardust += 1;
    gains.push("별가루+1");
  }
  pushFeed(`${player.name} 광맥 채굴: ${gains.join(", ")}`);
  state.mineOffer = makeMineOffer();
  advanceTurn();
  saveGame(true);
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
  const game = chooseMiniGame(card);
  const rules = MINI_GAMES[game];
  state.phase = "duel";
  state.duel = {
    id: makeId(),
    game,
    card,
    ownerId: currentPlayer().id,
    rivalId: rivalPlayer().id,
    ownerButton: rules.ownerButton,
    rivalButton: rules.rivalButton,
    duration: rules.duration + (Math.random() * 0.8 - 0.3),
    awaitingStart: true,
    startedAtEpoch: 0,
    ownerScore: 0,
    rivalScore: 0,
    meta: setupMiniGame(game)
  };
  state.recentGames = [game, ...(state.recentGames || [])].slice(0, 4);
  saveGame(true);
  render();
}

function chooseMiniGame(card) {
  const pool = MINI_POOLS[card.color] || Object.keys(MINI_GAMES);
  const recent = new Set(state.recentGames || []);
  const fresh = pool.filter((game) => !recent.has(game));
  const candidates = fresh.length ? fresh : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function beginDuel() {
  if (state.phase !== "duel" || !state.duel || !state.duel.awaitingStart) return;
  if (!canStartDuel()) return;
  state.duel.awaitingStart = false;
  state.duel.startedAtEpoch = Date.now() + 400;
  saveGame(true);
  render();
}

function setupMiniGame(game) {
  if (game === "furnace") return { heat: 0.46, velocity: 0, stable: 0, danger: 0, combo: 0, shock: 0, lastInput: {} };
  if (game === "sequence") return { seq: Array.from({ length: 15 }, () => ["ruby", "sapphire", "topaz"][Math.floor(Math.random() * 3)]), ownerIndex: 0, rivalIndex: 0, ownerCombo: 0, rivalCombo: 0, ownerMiss: 0, rivalMiss: 0, pulse: 0, lastInput: {} };
  if (game === "tug") {
    const start = Math.random() > 0.5 ? 0.24 : -0.24;
    return { pos: start, velocity: 0, phase: 0, centerTime: 0, awayTime: 0, maxDistance: Math.abs(start), lastOutDir: Math.sign(start), lastInput: {} };
  }
  if (game === "ricochet") return { aim: -0.58, aimDir: 1, wind: 0, guard: 0.5, shots: [], hit: 0, blocked: 0, near: 0, lastInput: {} };
  if (game === "rhythm") return { notes: [0.82, 1.27, 1.74, 2.25, 2.77, 3.18, 3.66, 4.11, 4.64, 5.1, 5.55, 6.08, 6.55, 7.08, 7.58], ownerHits: {}, rivalHits: {}, ownerCombo: 0, rivalCombo: 0, ownerMiss: 0, rivalMiss: 0, lastInput: {} };
  if (game === "mover") return { oreX: 0.12, oreY: 0.52, vx: 0.02, vy: 0, destPole: 1, orePole: -1, delivered: 0, repelTime: 0, overload: 0, rivalSwitches: [], fieldPulse: 0, lastInput: {} };
  if (game === "hockey") return { puckX: 0.5, puckY: 0.5, vx: 0.36, vy: 0.22, ownerPad: 0.5, rivalPad: 0.5, ownerGoal: 0, rivalGoal: 0, itemX: 0.5, itemY: 0.5, item: "boost", ownerItem: null, rivalItem: null, lastInput: {} };
  if (game === "mining") return { drill: 0.1, drillDir: 1, crack: 0.58, progress: 0, dull: 0, rubble: 0, hits: 0, misses: 0, lastInput: {} };
  if (game === "fortress") return { angle: 0.57, angleDir: 1, power: 0.62, powerDir: 1, wind: 0, shield: 0.58, shells: [], coreHp: 100, hit: 0, near: 0, block: 0, lastInput: {} };
  if (game === "chase") return { runner: 0.18, hunter: 0.72, ownerVel: 0, rivalVel: 0, safeTime: 0, tagTime: 0, swapAt: 4.2, swapped: false, lastInput: {} };
  if (game === "fishing") {
    return {
      hookX: 0.5,
      hookY: 0.08,
      hookV: 0,
      cast: false,
      reeling: false,
      current: 0,
      caught: 0,
      bigCaught: 0,
      overheat: 0,
      rivalSwitches: [],
      fish: Array.from({ length: 13 }, (_, index) => ({
        x: Math.random(),
        y: 0.24 + Math.random() * 0.58,
        speed: 0.13 + Math.random() * 0.18,
        size: index % 5 === 0 ? 1.45 : 1,
        caught: false,
        dir: Math.random() > 0.5 ? 1 : -1
      })),
      lastInput: {}
    };
  }
  return { round: 0, timer: 1.15, ownerLane: 1, rivalLane: 1, ownerGoals: 0, rivalGoals: 0, saves: 0, last: "준비", nextRole: "세공자 슈터", ballX: 0.5, ballY: 0.7, lastInput: {} };
}

function startDuelLoop() {
  const duel = state?.duel;
  if (!duel || duel.awaitingStart) return;
  if (activeLoopId === duel.id && loopTimer) return;
  cancelDuelLoop();
  activeLoopId = duel.id;
  let lastAt = performance.now();
  const frame = () => {
    if (!state?.duel || state.duel.id !== activeLoopId || state.phase !== "duel") {
      cancelDuelLoop();
      return;
    }
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastAt) / 1000);
    lastAt = now;
    const duelNow = state.duel;
    const elapsed = Math.max(0, (Date.now() - duelNow.startedAtEpoch) / 1000);
    updateMiniGame(duelNow, dt, elapsed);
    drawMiniGame(duelNow, elapsed);
    updateDuelHud(duelNow, elapsed);
    if ((duelNow.game === "fortress" && duelNow.meta.coreHp <= 0) || elapsed >= duelNow.duration) {
      finishDuel();
      return;
    }
    loopTimer = setTimeout(frame, 16);
  };
  loopTimer = setTimeout(frame, 16);
}

function cancelDuelLoop() {
  if (loopTimer) clearTimeout(loopTimer);
  loopTimer = null;
  activeLoopId = "";
}

function cancelLoops() {
  cancelDuelLoop();
  cancelBriefDemo();
}

function handleDuelInput(role, payload = {}) {
  if (!state || state.phase !== "duel" || !state.duel || state.duel.awaitingStart) return;
  if (!canPressDuelRole(role)) return;
  const duel = state.duel;
  const meta = duel.meta;
  if (!inputReady(meta, role, inputCooldownFor(duel.game, role))) return;

  if (duel.game === "furnace") {
    if (role === "owner") meta.velocity += 0.5;
    else {
      meta.velocity += Math.random() > 0.5 ? 0.4 : -0.3;
      meta.shock = 0.2;
    }
  }
  if (duel.game === "sequence") handleSequenceInput(duel, role, payload.color);
  if (duel.game === "tug") {
    const goodPulse = Math.sin(meta.phase) > 0.1;
    const power = goodPulse ? 0.58 : 0.24;
    if (role === "owner") {
      meta.velocity += -meta.pos * power * 2.05;
      meta.velocity *= 0.76;
    } else {
      const dir = Math.abs(meta.pos) < 0.08 ? meta.lastOutDir || 1 : Math.sign(meta.pos);
      meta.lastOutDir = dir || 1;
      meta.velocity += meta.lastOutDir * power;
    }
  }
  if (duel.game === "ricochet") {
    if (role === "owner" && meta.shots.length < 3) meta.shots.push({ x: 0.5, y: 0.91, vx: meta.aim * 0.9, vy: -1.25, life: 0 });
    if (role === "rival") {
      meta.guard = clamp(meta.guard + (Math.random() > 0.5 ? 0.14 : -0.14), 0.16, 0.84);
      meta.wind += (Math.random() > 0.5 ? 1 : -1) * 0.065;
    }
  }
  if (duel.game === "rhythm") handleRhythmInput(duel, role);
  if (duel.game === "mover") {
    if (role === "owner") {
      meta.destPole *= -1;
      meta.fieldPulse = 1;
    } else {
      const now = performance.now();
      meta.rivalSwitches = (meta.rivalSwitches || []).filter((time) => now - time < 1550);
      if (meta.overload > 0 || meta.rivalSwitches.length >= 3) {
        meta.overload = Math.max(meta.overload, 1.15);
      } else {
        meta.orePole *= -1;
        meta.rivalSwitches.push(now);
        meta.fieldPulse = -1;
      }
    }
  }
  if (duel.game === "hockey") {
    if (role === "owner") hockeyStrike(meta, "owner");
    else hockeyStrike(meta, "rival");
  }
  if (duel.game === "mining") {
    if (role === "owner") miningHit(meta);
    else meta.rubble = Math.min(1, meta.rubble + 0.32);
  }
  if (duel.game === "fortress") {
    if (role === "owner" && meta.shells.length < 2) {
      const speed = 1.02 + meta.power * 0.76;
      meta.shells.push({
        x: 0.13,
        y: 0.78,
        vx: Math.cos(meta.angle) * speed,
        vy: -Math.sin(meta.angle) * speed,
        trail: [],
        life: 0
      });
    }
    if (role === "rival") {
      meta.shield = clamp(meta.shield + (Math.random() > 0.5 ? 0.16 : -0.16), 0.22, 0.82);
      meta.wind += (Math.random() > 0.5 ? 1 : -1) * 0.08;
    }
  }
  if (duel.game === "chase") {
    if (role === "owner") meta.ownerVel += meta.swapped ? 0.32 : -0.32;
    else meta.rivalVel += meta.swapped ? -0.35 : 0.35;
  }
  if (duel.game === "goal" && Number.isFinite(payload.lane)) {
    meta[role + "Lane"] = clamp(payload.lane, 0, 2);
  }
  if (duel.game === "fishing") {
    if (role === "owner") {
      if (!meta.cast) {
        meta.cast = true;
        meta.hookV = 0.62;
      } else {
        meta.reeling = true;
      }
    } else {
      const now = performance.now();
      meta.rivalSwitches = (meta.rivalSwitches || []).filter((time) => now - time < 1500);
      if (meta.overheat > 0 || meta.rivalSwitches.length >= 3) {
        meta.overheat = Math.max(meta.overheat, 1.1);
      } else {
        meta.current += Math.random() > 0.5 ? 0.12 : -0.12;
        meta.rivalSwitches.push(now);
      }
    }
  }
  syncOnline(false);
}

function inputCooldownFor(game, role) {
  if (game === "sequence" || game === "goal") return 0.08;
  if (game === "fortress" && role === "owner") return 0.72;
  if (game === "fishing" && role === "owner") return 0.32;
  if (game === "mover" && role === "rival") return 0.2;
  return 0.18;
}

function inputReady(meta, role, cooldown) {
  meta.lastInput ||= {};
  const now = performance.now();
  if (now - (meta.lastInput[role] || 0) < cooldown * 1000) return false;
  meta.lastInput[role] = now;
  return true;
}

function handleSequenceInput(duel, role, color) {
  if (!color) return;
  const meta = duel.meta;
  const indexKey = role === "owner" ? "ownerIndex" : "rivalIndex";
  const comboKey = role === "owner" ? "ownerCombo" : "rivalCombo";
  const missKey = role === "owner" ? "ownerMiss" : "rivalMiss";
  const expected = meta.seq[meta[indexKey] % meta.seq.length];
  if (color === expected) {
    meta[indexKey]++;
    meta[comboKey]++;
    meta.pulse = 1;
  } else {
    meta[comboKey] = 0;
    meta[missKey]++;
    meta.pulse = -1;
  }
  recalcSequenceScore(duel);
}

function recalcSequenceScore(duel) {
  const meta = duel.meta;
  duel.ownerScore = Math.max(0, meta.ownerIndex * 8 + meta.ownerCombo * 2 - meta.ownerMiss * 4);
  duel.rivalScore = Math.max(0, meta.rivalIndex * 7 + meta.rivalCombo * 1.8 - meta.rivalMiss * 3);
}

function handleRhythmInput(duel, role) {
  const meta = duel.meta;
  const elapsed = Math.max(0, (Date.now() - duel.startedAtEpoch) / 1000);
  const hitMap = role === "owner" ? meta.ownerHits : meta.rivalHits;
  const otherMap = role === "owner" ? meta.rivalHits : meta.ownerHits;
  const comboKey = role === "owner" ? "ownerCombo" : "rivalCombo";
  const missKey = role === "owner" ? "ownerMiss" : "rivalMiss";
  const bonus = role === "owner" ? synergyBonuses(state.players.find((player) => player.id === duel.ownerId)).rhythmWindow || 0 : 0;
  let bestIndex = -1;
  let bestDelta = 999;
  meta.notes.forEach((time, index) => {
    if (hitMap[index] || otherMap[index] === "locked") return;
    const delta = Math.abs(time - elapsed);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  });
  if (bestDelta <= 0.1 + bonus) {
    hitMap[bestIndex] = role === "owner" ? "perfect" : "locked";
    meta[comboKey]++;
  } else if (bestDelta <= 0.21 + bonus) {
    hitMap[bestIndex] = role === "owner" ? "great" : "locked";
    meta[comboKey]++;
  } else {
    meta[comboKey] = 0;
    meta[missKey]++;
  }
  recalcRhythmScore(duel);
}

function recalcRhythmScore(duel) {
  const meta = duel.meta;
  const ownerHits = Object.values(meta.ownerHits).filter(Boolean);
  const rivalLocks = Object.values(meta.rivalHits).filter(Boolean).length;
  duel.ownerScore = ownerHits.reduce((sum, hit) => sum + (hit === "perfect" ? 12 : 7), 0) + meta.ownerCombo * 1.7 - meta.ownerMiss * 4;
  duel.rivalScore = rivalLocks * 6 + meta.rivalCombo * 1.2 - meta.rivalMiss * 2;
}

function hockeyStrike(meta, role) {
  const isOwner = role === "owner";
  const padY = isOwner ? 0.84 : 0.16;
  const near = Math.abs(meta.puckY - padY) < 0.15;
  const pad = isOwner ? meta.ownerPad : meta.rivalPad;
  const aligned = Math.abs(meta.puckX - pad) < 0.2;
  if (!near || !aligned) {
    if (isOwner) meta.ownerPad = clamp(meta.ownerPad + (Math.random() > 0.5 ? 0.18 : -0.18), 0.12, 0.88);
    else meta.rivalPad = clamp(meta.rivalPad + (Math.random() > 0.5 ? 0.18 : -0.18), 0.12, 0.88);
    return;
  }
  const itemKey = isOwner ? "ownerItem" : "rivalItem";
  const boost = meta[itemKey] === "boost" ? 1.55 : 1;
  meta.vx += (meta.puckX - pad) * 1.1;
  meta.vy = (isOwner ? -1 : 1) * 0.9 * boost;
  meta[itemKey] = null;
}

function miningHit(meta) {
  const accuracy = Math.abs(meta.drill - meta.crack);
  if (accuracy < 0.075 && meta.rubble < 0.82) {
    meta.progress += 0.18 + (0.075 - accuracy);
    meta.hits++;
  } else {
    meta.dull += 0.18;
    meta.misses++;
  }
}

function updateMiniGame(duel, dt, elapsed) {
  const meta = duel.meta;
  if (duel.game === "furnace") {
    meta.velocity -= 0.24 * dt;
    meta.velocity *= 0.91;
    meta.heat = clamp(meta.heat + meta.velocity * dt - 0.05 * dt, 0.04, 1.06);
    meta.shock = Math.max(0, meta.shock - dt);
    const stable = meta.heat > 0.5 && meta.heat < 0.73;
    const danger = meta.heat > 0.86 || meta.heat < 0.16;
    if (stable) {
      meta.stable += dt;
      meta.combo += dt;
    } else meta.combo = 0;
    if (danger) meta.danger += dt;
    duel.ownerScore = meta.stable * 18 + meta.combo * 3;
    duel.rivalScore = meta.danger * 21 + Math.abs(meta.heat - 0.62) * 12;
  }
  if (duel.game === "sequence") {
    meta.pulse *= 0.92;
    recalcSequenceScore(duel);
  }
  if (duel.game === "tug") {
    meta.phase += dt * 5.2;
    meta.velocity += (Math.sin(elapsed * 1.7) * 0.24 + Math.sin(elapsed * 3.9) * 0.08) * dt;
    meta.velocity += -meta.pos * 0.28 * dt;
    meta.velocity *= 0.956;
    meta.pos = clamp(meta.pos + meta.velocity * dt, -1, 1);
    const distance = Math.abs(meta.pos);
    const closeness = clamp(1 - distance / 0.72, 0, 1);
    meta.maxDistance = Math.max(meta.maxDistance, distance);
    if (distance < 0.18) meta.centerTime += dt;
    if (distance > 0.52) meta.awayTime += dt;
    duel.ownerScore = meta.centerTime * 18 + Math.pow(closeness, 1.4) * 22;
    duel.rivalScore = meta.awayTime * 22 + Math.pow(distance, 1.2) * 35;
  }
  if (duel.game === "ricochet") updateRicochet(duel, dt, elapsed);
  if (duel.game === "rhythm") {
    const missed = meta.notes.filter((time, index) => elapsed - time > 0.3 && !meta.ownerHits[index] && !meta.rivalHits[index]).length;
    duel.rivalScore += missed * dt * 0.45;
    recalcRhythmScore(duel);
  }
  if (duel.game === "mover") updateMover(duel, dt);
  if (duel.game === "hockey") updateHockey(duel, dt);
  if (duel.game === "mining") updateMining(duel, dt, elapsed);
  if (duel.game === "fortress") updateFortress(duel, dt);
  if (duel.game === "chase") updateChase(duel, dt, elapsed);
  if (duel.game === "goal") updateGoal(duel, dt);
  if (duel.game === "fishing") updateFishing(duel, dt);
}

function updateRicochet(duel, dt, elapsed) {
  const meta = duel.meta;
  meta.aim += meta.aimDir * dt * 1.08;
  if (meta.aim > 0.78 || meta.aim < -0.78) meta.aimDir *= -1;
  meta.wind *= 0.985;
  meta.guard = clamp(meta.guard + Math.sin(elapsed * 1.8) * dt * 0.1, 0.16, 0.84);
  const target = movingTarget(elapsed);
  meta.shots.forEach((shot) => {
    shot.life += dt;
    shot.vx += meta.wind * dt;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.vy += 0.9 * dt;
    if (shot.x < 0.05 || shot.x > 0.95) shot.vx *= -0.84;
    shot.x = clamp(shot.x, 0.05, 0.95);
    const dx = shot.x - target.x;
    const dy = shot.y - target.y;
    const guardHit = Math.abs(shot.x - meta.guard) < 0.11 && shot.y > 0.43 && shot.y < 0.58;
    if (Math.hypot(dx, dy) < 0.08) {
      shot.done = true;
      meta.hit++;
    } else if (Math.hypot(dx, dy) < 0.15) meta.near += dt;
    if (guardHit) {
      shot.done = true;
      meta.blocked++;
    }
    if (shot.y > 1.05 || shot.life > 3.5) shot.done = true;
  });
  meta.shots = meta.shots.filter((shot) => !shot.done);
  duel.ownerScore = meta.hit * 30 + meta.near * 6;
  duel.rivalScore = meta.blocked * 14 + Math.abs(meta.wind) * 18;
}

function updateMover(duel, dt) {
  const meta = duel.meta;
  const targetX = 0.86;
  const targetY = 0.5;
  const attracting = meta.destPole !== meta.orePole;
  const dx = targetX - meta.oreX;
  const dy = targetY - meta.oreY;
  const distance = Math.max(0.06, Math.hypot(dx, dy));
  const force = (attracting ? 0.62 : -0.44) / (0.55 + distance);
  meta.vx += (dx / distance) * force * dt;
  meta.vy += (dy / distance) * force * dt;
  meta.vy += Math.sin(Date.now() / 330) * dt * 0.06;
  meta.overload = Math.max(0, meta.overload - dt);
  meta.fieldPulse *= 0.9;
  meta.oreX += meta.vx * dt;
  meta.oreY += meta.vy * dt;
  meta.vx *= 0.964;
  meta.vy *= 0.964;
  if (meta.oreY < 0.2 || meta.oreY > 0.8) meta.vy *= -0.58;
  meta.oreY = clamp(meta.oreY, 0.18, 0.82);
  if (meta.oreX < 0.07) {
    meta.oreX = 0.07;
    meta.vx = Math.abs(meta.vx) * 0.48;
    meta.repelTime += dt;
  }
  if (meta.oreX > 0.92 && Math.abs(meta.oreY - targetY) < 0.14) {
    meta.delivered++;
    meta.oreX = 0.12;
    meta.oreY = 0.42 + Math.random() * 0.18;
    meta.vx = 0.03;
    meta.orePole = Math.random() > 0.5 ? 1 : -1;
    meta.destPole = -meta.orePole;
  }
  duel.ownerScore = meta.delivered * 38 + meta.oreX * 34 + (attracting ? 5 : 0) + meta.overload * 6;
  duel.rivalScore = meta.repelTime * 18 + Math.max(0, 0.42 - meta.oreX) * 22 + (attracting ? 0 : 8);
}

function updateHockey(duel, dt) {
  const meta = duel.meta;
  meta.ownerPad = clamp(meta.ownerPad + Math.sin(Date.now() / 410) * dt * 0.18, 0.12, 0.88);
  meta.rivalPad = clamp(meta.rivalPad + Math.cos(Date.now() / 380) * dt * 0.18, 0.12, 0.88);
  meta.puckX += meta.vx * dt;
  meta.puckY += meta.vy * dt;
  if (meta.puckX < 0.06 || meta.puckX > 0.94) meta.vx *= -0.9;
  meta.puckX = clamp(meta.puckX, 0.06, 0.94);
  if (meta.puckY > 0.92) {
    const inGate = Math.abs(meta.puckX - 0.5) < 0.13;
    if (inGate) meta.rivalGoal++;
    resetPuck(meta, -1);
  }
  if (meta.puckY < 0.08) {
    const inGate = Math.abs(meta.puckX - 0.5) < 0.19;
    if (inGate) meta.ownerGoal++;
    resetPuck(meta, 1);
  }
  if (Math.hypot(meta.puckX - meta.itemX, meta.puckY - meta.itemY) < 0.08) {
    if (meta.puckY > 0.5) meta.ownerItem = meta.item;
    else meta.rivalItem = meta.item;
    meta.itemX = 0.2 + Math.random() * 0.6;
    meta.itemY = 0.32 + Math.random() * 0.36;
  }
  duel.ownerScore = meta.ownerGoal * 35 + (meta.ownerItem ? 5 : 0);
  duel.rivalScore = meta.rivalGoal * 32 + (meta.rivalItem ? 5 : 0);
}

function resetPuck(meta, dir) {
  meta.puckX = 0.5;
  meta.puckY = 0.5;
  meta.vx = (Math.random() - 0.5) * 0.6;
  meta.vy = dir * (0.42 + Math.random() * 0.2);
}

function updateMining(duel, dt, elapsed) {
  const meta = duel.meta;
  meta.drill += meta.drillDir * dt * 0.36;
  if (meta.drill > 0.92 || meta.drill < 0.08) meta.drillDir *= -1;
  meta.crack = 0.5 + Math.sin(elapsed * 1.25) * 0.26;
  meta.rubble = Math.max(0, meta.rubble - dt * 0.18);
  meta.progress = Math.min(1.08, meta.progress + dt * 0.018);
  duel.ownerScore = meta.progress * 70 + meta.hits * 6 - meta.dull * 8;
  duel.rivalScore = meta.rubble * 22 + meta.misses * 4 + Math.max(0, 0.9 - meta.progress) * 6;
}

function updateFortress(duel, dt) {
  const meta = duel.meta;
  meta.angle += meta.angleDir * dt * 0.36;
  if (meta.angle > 0.95 || meta.angle < 0.32) meta.angleDir *= -1;
  meta.power += meta.powerDir * dt * 0.28;
  if (meta.power > 0.95 || meta.power < 0.34) meta.powerDir *= -1;
  meta.wind *= 0.986;
  meta.shells.forEach((shell) => {
    shell.life += dt;
    shell.trail.push({ x: shell.x, y: shell.y });
    if (shell.trail.length > 22) shell.trail.shift();
    shell.vx += meta.wind * dt;
    shell.x += shell.vx * dt;
    shell.y += shell.vy * dt;
    shell.vy += 1.08 * dt;
    const core = { x: 0.82, y: 0.54 };
    const shieldHit = Math.abs(shell.x - meta.shield) < 0.08 && shell.y > 0.42 && shell.y < 0.72;
    const dist = Math.hypot(shell.x - core.x, shell.y - core.y);
    if (dist < 0.075) {
      shell.done = true;
      meta.hit++;
      meta.coreHp = Math.max(0, meta.coreHp - 34);
    } else if (dist < 0.16) {
      meta.near += dt;
      meta.coreHp = Math.max(0, meta.coreHp - 10 * dt);
    }
    if (shieldHit) {
      shell.done = true;
      meta.block++;
    }
    if (shell.y > 1.05 || shell.x > 1.05 || shell.life > 3.2) shell.done = true;
  });
  meta.shells = meta.shells.filter((shell) => !shell.done);
  duel.ownerScore = (100 - meta.coreHp) * 0.9 + meta.hit * 16 + meta.near * 8;
  duel.rivalScore = meta.block * 16 + Math.abs(meta.wind) * 18;
}

function updateChase(duel, dt, elapsed) {
  const meta = duel.meta;
  meta.swapped = elapsed >= meta.swapAt;
  meta.runner += (meta.swapped ? meta.rivalVel : meta.ownerVel) * dt;
  meta.hunter += (meta.swapped ? meta.ownerVel : meta.rivalVel) * dt;
  meta.runner = wrap01(meta.runner);
  meta.hunter = wrap01(meta.hunter);
  meta.ownerVel *= 0.92;
  meta.rivalVel *= 0.92;
  const dist = circularDistance(meta.runner, meta.hunter);
  if (dist > 0.26) meta.safeTime += dt;
  if (dist < 0.09) meta.tagTime += dt;
  duel.ownerScore = meta.safeTime * 18 + (meta.swapped ? meta.tagTime * 6 : 0);
  duel.rivalScore = meta.tagTime * 21 + (meta.swapped ? 0 : Math.max(0, 0.16 - dist) * 35);
}

function updateGoal(duel, dt) {
  const meta = duel.meta;
  meta.timer -= dt;
  if (meta.timer > 0) return;
  const ownerShoots = meta.round % 2 === 0 || meta.round === 4;
  const shotLane = ownerShoots ? meta.ownerLane : meta.rivalLane;
  const guardLane = ownerShoots ? meta.rivalLane : meta.ownerLane;
  const goal = shotLane !== guardLane;
  if (ownerShoots) {
    if (goal) {
      meta.ownerGoals++;
      meta.last = "세공자 골";
    } else {
      meta.saves++;
      meta.last = "방해자 선방";
    }
  } else if (goal) {
    meta.rivalGoals++;
    meta.last = "방해자 역습 골";
  } else {
    meta.saves++;
    meta.last = "세공자 선방";
  }
  meta.ballX = [0.24, 0.5, 0.76][shotLane];
  meta.ballY = ownerShoots ? 0.26 : 0.74;
  meta.round++;
  meta.nextRole = meta.round % 2 === 0 || meta.round === 4 ? "세공자 슈터" : "방해자 슈터";
  meta.timer = 1.05 + Math.random() * 0.35;
  duel.ownerScore = meta.ownerGoals * 26 + (meta.saves && !ownerShoots ? 7 : 0) + Math.min(10, meta.round);
  duel.rivalScore = meta.rivalGoals * 25 + (meta.saves && ownerShoots ? 7 : 0);
}

function updateFishing(duel, dt) {
  const meta = duel.meta;
  meta.current *= 0.985;
  meta.overheat = Math.max(0, meta.overheat - dt);
  if (meta.cast) {
    meta.hookY += meta.hookV * dt;
    meta.hookX = clamp(meta.hookX + meta.current * dt * 0.8, 0.12, 0.88);
    if (meta.hookY > 0.86) {
      meta.reeling = true;
      meta.hookV = -0.48;
    }
    if (meta.reeling) meta.hookV = -0.55;
    if (meta.hookY < 0.08 && meta.reeling) {
      meta.hookY = 0.08;
      meta.hookV = 0;
    }
  } else {
    meta.hookX = 0.5 + Math.sin(Date.now() / 620) * 0.08;
  }
  meta.fish.forEach((fish) => {
    if (fish.caught) return;
    fish.x += fish.dir * fish.speed * dt + meta.current * dt * 0.22;
    if (fish.x > 1.06) fish.x = -0.06;
    if (fish.x < -0.06) fish.x = 1.06;
    fish.y += Math.sin(Date.now() / 480 + fish.x * 7) * dt * 0.025;
    const caught = meta.cast && Math.hypot(fish.x - meta.hookX, fish.y - meta.hookY) < 0.055 * fish.size;
    if (caught) {
      fish.caught = true;
      meta.caught++;
      if (fish.size > 1.2) meta.bigCaught++;
    }
  });
  duel.ownerScore = meta.caught * 12 + meta.bigCaught * 10 + (meta.reeling ? 4 : 0) + meta.overheat * 5;
  duel.rivalScore = Math.abs(meta.current) * 18 + meta.fish.filter((fish) => !fish.caught && fish.y > 0.3 && fish.y < 0.75).length * 0.35;
}

function finishDuel() {
  if (online.mode === "online" && state?.duel && state.duel.ownerId !== myPlayerId()) return;
  const duel = state.duel;
  if (!duel) return;
  cancelDuelLoop();
  finalizeMiniScores(duel);

  const owner = state.players.find((player) => player.id === duel.ownerId);
  const rival = state.players.find((player) => player.id === duel.rivalId);
  const ownerBonus = miniBonus(owner, duel.card.color, duel.game);
  const rivalBonus = sabotageBonus(rival, duel.card.color, duel.game);
  const shield = shieldBonus(owner);
  const ownerScore = Math.max(0, Math.round(duel.ownerScore + ownerBonus));
  const rivalScore = Math.max(0, Math.round(duel.rivalScore + rivalBonus - shield));
  const diff = ownerScore - rivalScore;
  const outcome = outcomeFromDiff(diff, ownerScore);
  const result = applyDuelResult(owner, rival, duel.card, outcome, ownerScore, rivalScore);

  removeAndRefillCard(duel.card);
  checkPatrons(owner);
  checkPatrons(rival);
  checkWinner();

  const summary = `${owner.name}: ${OUTCOME[outcome].label} · ${result.itemName}. ${rival.name}: ${result.rivalGains.join(", ")}`;
  pushFeed(summary);

  state.phase = "result";
  state.pendingResult = {
    ...result,
    ownerName: owner.name,
    rivalName: rival.name,
    ownerScore,
    rivalScore,
    outcome,
    summary
  };
  state.duel = null;
  saveGame(true);
  render();
}

function finalizeMiniScores(duel) {
  const meta = duel.meta;
  if (duel.game === "furnace") {
    duel.ownerScore += Math.max(0, 22 - Math.abs(meta.heat - 0.62) * 58);
    duel.rivalScore += meta.danger * 8;
  }
  if (duel.game === "tug") {
    const finalDistance = Math.abs(meta.pos);
    duel.ownerScore += Math.max(0, 24 - finalDistance * 34);
    duel.rivalScore += meta.maxDistance * 24;
  }
  if (duel.game === "mining" && meta.progress >= 1) duel.ownerScore += 24;
  if (duel.game === "chase" && meta.safeTime > meta.tagTime) duel.ownerScore += 12;
  if (duel.game === "goal" && meta.ownerGoals >= meta.rivalGoals) duel.ownerScore += 8;
  if (duel.game === "fortress" && meta.coreHp <= 0) duel.ownerScore += 22;
  if (duel.game === "fishing" && meta.caught >= 5) duel.ownerScore += 12;
}

function outcomeFromDiff(diff, ownerScore = 0) {
  if (diff >= 42 && ownerScore >= 72) return "great";
  if (diff >= -4) return "success";
  return "fail";
}

function applyDuelResult(owner, rival, card, outcome, ownerScore, rivalScore) {
  const ownerGains = [];
  const rivalGains = [];
  const synergyGains = [];
  let inscription = null;
  const bonuses = synergyBonuses(owner);
  const owned = { ...card, outcome, completedAt: Date.now(), cracked: outcome === "fail" };

  if (outcome === "great") {
    inscription = drawInscription(card.color, owner);
    owned.inscription = inscription;
    owner.cards.push(owned);
    owner.discounts[card.color] = (owner.discounts[card.color] || 0) + 2;
    owner.prestige += card.prestige + 1 + (bonuses.prestigeOnSuccess || 0) + (bonuses.prestigeOnGreat || 0);
    if (inscription?.kind === "prestige") owner.prestige += inscription.value;
    if (inscription?.kind === "discountAny") owner.anyDiscount += inscription.value;
    if (inscription?.kind === "discountColor") owner.discounts[inscription.color] += inscription.value;
    if (bonuses.stardustOnGreat) {
      owner.gems.stardust += bonuses.stardustOnGreat;
      synergyGains.push(`별가루 +${bonuses.stardustOnGreat}`);
    }
    ownerGains.push(`${card.name} 대성공 완성`);
    ownerGains.push(`S급 특별 능력: ${inscription.name}`);
    ownerGains.push(`${GEM[card.color].name} 할인 +2, 명성 +${card.prestige + 1}`);
  } else if (outcome === "success") {
    owner.cards.push(owned);
    owner.discounts[card.color] = (owner.discounts[card.color] || 0) + 1;
    owner.prestige += card.prestige + (bonuses.prestigeOnSuccess || 0);
    ownerGains.push(`${card.name} 완성`);
    ownerGains.push(`${GEM[card.color].name} 할인 +1, 명성 +${card.prestige}`);
  } else {
    owner.cards.push(owned);
    owner.gems[card.color] = (owner.gems[card.color] || 0) + 1;
    ownerGains.push(`균열품: ${card.name}`);
    ownerGains.push(`${GEM[card.color].name} 부산물 +1`);
  }

  if (bonuses.fragmentOnSuccess && outcome !== "fail") {
    owner.gems[card.color] += bonuses.fragmentOnSuccess;
    synergyGains.push(`${GEM[card.color].name} 파편 +${bonuses.fragmentOnSuccess}`);
  }

  const rivalBase = outcome === "great" ? 1 : outcome === "success" ? 2 : 4;
  const boost = rival.cards.reduce((sum, item) => sum + (item.inscription?.kind === "fragmentBoost" ? item.inscription.value : 0), 0);
  const rivalGain = rivalBase + boost;
  rival.gems[card.color] = (rival.gems[card.color] || 0) + rivalGain;
  rivalGains.push(`${GEM[card.color].name} 파편 +${rivalGain}`);
  if (outcome === "fail" || rivalScore - ownerScore > 30) {
    rival.gems.stardust += 1;
    rivalGains.push("별가루 +1");
  }

  const milestoneGains = applySynergyMilestones(owner);
  synergyGains.push(...milestoneGains);

  return {
    card,
    cardColor: card.color,
    itemName: outcome === "fail" ? `균열품: ${card.name}` : card.name,
    ownerGains,
    rivalGains,
    synergyGains,
    inscription
  };
}

function applySynergyMilestones(player) {
  const gains = [];
  player.synergyClaims ||= [];
  activeSynergies(player).forEach((item) => {
    item.levels.forEach((level, index) => {
      if (item.count < level.need) return;
      const claimId = `${item.id}:${level.need}`;
      if (player.synergyClaims.includes(claimId)) return;
      player.synergyClaims.push(claimId);
      if (item.id === "royal") {
        player.prestige += index === 0 ? 1 : 2;
        gains.push(`${item.name} ${level.need} 발동 · 명성 +${index === 0 ? 1 : 2}`);
      } else if (item.id === "prism" && index === 0) {
        gains.push(`${item.name} ${level.need} 발동 · 모든 구매 비용 -1`);
      } else {
        gains.push(`${item.name} ${level.need} 발동`);
      }
    });
  });
  return gains;
}

function continueAfterResult() {
  if (state.phase !== "result") return;
  if (!canAdvanceResult()) return;
  state.pendingResult = null;
  state.phase = "board";
  if (!state.winnerId) advanceTurn();
  saveGame(true);
  render();
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

function activeSynergies(player, extraCard = null) {
  return SYNERGIES.map((syn) => {
    const count = synergyCount(player, syn, extraCard);
    const levelIndex = syn.levels.reduce((found, level, index) => (count >= level.need ? index : found), -1);
    return { ...syn, count, levelIndex, activeLevel: levelIndex >= 0 ? syn.levels[levelIndex] : null, levels: syn.levels };
  });
}

function synergyCount(player, syn, extraCard = null) {
  const cards = [...(player.cards || []).filter((card) => !card.cracked), ...(extraCard ? [extraCard] : [])];
  if (syn.type === "colors") return new Set(cards.map((card) => card.color).filter((color) => GEM_KEYS.includes(color))).size;
  return cards.filter((card) => (card.tags || []).some((tag) => syn.tags.includes(tag))).length;
}

function synergyPreview(player, card) {
  const before = activeSynergies(player);
  const after = activeSynergies(player, card);
  const items = after
    .map((item) => {
      const old = before.find((candidate) => candidate.id === item.id);
      const changed = item.levelIndex > (old?.levelIndex ?? -1);
      return { id: item.id, name: item.name, before: old?.count || 0, after: item.count, changed };
    })
    .filter((item) => item.after > item.before || item.changed);
  const delta = items.reduce((sum, item) => sum + (item.after - item.before), 0);
  const activates = items.some((item) => item.changed);
  return { delta, activates, items };
}

function synergyBonuses(player, extraCard = null) {
  const total = { game: {} };
  activeSynergies(player, extraCard).forEach((syn) => {
    if (!syn.activeLevel?.bonus) return;
    mergeBonus(total, syn.activeLevel.bonus);
  });
  return total;
}

function mergeBonus(total, bonus) {
  Object.entries(bonus).forEach(([key, value]) => {
    if (key === "game") {
      Object.entries(value).forEach(([game, amount]) => {
        total.game[game] = (total.game[game] || 0) + amount;
      });
    } else if (Array.isArray(value)) {
      total[key] = [...(total[key] || []), ...value];
    } else {
      total[key] = (total[key] || 0) + value;
    }
  });
}

function canAfford(player, card) {
  return Object.entries(effectiveCost(player, card)).every(([color, value]) => (player.gems[color] || 0) >= value);
}

function effectiveCost(player, card) {
  const bonus = synergyBonuses(player);
  const cost = {};
  Object.entries(card.cost).forEach(([color, value]) => {
    const colorDiscount = color === "stardust" ? 0 : player.discounts[color] || 0;
    const anyDiscount = (player.anyDiscount || 0) + (bonus.costAny || 0);
    cost[color] = Math.max(0, value - colorDiscount - anyDiscount);
  });
  return cost;
}

function payCost(player, card) {
  Object.entries(effectiveCost(player, card)).forEach(([color, value]) => {
    player.gems[color] -= value;
  });
}

function drawInscription(color, player) {
  const existing = new Set(player.cards.map((card) => card.inscription?.id).filter(Boolean));
  const pool = [...(COLOR_INSCRIPTIONS[color] || []), ...COMMON_INSCRIPTIONS].filter((item) => !existing.has(item.id));
  return { ...(pool[Math.floor(Math.random() * pool.length)] || COMMON_INSCRIPTIONS[0]) };
}

function miniBonus(player, color, game) {
  const synergy = synergyBonuses(player);
  return player.cards.reduce((sum, card) => {
    const ins = card.inscription;
    if (!ins) return sum;
    if (ins.kind === "mini") return sum + ins.value;
    if (ins.kind === "game" && ins.game === game) return sum + ins.value;
    if (ins.kind === "discountColor" && ins.color === color) return sum;
    return sum;
  }, (synergy.ownerScore || 0) + (synergy.game?.[game] || 0));
}

function sabotageBonus(player, color, game) {
  const synergy = synergyBonuses(player);
  return player.cards.reduce((sum, card) => {
    const ins = card.inscription;
    if (!ins) return sum;
    if (ins.kind === "game" && ins.game === game) return sum + Math.floor(ins.value / 2);
    return sum;
  }, synergy.sabotage || 0);
}

function shieldBonus(player) {
  const synergy = synergyBonuses(player);
  return player.cards.reduce((sum, card) => sum + (card.inscription?.kind === "shield" ? card.inscription.value : 0), synergy.shield || 0);
}

function updateDuelHud(duel, elapsed) {
  const ownerScore = document.querySelector("#ownerScore");
  const rivalScore = document.querySelector("#rivalScore");
  const timerRing = document.querySelector("#timerRing");
  if (ownerScore) ownerScore.textContent = Math.max(0, Math.round(duel.ownerScore));
  if (rivalScore) rivalScore.textContent = Math.max(0, Math.round(duel.rivalScore));
  if (timerRing) {
    if (duel.game === "fortress") {
      const hp = Math.max(0, Math.round(duel.meta.coreHp));
      timerRing.textContent = `HP ${hp}`;
      timerRing.style.setProperty("--timer", `${100 - hp}%`);
    } else {
      const left = Math.max(0, duel.duration - elapsed);
      timerRing.textContent = left.toFixed(1);
      timerRing.style.setProperty("--timer", `${(elapsed / duel.duration) * 100}%`);
    }
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
  if (duel.game === "mover") drawMover(ctx, width, height, duel.meta);
  if (duel.game === "hockey") drawHockey(ctx, width, height, duel.meta);
  if (duel.game === "mining") drawMining(ctx, width, height, duel.meta);
  if (duel.game === "fortress") drawFortress(ctx, width, height, duel.meta);
  if (duel.game === "chase") drawChase(ctx, width, height, duel.meta);
  if (duel.game === "goal") drawGoal(ctx, width, height, duel.meta);
  if (duel.game === "fishing") drawFishing(ctx, width, height, duel.meta);
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
  grd.addColorStop(0, "rgba(255,255,255,.11)");
  grd.addColorStop(0.45, GEM[color]?.soft || GEM.stardust.soft);
  grd.addColorStop(1, "rgba(0,0,0,.50)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(0,0,0,.24)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(255,230,185,.18)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2, 54 + i * 46, 38 + i * 32, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let i = 0; i < 16; i++) {
    const x = ((i * 73 + Date.now() / 80) % Math.max(width, 1));
    const y = (Math.sin(i * 2.1 + Date.now() / 900) * 0.5 + 0.5) * height;
    ctx.fillStyle = `rgba(255,246,220,${0.08 + (i % 4) * 0.025})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFurnace(ctx, width, height, meta) {
  const x = width / 2;
  const y = height * 0.55;
  const radius = Math.min(width, height) * 0.23;
  ctx.fillStyle = "rgba(0,0,0,.42)";
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 18;
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI * 0.9, Math.PI * 0.9);
  ctx.stroke();
  ctx.strokeStyle = "rgba(98,211,156,.95)";
  ctx.beginPath();
  ctx.arc(x, y, radius, -0.22, 0.54);
  ctx.stroke();
  ctx.strokeStyle = meta.heat > 0.86 ? "#ff736e" : "#e0b15f";
  ctx.lineWidth = 23;
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI * 0.9, -Math.PI * 0.9 + meta.heat * Math.PI * 1.8);
  ctx.stroke();
  ctx.fillStyle = meta.heat > 0.86 ? "rgba(255,70,48,.82)" : "rgba(255,178,57,.78)";
  ctx.beginPath();
  ctx.ellipse(x, y, radius * 0.42 * Math.max(0.2, meta.heat), radius * 0.76 * Math.max(0.2, meta.heat), 0, 0, Math.PI * 2);
  ctx.fill();
  drawLabel(ctx, "안정 구간 유지", x, 36);
}

function drawSequence(ctx, width, height, meta) {
  const startX = width * 0.08;
  const gap = Math.min(42, width * 0.09);
  const y = height * 0.22;
  meta.seq.slice(0, 10).forEach((color, index) => {
    const x = startX + index * gap;
    ctx.fillStyle = GEM[color].fill;
    roundRect(ctx, x, y, gap * 0.76, gap * 0.76, 8);
    ctx.fill();
    if (index === meta.ownerIndex % meta.seq.length) {
      ctx.strokeStyle = "#fff6db";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  });
  drawProgress(ctx, width, "세공", meta.ownerIndex, height * 0.45, "#62d39c");
  drawProgress(ctx, width, "견제", meta.rivalIndex, height * 0.58, "#ff736e");
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
  const pulse = (Math.sin(meta.phase) + 1) / 2;
  ctx.strokeStyle = pulse > 0.58 ? "rgba(98,211,156,.95)" : "rgba(255,255,255,.2)";
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
  drawLabel(ctx, "중앙 안정권 vs 외곽 이탈", width / 2, 38);
}

function drawRicochet(ctx, width, height, meta, elapsed) {
  const target = movingTarget(elapsed);
  ctx.strokeStyle = "rgba(242,189,75,.62)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2, height * 0.92);
  ctx.lineTo(width / 2 + meta.aim * width * 0.25, height * 0.7);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,246,210,.34)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(width / 2, height * 0.92);
  ctx.quadraticCurveTo(width / 2 + meta.aim * width * 0.28, height * 0.58, target.x * width, target.y * height);
  ctx.stroke();
  ctx.setLineDash([]);
  drawGemstone(ctx, target.x * width, target.y * height, 28, GEM.topaz.fill, "");
  ctx.fillStyle = "rgba(255,115,110,.78)";
  roundRect(ctx, meta.guard * width - 42, height * 0.49, 84, 16, 8);
  ctx.fill();
  drawShots(ctx, width, height, meta.shots, "#fff7ca");
  drawLabel(ctx, "예측선이 표적과 겹칠 때 발사", width / 2, 36);
}

function drawRhythm(ctx, width, height, meta, elapsed) {
  const cx = width / 2;
  const cy = height * 0.48;
  const base = Math.min(width, height) * 0.27;
  ctx.strokeStyle = "rgba(242,239,227,.7)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, base, 0, Math.PI * 2);
  ctx.stroke();
  meta.notes.forEach((time, index) => {
    const delta = time - elapsed;
    if (delta < -0.35 || delta > 1.25) return;
    const t = 1 - delta / 1.25;
    const angle = index * 1.72;
    const radius = base + (1 - t) * 145;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const hit = meta.ownerHits[index] || meta.rivalHits[index];
    ctx.fillStyle = hit === "locked" ? "rgba(255,115,110,.85)" : hit ? "rgba(98,211,156,.9)" : "rgba(187,118,255,.92)";
    ctx.beginPath();
    ctx.arc(x, y, hit ? 8 : 12, 0, Math.PI * 2);
    ctx.fill();
  });
  drawLabel(ctx, "정확한 박자만 유효", cx, 36);
}

function drawGemstone(ctx, x, y, radius, fill, label = "") {
  const points = [
    [x, y - radius],
    [x + radius * 0.82, y - radius * 0.36],
    [x + radius * 0.62, y + radius * 0.88],
    [x - radius * 0.62, y + radius * 0.88],
    [x - radius * 0.82, y - radius * 0.36]
  ];
  const grd = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.35, radius * 0.1, x, y, radius * 1.15);
  grd.addColorStop(0, "rgba(255,255,255,.95)");
  grd.addColorStop(0.22, fill);
  grd.addColorStop(1, "rgba(24,12,36,.92)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  points.forEach(([px, py], index) => (index ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,246,215,.72)";
  ctx.lineWidth = Math.max(1.5, radius * 0.12);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.42)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - radius * 0.92);
  ctx.lineTo(x, y + radius * 0.76);
  ctx.moveTo(x - radius * 0.7, y - radius * 0.28);
  ctx.lineTo(x + radius * 0.7, y - radius * 0.28);
  ctx.stroke();
  if (label) {
    ctx.font = `800 ${Math.max(12, radius * 0.72)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff7df";
    ctx.fillText(label, x, y + radius * 0.22);
  }
}

function drawPoleBadge(ctx, x, y, pole, radius = 20) {
  const isNorth = pole > 0;
  const grd = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  grd.addColorStop(0, isNorth ? "#ff8c88" : "#76b8ff");
  grd.addColorStop(1, isNorth ? "#b9232d" : "#2367c9");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.62)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `900 ${radius}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  ctx.fillText(isNorth ? "N" : "S", x, y + radius * 0.36);
}

function drawTrajectory(ctx, width, height, meta) {
  const speed = 1.02 + meta.power * 0.76;
  let x = 0.13;
  let y = 0.78;
  let vx = Math.cos(meta.angle) * speed;
  let vy = -Math.sin(meta.angle) * speed;
  ctx.strokeStyle = "rgba(255,246,210,.62)";
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(x * width, y * height);
  for (let i = 0; i < 46; i++) {
    vx += meta.wind * 0.03;
    x += vx * 0.03;
    y += vy * 0.03;
    vy += 1.08 * 0.03;
    ctx.lineTo(x * width, y * height);
    if (y > 1 || x > 1) break;
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawFishShape(ctx, x, y, size, color, dir = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  const grd = ctx.createLinearGradient(-size, -size, size, size);
  grd.addColorStop(0, "rgba(255,255,255,.95)");
  grd.addColorStop(0.35, color);
  grd.addColorStop(1, "rgba(20,48,76,.88)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.35, size * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 1.3, 0);
  ctx.lineTo(-size * 2.0, -size * 0.72);
  ctx.lineTo(-size * 1.8, size * 0.72);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.beginPath();
  ctx.arc(size * 0.62, -size * 0.18, size * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMover(ctx, width, height, meta) {
  const targetX = width * 0.86;
  const targetY = height * 0.5;
  const oreX = meta.oreX * width;
  const oreY = meta.oreY * height;
  const attracting = meta.destPole !== meta.orePole;
  ctx.strokeStyle = attracting ? "rgba(98,211,156,.5)" : "rgba(255,115,110,.42)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(oreX, oreY - 20 + i * 10);
    ctx.quadraticCurveTo(width * 0.52, height * (0.34 + i * 0.07), targetX, targetY - 26 + i * 13);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,0,0,.36)";
  roundRect(ctx, width * 0.75, height * 0.31, width * 0.2, height * 0.38, 18);
  ctx.fill();
  ctx.strokeStyle = attracting ? "rgba(98,211,156,.78)" : "rgba(255,115,110,.72)";
  ctx.lineWidth = 4;
  ctx.stroke();
  drawPoleBadge(ctx, targetX, targetY - 48, meta.destPole, 22);
  drawGemstone(ctx, targetX, targetY + 22, 30, GEM.emerald.fill, "목");
  drawGemstone(ctx, oreX, oreY, 25, "#e9fff4", "");
  drawPoleBadge(ctx, oreX, oreY - 36, meta.orePole, 18);
  if (meta.overload > 0) drawLabel(ctx, "방해 과부하: 광물 극성 잠김", width / 2, height * 0.82);
  drawLabel(ctx, attracting ? "서로 다른 극성: 끌림" : "같은 극성: 밀림", width / 2, 36);
  drawLabel(ctx, `운반 ${meta.delivered}`, width / 2, height - 28);
}

function drawHockey(ctx, width, height, meta) {
  ctx.fillStyle = "rgba(0,0,0,.3)";
  roundRect(ctx, width * 0.06, height * 0.08, width * 0.88, height * 0.84, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,230,185,.3)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.beginPath();
  ctx.moveTo(width * 0.08, height * 0.5);
  ctx.lineTo(width * 0.92, height * 0.5);
  ctx.stroke();
  ctx.fillStyle = "rgba(98,211,156,.8)";
  roundRect(ctx, meta.ownerPad * width - 44, height * 0.84, 88, 14, 7);
  ctx.fill();
  ctx.fillStyle = "rgba(255,115,110,.8)";
  roundRect(ctx, meta.rivalPad * width - 44, height * 0.14, 88, 14, 7);
  ctx.fill();
  drawGemstone(ctx, meta.puckX * width, meta.puckY * height, 18, GEM.topaz.fill, "");
  drawGemstone(ctx, meta.itemX * width, meta.itemY * height, 12, "#f2efe3", "!");
  drawLabel(ctx, `아이템: 부스트`, width / 2, 36);
}

function drawMining(ctx, width, height, meta) {
  ctx.fillStyle = "rgba(0,0,0,.35)";
  roundRect(ctx, width * 0.1, height * 0.36, width * 0.8, height * 0.24, 14);
  ctx.fill();
  ctx.strokeStyle = "#f2bd4b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(meta.crack * width, height * 0.34);
  ctx.lineTo(meta.crack * width + Math.sin(Date.now() / 120) * 28, height * 0.64);
  ctx.stroke();
  ctx.fillStyle = meta.rubble > 0.45 ? "rgba(255,115,110,.55)" : "rgba(255,255,255,.85)";
  ctx.beginPath();
  ctx.arc(meta.drill * width, height * 0.5, 18, 0, Math.PI * 2);
  ctx.fill();
  drawProgress(ctx, width, "광맥", meta.progress * 10, height * 0.74, "#f2bd4b");
}

function drawFortress(ctx, width, height, meta) {
  drawTrajectory(ctx, width, height, meta);
  ctx.fillStyle = "rgba(0,0,0,.34)";
  roundRect(ctx, width * 0.7, height * 0.38, width * 0.23, height * 0.34, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,230,185,.32)";
  ctx.stroke();
  drawGemstone(ctx, width * 0.82, height * 0.54, 28, GEM.topaz.fill, "");
  ctx.fillStyle = "rgba(255,255,255,.13)";
  roundRect(ctx, width * 0.67, height * 0.24, width * 0.3, 13, 7);
  ctx.fill();
  ctx.fillStyle = meta.coreHp < 35 ? "#ff736e" : "#62d39c";
  roundRect(ctx, width * 0.67, height * 0.24, width * 0.3 * (meta.coreHp / 100), 13, 7);
  ctx.fill();
  ctx.fillStyle = "rgba(255,115,110,.76)";
  roundRect(ctx, meta.shield * width - 14, height * 0.39, 28, height * 0.35, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.38)";
  ctx.stroke();
  ctx.fillStyle = "rgba(0,0,0,.42)";
  roundRect(ctx, width * 0.08, height * 0.72, width * 0.13, height * 0.08, 8);
  ctx.fill();
  const muzzleX = width * 0.13;
  const muzzleY = height * 0.78;
  ctx.strokeStyle = "#f2efe3";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(muzzleX, muzzleY);
  ctx.lineTo(muzzleX + Math.cos(meta.angle) * 54, muzzleY - Math.sin(meta.angle) * 54);
  ctx.stroke();
  meta.shells.forEach((shell) => {
    ctx.strokeStyle = "rgba(255,238,181,.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    shell.trail.forEach((p, index) => (index ? ctx.lineTo(p.x * width, p.y * height) : ctx.moveTo(p.x * width, p.y * height)));
    ctx.stroke();
  });
  drawShots(ctx, width, height, meta.shells, "#fff1bd");
  drawLabel(ctx, `핵 체력 ${Math.round(meta.coreHp)} · 곡사 궤적`, width / 2, 36);
}

function drawChase(ctx, width, height, meta) {
  const cx = width / 2;
  const cy = height * 0.52;
  const r = Math.min(width, height) * 0.28;
  ctx.strokeStyle = "rgba(255,255,255,.25)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  const runner = pointOnCircle(cx, cy, r, meta.runner);
  const hunter = pointOnCircle(cx, cy, r, meta.hunter);
  ctx.fillStyle = meta.swapped ? "#ff736e" : "#62d39c";
  ctx.beginPath();
  ctx.arc(runner.x, runner.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = meta.swapped ? "#62d39c" : "#ff736e";
  ctx.beginPath();
  ctx.arc(hunter.x, hunter.y, 20, 0, Math.PI * 2);
  ctx.fill();
  drawLabel(ctx, meta.swapped ? "역할 교대" : "도망자 보호", width / 2, 36);
}

function drawGoal(ctx, width, height, meta) {
  const lanes = [0.24, 0.5, 0.76];
  ctx.fillStyle = "rgba(0,0,0,.34)";
  roundRect(ctx, width * 0.12, height * 0.13, width * 0.76, height * 0.74, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,230,185,.34)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.2)";
  ctx.lineWidth = 2;
  lanes.forEach((x) => {
    ctx.beginPath();
    ctx.moveTo(x * width, height * 0.15);
    ctx.lineTo(x * width, height * 0.86);
    ctx.stroke();
  });
  const ownerShoots = meta.round % 2 === 0 || meta.round === 4;
  const shooterY = ownerShoots ? height * 0.78 : height * 0.22;
  const keeperY = ownerShoots ? height * 0.22 : height * 0.78;
  const shooterLane = ownerShoots ? meta.ownerLane : meta.rivalLane;
  const keeperLane = ownerShoots ? meta.rivalLane : meta.ownerLane;
  ctx.fillStyle = ownerShoots ? "rgba(98,211,156,.92)" : "rgba(255,115,110,.92)";
  roundRect(ctx, lanes[shooterLane] * width - 42, shooterY - 13, 84, 26, 13);
  ctx.fill();
  ctx.fillStyle = ownerShoots ? "rgba(255,115,110,.92)" : "rgba(98,211,156,.92)";
  roundRect(ctx, lanes[keeperLane] * width - 46, keeperY - 15, 92, 30, 15);
  ctx.fill();
  drawGemstone(ctx, meta.ballX * width, meta.ballY * height, 18, "#f2efe3", "");
  ctx.strokeStyle = "rgba(255,246,210,.58)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lanes[shooterLane] * width, shooterY);
  ctx.lineTo(lanes[shooterLane] * width, ownerShoots ? height * 0.27 : height * 0.73);
  ctx.stroke();
  drawLabel(ctx, `${meta.nextRole || "방향 선택"} · ${meta.last}`, width / 2, 36);
  drawLabel(ctx, `세공 ${meta.ownerGoals} : ${meta.rivalGoals} 방해`, width / 2, height - 28);
}

function drawFishing(ctx, width, height, meta) {
  const water = ctx.createLinearGradient(0, height * 0.1, 0, height);
  water.addColorStop(0, "rgba(68,178,230,.18)");
  water.addColorStop(0.45, "rgba(32,111,169,.34)");
  water.addColorStop(1, "rgba(20,38,86,.62)");
  ctx.fillStyle = water;
  roundRect(ctx, width * 0.07, height * 0.15, width * 0.86, height * 0.76, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(180,235,255,.26)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    const y = height * (0.25 + i * 0.13);
    ctx.moveTo(width * 0.08, y);
    ctx.bezierCurveTo(width * 0.28, y + Math.sin(Date.now() / 400 + i) * 10, width * 0.62, y - 12, width * 0.92, y + 6);
    ctx.stroke();
  }
  meta.fish.forEach((fish, index) => {
    if (fish.caught) return;
    const color = fish.size > 1.2 ? "#f2bd4b" : index % 2 ? "#58a3ff" : "#bb76ff";
    drawFishShape(ctx, fish.x * width, fish.y * height, 10 * fish.size, color, fish.dir);
  });
  ctx.strokeStyle = "rgba(255,246,220,.78)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.05);
  ctx.lineTo(meta.hookX * width, meta.hookY * height);
  ctx.stroke();
  drawGemstone(ctx, meta.hookX * width, meta.hookY * height, 13, "#f2efe3", "");
  if (meta.overheat > 0) drawLabel(ctx, "물살 과열: 방해 잠김", width / 2, height * 0.84);
  drawLabel(ctx, meta.cast ? "찌 경로와 물고기가 겹치면 포획" : "한 번의 기회: 찌를 던지세요", width / 2, 36);
  drawLabel(ctx, `포획 ${meta.caught} · 큰 물고기 ${meta.bigCaught}`, width / 2, height - 28);
}

function drawShots(ctx, width, height, shots, color) {
  shots.forEach((shot) => {
    drawGemstone(ctx, shot.x * width, shot.y * height, 10, color, "");
  });
}

function drawProgress(ctx, width, label, value, y, color) {
  ctx.fillStyle = "rgba(255,255,255,.12)";
  ctx.fillRect(width * 0.12, y, width * 0.76, 12);
  ctx.fillStyle = color;
  ctx.fillRect(width * 0.12, y, Math.min(width * 0.76, value * 13), 12);
  drawLabel(ctx, `${label} ${Math.max(0, Math.round(value))}`, width / 2, y - 12);
}

function drawLabel(ctx, text, x, y) {
  ctx.font = "700 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0,0,0,.46)";
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = "#fff6df";
  ctx.fillText(text, x, y);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function startBriefDemo(duel) {
  if (briefLoopId === duel.id && briefTimer) return;
  cancelBriefDemo();
  briefLoopId = duel.id;
  const started = performance.now();
  const frame = () => {
    const canvas = document.querySelector("#briefDemoCanvas");
    if (!canvas || !state?.duel || state.duel.id !== briefLoopId || !state.duel.awaitingStart) {
      cancelBriefDemo();
      return;
    }
    const ctx = resizeCanvas(canvas);
    const { width, height } = canvas.getBoundingClientRect();
    const t = ((performance.now() - started) / 1000) % 5;
    ctx.clearRect(0, 0, width, height);
    drawBackdrop(ctx, width, height, duel.card.color);
    drawDemo(ctx, width, height, duel.game, t);
    const bar = document.querySelector("#briefDemoBar");
    if (bar) bar.style.width = `${(t / 5) * 100}%`;
    briefTimer = setTimeout(frame, 33);
  };
  briefTimer = setTimeout(frame, 33);
}

function drawDemo(ctx, width, height, game, t) {
  if (game === "furnace") return drawFurnace(ctx, width, height, { heat: 0.58 + Math.sin(t * 2.2) * 0.14, shock: 0 });
  if (game === "sequence") return drawSequence(ctx, width, height, { seq: ["ruby", "sapphire", "topaz", "ruby", "topaz", "sapphire"], ownerIndex: Math.floor(t * 2) % 6, rivalIndex: Math.floor(t * 1.4) % 6 });
  if (game === "tug") return drawTug(ctx, width, height, { pos: Math.sin(t * 2.4) * 0.42, phase: t * 5 });
  if (game === "ricochet") return drawRicochet(ctx, width, height, { aim: Math.sin(t * 1.8) * 0.68, guard: 0.5 + Math.sin(t * 2) * 0.22, shots: [] }, t);
  if (game === "rhythm") return drawRhythm(ctx, width, height, { notes: [0.7, 1.2, 1.8, 2.4, 3.0, 3.7, 4.3], ownerHits: {}, rivalHits: {} }, t % 4.5);
  if (game === "mover") return drawMover(ctx, width, height, { oreX: 0.18 + (t / 5) * 0.65, oreY: 0.52 + Math.sin(t * 2) * 0.08, destPole: t % 2 > 1 ? 1 : -1, orePole: t % 2 > 1 ? -1 : 1, delivered: 0, overload: t > 3.3 ? 0.8 : 0 });
  if (game === "hockey") return drawHockey(ctx, width, height, { puckX: 0.5 + Math.sin(t * 2.2) * 0.32, puckY: 0.5 + Math.cos(t * 2.7) * 0.28, ownerPad: 0.45, rivalPad: 0.58, itemX: 0.72, itemY: 0.5, item: "boost", ownerItem: null, rivalItem: null });
  if (game === "mining") return drawMining(ctx, width, height, { drill: 0.12 + (t / 5) * 0.78, crack: 0.5 + Math.sin(t * 2) * 0.2, progress: t / 5, rubble: t > 3 ? 0.6 : 0 });
  if (game === "fortress") return drawFortress(ctx, width, height, { angle: 0.42 + Math.sin(t) * 0.16, power: 0.68, wind: 0.02, shield: 0.58, shells: [], coreHp: Math.max(20, 100 - t * 13), hit: 0, near: 0, block: 0 });
  if (game === "chase") return drawChase(ctx, width, height, { runner: t / 5, hunter: t / 5 + 0.22, swapped: t > 2.5 });
  if (game === "goal") return drawGoal(ctx, width, height, { round: Math.floor(t) % 5, ownerLane: Math.floor(t * 1.5) % 3, rivalLane: Math.floor(t * 2.1) % 3, ownerGoals: 1, rivalGoals: 0, saves: 0, last: "방향 읽기", nextRole: t % 2 > 1 ? "방해자 슈터" : "세공자 슈터", ballX: [0.24, 0.5, 0.76][Math.floor(t * 1.5) % 3], ballY: 0.54 });
  if (game === "fishing") {
    return drawFishing(ctx, width, height, {
      hookX: 0.5 + Math.sin(t) * 0.18,
      hookY: 0.18 + (t / 5) * 0.64,
      cast: true,
      caught: Math.floor(t),
      bigCaught: t > 3 ? 1 : 0,
      overheat: t > 3.5 ? 0.8 : 0,
      fish: Array.from({ length: 8 }, (_, index) => ({ x: (index * 0.16 + t * 0.08) % 1, y: 0.26 + (index % 5) * 0.12, size: index % 4 === 0 ? 1.35 : 1, caught: false, dir: index % 2 ? 1 : -1 }))
    });
  }
  drawLabel(ctx, MINI_GAMES[game].label, width / 2, 28);
}

function cancelBriefDemo() {
  if (briefTimer) clearTimeout(briefTimer);
  briefTimer = null;
  briefLoopId = "";
}

function movingTarget(elapsed) {
  return { x: 0.5 + Math.sin(elapsed * 1.3) * 0.28, y: 0.24 + Math.cos(elapsed * 1.8) * 0.08 };
}

function pointOnCircle(cx, cy, r, value) {
  const angle = value * Math.PI * 2 - Math.PI / 2;
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

function circularDistance(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
}

function wrap01(value) {
  return ((value % 1) + 1) % 1;
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
  if (online.mode === "online" && !confirm("현재 방 코드 그대로 새 판을 시작할까요? 상대 화면도 함께 초기화됩니다.")) return;
  const oldRoom = state?.roomCode || online.roomCode || makeRoomCode();
  const players = state?.players || [createPlayer("p1", "세공사 A"), createPlayer("p2", "세공사 B")];
  state = createGame();
  state.roomCode = oldRoom;
  if (online.mode === "online") {
    state.players[0].id = players[0].id;
    state.players[1].id = players[1].id;
    state.feed = [`방 ${oldRoom}에서 새 판을 시작했습니다.`];
  }
  saveGame(true);
  render();
}

async function createFreshOnlineRoom() {
  if (!online.firebaseReady) return renderLobby("Firebase 설정이 아직 준비되지 않았습니다.");
  if (online.mode === "online" && !confirm("새 방을 만들까요? 기존 방과 다른 초대 코드가 생성됩니다.")) return;
  clearRememberedSession();
  if (online.unsubscribe) online.unsubscribe();
  await createOnlineRoom();
}

async function leaveToLobby() {
  if (online.mode === "online" && !confirm("현재 방에서 나가고 로비로 이동할까요?")) return;
  const code = online.roomCode;
  const idx = online.playerIndex;
  if (online.unsubscribe) online.unsubscribe();
  if (online.firebaseReady && code && idx >= 0) {
    try {
      await online.api.update(online.api.ref(online.db, roomPath(code)), {
        [`players/p${idx + 1}`]: null,
        updatedAt: online.api.serverTimestamp()
      });
    } catch (error) {
      console.warn("leave room failed", error);
    }
  }
  clearRememberedSession();
  online.mode = "boot";
  online.roomCode = "";
  online.playerId = "";
  online.playerIndex = -1;
  online.roomPlayers = {};
  state = null;
  renderLobby("로비로 나왔습니다.");
}

function loadGame() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed) return null;
    if (parsed.phase === "duel") {
      parsed.phase = "board";
      parsed.duel = null;
    }
    return normalizeGame(parsed);
  } catch {
    return null;
  }
}

function saveGame(forceOnline = false) {
  if (!state) return;
  if (online.mode === "online") {
    syncOnline(forceOnline);
    return;
  }
  if (state.phase === "duel") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function rememberSession() {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode: online.roomCode, playerId: online.playerId, playerIndex: online.playerIndex }));
}

function readRememberedSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

function clearRememberedSession() {
  localStorage.removeItem(SESSION_KEY);
}

function canControlTurn() {
  if (online.mode !== "online") return true;
  return currentPlayer()?.id === myPlayerId();
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
  if (online.mode !== "online" || !state?.pendingResult) return true;
  return state.players[state.turn]?.id === myPlayerId();
}

function canResetGame() {
  if (online.mode !== "online") return true;
  return online.playerIndex === 0;
}

function myPlayerId() {
  return online.playerId || state?.players?.[online.playerIndex]?.id || "";
}

function roleLabel() {
  if (online.mode !== "online") return "로컬";
  if (online.playerIndex === 0) return "방장 · 세공사 A";
  if (online.playerIndex === 1) return "참가자 · 세공사 B";
  return "관전 중";
}

function inviteText() {
  const baseUrl = `${location.origin}${location.pathname}`;
  return `루멘 젬 듀얼 같이 하자!\n링크: ${baseUrl}\n초대 코드: ${online.roomCode}`;
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    online.notice = successMessage;
  } catch {
    online.notice = "복사 권한이 없어 직접 선택해 복사해주세요.";
  }
  render();
  setTimeout(() => {
    online.notice = "";
    if (state) render();
  }, 1600);
}

function copyInvite() {
  if (!online.roomCode) return;
  copyText(inviteText(), "초대문을 복사했습니다.");
}

function copyRoomCode() {
  if (!online.roomCode) return;
  copyText(online.roomCode, "초대 코드만 복사했습니다.");
}

function pushFeed(message) {
  state.feed.push(message);
  state.feed = state.feed.slice(-24);
}

function countColor(player, color) {
  return player.cards.filter((card) => !card.cracked && card.color === color).length;
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
  return `<span class="gem-chip" style="${gemStyle(color)}" title="${GEM[color].name}">${GEM[color].short} ${value}</span>`;
}

function discountChip(color, value) {
  return `<span class="discount-chip" style="${gemStyle(color)}">${GEM[color].short} -${value}</span>`;
}

function gemStyle(color) {
  const gem = GEM[color] || GEM.stardust;
  return `--gem-color:${gem.fill};--gem-soft:${gem.soft}`;
}

function artStyle(card) {
  const [x, y] = card.art || [50, 50];
  return `--art-x:${x}%;--art-y:${y}%`;
}

function synergyStyle(card) {
  const syn = primarySynergyForCard(card);
  return `--synergy-color:${SYNERGY_ACCENTS[syn?.id] || GEM[card.color]?.fill || GEM.stardust.fill}`;
}

function primarySynergyForCard(card) {
  const tags = card.tags || [];
  return SYNERGIES.find((syn) => {
    if (syn.type === "colors") return card.color === "stardust" || tags.includes("프리즘");
    return (syn.tags || []).some((tag) => tags.includes(tag));
  });
}

function makeRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length: 5 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
}

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
