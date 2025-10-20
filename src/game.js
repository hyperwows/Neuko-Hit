
// Game JS - Neuko Hit Game
const board = document.getElementById('board');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const timeEl = document.getElementById('time');
const scoreEl = document.getElementById('score');

const GAME_TIME = 30;
let timeLeft = GAME_TIME;
let score = 0;
let popInterval = null;
let countdown = null;
let active = false;

// audio setup - try to load mp3, but fallback to speechSynthesis if not playable
const audioPath = '../public/sounds/neuko.mp3'; // path relative to src/index.html when served by Vercel root rewrites
let hitAudio = new Audio(audioPath);
let audioAvailable = true;
hitAudio.addEventListener('error', ()=>{ audioAvailable = false; console.warn('neuko.mp3 failed to load - falling back to speechSynthesis'); });
// try to load metadata to detect availability (may be blocked until user gesture)
hitAudio.addEventListener('loadeddata', ()=>{ audioAvailable = true; });

function speakNeukoFallback(){
  try{
    const ut = new SpeechSynthesisUtterance('Neuko');
    const voices = window.speechSynthesis.getVoices();
    if(voices && voices.length){
      ut.voice = voices[0];
    }
    ut.rate = 0.95; ut.pitch = 0.5; ut.volume = 1.0;
    speechSynthesis.speak(ut);
  }catch(e){ console.warn('speech failed', e); }
}

function playNeuko(){
  if(audioAvailable){
    hitAudio.currentTime = 0;
    const p = hitAudio.play();
    if(p && p.catch){ p.catch(()=>{ audioAvailable = false; speakNeukoFallback(); }); }
  }else{
    speakNeukoFallback();
  }
}

// build holes
for(let i=0;i<9;i++){
  const hole = document.createElement('div');
  hole.className = 'hole';
  hole.dataset.index = i;

  const headWrap = document.createElement('div');
  headWrap.className = 'headWrap';
  headWrap.tabIndex = 0;

  const headInner = document.createElement('img');
  headInner.className = 'headInner';
  headInner.draggable = false;
  headInner.src = '/public/images/neuko-head.png';
  headInner.alt = 'neuko head';

  const overlayNormal = document.createElement('div'); overlayNormal.className='overlay normal';
  overlayNormal.innerHTML = `<!-- neutral overlay -->`;

  const overlayHit = document.createElement('div'); overlayHit.className='overlay hitOverlay';
  overlayHit.innerHTML = `<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><g stroke='white' stroke-width='6' stroke-linecap='round'><line x1='30' y1='36' x2='46' y2='52'/><line x1='46' y1='36' x2='30' y2='52'/><line x1='70' y1='36' x2='86' y2='52'/><line x1='86' y1='36' x2='70' y2='52'/></g><ellipse cx='50' cy='70' rx='16' ry='10' fill='rgba(0,0,0,0.85)' stroke='white' stroke-width='3'/></svg>`;

  const overlayDizzy = document.createElement('div'); overlayDizzy.className='overlay dizzyOverlay';
  overlayDizzy.innerHTML = `<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><g stroke='white' stroke-width='5' stroke-linecap='round'><path d='M28 40 q12 12 24 0' fill='none'/><path d='M72 40 q12 12 24 0' transform='translate(-48,0)' fill='none'/></g><g transform='translate(20,10)' stroke='white' stroke-width='4'><path d='M10 20 q10 -12 30 -6 q-6 10 -18 18' fill='none'/></g></svg>`;

  const popup = document.createElement('div'); popup.className='popup'; popup.textContent = '+1';

  headWrap.appendChild(headInner);
  headWrap.appendChild(overlayNormal);
  headWrap.appendChild(overlayHit);
  headWrap.appendChild(overlayDizzy);
  headWrap.appendChild(popup);

  const cap = document.createElement('div'); cap.className = 'cap';

  hole.appendChild(headWrap);
  hole.appendChild(cap);
  board.appendChild(hole);

  overlayHit.style.display='none'; overlayDizzy.style.display='none';

  headWrap.addEventListener('pointerdown', (e)=>{
    if(!active) return;
    if(!headWrap.classList.contains('pop')) return;
    headWrap.classList.add('hit');
    overlayHit.style.display='flex'; overlayNormal.style.display='none';
    playNeuko();
    spawnParticles(hole, e.clientX, e.clientY);
    showPopup(popup);
    score += 1; scoreEl.textContent = score;
    setTimeout(()=>{ overlayHit.style.display='none'; overlayDizzy.style.display='flex'; headWrap.classList.remove('hit'); }, 220);
    setTimeout(()=>{ overlayDizzy.style.display='none'; overlayNormal.style.display='none'; headWrap.classList.remove('pop'); }, 900);
  });

  headWrap.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); headWrap.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})); } });
}

const holes = Array.from(document.querySelectorAll('.hole'));

function randomHole(){ return holes[Math.floor(Math.random()*holes.length)]; }

function popOne(){
  const hole = randomHole();
  const headWrap = hole.querySelector('.headWrap');
  if(headWrap.classList.contains('pop')) return;
  headWrap.classList.add('pop');
  headWrap.querySelector('.overlay.normal').style.display='none';
  headWrap.querySelector('.overlay.hitOverlay').style.display='none';
  headWrap.querySelector('.overlay.dizzyOverlay').style.display='none';
  const stay = 600 + Math.random()*900;
  setTimeout(()=>{ if(headWrap.classList.contains('pop')) headWrap.classList.remove('pop'); }, stay);
}

function startGame(){
  if(active) return; active=true; score=0; scoreEl.textContent=score; timeLeft=GAME_TIME; timeEl.textContent=timeLeft;
  popInterval = setInterval(popOne,400);
  countdown = setInterval(()=>{ timeLeft-=1; timeEl.textContent=timeLeft; if(timeLeft===Math.floor(GAME_TIME*0.6)){ clearInterval(popInterval); popInterval=setInterval(popOne,340);} if(timeLeft===Math.floor(GAME_TIME*0.3)){ clearInterval(popInterval); popInterval=setInterval(popOne,280);} if(timeLeft<=0){ stopGame(); } },1000);
}

function stopGame(){ active=false; clearInterval(popInterval); popInterval=null; clearInterval(countdown); countdown=null; document.querySelectorAll('.headWrap').forEach(h=>{ h.classList.remove('pop'); h.classList.remove('hit'); h.querySelector('.overlay.hitOverlay').style.display='none'; h.querySelector('.overlay.dizzyOverlay').style.display='none'; }); }

startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);

function spawnParticles(hole, clientX, clientY){
  for(let i=0;i<6;i++){
    const p = document.createElement('div'); p.className='particle'; p.style.background = ['#ffb300','#ffd166','#ff8c42'][Math.floor(Math.random()*3)];
    const rect = hole.getBoundingClientRect();
    const x = (clientX || rect.left + rect.width/2) - rect.left;
    const y = (clientY || rect.top + rect.height/2) - rect.top - 10;
    p.style.left = x + 'px'; p.style.top = y + 'px';
    hole.appendChild(p);
    setTimeout(()=>p.remove(),800);
  }
  document.querySelector('.game').style.transform = 'translateY(-4px)';
  setTimeout(()=>{ document.querySelector('.game').style.transform = ''; },120);
}

function showPopup(popup){ popup.classList.add('show'); setTimeout(()=>popup.classList.remove('show'),600); }
