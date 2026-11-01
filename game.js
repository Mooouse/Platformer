import {createFrame, clearFrame, createFx, composite} from './pixelfx/core/index.js';
import {createArt} from './art.js';
import * as collectBurst from './pixelfx/fx/pickups/collect-burst.js';
import * as hitSpark from './pixelfx/fx/impacts/hit-spark.js';
import * as swordSlash from './pixelfx/fx/melee/sword-slash.js';
import * as arcanePortal from './pixelfx/fx/arcane/portal.js';
import * as smallExplosion from './pixelfx/fx/explosions/small-explosion.js';
import * as teleportPad from './pixelfx/fx/scifi/teleporter-pad.js';
import * as torch from './pixelfx/fx/fire/torch.js';

const W=480,H=270, FLOOR=232, TAU=Math.PI*2;
const canvas=document.querySelector('#game');
const ctx=canvas.getContext('2d',{alpha:false});
ctx.imageSmoothingEnabled=false;
const fxCanvas=document.createElement('canvas');fxCanvas.width=W;fxCanvas.height=H;
const fxCtx=fxCanvas.getContext('2d',{alpha:true,willReadFrequently:false});
const fxFrame=createFrame(W,H), fxPixels=fxCtx.createImageData(W,H);
const art=createArt(ctx,W,H);
const overlay=document.querySelector('#overlay'), hud=document.querySelector('#hud');
const heartsEl=document.querySelector('#hearts'), shardEl=document.querySelector('#shard-count'),stageEl=document.querySelector('#stage-name');
const menuTitle=document.querySelector('#menu-title'),menuDesc=document.querySelector('#menu-description'),menuTag=document.querySelector('#menu-tag');
const menuStats=document.querySelector('#menu-stats'),menuHint=document.querySelector('#menu-hint');
const primaryBtn=document.querySelector('#primary-btn'),secondaryBtn=document.querySelector('#secondary-btn');
const toastEl=document.querySelector('#toast'),soundBtn=document.querySelector('#sound-btn');
const colorSets=[
 {name:'THE MOSSWORKS',subtitle:'Ruins swallowed by a luminous forest',sky:['#0c1b35','#1f3750','#233f4d'],hills:['#162d43','#1d3649'],blocks:['#283c4b','#4b6870','#81bf8e','#a5d6a2'],accent:'#8ef7d6',dark:'#132c35',enemy:'#fbc078'},
 {name:'ASHEN KEEP',subtitle:'An old fortress above the ember sea',sky:['#21132a','#45283c','#78403c'],hills:['#302135','#4b283b'],blocks:['#473342','#70515a','#d48a70','#efae80'],accent:'#ffba91',dark:'#34212b',enemy:'#ffd4a0'},
 {name:'STARFALL',subtitle:'The broken observatory at the edge of the stars',sky:['#0b173b','#242c64','#3a386d'],hills:['#171f4c','#242852'],blocks:['#282b58','#515c91','#80a9fb','#b6d3ff'],accent:'#9ceaff',dark:'#182346',enemy:'#f6a4e8'}
];
const rawLevels=[
 {ground:[[0,430],[476,400],[930,420],[1402,448]],platforms:[[156,194,76],[314,164,86],[527,193,93],[683,176,80],[836,160,88],[984,195,75],[1136,166,86],[1293,188,64],[1480,181,88],[1650,163,96]],gems:[[200,168],[353,137],[561,167],[735,148],[865,132],[1040,168],[1190,139],[1525,153],[1699,135]],foes:[[265,211,230,394,31,0],[595,211,530,817,36,0],[1073,211,990,1263,35,0],[1600,211,1490,1775,47,0],[749,134,704,837,25,1]],spikes:[[386,405],[781,801],[1188,1208],[1750,1775]],checkpoints:[694,1427],torches:[350,1044,1649],end:1810},
 {ground:[[0,380],[432,376],[868,382],[1310,410],[1768,332]],platforms:[[130,189,80],[290,158,84],[476,183,88],[625,157,74],[737,189,90],[905,181,72],[1035,158,88],[1184,182,68],[1365,193,88],[1515,160,95],[1810,181,93],[1968,161,77]],gems:[[171,163],[328,133],[520,156],[655,129],[772,161],[947,154],[1072,132],[1235,153],[1404,167],[1552,133],[1850,154],[2005,132]],foes:[[261,211,230,368,40,0],[560,211,470,780,44,0],[964,211,895,1185,51,0],[1418,211,1350,1666,56,0],[1840,211,1780,2055,51,0],[1092,119,1034,1200,28,1]],spikes:[[344,364],[741,763],[1125,1156],[1606,1633],[1889,1910]],checkpoints:[820,1325],torches:[290,636,1010,1555,1880],end:2070},
 {ground:[[0,405],[461,404],[922,413],[1394,414],[1873,477]],platforms:[[139,194,76],[290,161,88],[506,183,76],[651,156,86],[790,187,76],[977,183,88],[1138,150,88],[1281,180,75],[1475,170,83],[1632,151,85],[1820,177,72],[2021,164,80],[2185,150,76]],gems:[[177,167],[334,135],[540,155],[692,127],[829,158],[1015,154],[1182,122],[1308,151],[1509,144],[1673,123],[1849,149],[2066,135],[2220,123]],foes:[[267,211,222,379,47,0],[550,211,490,840,55,0],[1020,211,953,1298,53,0],[1490,211,1420,1775,59,0],[1960,211,1888,2320,58,0],[722,119,650,841,31,1],[1673,115,1628,1810,35,1]],spikes:[[368,392],[818,845],[1234,1259],[1701,1725],[2080,2111]],checkpoints:[925,1877],torches:[328,740,1210,1550,2039],end:2322}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const hash=(n)=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
const overlap=(ax,ay,aw,ah,bx,by,bw,bh)=>ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;
let mode='menu',stage=0,level=null,player=null,camera=0,clock=0,last=0,raf=0,shake=0,flash=0;
let fxList=[],shards=0,toastTime=0,gateHintTime=0,particles=[],shootTime=0;
let highestUnlock=0,sound=true,ac=null,musicT=0,musicStep=0;
try{highestUnlock=clamp(Number(localStorage.getItem('shard-runner-unlock')||0),0,2);sound=localStorage.getItem('shard-runner-sound')!=='off'}catch{}
const keys={left:false,right:false},touch={left:false,right:false};
let queuedJump=false,queuedDash=false,onPrimary=()=>{},onSecondary=()=>{};
const palettes={
 aqua:['#102844','#205b77','#287fa5','#39bcd3','#7de4e7','#b8fff2','#ffffff'],
 amber:['#3e1728','#913b36','#db6d49','#f99a57','#ffc274','#ffe1ae','#ffffff'],
 lilac:['#1a1641','#433273','#7756b0','#ab7ce2','#d4b3ff','#eedbff','#ffffff']
};
function sfx(type){
 if(!sound||!ac)return;
 const at=ac.currentTime,osc=ac.createOscillator(),gain=ac.createGain();
 osc.connect(gain);gain.connect(ac.destination);
 const sounds={jump:[330,530,.12,'sine',.045],dash:[220,90,.17,'sawtooth',.05],gem:[590,1030,.20,'triangle',.048],hit:[160,46,.17,'sawtooth',.065],hurt:[185,75,.26,'triangle',.060],gate:[360,820,.48,'sine',.08],step:[92,66,.055,'triangle',.009]};
 const [a,b,d,w,v]=sounds[type]||sounds.gem;
 osc.type=w;osc.frequency.setValueAtTime(a,at);osc.frequency.exponentialRampToValueAtTime(Math.max(1,b),at+d);
 gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(v,at+.012);
 gain.gain.exponentialRampToValueAtTime(.0001,at+d);
 osc.start(at);osc.stop(at+d+.025);
}
function musicTick(dt){
 if(!sound||!ac||mode!=='playing')return;
 musicT+=dt;if(musicT<.36)return;musicT-=.36;
 const notes=[220,0,329.63,0,261.63,0,392,329.63,196,0,293.66,0,261.63,329.63,392,0];
 const freq=notes[musicStep++%notes.length];if(!freq)return;
 const o=ac.createOscillator(),v=ac.createGain(),at=ac.currentTime;
 o.type='sine';o.frequency.setValueAtTime(freq/2,at);o.connect(v);v.connect(ac.destination);
 v.gain.setValueAtTime(.0001,at);v.gain.linearRampToValueAtTime(.010,at+.02);v.gain.exponentialRampToValueAtTime(.0001,at+.32);
 o.start(at);o.stop(at+.33);
}
function startAudio(){if(!sound)return;try{ac??=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch{sound=false}}
function updateSound(){soundBtn.textContent=sound?'♫ SOUND ON':'♫ SOUND OFF';try{localStorage.setItem('shard-runner-sound',sound?'on':'off')}catch{}}
function spawn(mod,x,y,opts={},loop=false){
 if(fxList.length>28)fxList=fxList.filter(e=>e.loop||e.age<.65);
 const fx=createFx(mod,{x:0,y:0,seed:Math.floor(hash(x*3+y+clock)*100000),...opts});
 fxList.push({fx,x,y,loop,age:0});return fx;
}
function dust(x,y,c,n=6,power=1){
 for(let i=0;i<n;i++){const ang=Math.PI+hash(i+clock*107)*Math.PI;const speed=(20+hash(i*5+clock*41)*65)*power;
 particles.push({x,y,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed*.55-12,life:.25+hash(i*9+clock)*.4,max:.65,c,s:hash(i+14)>0.55?2:1});}
 if(particles.length>110)particles.splice(0,particles.length-110);
}
function notify(message,duration=1.8){toastEl.textContent=message;toastEl.classList.remove('hidden');toastTime=duration}
function hideToast(){toastTime=0;toastEl.classList.add('hidden')}
function setupLevel(index){
 stage=index;const src=rawLevels[stage],theme=colorSets[stage];
 level={...src,theme,stage:index,
  solids:[...src.ground.map(([x,w])=>({x,y:FLOOR,w,h:100,ground:true})),
    ...src.platforms.map(([x,y,w])=>({x,y,w,h:11,ground:false}))],
  gems:src.gems.map(([x,y])=>({x,y,taken:false})),
  foes:src.foes.map(([x,y,min,max,speed,flying])=>({x,y,min,max,speed,flying,baseY:y,dir:hash(x)>0.5?1:-1,alive:true,hit:0})),
  activeCheckpoints:new Set()};
 player={x:48,y:FLOOR-22,w:12,h:22,vx:0,vy:0,face:1,grounded:false,coyote:0,jumps:0,dash:0,dashCD:0,invuln:0,hp:3,checkpoint:48,runT:0};
 camera=0;shake=0;flash=0;shards=0;fxList=[];particles=[];hideToast();gateHintTime=0;shootTime=0;
 spawn(arcanePortal,level.end,FLOOR-4,{width:15,height:27,palette:stage===1?palettes.amber:stage===2?palettes.lilac:palettes.aqua,light:.85},true);
 spawn(teleportPad,level.end,FLOOR,{palette:stage===1?palettes.amber:palettes.aqua,light:.58},true);
 for(const [i,x] of src.torches.entries())spawn(torch,x,210,{...(stage===1?{}:{palette:palettes.aqua}),light:.46,seed:x+i},true);
 updateHUD();
}
function updateHUD(){
 if(!player)return;
 heartsEl.textContent=('♥ '.repeat(Math.max(0,player.hp))+'♡ '.repeat(3-player.hp)).trim();
 shardEl.textContent=shards+' / 3';
 stageEl.textContent=String(stage+1).padStart(2,'0')+' / '+colorSets[stage].name;
}
function showMenu(kind='menu'){
 mode=kind;overlay.classList.remove('hidden');hud.classList.toggle('hidden',kind==='menu'||kind==='dead'||kind==='complete');
 secondaryBtn.classList.add('hidden');
 menuStats.style.display='';menuHint.style.display='';
 if(kind==='menu'){
  menuTag.textContent='A PIXELFX ACTION PLATFORMER';
  menuTitle.innerHTML='SHARD<span>RUNNER</span>';
  menuDesc.innerHTML='Three lost realms. One last spark.<br>Run, double-jump and dash through the ruins.';
  primaryBtn.innerHTML=highestUnlock?'CONTINUE — REALM '+(highestUnlock+1)+' <span>➜</span>':'BEGIN THE JOURNEY <span>➜</span>';
  onPrimary=()=>startGame(highestUnlock);
 } else if(kind==='paused'){
  menuTag.textContent='THE WORLD IS WAITING';menuTitle.innerHTML='PAU<span>SED</span>';
  menuDesc.textContent='Even heroes need a moment.';primaryBtn.innerHTML='RESUME <span>➜</span>';
  secondaryBtn.classList.remove('hidden');secondaryBtn.textContent='RESTART LEVEL';
  onPrimary=()=>resume();onSecondary=()=>startGame(stage);
 } else if(kind==='dead'){
  menuTag.textContent='YOUR LIGHT STILL BURNS';menuTitle.innerHTML='TRY<span>AGAIN</span>';
  menuDesc.textContent='The shadows won this round. Every run brings you closer.';
  primaryBtn.innerHTML='RETRY REALM <span>➜</span>';onPrimary=()=>startGame(stage);
 } else if(kind==='won'){
  menuTag.textContent='REALM CLEARED';menuTitle.innerHTML='GATE<span>OPEN</span>';
  menuDesc.innerHTML='Shards recovered: '+shards+' / '+level.gems.length+'<br>'+colorSets[stage].subtitle;
  primaryBtn.innerHTML='NEXT REALM <span>➜</span>';onPrimary=()=>startGame(stage+1);
 } else if(kind==='complete'){
  menuTag.textContent='ALL THREE REALMS RESTORED';menuTitle.innerHTML='THE<span>END?</span>';
  menuDesc.innerHTML='You relit the last gate.<br>But there are always more worlds beyond it.';
  primaryBtn.innerHTML='PLAY AGAIN <span>➜</span>';onPrimary=()=>startGame(0);
 }
 if(kind!=='menu'){menuStats.style.display='none';menuHint.style.display='none';}
}
function startGame(index=0){
 startAudio();setupLevel(index);mode='playing';overlay.classList.add('hidden');hud.classList.remove('hidden');
 queuedJump=false;queuedDash=false;keys.left=keys.right=false;touch.left=touch.right=false;
}
function resume(){startAudio();mode='playing';overlay.classList.add('hidden');hud.classList.remove('hidden')}
function pause(){if(mode==='playing'){showMenu('paused')}else if(mode==='paused'){resume()}}
function hurt(){
 if(player.invuln>0||player.dash>0||mode!=='playing')return;
 player.hp--;player.invuln=1.25;shake=3;flash=.14;dust(player.x+6,player.y+10,'#fd8c9d',13,1.1);
 spawn(hitSpark,player.x+6,player.y+9,{palette:palettes.amber,height:15,light:.55});sfx('hurt');
 updateHUD();
 if(player.hp<=0){showMenu('dead');return}
 player.x=player.checkpoint;player.y=FLOOR-38;player.vy=-45;player.vx=0;camera=clamp(player.x-135,0,level.end-W+80);
 notify('CHECKPOINT RESTORED');
}
function collect(gem){
 gem.taken=true;shards++;
 spawn(collectBurst,gem.x,gem.y,{palette:stage===1?palettes.amber:stage===2?palettes.lilac:palettes.aqua,light:.8});
 dust(gem.x,gem.y,level.theme.accent,9,.65);sfx('gem');updateHUD();
 if(shards===3){notify('GATE UNLOCKED — FIND THE EXIT!',2.3);sfx('gate')}
}
function kill(enemy){
 enemy.alive=false;shake=2.4;
 spawn(hitSpark,enemy.x,enemy.y+7,{palette:palettes.amber,height:17,flip:player.face<0,light:.8});
 spawn(smallExplosion,enemy.x,enemy.y+14,{size:.30,light:.3,palette:stage===1?palettes.amber:palettes.aqua});
 dust(enemy.x,enemy.y+7,level.theme.enemy,12,1.2);sfx('hit');
}
function completeLevel(){
 sfx('gate');flash=.55;shake=3;
 spawn(collectBurst,level.end,FLOOR-25,{palette:palettes.aqua,light:1});
 if(stage===2){showMenu('complete')}else{
  try{localStorage.setItem('shard-runner-unlock',String(Math.max(highestUnlock,stage+1)))}catch{}
  highestUnlock=Math.max(highestUnlock,stage+1);showMenu('won');
 }
}
function step(dt){
 clock+=dt;
 if(mode!=='playing')return;
 musicTick(dt);
 if(toastTime>0){toastTime-=dt;if(toastTime<=0)hideToast()}
 player.invuln=Math.max(0,player.invuln-dt);
 player.dashCD=Math.max(0,player.dashCD-dt);
 gateHintTime=Math.max(0,gateHintTime-dt);
 flash=Math.max(0,flash-dt*2);shake=Math.max(0,shake-dt*16);
 const p=player;
 const move=(keys.right||touch.right?1:0)-(keys.left||touch.left?1:0);
 if(move)p.face=move;
 p.coyote=p.grounded ? 0.075 : Math.max(0,p.coyote-dt);
 if(queuedJump){
  if(p.grounded||p.coyote>0||p.jumps<2){
   if(!p.grounded&&p.coyote<=0&&p.jumps===0)p.jumps=1;
   p.vy=-272;p.grounded=false;p.coyote=0;p.jumps++;
   dust(p.x+6,p.y+21,level.theme.accent,7,.48);sfx('jump');
   if(p.jumps===2){spawn(collectBurst,p.x+6,p.y+18,{palette:palettes.aqua,light:.30})}
  }
  queuedJump=false;
 }
 if(queuedDash){
  if(p.dashCD<=0){
   p.dash=.18;p.dashCD=.73;p.vy=0;p.vx=p.face*335;p.invuln=Math.max(p.invuln,.23);shake=1.1;
   spawn(swordSlash,p.x+6+p.face*12,p.y+12,{flip:p.face<0,radius:26,light:.60,palette:stage===1?palettes.amber:stage===2?palettes.lilac:palettes.aqua});
   dust(p.x+6,p.y+12,level.theme.accent,9,.8);sfx('dash');
  }
  queuedDash=false;
 }
 const prevBottom=p.y+p.h;
 if(p.dash>0){
  p.dash-=dt;p.vx=p.face*335;p.vy=0;
  if(hash(clock*146)>.5)particles.push({x:p.x+6,y:p.y+12,vx:-p.face*34,vy:(hash(clock*200)-.5)*15,life:.20,max:.20,c:level.theme.accent,s:2});
 }else{
  const target=move*146,accel=p.grounded?1100:650;
  p.vx+=clamp(target-p.vx,-accel*dt,accel*dt);
  p.vy=Math.min(450,p.vy+755*dt);
 }
 p.x=clamp(p.x+p.vx*dt,-8,level.end+35);
 p.y+=p.vy*dt;
 p.grounded=false;
 if(p.vy>=0){
  for(const s of level.solids){
   if(p.x+p.w<s.x+2||p.x>s.x+s.w-2)continue;
   if(prevBottom<=s.y+7&&p.y+p.h>=s.y&&p.y+p.h<s.y+28){
    if(p.vy>165) dust(p.x+6,s.y,level.theme.blocks[2],Math.min(9,Math.floor(p.vy/50)),.42);
    p.y=s.y-p.h;p.vy=0;p.grounded=true;p.jumps=0;break;
   }
  }
 }
 if(p.grounded&&Math.abs(p.vx)>30){p.runT+=dt;if(p.runT>.14){p.runT=0;dust(p.x+6,p.y+22,level.theme.blocks[1],2,.23)}}
 if(p.y>H+42){hurt();if(mode==='playing'){p.y=FLOOR-35;p.vy=0}}
 if(mode!=='playing')return;
 for(const enemy of level.foes){
  if(!enemy.alive)continue;
  enemy.x+=enemy.speed*enemy.dir*dt;
  if(enemy.x<enemy.min){enemy.x=enemy.min;enemy.dir=1}
  if(enemy.x>enemy.max){enemy.x=enemy.max;enemy.dir=-1}
  if(enemy.flying)enemy.y=enemy.baseY+Math.sin(clock*2.7+enemy.min)*8;
  if(overlap(p.x+1,p.y+1,10,20,enemy.x-7,enemy.y-7,14,15)){
   if(p.dash>0)kill(enemy);else hurt();
  }
 }
 for(const [x0,x1] of level.spikes){
  if(overlap(p.x+2,p.y+4,8,18,x0,FLOOR-9,x1-x0,9))hurt();
 }
 for(const gem of level.gems)if(!gem.taken&&Math.abs(p.x+6-gem.x)<14&&Math.abs(p.y+11-gem.y)<17)collect(gem);
 for(const x of level.checkpoints){
  if(p.x>x&&!level.activeCheckpoints.has(x)){
   level.activeCheckpoints.add(x);p.checkpoint=x-14;notify('CHECKPOINT ACTIVATED');
   spawn(collectBurst,x,FLOOR-25,{palette:palettes.aqua,light:.65});sfx('gem');
  }
 }
 if(p.x+6>level.end-18){
  if(shards>=3)completeLevel();
  else if(gateHintTime<=0){notify('NEED '+(3-shards)+' MORE SHARD'+(3-shards===1?'':'S')+' TO OPEN THE GATE');gateHintTime=2}
 }
 for(const item of fxList){item.fx.update(dt);item.age+=dt}
 fxList=fxList.filter(f=>f.loop||!f.fx.done());
 for(const v of particles){v.x+=v.vx*dt;v.y+=v.vy*dt;v.vy+=165*dt;v.life-=dt}
 particles=particles.filter(v=>v.life>0);
 camera=lerp(camera,clamp(p.x-145,0,Math.max(0,level.end-W+80)),clamp(dt*6.2,0,1));
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(Math.round(points[0][0]),Math.round(points[0][1]));for(let i=1;i<points.length;i++)ctx.lineTo(Math.round(points[i][0]),Math.round(points[i][1]));ctx.closePath();ctx.fill()}
function drawBackground(){
 const th=level.theme;
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,th.sky[0]);grad.addColorStop(.62,th.sky[1]);grad.addColorStop(1,th.sky[2]);
 ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 // star-field and drifting luminous dust
 for(let i=0;i<72;i++){
  const x=(((i*83+hash(i+3)*220-camera*.12)%560)+560)%560-36,y=12+hash(i*7+40)*160;
  const flick=.32+.36*Math.sin(clock*(.5+hash(i)*1.8)+i);
  ctx.globalAlpha=clamp(flick,.12,.85);rect(x,y,i%13===0?2:1,i%17===0?2:1,i%5===0?'#c8ffff':'#adbaf8');
 }
 ctx.globalAlpha=1;
 // distant moon glow
 const moonX=350-camera*.04;
 ctx.fillStyle=th.accent+'0d';ctx.beginPath();ctx.arc(moonX,68,61,0,TAU);ctx.fill();
 ctx.fillStyle=th.accent+'31';ctx.beginPath();ctx.arc(moonX,68,33,0,TAU);ctx.fill();
 ctx.fillStyle=th.accent+'98';ctx.beginPath();ctx.arc(moonX,68,19,0,TAU);ctx.fill();
 ctx.fillStyle=th.sky[1];ctx.beginPath();ctx.arc(moonX-6,62,15,0,TAU);ctx.fill();
 for(let layer=0;layer<2;layer++){
  const f=layer?.34:.18,base=layer?195:171,period=115;
  const ox=Math.floor(camera*f/period)*period-camera*f;
  for(let i=-1;i<7;i++){
   const world=Math.floor(camera*f/period)+i, x=Math.floor(ox+i*period),h=20+hash(world*7+layer)*46;
   poly([[x-38,base+20],[x+35,base-h],[x+93,base+24]],th.hills[layer]);
  }
 }
 // broken towers and hanging arches
 const f=.48;
 for(let i=-1;i<13;i++){
  const wx=i*178+35, x=Math.round(wx-camera*f);
  if(x<-80||x>W+80)continue;
  const height=21+Math.floor(hash(i*11+5)*36);
  rect(x,202-height,15,height,th.dark);rect(x-4,202-height,23,5,th.hills[1]);
  rect(x+5,202-height+11,4,8,th.sky[0]);
  if(i%3===0){rect(x+29,188-height,12,height+14,th.dark);rect(x+15,184-height,29,5,th.hills[1])}
 }
 // subtle parallax near-floor mist, not full-screen flashes
 ctx.globalAlpha=.14;rect(0,213,W,23,th.accent);ctx.globalAlpha=1;
}
function drawSolids(){
 const t=level.theme;
 for(const s of level.solids){
  const x=Math.round(s.x-camera);if(x+s.w<0||x>W)continue;
  rect(x,s.y,s.w,Math.min(s.h,H-s.y+5),t.blocks[0]);
  rect(x,s.y,s.w,4,t.blocks[1]);rect(x,s.y,s.w,2,t.blocks[2]);
  for(let i=0;i<s.w;i+=13){
   const n=Math.floor((s.x+i)/11);
   const l=hash(n*31+stage);
   if(l>.25)rect(x+i,s.y+6,7,1,t.blocks[1]);
   if(l>.7)rect(x+i+2,s.y+12,1,7,t.dark);
   if(i%3===0)rect(x+i,s.y+2,3,1,t.blocks[3]);
  }
  if(!s.ground){
   rect(x+4,s.y+4,2,8,t.blocks[1]);rect(x+s.w-8,s.y+4,2,8,t.blocks[1]);
  }else{
   for(let i=0;i<s.w;i+=37){
    const yy=s.y+16+hash((s.x+i)*.25)*19;
    rect(x+i,yy,13,2,t.dark);rect(x+i+4,yy+3,6,2,t.dark);
   }
  }
 }
 // sharp spike silhouettes, with highlight on one side
 for(const [a,b] of level.spikes){
  if(b<camera||a>camera+W)continue;
  for(let x=a;x<b;x+=8){
   const px=x-camera;
   poly([[px,FLOOR],[px+4,FLOOR-10],[px+8,FLOOR]],'#101923');
   poly([[px+1,FLOOR-1],[px+4,FLOOR-8],[px+4,FLOOR-1]],t.enemy);
  }
 }
 // flowers, crystals, torches stands
 for(let x=55;x<level.end;x+=79){
  const sx=Math.round(x-camera);if(sx<0||sx>W)continue;
  if(!level.ground.some(([a,w])=>x>=a+8&&x<a+w-8))continue;
  rect(sx,FLOOR-3,1,3,t.blocks[2]);rect(sx-2,FLOOR-5,5,2,t.blocks[1]);rect(sx,FLOOR-6,1,1,t.accent);
 }
 for(const x of level.torches){
  const sx=Math.round(x-camera);if(sx<-30||sx>W+30)continue;
  rect(sx-3,FLOOR-20,6,20,t.blocks[0]);rect(sx-5,FLOOR-21,10,3,t.blocks[1]);
 }
 for(const x of level.checkpoints){
  const sx=Math.round(x-camera);if(sx<-25||sx>W+25)continue;
  const active=level.activeCheckpoints.has(x);
  rect(sx-3,FLOOR-26,7,26,t.blocks[1]);rect(sx-5,FLOOR-27,11,3,t.blocks[2]);
  poly([[sx-8,FLOOR-32],[sx,FLOOR-41],[sx+8,FLOOR-32],[sx,FLOOR-24]],active?t.accent:'#71879f');
  rect(sx-2,FLOOR-34,5,3,'#ffffff');
 }
}
function drawGem(g){
 if(g.taken)return;
 const x=Math.round(g.x-camera),y=Math.round(g.y+Math.sin(clock*3.2+g.x)*2);
 if(x<-20||x>W+20)return;
 ctx.globalAlpha=.14+.06*Math.sin(clock*4+g.x);
 rect(x-10,y-10,21,21,level.theme.accent);ctx.globalAlpha=1;
 poly([[x,y-8],[x+6,y],[x,y+8],[x-6,y]],'#17384f');
 poly([[x,y-7],[x+5,y],[x,y+6],[x-5,y]],level.theme.accent);
 poly([[x,y-7],[x+5,y],[x,y]],'#efffff');rect(x-1,y-4,2,3,'#ffffff');
 if(hash(Math.floor(clock*3)+g.x)>.72){rect(x+9,y-8,2,2,'#ffffff');rect(x+10,y-10,1,5,'#ffffff')}
}
function drawEnemy(e){
 if(!e.alive)return;
 const x=Math.round(e.x-camera),y=Math.round(e.y);
 if(x<-26||x>W+26)return;
 ctx.save();ctx.translate(x,y);
 if(e.flying){
  rect(-9,-6,18,12,level.theme.dark);rect(-7,-7,14,3,level.theme.blocks[2]);
  rect(-11,-1,4,3,level.theme.enemy);rect(8,-1,4,3,level.theme.enemy);
  rect(-5,-1,10,4,level.theme.enemy);rect(-3,0,2,1,'#fff');
  rect(-4,7,2,4,level.theme.blocks[1]);rect(3,7,2,4,level.theme.blocks[1]);
 } else {
  rect(-8,-7,16,15,'#111c2b');rect(-7,-8,14,5,level.theme.blocks[1]);
  rect(-6,-3,12,9,level.theme.blocks[0]);rect(-4,-3,8,4,level.theme.enemy);
  rect(-3,-2,2,2,'#fff8d3');rect(2,-2,2,2,'#fff8d3');
  rect(-10,1,4,4,level.theme.blocks[2]);rect(7,1,4,4,level.theme.blocks[2]);
  const step=Math.sin(clock*8+e.x)*2;rect(-6,7+step,4,5,level.theme.blocks[1]);rect(3,7-step,4,5,level.theme.blocks[1]);
 }
 ctx.restore();
}
function drawPlayer(){
 const p=player;
 if(p.invuln>0&&Math.floor(clock*17)%2===0&&p.dash<=0)return;
 const x=Math.round(p.x-camera),y=Math.round(p.y),running=p.grounded&&Math.abs(p.vx)>30;
 const stride=running?Math.round(Math.sin(clock*18)*3):0;
 ctx.save();ctx.translate(x+6,y+11);ctx.scale(p.face,1);
 // trailing scarf is driven by movement, not a texture
 const trail=p.dash>0?14:Math.abs(p.vx)>40?9:6;
 poly([[-2,-4],[-trail,-4+(Math.sin(clock*9)*2|0)],[-trail+3,-1],[-1,0]],'#40b4c3');
 rect(-4,-5,8,12,'#111a35');rect(-4,-4,7,9,'#41698c');
 rect(-5,-3,3,8,'#a9e4e5');rect(2,-3,3,9,'#2f4f76');
 // arms
 rect(-6,-3,3,7,'#d8e8eb');rect(4,-2,3,7,'#d8e8eb');
 rect(-5,-11,10,8,'#10253e');rect(-4,-10,8,7,'#d7f5ed');
 rect(-5,-9,10,4,'#597caa');
 rect(1,-8,4,2,'#ffdd93');rect(2,-8,2,1,'#fff');
 rect(-3,6+stride,4,5,'#1b2c50');rect(1,6-stride,4,5,'#1b2c50');
 rect(-4,10+Math.max(0,stride),5,2,'#a4d8e3');rect(1,10+Math.max(0,-stride),5,2,'#a4d8e3');
 if(p.dash>0){rect(7,-1,12,2,'#e4ffff');rect(16,-3,3,6,'#9ce7ff')}
 ctx.restore();
}
function drawGoal(){
 const x=Math.round(level.end-camera),t=level.theme;
 if(x<-65||x>W+65)return;
 rect(x-27,FLOOR-65,54,65,t.dark);rect(x-22,FLOOR-61,44,61,t.blocks[1]);rect(x-18,FLOOR-55,36,54,'#0b1028');
 rect(x-28,FLOOR-65,56,6,t.blocks[2]);rect(x-25,FLOOR-70,8,8,t.blocks[1]);rect(x+17,FLOOR-70,8,8,t.blocks[1]);
 rect(x-23,FLOOR-56,3,48,t.blocks[3]);rect(x+20,FLOOR-56,3,48,t.blocks[3]);
 const unlocked=shards>=3;
 ctx.globalAlpha=unlocked?1:.55;
 poly([[x,FLOOR-66],[x+6,FLOOR-60],[x,FLOOR-54],[x-6,FLOOR-60]],unlocked?t.accent:'#8a8dab');
 ctx.globalAlpha=1;
 if(Math.abs(player.x-level.end)<100){
  ctx.textAlign='center';ctx.font='bold 7px monospace';ctx.fillStyle=unlocked?'#c6fff3':'#ebaf9b';
  ctx.fillText(unlocked?'ENTER THE PORTAL':'COLLECT 3 SHARDS',x,FLOOR-79);
 }
}
function drawParticles(){
 for(const p of particles){
  const x=p.x-camera;if(x<-10||x>W+10)continue;
  ctx.globalAlpha=clamp(p.life/p.max,0,1);
  rect(x,p.y,p.s,p.s,p.c);
 }
 ctx.globalAlpha=1;
}
function drawVfx(){
 if(fxList.length===0)return;
 clearFrame(fxFrame);
 let visible=0;
 for(const item of fxList){
  const x=item.x-camera;
  if(x<-190||x>W+190)continue;
  item.fx.options.x=Math.round(x);item.fx.options.y=Math.round(item.y);visible++;
  try{item.fx.draw(fxFrame)}catch(err){if(!item.reported){console.error('PixelFX:',err);item.reported=true}}
 }
 if(visible){
  composite(fxFrame,fxPixels.data,null,.75);
  fxCtx.putImageData(fxPixels,0,0);
  ctx.drawImage(fxCanvas,0,0);
 }
}
function render(){
 if(!level)return;
 ctx.save();
 if(shake>0&&mode==='playing')ctx.translate(Math.round((hash(clock*37)-.5)*shake*2),Math.round((hash(clock*46)-.5)*shake*1.5));
 art.background(level.theme,stage,camera,clock);
 art.goal(level,camera,clock,shards,player);
 art.terrain(level,camera,clock);
 for(const item of level.gems)art.gem(item,camera,clock,stage);
 for(const e of level.foes)art.enemy(e,camera,clock,stage);
 art.hero(player,camera,clock,stage);drawParticles();drawVfx();art.foreground(stage,clock);
 if(flash>0){ctx.globalAlpha=flash*.20;rect(0,0,W,H,'#d0ffff');ctx.globalAlpha=1}
 // progress bar painted into the world so no huge HUD
 rect(0,H-3,W,3,'#0a1121');rect(0,H-3,Math.round(W*clamp(player.x/level.end,0,1)),3,level.theme.accent);
 ctx.restore();
}
function loop(t){
 const dt=Math.min(.033,(t-last)/1000||.016);last=t;
 if(mode==='playing')step(dt);
 else clock+=dt*.3;
 render();raf=requestAnimationFrame(loop);
}
function normalizeKey(e){
 const k=e.key.toLowerCase();
 if(k==='arrowleft'||k==='a')return'left';
 if(k==='arrowright'||k==='d')return'right';
 if(k==='arrowup'||k==='w'||k===' ')return'jump';
 if(k==='shift'||k==='x'||k==='j')return'dash';
 return k;
}
document.addEventListener('keydown',e=>{
 const a=normalizeKey(e);
 if(['left','right','jump','dash'].includes(a))e.preventDefault();
 if(['left','right'].includes(a)){keys[a]=true;return}
 if(a==='jump'&&!e.repeat){queuedJump=true;return}
 if(a==='dash'&&!e.repeat){queuedDash=true;return}
 if(a==='escape'||a==='p'){if(!e.repeat)pause();return}
 if(a==='r'&&mode!=='menu'&&!e.repeat){startGame(stage);return}
 if(a==='m'&&!e.repeat){sound=!sound;updateSound();if(sound)startAudio()}
});
document.addEventListener('keyup',e=>{const a=normalizeKey(e);if(a==='left'||a==='right')keys[a]=false});
window.addEventListener('blur',()=>{keys.left=keys.right=false;touch.left=touch.right=false;if(mode==='playing')pause()});
for(const btn of document.querySelectorAll('[data-action]')){
 const a=btn.dataset.action;
 btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);if(a==='jump')queuedJump=true;else if(a==='dash')queuedDash=true;else touch[a]=true});
 for(const evt of ['pointerup','pointercancel','lostpointercapture'])btn.addEventListener(evt,()=>{if(a==='left'||a==='right')touch[a]=false});
}
primaryBtn.addEventListener('click',()=>onPrimary());
secondaryBtn.addEventListener('click',()=>onSecondary());
document.querySelector('#pause-btn').addEventListener('click',pause);
soundBtn.addEventListener('click',()=>{sound=!sound;updateSound();if(sound)startAudio()});
updateSound();setupLevel(highestUnlock);showMenu('menu');requestAnimationFrame(loop);
