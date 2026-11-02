import test from 'node:test';
import assert from 'node:assert/strict';
import { createFrame, clearFrame, createFx } from '../pixelfx/core/index.js';
import * as contact from '../pixelfx/fx/custom/cleave-contact.js';

function snap(t, seed=112) {
  const frame=createFrame(...contact.meta.size);
  const fx=createFx(contact,{x:contact.meta.origin[0],y:contact.meta.origin[1],seed});
  if(t>0)fx.update(t);
  clearFrame(frame);fx.draw(frame);
  return {C:frame.color,L:frame.light,count:frame.color.filter(v=>v!==0).length+frame.light.filter(v=>v!==0).length};
}

test('Cleave act has a real pre-hit pose, contact freeze and recovery',()=>{
 assert.ok(contact.act.poses[0][0]<0);
 assert.equal(contact.act.hits[0].t,0);
 assert.ok(contact.act.hits[0].stop>0&&contact.act.hits[0].stop<.2);
 assert.ok(contact.act.poses.at(-1)[0]<contact.meta.duration);
});
test('Cleave contact has a readable launch frame, moving mid frame and a clean decay',()=>{
 const start=snap(.016),mid=snap(.20),tail=snap(.60),end=snap(.77);
 assert.ok(start.count>20, 'no white-hot contact pixels');
 assert.ok(mid.count>20, 'no readable secondary motion');
 assert.ok(tail.count>0, 'effect lacks its decay stage');
 assert.equal(end.count,0, 'one-shot must not linger after duration');
});
test('Cleave rendering is deterministic for an effect seed',()=>{
 const a=snap(.22,999),b=snap(.22,999),c=snap(.22,1001);
 assert.deepEqual(a.C,b.C);assert.deepEqual(a.L,b.L);
 assert.notDeepEqual(a.C,c.C,'a different seed must change the glass fragments');
});
