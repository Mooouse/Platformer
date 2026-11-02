// TRY AGAIN — stage-specific challenge layouts and escalating timing.
// Data deliberately keeps every mandatory shard and checkpoint reachable.
export const CHALLENGE_LAYOUTS = [
  {
    crumble: [527,1136], springs:[550,995,1502],
    gates:[1065], lasers:[624,1590], meteors:[], elites:[3],
    crumbleDelay:.78, laserPeriod:3.2, laserActive:.72
  },
  {
    crumble:[476,1035,1515,1810], springs:[490,935,1820],
    gates:[1340,1934], lasers:[565,1090,1552,1850], meteors:[760,1470], elites:[2,4],
    crumbleDelay:.60, laserPeriod:2.7, laserActive:.92
  },
  {
    crumble:[506,977,1475,2021], springs:[540,1010,1908],
    gates:[1178,1767,2110], lasers:[560,1050,1550,1940,2220], meteors:[750,1260,1650,2140], elites:[0,3,4],
    crumbleDelay:.47, laserPeriod:2.35, laserActive:1.02
  }
];

export function makeChallenges(stage,platforms) {
  const cfg=CHALLENGE_LAYOUTS[stage];
  const crumbly=new Set(cfg.crumble);
  const solids=platforms.map(([x,y,w])=>({
    x,y,w,h:11,ground:false,kind:crumbly.has(x)?'crumble':'stone',
    active:true,warning:-1,restore:0
  }));
  return {
    solids,
    springs:cfg.springs.map(x=>({x,cooldown:0})),
    gates:cfg.gates.map(x=>({x,broken:false})),
    lasers:cfg.lasers.map((x,i)=>({x,phase:(i*1.17+.23)%cfg.laserPeriod,period:cfg.laserPeriod,on:cfg.laserActive})),
    meteors:cfg.meteors.map(x=>({x,phase:'ready',timer:0,y:-40,cooldown:0})),
    elites:new Set(cfg.elites),
    crumbleDelay:cfg.crumbleDelay
  };
}
export function laserStatus(laser) {
  const phase=laser.phase%laser.period;
  const warm=.48;
  return phase<laser.on?'active':phase<laser.on+warm?'cooldown':phase>laser.period-warm?'warning':'idle';
}
export function advanceCrumble(s,dt,delay) {
  if(s.kind!=='crumble')return false;
  if(!s.active){
    s.restore=Math.max(0,s.restore-dt);
    if(s.restore===0){s.active=true;s.warning=-1;}
    return false;
  }
  if(s.warning<0)return false;
  s.warning-=dt;
  if(s.warning<=0){
    s.active=false;s.restore=3.2;s.warning=-1;return true;
  }
  return false;
}
export function triggerCrumble(s,delay) {
  if(s?.kind==='crumble'&&s.active&&s.warning<0){s.warning=delay;return true}
  return false;
}
