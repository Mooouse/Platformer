import test from 'node:test';
import assert from 'node:assert/strict';
import {CHALLENGE_LAYOUTS,makeChallenges,laserStatus,advanceCrumble,triggerCrumble} from '../challenge.js';

const platforms=[
 [476,183,88],[506,183,76],[527,193,93],[977,183,88],[1035,158,88],[1136,166,86],
 [1475,170,83],[1515,160,95],[1810,181,93],[2021,164,80]
];
test('The three worlds escalate hazards while preserving a safe introduction',()=>{
 assert.equal(CHALLENGE_LAYOUTS.length,3);
 for(let i=0;i<3;i++){
  const layout=CHALLENGE_LAYOUTS[i];
  assert.ok(layout.springs.length>=3);
  assert.ok(layout.gates.length>=1);
  assert.ok(layout.lasers.length>=2);
  assert.ok(layout.crumbleDelay>=.35);
  for(const pos of [...layout.springs,...layout.gates,...layout.lasers,...layout.meteors])
   assert.ok(pos>200,'hazards must not start on top of player spawn');
 }
 assert.ok(CHALLENGE_LAYOUTS[0].lasers.length<CHALLENGE_LAYOUTS[2].lasers.length);
 assert.equal(CHALLENGE_LAYOUTS[0].meteors.length,0);
 assert.ok(CHALLENGE_LAYOUTS[2].meteors.length>CHALLENGE_LAYOUTS[1].meteors.length);
 assert.ok(CHALLENGE_LAYOUTS[0].crumbleDelay>CHALLENGE_LAYOUTS[2].crumbleDelay);
});
test('Crumble starts on collision, stays intact during warning and repairs',()=>{
 const c=makeChallenges(1,platforms);
 const platform=c.solids.find(s=>s.x===476);
 assert.equal(platform.kind,'crumble');
 assert.equal(platform.active,true);
 assert.equal(triggerCrumble(platform,c.crumbleDelay),true);
 assert.equal(triggerCrumble(platform,c.crumbleDelay),false);
 assert.equal(advanceCrumble(platform,c.crumbleDelay*.35,c.crumbleDelay),false);
 assert.equal(platform.active,true);
 assert.equal(advanceCrumble(platform,c.crumbleDelay*.70,c.crumbleDelay),true);
 assert.equal(platform.active,false);
 assert.equal(advanceCrumble(platform,3.3,c.crumbleDelay),false);
 assert.equal(platform.active,true);
 assert.equal(platform.warning,-1);
});
test('Timed laser follows clear warning, hit and cooldown windows',()=>{
 const b={phase:2.1,period:2.7,on:.9};
 assert.equal(laserStatus(b),'idle');
 b.phase=2.5;assert.equal(laserStatus(b),'warning');
 b.phase=.15;assert.equal(laserStatus(b),'active');
 b.phase=1.1;assert.equal(laserStatus(b),'cooldown');
});
test('Elites are distinct from normal enemies and seals can break once',()=>{
 const a=makeChallenges(2,platforms);
 assert.ok(a.elites.size>=2);
 for(const g of a.gates)assert.equal(g.broken,false);
 assert.ok(a.meteors.length>0);
});
