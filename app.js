const quests = [
  [1,'easy','Blessing Box'],[2,'easy','Say the Thing'],[3,'easy','Walk It Out'],[4,'easy','Make the Thing'],[5,'easy','Talk to a Stranger'],[6,'easy','Live Music Mode'],
  [7,'easy','Quiet Service'],[8,'easy','Obscure Compliment'],[9,'easy','Great Job, Keep Moving'],[10,'easy','Use the Good Stuff'],[11,'easy','Text Your Person'],[12,'easy','Small Treat Economy'],
  [13,'easy','Memory Quest'],[14,'easy','Sunshine Save Point'],[15,'easy','Clean Slate'],[16,'easy','Feed the People'],[17,'easy','Spontaneous Adventure'],[18,'easy','Check In'],
  [19,'easy','Joy Without Apology'],[20,'easy','Generous Review'],[21,'easy','Let Something Go'],[22,'easy','Be the Soft Place'],[23,'easy','Gratitude Drop'],[24,'easy',"Dealer's Choice"],
  [25,'hard','Cheers It Forward'],[26,'hard','Guerrilla Clean Up'],[27,'hard','Dog Park Pandamonium'],[28,'hard','Holiday Card Heist'],[29,'hard','Grave Encounter'],[30,'hard','Drive-By Love'],
  [31,'hard','Blind Gig'],[32,'hard','Sporty Nonsense'],[33,'hard','Chaos Menu'],[34,'hard','Stupid Game Theory'],[35,'hard','Trivia Chaos'],[36,'hard','Boots or Belt It']
].map(([id,mode,title]) => ({
  id, mode, title,
  image:`./assets/cards/quest_${String(id).padStart(2,'0')}.png`
}));

let state = { mode:null, current:null, lastId:null, sound:true, opened:false };
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const screens = $$('.screen');
const topbar = $('#topbar');
const gift = $('#gift');
const giftStage = $('#giftStage');
const openGiftButton = $('#openGiftButton');
const rollButton = $('#rollButton');
const diceStage = $('.dice-stage');
const dieOne = $('#dieOne');
const dieTwo = $('#dieTwo');
const rollCallout = $('#rollCallout');
const questCard = $('#questCard');
const acceptedCard = $('#acceptedCard');
const cardFrame = $('#cardFrame');
const banner = $('.result-banner');
const toast = $('#toast');
const saveStatus = $('#saveStatus');

function showScreen(name){
  screens.forEach(s => s.classList.toggle('active', s.dataset.screen === name));
  topbar.hidden = name === 'intro';
  window.scrollTo({top:0,behavior:'auto'});
}
function randomDie(){ return Math.floor(Math.random()*6)+1; }
function landingTransform(n, wobble=0){
  const rotations={
    1:[-12,8], 2:[-10,-82], 3:[-102,8],
    4:[78,8], 5:[-10,98], 6:[-10,188]
  };
  const [x,y]=rotations[n] || rotations[1];
  return `rotateX(${x+wobble}deg) rotateY(${y-wobble}deg) rotateZ(${wobble/2}deg)`;
}
function landDie(el,n,wobble=0){ el.style.transform=landingTransform(n,wobble); }
function beep(freq=440,duration=.06,type='square'){
  if(!state.sound) return;
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = beep.ctx || (beep.ctx = new AudioCtx());
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type=type;o.frequency.value=freq;g.gain.value=.035;o.connect(g);g.connect(ctx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.stop(ctx.currentTime+duration);
  }catch(e){}
}
function showToast(message){
  toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2400);
}
function confetti(target,count=28){
  target.innerHTML='';
  const colors=['#ffc83d','#32a7ff','#ff4fa7','#5ee05e','#9a4dff','#fff'];
  for(let i=0;i<count;i++){
    const p=document.createElement('i');p.className='confetti-piece';
    p.style.left=`${Math.random()*100}%`;p.style.color=colors[i%colors.length];p.style.background=colors[i%colors.length];
    p.style.setProperty('--drift',`${(Math.random()-.5)*180}px`);p.style.animationDelay=`${Math.random()*.45}s`;p.style.animationDuration=`${1.2+Math.random()*1.3}s`;target.appendChild(p);
  }
  setTimeout(()=>target.innerHTML='',3000);
}
function resetAll(){
  state.mode=null;state.current=null;state.lastId=null;
  showScreen('mode');
}
function selectMode(mode){
  state.mode=mode;
  const rollScreen=$('[data-screen="roll"]');
  rollScreen.classList.toggle('hard-roll',mode==='hard');
  $('#modeEyebrow').textContent=mode==='hard'?'☠ HARD MODE':'♥ EASY MODE';
  beep(mode==='hard'?180:520,.09);
  showScreen('roll');
}
function chooseQuest(){
  const pool=quests.filter(q=>q.mode===state.mode && q.id!==state.lastId);
  const q=pool[Math.floor(Math.random()*pool.length)];
  state.current=q;state.lastId=q.id;
  return q;
}
function rollQuest(){
  rollButton.disabled=true;
  const d1=randomDie(), d2=randomDie();
  rollCallout.textContent=state.mode==='hard'?'TEMPTING FATE. EXCELLENT CHOICE.':'SHAKING THE TINY CUBES OF DESTINY…';
  diceStage.classList.remove('rolling');
  void diceStage.offsetWidth;
  diceStage.classList.add('rolling');
  let ticks=0;
  const interval=setInterval(()=>{
    ticks++;
    beep(150+Math.random()*260,.02);
    if(ticks%3===0) rollCallout.textContent=['THE DICE ARE CONSIDERING IT…','CONSULTING THE CHAOS TABLE…','THIS SEEMS SCIENTIFIC…'][Math.floor(Math.random()*3)];
  },90);
  setTimeout(()=>{
    clearInterval(interval);
    diceStage.classList.remove('rolling');
    // Force the cubes to their actual rolled faces after the tumble.
    void dieOne.offsetWidth;
    landDie(dieOne,d1,-2);
    landDie(dieTwo,d2,2);
    rollCallout.textContent=`YOU ROLLED ${d1 + d2}. THIS NUMBER MEANS ABSOLUTELY NOTHING.`;
    beep(120,.04);setTimeout(()=>beep(190,.05),70);
    const q=chooseQuest();
    setTimeout(()=>{
      renderQuest(q);
      beep(state.mode==='hard'?210:650,.12);
      rollButton.disabled=false;
      showScreen('result');
    },430);
  },1180);
}
const imageObjectUrls = new WeakMap();

