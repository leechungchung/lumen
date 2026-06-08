import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type GemColor = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst';
type Grade = 'S' | 'A' | 'B' | 'C' | 'D';
type Phase = 'market' | 'minigame' | 'result' | 'gameOver';
type PlayerId = 0 | 1;

type Gem = {
  color: GemColor;
  grade: Grade;
};

type CardTemplate = {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  color: GemColor;
  cost: Partial<Record<GemColor, number>>;
  basePrestige: number;
};

type OwnedCard = CardTemplate & {
  uid: string;
  grade: Grade;
  inscription?: Inscription;
};

type Player = {
  name: string;
  gems: Gem[];
  cards: OwnedCard[];
};

type Inscription = {
  id: string;
  name: string;
  desc: string;
  scoreBonus?: Partial<Record<GemColor, number>>;
  prestigeBonus?: number;
  costDiscountAny?: number;
};

type MiniGameKind = 'overheat' | 'sequence' | 'tug' | 'rhythm';

type ActivePurchase = {
  playerId: PlayerId;
  card: CardTemplate;
  paidGems: Gem[];
  miniGame: MiniGameKind;
};

const colors: Record<GemColor, { label: string; emoji: string }> = {
  ruby: { label: '루비', emoji: '🔴' },
  sapphire: { label: '사파이어', emoji: '🔵' },
  emerald: { label: '에메랄드', emoji: '🟢' },
  topaz: { label: '토파즈', emoji: '🟡' },
  amethyst: { label: '자수정', emoji: '🟣' },
};

const gradeValue: Record<Grade, number> = { S: 4, A: 3, B: 2, C: 1, D: 0 };

const inscriptionsByColor: Record<GemColor, Inscription[]> = {
  ruby: [
    { id: 'ruby-heat', name: '불꽃 과열', desc: '루비 미니게임 점수 +8', scoreBonus: { ruby: 8 } },
    { id: 'ruby-heart', name: '용암 심장', desc: '루비 카드 비용 -1' },
    { id: 'ruby-signature', name: '붉은 서명', desc: '이 카드 명성 +2', prestigeBonus: 2 },
  ],
  sapphire: [
    { id: 'sapphire-memory', name: '푸른 기억', desc: '사파이어 미니게임 점수 +8', scoreBonus: { sapphire: 8 } },
    { id: 'sapphire-focus', name: '완전한 집중', desc: '모든 미니게임 점수 +4', scoreBonus: { ruby: 4, sapphire: 4, emerald: 4, topaz: 4, amethyst: 4 } },
    { id: 'sapphire-lens', name: '지혜의 렌즈', desc: '이 카드 명성 +1', prestigeBonus: 1 },
  ],
  emerald: [
    { id: 'emerald-root', name: '뿌리내림', desc: '에메랄드 미니게임 점수 +8', scoreBonus: { emerald: 8 } },
    { id: 'emerald-shield', name: '안정화', desc: '모든 미니게임 점수 +3', scoreBonus: { ruby: 3, sapphire: 3, emerald: 3, topaz: 3, amethyst: 3 } },
    { id: 'emerald-life', name: '생명의 잔향', desc: '아무 색 비용 -1', costDiscountAny: 1 },
  ],
  topaz: [
    { id: 'topaz-luck', name: '황금 직감', desc: '토파즈 미니게임 점수 +8', scoreBonus: { topaz: 8 } },
    { id: 'topaz-trade', name: '황금 거래', desc: '아무 색 비용 -1', costDiscountAny: 1 },
    { id: 'topaz-spark', name: '반짝임', desc: '이 카드 명성 +2', prestigeBonus: 2 },
  ],
  amethyst: [
    { id: 'amethyst-rhythm', name: '별빛 박자', desc: '자수정 미니게임 점수 +8', scoreBonus: { amethyst: 8 } },
    { id: 'amethyst-time', name: '시간 왜곡', desc: '모든 미니게임 점수 +5', scoreBonus: { ruby: 5, sapphire: 5, emerald: 5, topaz: 5, amethyst: 5 } },
    { id: 'amethyst-glow', name: '공명 잔향', desc: '이 카드 명성 +1', prestigeBonus: 1 },
  ],
};

