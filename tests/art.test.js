import test from 'node:test';
import assert from 'node:assert/strict';
import {createArt} from '../art.js';
import {posed} from '../pixelfx/core/rig.js';

function makeContext() {
  let writes=0;
  const gradient={addColorStop(){}};
  const ctx={
    fillStyle:'#fff',strokeStyle:'#fff',globalAlpha:1,lineWidth:1,
    fillRect(){writes++},strokeRect(){writes++},
    beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){writes++},stroke(){writes++},
    arc(){},translate(){},save(){},restore(){},scale(){},drawImage(){writes++},
    createLinearGradient(){return gradient},createRadialGradient(){return gradient},
    fillText(){writes++},getContext(){return this},
  };
  return {ctx,get writes(){return writes}};
}
const originalDocument=globalThis.document;
globalThis.document={createElement:()=>({width:0,height:0,getContext(){return makeContext().ctx}})};
test('PixelFX rig produces detailed masked character with sword and animated pose',()=>{
  const p=posed({face:1,crouch:3,lean:4,fx:7,fy:-18,weapon:'sword',sa:-0.6});
  assert.ok(p.n>150,'character sprite is unexpectedly empty');
  assert.equal(p.xs.length>=p.n,true);
  assert.equal(p.color.length>=p.n,true);
});
test('Scene draws each realm and entities without runtime exceptions',()=>{
  for(let stage=0;stage<3;stage++){
    const c=makeContext(),art=createArt(c.ctx,480,270);
    const level={stage,end:1800,ground:[[0,500],[570,600]],
      solids:[{x:0,y:232,w:500,h:100,ground:true},{x:210,y:167,w:88,h:11,ground:false}],
      spikes:[[255,286]],torches:[120,270],checkpoints:[345],activeCheckpoints:new Set([345])};
    const hero={x:70,y:210,h:22,face:1,vx:0,vy:0,dash:0,grounded:true};
    art.background(null,stage,0,1.3);
    art.terrain(level,0,1.3);
    art.goal(level,0,1.3,3,hero);
    art.gem({x:220,y:146,taken:false},0,1.3,stage);
    art.enemy({alive:true,x:301,y:217,flying:false,speed:40},0,1.3,stage);
    art.enemy({alive:true,x:350,y:130,flying:true,speed:20},0,1.3,stage);
    art.hero(hero,0,1.3,stage);
    hero.face=-1;hero.dash=.15;hero.grounded=false;
    art.hero(hero,0,1.3,stage);
    art.foreground(stage,1.3);
    assert.ok(c.writes>100,'scene produced few pixels');
  }
});
if(originalDocument===undefined)delete globalThis.document;
else globalThis.document=originalDocument;