function cardUrl(q, bust=false){
  const url = new URL(q.image, document.baseURI);
  if(bust) url.searchParams.set('fresh', `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  return url.href;
}

async function fetchCardBlob(q){
  const url = cardUrl(q, true);
  const res = await fetch(url, { cache:'no-store' });
  if(!res.ok) throw new Error(`Card request failed: ${res.status} ${res.statusText}`);

  // GitHub Pages can serve generated image files with a generic MIME type.
  // Navigating directly to the PNG still works because the browser sniffs it,
  // but an <img> backed by a Blob URL may reject application/octet-stream.
  // Read the bytes and explicitly label them as PNG before rendering/sharing.
  const bytes = await res.arrayBuffer();
  if(!bytes.byteLength) throw new Error('Card request returned an empty file');
  const signature = new Uint8Array(bytes.slice(0, 8));
  const isPng = signature.length === 8 &&
    signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47 &&
    signature[4] === 0x0D && signature[5] === 0x0A && signature[6] === 0x1A && signature[7] === 0x0A;
  if(!isPng) throw new Error(`Card response was not a PNG (server type: ${res.headers.get('content-type') || 'unknown'})`);
  return new Blob([bytes], { type:'image/png' });
}

async function setCardImage(img,q){
  img.classList.remove('image-loaded','image-error');
  img.alt=`Quest ${q.id}: ${q.title}`;
  img.onclick=null;

  // Every render gets a token so an older async request cannot overwrite a newer roll.
  const token = `${q.id}-${Date.now()}-${Math.random()}`;
  img.dataset.loadToken = token;
  img.removeAttribute('src');

  try{
    const blob = await fetchCardBlob(q);
    if(img.dataset.loadToken !== token) return;

    // Convert the known-good PNG Blob to an explicit data:image/png URL.
    // This avoids depending on GitHub's response MIME type or Blob URL handling.
    const dataUrl = await new Promise((resolve,reject)=>{
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('Could not convert card image'));
      reader.readAsDataURL(blob);
    });
    if(img.dataset.loadToken !== token) return;

    img.onload=()=>{
      if(img.dataset.loadToken!==token) return;
      img.classList.add('image-loaded');
    };
    img.onerror=()=>{
      if(img.dataset.loadToken!==token) return;
      img.classList.add('image-error');
      showToast('PNG bytes loaded, but the browser still refused the image. Tap here to open the original.');
      img.onclick=()=>window.open(cardUrl(q,true),'_blank','noopener');
    };
    img.src=dataUrl;
  }catch(err){
    if(img.dataset.loadToken !== token) return;
    console.error('Quest card fetch failed:', err, cardUrl(q));
    img.classList.add('image-error');
    img.removeAttribute('src');
    showToast(`Card fetch failed: ${err.message}. Tap the card area to open it directly.`);
    img.onclick=()=>window.open(cardUrl(q,true),'_blank','noopener');
  }
}

function renderQuest(q){
  setCardImage(questCard,q);
  $('#questNumber').textContent=`QUEST ${String(q.id).padStart(2,'0')}`;$('#questTitle').textContent=q.title;
  $('#questModeLabel').textContent=q.mode==='hard'?'HARD MODE QUEST':'YOUR QUEST';
  cardFrame.classList.toggle('hard',q.mode==='hard');banner.classList.toggle('hard',q.mode==='hard');
}
async function downloadCard(q,quiet=false){
  const filename=`jonah-side-quest-${String(q.id).padStart(2,'0')}-${q.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}.png`;
  try{
    const blob=await fetchCardBlob(q);const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
    if(!quiet) showToast('Card download started.');
    return true;
  }catch(e){
    const a=document.createElement('a');a.href=cardUrl(q,true);a.download=filename;a.target='_blank';document.body.appendChild(a);a.click();a.remove();
    if(!quiet) showToast('Opened card image — save it from your browser.');
    return false;
  }
}
async function acceptQuest(){
  if(!state.current)return;
  setCardImage(acceptedCard,state.current);
  showScreen('accepted');confetti($('#acceptConfetti'),45);beep(523,.08);setTimeout(()=>beep(659,.08),90);setTimeout(()=>beep(784,.12),180);
  saveStatus.textContent='Starting your card download…';
  const ok=await downloadCard(state.current,true);
  saveStatus.textContent=ok?'Download started. On iPhone, the Share button is often the easiest way to save to Photos.':'Your browser may open the card instead. Save it from there, or use Share Quest.';
}
async function shareQuest(){
  if(!state.current)return;
  try{
    const blob=await fetchCardBlob(state.current);
    const file=new File([blob],`jonah-side-quest-${state.current.id}.png`,{type:'image/png'});
    if(navigator.canShare?.({files:[file]})){
      await navigator.share({title:`Jonah's Side Quest: ${state.current.title}`,text:`I rolled Quest ${state.current.id}: ${state.current.title}. Apparently this is my life now.`,files:[file]});
    }else if(navigator.share){
      await navigator.share({title:`Jonah's Side Quest: ${state.current.title}`,text:`I rolled Quest ${state.current.id}: ${state.current.title}.`});
    }else{
      await downloadCard(state.current);showToast('Sharing is not supported here, so I downloaded it instead.');
    }
  }catch(e){ if(e.name!=='AbortError') showToast('Share menu declined the quest. Fair enough.'); }
}