const deck: CardTemplate[] = [
  { id: 'r1', name: '붉은 연마석', level: 1, color: 'ruby', cost: { ruby: 2 }, basePrestige: 0 },
  { id: 's1', name: '푸른 렌즈', level: 1, color: 'sapphire', cost: { sapphire: 2 }, basePrestige: 0 },
  { id: 'e1', name: '녹색 장갑', level: 1, color: 'emerald', cost: { emerald: 2 }, basePrestige: 0 },
  { id: 't1', name: '황금 부적', level: 1, color: 'topaz', cost: { topaz: 2 }, basePrestige: 0 },
  { id: 'a1', name: '보랏빛 시계', level: 1, color: 'amethyst', cost: { amethyst: 2 }, basePrestige: 0 },
  { id: 'r2', name: '왕실 루비검', level: 2, color: 'ruby', cost: { ruby: 4, sapphire: 2 }, basePrestige: 1 },
  { id: 's2', name: '달빛 렌즈', level: 2, color: 'sapphire', cost: { sapphire: 4, amethyst: 2 }, basePrestige: 1 },
  { id: 'e2', name: '숲의 브로치', level: 2, color: 'emerald', cost: { emerald: 4, topaz: 2 }, basePrestige: 1 },
  { id: 't2', name: '황금 성배', level: 2, color: 'topaz', cost: { topaz: 4, ruby: 2 }, basePrestige: 1 },
  { id: 'a2', name: '별빛 귀걸이', level: 2, color: 'amethyst', cost: { amethyst: 4, emerald: 2 }, basePrestige: 1 },
  { id: 'r3', name: '태양 왕관', level: 3, color: 'ruby', cost: { ruby: 6, topaz: 4 }, basePrestige: 3 },
  { id: 's3', name: '심해 왕관', level: 3, color: 'sapphire', cost: { sapphire: 6, emerald: 4 }, basePrestige: 3 },
  { id: 'e3', name: '세계수 장식', level: 3, color: 'emerald', cost: { emerald: 6, amethyst: 4 }, basePrestige: 3 },
  { id: 't3', name: '행운의 왕관', level: 3, color: 'topaz', cost: { topaz: 6, sapphire: 4 }, basePrestige: 3 },
  { id: 'a3', name: '예언의 왕관', level: 3, color: 'amethyst', cost: { amethyst: 6, ruby: 4 }, basePrestige: 3 },
];

