import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const GEM = {
  ruby: { name: '루비', icon: '◆', color: '#ff4d6d', base: 5, mini: ['overheat','goal'] },
  sapphire: { name: '사파이어', icon: '◆', color: '#4dabff', base: 4, mini: ['sequence','memory'] },
  emerald: { name: '에메랄드', icon: '◆', color: '#39d98a', base: 3, mini: ['tug','balance'] },
  topaz: { name: '토파즈', icon: '◆', color: '#ffd166', base: 2, mini: ['goal','memory'] },
  amethyst: { name: '자수정', icon: '◆', color: '#b197fc', base: 4, mini: ['rhythm','orbit'] }
};
const GEMS = Object.keys(GEM);
const GRADE = {
  S: { value: 4, label:'S', className:'s', text:'걸작', aura:'각인 획득' },
  A: { value: 3, label:'A', className:'a', text:'고순도', aura:'명성 강화' },
  B: { value: 2, label:'B', className:'b', text:'표준', aura:'할인 적용' },
  C: { value: 1, label:'C', className:'c', text:'저순도', aura:'약한 효과' },
  D: { value: 0, label:'D', className:'d', text:'불순물', aura:'정제 재료' }
};
const INSCRIPTIONS = {
  ruby:['불꽃 과열: 루비 미니게임 +8','용암 심장: 루비 구매 비용 -1','강타: 방해자로 루비 점수 +8'],
  sapphire:['푸른 기억: 오답 1회 무시','수정 예측: 색상 입력 첫 노트 공개','지혜의 렌즈: 사파이어 비용 -1'],
  emerald:['뿌리내림: 줄다리기 저항 +15%','회복의 빛: Miss 1회 Good 보정','생명의 잔향: 패배 보상 +1등급'],
  topaz:['행운의 튕김: 빗나간 슛 1회 보정','황금 거래: 아무 색 비용 -1','도박사의 눈: 각인 재추첨'],
  amethyst:['별빛 박자: Great 1회 Perfect','시간 왜곡: 미니게임 +0.5초','예언자의 눈: 궤도 힌트 표시']
};
const CARDS = [
  ['붉은 연마석','ruby',1,{ruby:2},0],['푸른 렌즈','sapphire',1,{sapphire:2},0],['숲의 장갑','emerald',1,{emerald:2},0],['황금 부적','topaz',1,{topaz:2},0],['별빛 현','amethyst',1,{amethyst:2},0],
  ['용암 세공망치','ruby',2,{ruby:4, topaz:2},1],['기억의 프리즘','sapphire',2,{sapphire:4, amethyst:2},1],['균형의 브로치','emerald',2,{emerald:4, sapphire:2},1],['행운의 골드컵','topaz',2,{topaz:4, ruby:2},1],['달의 리듬석','amethyst',2,{amethyst:4, emerald:2},1],
  ['왕실 루비관','ruby',3,{ruby:7, sapphire:3},3],['빙정 왕관','sapphire',3,{sapphire:7, amethyst:3},3],['세계수 장식','emerald',3,{emerald:7, topaz:3},3],['태양의 메달','topaz',3,{topaz:7, ruby:3},3],['별무리 왕홀','amethyst',3,{amethyst:7, emerald:3},3]
].map((c,i)=>({id:'c'+i, name:c[0], gem:c[1], tier:c[2], cost:c[3], prestige:c[4]}));