openGiftButton.addEventListener('click',()=>{
  if(!state.opened){
    state.opened=true;gift.classList.add('open');giftStage.classList.add('opened');confetti($('#introConfetti'),40);beep(392,.08);setTimeout(()=>beep(523,.08),120);setTimeout(()=>beep(659,.14),240);openGiftButton.textContent='⚔ CHOOSE YOUR FATE';
  }else{showScreen('mode');beep(620,.06);}
});
$$('.mode-card').forEach(b=>b.addEventListener('click',()=>selectMode(b.dataset.mode)));
rollButton.addEventListener('click',rollQuest);
$('#rerollButton').addEventListener('click',()=>{showScreen('roll');setTimeout(rollQuest,180)});
$('#acceptButton').addEventListener('click',acceptQuest);
$('#saveButton').addEventListener('click',()=>state.current&&downloadCard(state.current));
$('#shareButton').addEventListener('click',shareQuest);
$('#changeModeButton').addEventListener('click',()=>showScreen('mode'));
$('#homeButton').addEventListener('click',resetAll);
$('#resultRestartButton').addEventListener('click',resetAll);
$('#acceptedRestartButton').addEventListener('click',resetAll);
$('#soundButton').addEventListener('click',()=>{state.sound=!state.sound;$('#soundButton').textContent=state.sound?'♪':'×';showToast(state.sound?'Tiny game noises: ON':'Tiny game noises: OFF');if(state.sound)beep(600,.05)});

// v4 deliberately disables service workers/cache while the app is actively changing.
if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
if ('caches' in window) caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).catch(()=>{});