const minigamesByColor: Record<GemColor, MiniGameKind[]> = {
  ruby: ['overheat', 'overheat'],
  sapphire: ['sequence', 'sequence'],
  emerald: ['tug', 'tug'],
  topaz: ['sequence', 'overheat'],
  amethyst: ['rhythm', 'rhythm'],
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function initialGems(): Gem[] {
  return [
    { color: 'ruby', grade: 'B' },
    { color: 'sapphire', grade: 'B' },
    { color: 'emerald', grade: 'B' },
    { color: 'topaz', grade: 'B' },
    { color: 'amethyst', grade: 'B' },
    { color: 'ruby', grade: 'C' },
    { color: 'sapphire', grade: 'C' },
    { color: 'emerald', grade: 'C' },
  ];
}

function prestige(card: OwnedCard) {
  const gradePrestige: Record<Grade, number> = { S: 0, A: 1, B: 0, C: 1, D: 0 };
  return card.basePrestige + gradePrestige[card.grade] + (card.inscription?.prestigeBonus ?? 0);
}

function discount(card: OwnedCard) {
  if (card.grade === 'S') return 2;
  if (card.grade === 'A' || card.grade === 'B') return 1;
  return 0;
}

function playerPrestige(player: Player) {
  return player.cards.reduce((sum, card) => sum + prestige(card), 0);
}

function effectiveCost(player: Player, cost: Partial<Record<GemColor, number>>) {
  const result: Partial<Record<GemColor, number>> = { ...cost };
  for (const card of player.cards) {
    const current = result[card.color] ?? 0;
    result[card.color] = Math.max(0, current - discount(card));
  }
  let anyDiscount = player.cards.reduce((sum, card) => sum + (card.inscription?.costDiscountAny ?? 0), 0);
  for (const color of Object.keys(result) as GemColor[]) {
    while ((result[color] ?? 0) > 0 && anyDiscount > 0) {
      result[color] = (result[color] ?? 0) - 1;
      anyDiscount -= 1;
    }
  }
  return result;
}

function canPay(player: Player, cost: Partial<Record<GemColor, number>>) {
  return (Object.keys(cost) as GemColor[]).every((color) => {
    const need = cost[color] ?? 0;
    const has = player.gems.filter((g) => g.color === color).reduce((sum, g) => sum + gradeValue[g.grade], 0);
    return has >= need;
  });
}

function autoPay(player: Player, cost: Partial<Record<GemColor, number>>) {
  const paid: Gem[] = [];
  const remaining = [...player.gems];
  for (const color of Object.keys(cost) as GemColor[]) {
    let need = cost[color] ?? 0;
    const candidates = remaining
      .map((g, i) => ({ ...g, i }))
      .filter((g) => g.color === color)
      .sort((a, b) => gradeValue[a.grade] - gradeValue[b.grade]);
    for (const gem of candidates) {
      if (need <= 0) break;
      paid.push({ color: gem.color, grade: gem.grade });
      need -= gradeValue[gem.grade];
      const idx = remaining.findIndex((_, i) => i === gem.i);
      if (idx >= 0) remaining.splice(idx, 1);
    }
  }
  return { paid, remaining };
}

function resultToGrade(diff: number): { grade: Grade; fragment: Grade } {
  if (diff >= 50) return { grade: 'S', fragment: 'D' };
  if (diff >= 30) return { grade: 'A', fragment: 'C' };
  if (diff >= 10) return { grade: 'B', fragment: 'C' };
  if (diff >= -9) return { grade: 'B', fragment: 'B' };
  if (diff >= -29) return { grade: 'C', fragment: 'B' };
  if (diff >= -49) return { grade: 'D', fragment: 'A' };
  return { grade: 'D', fragment: 'A' };
}

function randomInscription(color: GemColor): Inscription {
  const pool = inscriptionsByColor[color];
  return pool[Math.floor(Math.random() * pool.length)];
}

function scoreBonus(player: Player, color: GemColor) {
  return player.cards.reduce((sum, card) => sum + (card.inscription?.scoreBonus?.[color] ?? 0), 0);
}

function marketFromDeck(cards: CardTemplate[]) {
  return [1, 2, 3].flatMap((level) => shuffle(cards.filter((c) => c.level === level)).slice(0, 4));
}

function App() {
  const [players, setPlayers] = useState<Player[]>([
    { name: '플레이어 1', gems: initialGems(), cards: [] },
    { name: '플레이어 2', gems: initialGems(), cards: [] },
  ]);
  const [turn, setTurn] = useState<PlayerId>(0);
  const [market, setMarket] = useState<CardTemplate[]>(() => marketFromDeck(deck));
  const [phase, setPhase] = useState<Phase>('market');
  const [active, setActive] = useState<ActivePurchase | null>(null);
  const [log, setLog] = useState<string[]>(['게임 시작: 카드 구매 후 미니게임으로 순도를 결정하세요.']);
  const [lastResult, setLastResult] = useState<string>('');

  const winner = players.findIndex((p) => playerPrestige(p) >= 15);

  function addLog(message: string) {
    setLog((prev) => [message, ...prev].slice(0, 7));
  }

  function purchase(card: CardTemplate) {
    const buyer = players[turn];
    const cost = effectiveCost(buyer, card.cost);
    if (!canPay(buyer, cost)) {
      addLog(`${buyer.name}은(는) ${card.name} 비용을 지불할 수 없습니다.`);
      return;
    }
    const { paid, remaining } = autoPay(buyer, cost);
    const nextPlayers = players.map((p, idx) => (idx === turn ? { ...p, gems: remaining } : p));
    setPlayers(nextPlayers);
    const miniGamePool = minigamesByColor[card.color];
    const miniGame = miniGamePool[Math.floor(Math.random() * miniGamePool.length)];
    setActive({ playerId: turn, card, paidGems: paid, miniGame });
    setPhase('minigame');
    addLog(`${buyer.name}이(가) ${card.name} 구매를 시도합니다. ${colors[card.color].label} 순도 대결 시작!`);
  }

  function finishMiniGame(attackerBase: number, defenderBase: number) {
    if (!active) return;
    const attackerId = active.playerId;
    const defenderId = (attackerId === 0 ? 1 : 0) as PlayerId;
    const attacker = players[attackerId];
    const defender = players[defenderId];
    const attackerScore = Math.round(attackerBase + scoreBonus(attacker, active.card.color));
    const defenderScore = Math.round(defenderBase + scoreBonus(defender, active.card.color));
    const diff = attackerScore - defenderScore;
    const { grade, fragment } = resultToGrade(diff);
    const inscription = grade === 'S' ? randomInscription(active.card.color) : undefined;
    const owned: OwnedCard = { ...active.card, uid: uid(), grade, inscription };

    const nextPlayers = players.map((p, idx) => {
      if (idx === attackerId) return { ...p, cards: [...p.cards, owned] };
      if (idx === defenderId) return { ...p, gems: [...p.gems, { color: active.card.color, grade: fragment }] };
      return p;
    });

    setPlayers(nextPlayers);
    setMarket((prev) => {
      const remaining = prev.filter((c) => c.id !== active.card.id);
      const sameLevel = deck.filter((c) => c.level === active.card.level && !remaining.some((m) => m.id === c.id));
      const replacement = shuffle(sameLevel).find((c) => c.id !== active.card.id);
      return replacement ? [...remaining, replacement] : remaining;
    });

    const result = `${attacker.name}: ${attackerScore}점 / ${defender.name}: ${defenderScore}점 / 차이 ${diff}. ${colors[active.card.color].label} ${grade} ${active.card.name} 완성${inscription ? `, 각인 [${inscription.name}] 획득` : ''}. 방해자는 ${fragment} 파편 획득.`;
    setLastResult(result);
    addLog(result);
    setPhase(playerPrestige(nextPlayers[attackerId]) >= 15 ? 'gameOver' : 'result');
  }

  function nextTurn() {
    setTurn((turn === 0 ? 1 : 0) as PlayerId);
    setActive(null);
    setPhase('market');
  }

  function reset() {
    setPlayers([
      { name: '플레이어 1', gems: initialGems(), cards: [] },
      { name: '플레이어 2', gems: initialGems(), cards: [] },
    ]);
    setTurn(0);
    setMarket(marketFromDeck(deck));
    setPhase('market');
    setActive(null);
    setLastResult('');
    setLog(['새 게임 시작']);
  }

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Prototype</p>
          <h1>루멘 젬 듀얼</h1>
          <p>카드를 사고, 실시간 미니게임으로 보석 순도 S/A/B/C/D를 겨룹니다.</p>
        </div>
        <button onClick={reset}>새 게임</button>
      </header>

      <section className="players">
        {players.map((player, idx) => (
          <PlayerPanel key={player.name} player={player} active={idx === turn} />
        ))}
      </section>

      {phase === 'market' && (
        <Market market={market} currentPlayer={players[turn]} onPurchase={purchase} />
      )}

      {phase === 'minigame' && active && (
        <MiniGame
          active={active}
          attacker={players[active.playerId]}
          defender={players[active.playerId === 0 ? 1 : 0]}
          onFinish={finishMiniGame}
        />
      )}

      {phase === 'result' && (
        <section className="card result">
          <h2>세공 결과</h2>
          <p>{lastResult}</p>
          <button onClick={nextTurn}>다음 턴</button>
        </section>
      )}

      {phase === 'gameOver' && (
        <section className="card result win">
          <h2>게임 종료</h2>
          <p>{winner >= 0 ? `${players[winner].name} 승리!` : '승리 조건 달성'}</p>
          <p>{lastResult}</p>
          <button onClick={reset}>다시 시작</button>
        </section>
      )}

      <section className="card log">
        <h2>로그</h2>
        {log.map((item, i) => <p key={i}>{item}</p>)}
      </section>
    </main>
  );
}

