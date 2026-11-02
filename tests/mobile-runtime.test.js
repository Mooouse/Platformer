import test from 'node:test';
import assert from 'node:assert/strict';

// Browser-independent simulation of the actual game entrypoint: load real PixelFX
// modules and render several frames, then rotate a simulated phone in place.
test('Portrait play, jump, dash and landscape rotation run without runtime errors',async()=>{
 const pending=[];
 const nop=()=>{};
 const gradients={addColorStop:nop};
 const context={
  imageSmoothingEnabled:false,fillStyle:'#000',strokeStyle:'#fff',globalAlpha:1,lineWidth:1,
  fillRect:nop,strokeRect:nop,beginPath:nop,moveTo:nop,lineTo:nop,closePath:nop,
  arc:nop,fill:nop,stroke:nop,save:nop,restore:nop,translate:nop,scale:nop,
  drawImage:nop,fillText:nop,putImageData:nop,
  createLinearGradient:()=>gradients,createRadialGradient:()=>gradients,
  createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h})
 };
 const makeEl=(tag='div')=>{
  const classSet=new Set(),handlers=new Map();
  return {tagName:tag,width:0,height:0,dataset:{},style:{},handlers,textContent:'',innerHTML:'',
   classList:{add:n=>classSet.add(n),remove:n=>classSet.delete(n),
    toggle:(n,yes)=>yes===undefined?classSet.has(n)?classSet.delete(n):classSet.add(n):yes?classSet.add(n):classSet.delete(n)},
   addEventListener:(type,fn)=>{handlers.set(type,fn)},
   setAttribute:nop,append:nop,closest:()=>null,setPointerCapture:nop,
   getContext:()=>context,getBoundingClientRect:()=>({width:390,height:844})
  };
 };
 const canvas=makeEl('canvas'),viewport=makeEl();
 let rect={width:390,height:844};
 const listeners=new Map();
 viewport.getBoundingClientRect=()=>rect;
 viewport.addEventListener=(event,fn)=>listeners.set('viewport:'+event,fn);
 const selectors=new Map([['#game',canvas],['#viewport',viewport]]);
 const buttons=new Map();
 for(const a of ['left','right','jump','dash']){
  const b=makeEl('button');b.dataset.action=a;buttons.set(a,b);
 }
 const bySelector=q=>{
  if(q.startsWith('[data-action="'))return buttons.get(q.slice(14,-2));
  if(!selectors.has(q))selectors.set(q,makeEl());
  return selectors.get(q);
 };
 const document={
  fullscreenEnabled:false,fullscreenElement:null,
  querySelector:bySelector,querySelectorAll:q=>q==='[data-action]'?[...buttons.values()]:[],
  createElement:tag=>makeEl(tag),
  addEventListener:(event,fn)=>listeners.set('document:'+event,fn),
  elementFromPoint:()=>null
 };
 const window={
  addEventListener:(event,fn)=>listeners.set('window:'+event,fn),
  visualViewport:{addEventListener:(event,fn)=>listeners.set('visual:'+event,fn)}
 };
 const original={
  document:globalThis.document,window:globalThis.window,
  localStorage:globalThis.localStorage,requestAnimationFrame:globalThis.requestAnimationFrame
 };
 try{
  globalThis.document=document;globalThis.window=window;
  globalThis.localStorage={getItem:()=>null,setItem:nop};
  globalThis.requestAnimationFrame=fn=>{pending.push(fn);return pending.length;};
  await import('../game.js');
  assert.equal(canvas.width,220);assert.ok(canvas.height>400);
  const start=selectors.get('#primary-btn');
  assert.ok(start?.handlers?.get('click'),'start menu click is wired');
  start.handlers.get('click')();
  let t=0;
  for(let i=0;i<6;i++){t+=16.7;pending.shift()(t)}
  // Move, jump, and attack with actual gameplay ticking before rotating.
  const keydown=listeners.get('document:keydown');
  const keyup=listeners.get('document:keyup');
  keydown({key:'d',repeat:false,preventDefault:nop});
  for(let i=0;i<6;i++){t+=16.7;pending.shift()(t)}
  keyup({key:'d'});
  keydown({key:' ',repeat:false,preventDefault:nop});
  for(let i=0;i<5;i++){t+=16.7;pending.shift()(t)}
  keydown({key:'Shift',repeat:false,preventDefault:nop});
  for(let i=0;i<10;i++){t+=16.7;pending.shift()(t)}
  // Rotate from portrait to landscape; viewport and frame buffers are recreated.
  rect={width:844,height:390};
  listeners.get('window:resize')();
  assert.equal(canvas.height,270);
  assert.ok(canvas.width>570&&canvas.width<610);
  for(let i=0;i<3;i++){t+=16.7;pending.shift()(t)}
  rect={width:390,height:844};
  listeners.get('window:resize')();
  assert.equal(canvas.width,220);
  assert.ok(canvas.height>400);
 } finally {
  for(const [key,val] of Object.entries(original)){
   if(val===undefined)delete globalThis[key];
   else globalThis[key]=val;
  }
 }
});