function shuffle(a){return [...a].sort(()=>Math.random()-0.5)}
function makePlayer(name){return {name, gems:GEMS.reduce((o,g)=>({...o,[g]:[]}),{}), cards:[], score:0}}
function gradeFromDiff(diff){ if(diff>=50)return 'S'; if(diff>=30)return 'A'; if(diff>=10)return 'B'; if(diff>=-9)return 'B'; if(diff>=-29)return 'C'; return 'D'; }
function fragmentFromDiff(diff){ if(diff>=50)return 'D'; if(diff>=30)return 'C'; if(diff>=10)return 'C'; if(diff>=-9)return 'B'; if(diff>=-29)return 'B'; return 'A'; }
function gradeDiscount(grade){return grade==='S'?2:(grade==='A'||grade==='B'?1:0)}
function gradePrestige(grade, base){return base + (grade==='S'?1: grade==='A'?1: grade==='C'?1:0)}
function readableCost(cost){return Object.entries(cost).map(([g,v])=>`${GEM[g].name} ${v}`).join(' + ')}
function discountSummary(cards){
  const d=GEMS.reduce((o,g)=>({...o,[g]:0}),{});
  cards.forEach(c=>{d[c.gem]+=gradeDiscount(c.grade); if(c.inscription?.includes('비용 -1')||c.inscription?.includes('구매 비용 -1')) d[c.gem]+=1});
  return d;
}
function canAfford(player, card){
  const d=discountSummary(player.cards);
  return Object.entries(card.cost).every(([g,need])=>{
    const required=Math.max(0, need-(d[g]||0));
    const value=player.gems[g].reduce((s,gr)=>s+GRADE[gr].value,0);
    return value>=required;
  });
}
function payCost(player, card){
  const next=structuredClone(player);
  const disc=discountSummary(player.cards);
  Object.entries(card.cost).forEach(([g,need])=>{
    let req=Math.max(0,need-(disc[g]||0));
    const sorted=[...next.gems[g]].sort((a,b)=>GRADE[b].value-GRADE[a].value);
    const remain=[];
    for(const gr of sorted){ if(req>0){req-=GRADE[gr].value;} else remain.push(gr); }
    next.gems[g]=remain;
  });
  return next;
}
function drawMarket(deck){
  return [1,2,3].flatMap(t=>deck.filter(c=>c.tier===t).slice(0,4));
}
function App(){
  const [deck,setDeck]=useState(()=>shuffle(CARDS));
  const [market,setMarket]=useState(()=>drawMarket(shuffle(CARDS)));
  const [players,setPlayers]=useState(()=>[makePlayer('플레이어 1'), makePlayer('플레이어 2')]);
  const [turn,setTurn]=useState(0);
  const [selected,setSelected]=useState(null);
  const [duel,setDuel]=useState(null);
  const [log,setLog]=useState(['시장에 세공 카드가 공개되었습니다. 카드를 골라 순도 대결을 시작하세요.']);
  const winner=players.find(p=>p.score>=15);
  function addLog(t){setLog(l=>[t,...l].slice(0,8))}
  function buy(card){
    if(winner)return;
    const p=players[turn];
    if(!canAfford(p,card)){addLog(`${p.name}: 보석 가치가 부족합니다. 카드 비용은 할인 후에도 부족합니다.`); return;}
    const mini=GEM[card.gem].mini[Math.floor(Math.random()*GEM[card.gem].mini.length)];
    setDuel({card, mini, attacker:turn});
  }
  function settle(attackerScore, defenderScore){
    const {card, attacker}=duel;
    const defender=1-attacker;
    const diff=attackerScore-defenderScore;
    const grade=gradeFromDiff(diff);
    const frag=fragmentFromDiff(diff);
    const newPlayers=structuredClone(players);
    let buyer=payCost(newPlayers[attacker], card);
    const sInsc=grade==='S'?INSCRIPTIONS[card.gem][Math.floor(Math.random()*INSCRIPTIONS[card.gem].length)]:null;
    const made={...card, grade, inscription:sInsc, earnedAt:Date.now()};
    buyer.cards.push(made);
    buyer.score=buyer.cards.reduce((s,c)=>s+gradePrestige(c.grade,c.prestige),0);
    newPlayers[attacker]=buyer;
    newPlayers[defender].gems[card.gem].push(frag);
    setPlayers(newPlayers);
    setMarket(m=>m.filter(c=>c.id!==card.id));
    setDeck(d=>d.filter(c=>c.id!==card.id));
    addLog(`${players[attacker].name} ${card.name} ${grade}등급 완성! ${players[defender].name}은 ${GEM[card.gem].name} ${frag} 파편 획득.${sInsc?' 각인: '+sInsc:''}`);
    setDuel(null); setSelected(null); setTurn(1-turn);
  }
  function addTestGems(){
    setPlayers(ps=>ps.map(p=>{const n=structuredClone(p); GEMS.forEach(g=>n.gems[g].push(['B','C','A'][Math.floor(Math.random()*3)])); return n;}));
    addLog('테스트용 보석이 지급되었습니다.');
  }
  if(duel) return <MiniGame duel={duel} players={players} onDone={settle}/>;
  return <div className="app">
    <header className="hero"><div><p className="eyebrow">LUMEN GEM DUEL V2</p><h1>보석 순도 배틀</h1><p>카드를 구매하고, 미니게임으로 순도를 세공하세요. S등급은 랜덤 각인을 얻습니다.</p></div><button onClick={addTestGems}>테스트 보석 지급</button></header>
    {winner&&<div className="winner">🏆 {winner.name} 승리! 명성 {winner.score}</div>}
    <section className="players">{players.map((p,i)=><Player key={i} p={p} active={turn===i}/>)}</section>
    <section className="economy"><h2>보석 기준가와 순도</h2><div className="gemPriceRow">{GEMS.map(g=><div className="gemPrice" key={g} style={{'--gem':GEM[g].color}}><b>{GEM[g].icon} {GEM[g].name}</b><span>기준가 {GEM[g].base}</span><small>S4 A3 B2 C1 D0</small></div>)}</div></section>
    <main className="board"><section className="market"><div className="sectionTitle"><h2>카드 시장</h2><span>{players[turn].name}의 턴</span></div>{[1,2,3].map(t=><div key={t} className="tier"><h3>{t}단계</h3><div className="cards">{market.filter(c=>c.tier===t).map(c=><Card card={c} key={c.id} affordable={canAfford(players[turn],c)} selected={selected?.id===c.id} onClick={()=>{setSelected(c); buy(c)}} />)}</div></div>)}</section>
      <aside className="detail"><h2>카드 상세</h2>{selected?<CardDetail card={selected} player={players[turn]}/>:<p className="empty">카드를 누르면 상세 비용, 할인 후 비용, 미니게임 후보가 보입니다.</p>}<h2>기록</h2><div className="log">{log.map((l,i)=><p key={i}>{l}</p>)}</div><OnlinePanel/></aside></main>
  </div>
}
function Player({p,active}){const discounts=discountSummary(p.cards);return <article className={`player ${active?'active':''}`}><div className="playerTop"><h2>{p.name}</h2><span>명성 {p.score}/15</span></div><div className="discounts">{GEMS.map(g=><span key={g} style={{'--gem':GEM[g].color}}>{GEM[g].name} 할인 {discounts[g]}</span>)}</div><div className="gemBag">{GEMS.map(g=><div className="bagCol" key={g}><b style={{color:GEM[g].color}}>{GEM[g].name}</b><div>{p.gems[g].length?p.gems[g].map((gr,i)=><i key={i} className={`chip ${GRADE[gr].className}`}>{gr}</i>):<small>없음</small>}</div></div>)}</div><div className="ownedCards">{p.cards.map(c=><div key={c.id+c.earnedAt} className={`miniCard ${c.gem}`}><span>{c.name}</span><b className={`grade ${GRADE[c.grade].className}`}>{c.grade}</b>{c.inscription&&<small>{c.inscription.split(':')[0]}</small>}</div>)}</div></article>}
function Card({card, affordable, selected, onClick}){return <button className={`card ${card.gem} ${selected?'selected':''}`} onClick={onClick}><div className="cardGem">{GEM[card.gem].icon}</div><b>{card.name}</b><p>{GEM[card.gem].name} 세공 카드</p><div className="cost">{readableCost(card.cost)}</div><div className="effect"><span>할인/명성은 순도에 따라 결정</span></div><div className={affordable?'afford ok':'afford no'}>{affordable?'구매 가능':'보석 부족'}</div></button>}
function CardDetail({card,player}){const d=discountSummary(player.cards);return <div className="detailCard"><h3>{card.name}</h3><p><b>색상</b> {GEM[card.gem].name}</p><p><b>기본 비용</b> {readableCost(card.cost)}</p><p><b>현재 할인 후</b> {Object.entries(card.cost).map(([g,v])=>`${GEM[g].name} ${Math.max(0,v-(d[g]||0))}`).join(' + ')}</p><p><b>미니게임 후보</b> {GEM[card.gem].mini.map(m=>MINI_LABEL[m]).join(' / ')}</p><div className="gradeRules"><b>등급 효과</b><span>S: 할인 2 + 랜덤 각인</span><span>A: 할인 1 + 명성 1</span><span>B: 할인 1</span><span>C: 낮은 명성/보조</span><span>D: 효과 없음</span></div></div>}
function OnlinePanel(){return <div className="online"><h2>온라인은 어떻게?</h2><p>현재는 룰 검증용 로컬 2인입니다. 실제 두 휴대폰 대전은 Firebase/Supabase에 방 상태를 저장해야 합니다.</p><ol><li>방 코드 생성</li><li>상대가 입장</li><li>미니게임 점수 동기화</li><li>서버에서 결과 계산</li></ol></div>}
const MINI_LABEL={overheat:'과열 세공', goal:'무조준 골넣기', sequence:'색상 연쇄', memory:'수정 기억 카드', tug:'줄다리기 공명', balance:'균형 정원', rhythm:'별빛 리듬', orbit:'예언 투척'};
function MiniGame({duel,players,onDone}){const Comp={overheat:Overheat, goal:Goal, sequence:Sequence, memory:Memory, tug:Tug, balance:Balance, rhythm:Rhythm, orbit:Orbit}[duel.mini];return <div className="gameScreen"><div className="gameHeader"><p>획득자: {players[duel.attacker].name} · 방해자: {players[1-duel.attacker].name}</p><h1>{MINI_LABEL[duel.mini]}</h1><span>{duel.card.name} / {GEM[duel.card.gem].name} 순도 세공</span></div><Comp onDone={onDone} gem={duel.card.gem}/></div>}
function DuelResultButton({scoreA,scoreD,onDone}){return <button className="finish" onClick={()=>onDone(Math.round(scoreA),Math.round(scoreD))}>결과 확정: 획득자 {Math.round(scoreA)} vs 방해자 {Math.round(scoreD)}</button>}
function Overheat({onDone,gem}){const [temp,setTemp]=useState(20),[stack,setStack]=useState([]),[a,setA]=useState(0),[d,setD]=useState(20);useEffect(()=>{const id=setInterval(()=>setTemp(t=>Math.max(0,t-4)),150);return()=>clearInterval(id)},[]);function tap(side){const good=temp>55&&temp<82; setTemp(t=>Math.min(110,t+8)); setStack(s=>[...s.slice(-18),{id:Math.random(),side,good}]); if(side==='a') setA(x=>x+(good?8:2)); else setD(x=>x+5)}return <div className="mini overheat"><div className="furnace"><div className="heatBand"></div><div className="mercury" style={{height:`${temp}%`}}></div><span>적정 온도에 맞춰 보석 조각을 척척 쌓으세요</span></div><div className="oreStack">{stack.map(o=><b className={o.good?'good':'bad'} key={o.id}>◆</b>)}</div><div className="duelButtons"><button onClick={()=>tap('a')}>획득자 탭</button><button onClick={()=>tap('d')}>방해자 흔들기</button></div><DuelResultButton scoreA={a} scoreD={d} onDone={onDone}/></div>}
function Sequence({onDone}){const colors=['red','blue','yellow'];const [seq]=useState(()=>Array.from({length:18},()=>colors[Math.floor(Math.random()*3)]));const [idx,setIdx]=useState(0),[a,setA]=useState(10),[d,setD]=useState(10);function press(side,c){if(seq[idx]===c){side==='a'?setA(x=>x+6):setD(x=>x+5); setIdx(i=>Math.min(seq.length-1,i+1));}else{side==='a'?setA(x=>x-5):setD(x=>x+2)}}return <div className="mini sequence"><div className="sequenceTrack">{seq.slice(idx,idx+7).map((c,i)=><span key={i} className={c}>{c[0]}</span>)}</div><p>나오는 색을 순서대로 누르세요. 틀리면 감점됩니다.</p><div className="dualPad"><div><h3>획득자</h3>{colors.map(c=><button className={c} onClick={()=>press('a',c)} key={c}>{c}</button>)}</div><div><h3>방해자</h3>{colors.map(c=><button className={c} onClick={()=>press('d',c)} key={c}>{c}</button>)}</div></div><DuelResultButton scoreA={a} scoreD={d} onDone={onDone}/></div>}
function Memory({onDone}){const items=['★','●','▲','◆','☾','✦'];const [open,setOpen]=useState(true);const [grid]=useState(()=>shuffle([...items,...items]));const [target]=useState(()=>items[Math.floor(Math.random()*items.length)]);const [a,setA]=useState(20),[d,setD]=useState(15);useEffect(()=>{setTimeout(()=>setOpen(false),2200)},[]);function pick(side,i){const ok=grid[i]===target; if(side==='a')setA(x=>x+(ok?20:-10)); else setD(x=>x+(ok?16:-4));}return <div className="mini memory"><p>목표 문양: <b>{target}</b> · 2초 뒤 카드가 뒤집힙니다.</p><div className="memoryGrid">{grid.map((it,i)=><button key={i} onClick={()=>pick(i%2?'d':'a',i)}>{open?it:'?'}</button>)}</div><small>홀수 칸은 방해자, 짝수 칸은 획득자 입력으로 처리한 테스트 버전입니다.</small><DuelResultButton scoreA={a} scoreD={d} onDone={onDone}/></div>}
function Tug({onDone}){const [pos,setPos]=useState(50),[zone,setZone]=useState(30),[a,setA]=useState(20),[d,setD]=useState(20);useEffect(()=>{const id=setInterval(()=>setZone(z=>(z+13)%80),700);return()=>clearInterval(id)},[]);function pull(side){const power=zone>25&&zone<55?9:3; setPos(p=>Math.max(0,Math.min(100,p+(side==='a'?power:-power)))); side==='a'?setA(x=>x+power):setD(x=>x+power)}return <div className="mini tug"><div className="rope"><span className="sweet" style={{left:`${zone}%`}}></span><b style={{left:`${pos}%`}}>💎</b></div><p>타이밍 구간에 맞춰 당기면 더 강하게 밀립니다.</p><div className="duelButtons"><button onClick={()=>pull('a')}>획득자 당기기</button><button onClick={()=>pull('d')}>방해자 당기기</button></div><DuelResultButton scoreA={a+(pos-50)} scoreD={d+(50-pos)} onDone={onDone}/></div>}
function Balance({onDone}){const [tilt,setTilt]=useState(0),[a,setA]=useState(20),[d,setD]=useState(20);useEffect(()=>{const id=setInterval(()=>{setTilt(t=>Math.max(-45,Math.min(45,t+(Math.random()*16-8)))); setA(x=>x+(Math.abs(tilt)<12?2:0))},300);return()=>clearInterval(id)},[tilt]);return <div className="mini balance"><div className="plate" style={{transform:`rotate(${tilt}deg)`}}>◆ ◆ ◆</div><p>획득자는 균형을 잡고, 방해자는 바람을 보냅니다.</p><div className="duelButtons"><button onClick={()=>setTilt(t=>t-10)}>왼쪽 보정</button><button onClick={()=>setTilt(t=>t+10)}>오른쪽 보정</button><button onClick={()=>{setTilt(t=>t+(Math.random()>0.5?22:-22));setD(x=>x+8)}}>방해 파동</button></div><DuelResultButton scoreA={a} scoreD={d} onDone={onDone}/></div>}
function Goal({onDone}){const [ball,setBall]=useState({x:50,y:82});const [goal,setGoal]=useState(35);const [a,setA]=useState(20),[d,setD]=useState(20);useEffect(()=>{const id=setInterval(()=>setGoal(g=>(g+7)%70+10),600);return()=>clearInterval(id)},[]);function shoot(){const x=Math.random()*100; const dist=Math.abs(x-goal); setBall({x,y:20}); setTimeout(()=>setBall({x:50,y:82}),500); setA(s=>s+Math.max(0,35-dist));}return <div className="mini goal"><div className="field"><div className="goal" style={{left:`${goal}%`}}>GOAL</div><div className="ball" style={{left:`${ball.x}%`,top:`${ball.y}%`}}>⚽</div></div><p>무조준 투척/슛 테스트: 목표가 움직이고, 힘과 각도는 랜덤 물리값으로 계산됩니다.</p><div className="duelButtons"><button onClick={shoot}>획득자 슛</button><button onClick={()=>setD(x=>x+12)}>방해자 수비</button></div><DuelResultButton scoreA={a} scoreD={d} onDone={onDone}/></div>}
function Rhythm({onDone}){const [notes,setNotes]=useState(()=>Array.from({length:9},(_,i)=>({id:i,x:i*12+10,hit:false})));const [a,setA]=useState(20),[d,setD]=useState(20);useEffect(()=>{const id=setInterval(()=>setNotes(ns=>ns.map(n=>({...n,x:n.x-4})).filter(n=>n.x>-10)),250);return()=>clearInterval(id)},[]);function hit(side){const near=notes.find(n=>Math.abs(n.x-20)<8); if(near){setNotes(ns=>ns.filter(n=>n.id!==near.id)); side==='a'?setA(x=>x+14):setD(x=>x+11)} else {side==='a'?setA(x=>x-7):setD(x=>x-3)}}return <div className="mini rhythm"><div className="rhythmLane"><b className="hitLine"></b>{notes.map(n=><span key={n.id} style={{left:`${n.x}%`}}>♪</span>)}</div><p>판정선에 노트가 왔을 때만 누르세요. 광클하면 감점됩니다.</p><div className="duelButtons"><button onClick={()=>hit('a')}>획득자 박자</button><button onClick={()=>hit('d')}>방해자 박자</button></div><DuelResultButton scoreA={a} scoreD={d} onDone={onDone}/></div>}
function Orbit({onDone}){const [angle,setAngle]=useState(0),[a,setA]=useState(20),[d,setD]=useState(20);useEffect(()=>{const id=setInterval(()=>setAngle(x=>(x+18)%360),100);return()=>clearInterval(id)},[]);function fire(side){const pred=(angle+45)%360; const score=90-Math.abs(180-Math.abs(pred-180)); side==='a'?setA(x=>x+score/5):setD(x=>x+score/6)}return <div className="mini orbit"><div className="orbitCircle"><span style={{transform:`rotate(${angle}deg) translateX(90px)`}}>✦</span></div><p>현재 위치가 아니라 미래 위치를 예측해 발사합니다.</p><div className="duelButtons"><button onClick={()=>fire('a')}>획득자 발사</button><button onClick={()=>fire('d')}>방해자 왜곡</button></div><DuelResultButton scoreA={a} scoreD={d} onDone={onDone}/></div>}
createRoot(document.getElementById('root')).render(<App/>);