function PlayerPanel({ player, active }: { player: Player; active: boolean }) {
  const gemsByColor = useMemo(() => {
    const groups: Partial<Record<GemColor, Gem[]>> = {};
    for (const gem of player.gems) groups[gem.color] = [...(groups[gem.color] ?? []), gem];
    return groups;
  }, [player.gems]);

  return (
    <section className={`player ${active ? 'active' : ''}`}>
      <div className="playerTop">
        <h2>{player.name}</h2>
        <strong>{playerPrestige(player)} 명성</strong>
      </div>
      <div className="gemRows">
        {(Object.keys(colors) as GemColor[]).map((color) => (
          <div className="gemRow" key={color}>
            <span>{colors[color].emoji} {colors[color].label}</span>
            <span>{(gemsByColor[color] ?? []).map((g) => g.grade).join(' ') || '-'}</span>
          </div>
        ))}
      </div>
      <div className="ownedCards">
        {player.cards.map((card) => (
          <div className="owned" key={card.uid}>
            <b>{card.grade} {card.name}</b>
            <span>{colors[card.color].emoji} 할인 {discount(card)} / 명성 {prestige(card)}</span>
            {card.inscription && <em>{card.inscription.name}: {card.inscription.desc}</em>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Market({ market, currentPlayer, onPurchase }: { market: CardTemplate[]; currentPlayer: Player; onPurchase: (card: CardTemplate) => void }) {
  return (
    <section className="card">
      <h2>시장</h2>
      <p className="hint">현재 턴: {currentPlayer.name}. 구매 가능한 카드를 누르세요.</p>
      {[1, 2, 3].map((level) => (
        <div key={level}>
          <h3>{level}단계 카드</h3>
          <div className="marketGrid">
            {market.filter((c) => c.level === level).map((card) => {
              const cost = effectiveCost(currentPlayer, card.cost);
              const affordable = canPay(currentPlayer, cost);
              return (
                <button className={`marketCard ${affordable ? '' : 'disabled'}`} key={card.id} onClick={() => onPurchase(card)}>
                  <b>{colors[card.color].emoji} {card.name}</b>
                  <span>기본 명성 {card.basePrestige}</span>
                  <small>비용: {formatCost(cost)}</small>
                  <small>S: 할인 +2 + 랜덤 각인</small>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function formatCost(cost: Partial<Record<GemColor, number>>) {
  const text = (Object.keys(cost) as GemColor[])
    .filter((c) => (cost[c] ?? 0) > 0)
    .map((c) => `${colors[c].emoji}${cost[c]}`)
    .join(' ');
  return text || '무료';
}

function MiniGame({ active, attacker, defender, onFinish }: { active: ActivePurchase; attacker: Player; defender: Player; onFinish: (attackerScore: number, defenderScore: number) => void }) {
  const [attackerScore, setAttackerScore] = useState(0);
  const [defenderScore, setDefenderScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 4));
  const [sequence, setSequence] = useState<number[]>(() => Array.from({ length: 16 }, () => Math.floor(Math.random() * 3)));
  const [attackerIndex, setAttackerIndex] = useState(0);
  const [defenderIndex, setDefenderIndex] = useState(0);

  React.useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          onFinish(attackerScore, defenderScore);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, attackerScore, defenderScore, onFinish]);

  function tapOverheat(side: 'attacker' | 'defender') {
    if (!running) return;
    const gain = Math.random() > 0.18 ? 7 : -5;
    side === 'attacker' ? setAttackerScore((s) => Math.max(0, s + gain)) : setDefenderScore((s) => Math.max(0, s + gain));
  }

  function pressSequence(side: 'attacker' | 'defender', value: number) {
    if (!running) return;
    const index = side === 'attacker' ? attackerIndex : defenderIndex;
    const correct = sequence[index] === value;
    if (side === 'attacker') {
      setAttackerScore((s) => Math.max(0, s + (correct ? 8 : -6)));
      setAttackerIndex((i) => Math.min(sequence.length - 1, i + (correct ? 1 : 0)));
    } else {
      setDefenderScore((s) => Math.max(0, s + (correct ? 8 : -6)));
      setDefenderIndex((i) => Math.min(sequence.length - 1, i + (correct ? 1 : 0)));
    }
  }

  function pull(side: 'attacker' | 'defender') {
    if (!running) return;
    const goodTiming = Math.random() > 0.35;
    const gain = goodTiming ? 10 : 2;
    side === 'attacker' ? setAttackerScore((s) => s + gain) : setDefenderScore((s) => s + gain);
  }

  function rhythm(side: 'attacker' | 'defender') {
    if (!running) return;
    const perfect = Math.random() > 0.45;
    side === 'attacker' ? setAttackerScore((s) => s + (perfect ? 12 : 4)) : setDefenderScore((s) => s + (perfect ? 12 : 4));
  }

  return (
    <section className="card minigame">
      <h2>{colors[active.card.color].emoji} {active.card.name} 순도 대결</h2>
      <p className="hint">{miniGameTitle(active.miniGame)} · {timeLeft}초</p>
      {!running && timeLeft === 8 && <button className="start" onClick={() => setRunning(true)}>미니게임 시작</button>}

      <div className="duelScore">
        <div><b>{attacker.name}</b><span>{Math.round(attackerScore)}</span><small>획득자</small></div>
        <div><b>{defender.name}</b><span>{Math.round(defenderScore)}</span><small>방해자</small></div>
      </div>

      {active.miniGame === 'overheat' && (
        <div className="miniControls">
          <p>과열 광클: 빠르게 누르되, 가끔 감점이 발생합니다. 점수 차이로 순도가 결정됩니다.</p>
          <button onClick={() => tapOverheat('attacker')}>{attacker.name} 탭</button>
          <button onClick={() => tapOverheat('defender')}>{defender.name} 방해 탭</button>
        </div>
      )}

      {active.miniGame === 'sequence' && (
        <div className="miniControls">
          <p>색상 연쇄 입력: 표시된 순서대로 더 빨리 누르세요.</p>
          <div className="sequence">{sequence.slice(0, 10).map((v, i) => <span key={i}>{['🔴','🔵','🟡'][v]}</span>)}</div>
          <div className="splitControls">
            <div>{['🔴','🔵','🟡'].map((label, i) => <button key={label} onClick={() => pressSequence('attacker', i)}>{attacker.name} {label}</button>)}</div>
            <div>{['🔴','🔵','🟡'].map((label, i) => <button key={label} onClick={() => pressSequence('defender', i)}>{defender.name} {label}</button>)}</div>
          </div>
        </div>
      )}

      {active.miniGame === 'tug' && (
        <div className="miniControls">
          <p>줄다리기 공명: 타이밍을 맞춘다는 가정의 프로토타입입니다. 버튼을 눌러 코어를 당기세요.</p>
          <div className="tugBar"><div style={{ left: `${50 + Math.max(-45, Math.min(45, (attackerScore - defenderScore) / 2))}%` }} /></div>
          <button onClick={() => pull('attacker')}>{attacker.name} 당기기</button>
          <button onClick={() => pull('defender')}>{defender.name} 방해 당기기</button>
        </div>
      )}

      {active.miniGame === 'rhythm' && (
        <div className="miniControls">
          <p>별빛 리듬: 박자 입력 프로토타입입니다. 타이밍 성공/실패는 확률로 처리합니다.</p>
          <div className="rhythmOrb">♪</div>
          <button onClick={() => rhythm('attacker')}>{attacker.name} 박자</button>
          <button onClick={() => rhythm('defender')}>{defender.name} 방해 박자</button>
        </div>
      )}
    </section>
  );
}

function miniGameTitle(kind: MiniGameKind) {
  switch (kind) {
    case 'overheat': return '과열 광클';
    case 'sequence': return '색상 연쇄 입력';
    case 'tug': return '줄다리기 공명';
    case 'rhythm': return '별빛 리듬';
  }
}

createRoot(document.getElementById('root')!).render(<App />);
