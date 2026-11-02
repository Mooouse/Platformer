import test from 'node:test';
import assert from 'node:assert/strict';
import { installGameTouchGuards } from '../touch-guards.js';

function harness(){
 const onRoot=new Map(),onDoc=new Map();
 const root={addEventListener:(name,fn,options)=>onRoot.set(name,{fn,options})};
 let cleared=0;
 const selection={rangeCount:1,removeAllRanges(){cleared++;this.rangeCount=0}};
 const doc={addEventListener:(name,fn,options)=>onDoc.set(name,{fn,options}),getSelection:()=>selection};
 installGameTouchGuards(root,doc);
 function dispatch(where,name,attrs={}){
  let prevented=false;
  const event={
   cancelable:true,timeStamp:1000,
   preventDefault(){prevented=true},
   changedTouches:[{clientX:160,clientY:220}],
   touches:[],target:{closest:()=>null},...attrs
  };
  const listener=(where==='root'?onRoot:onDoc).get(name);
  assert.ok(listener,'handler for '+name);
  listener.fn(event);
  return {prevented,options:listener.options};
 }
 return {dispatch,onDoc,onRoot,get cleared(){return cleared}};
}
test('Rapid iOS double-tap prevents default browser zoom, including non-passive capture',()=>{
 const h=harness();
 let event=h.dispatch('root','touchend',{timeStamp:1000});
 assert.equal(event.prevented,false,'first tap should behave normally');
 event=h.dispatch('root','touchend',{timeStamp:1230});
 assert.equal(event.prevented,true,'second tap must cancel zoom');
 assert.equal(event.options.passive,false);
 assert.equal(event.options.capture,true);
});
test('Double tapping a gamepad button is allowed by pointerdown but native touch gesture is cancelled',()=>{
 const h=harness();
 const e=h.dispatch('root','touchend',{target:{closest:s=>s==='[data-action]'?{}:null}});
 assert.equal(e.prevented,true);
 // The guard does not stop pointerdown propagation, so jump and dash still work.
 assert.equal(h.onRoot.has('pointerdown'),false);
});
test('Menu buttons and links retain native click events',()=>{
 const h=harness();
 const target={closest:s=>s==='#overlay a, #overlay button'?{}:null};
 const e1=h.dispatch('root','touchend',{target,timeStamp:2000});
 const e2=h.dispatch('root','touchend',{target,timeStamp:2200});
 assert.equal(e1.prevented,false);
 assert.equal(e2.prevented,false);
});
test('Separate taps and quick taps far apart are not blocked',()=>{
 const h=harness();
 h.dispatch('root','touchend',{timeStamp:1000});
 const distant=h.dispatch('root','touchend',{timeStamp:1100,changedTouches:[{clientX:300,clientY:600}]});
 assert.equal(distant.prevented,false);
 const slow=h.dispatch('root','touchend',{timeStamp:2100,changedTouches:[{clientX:300,clientY:600}]});
 assert.equal(slow.prevented,false);
});
test('Pinch gestures and dragging cannot zoom or scroll the game',()=>{
 const h=harness();
 assert.equal(h.dispatch('root','touchstart',{touches:[{},{}]}).prevented,true);
 assert.equal(h.dispatch('root','touchstart',{touches:[{}]}).prevented,false);
 for(const name of ['gesturestart','gesturechange','gestureend']){
  assert.equal(h.dispatch('doc',name).prevented,true);
  assert.equal(h.onDoc.get(name).options.passive,false);
 }
 assert.equal(h.dispatch('root','touchmove').prevented,true);
 assert.equal(h.dispatch('doc','dblclick').prevented,true);
});
test('Selection, callouts and dragging are cancelled even outside controls',()=>{
 const h=harness();
 for(const name of ['selectstart','contextmenu','dragstart'])
  assert.equal(h.dispatch('doc',name).prevented,true,name);
 h.dispatch('doc','selectionchange');
 assert.equal(h.cleared,1);
});
