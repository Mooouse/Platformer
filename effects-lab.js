import {createFrame,clearFrame,createFx,composite} from './pixelfx/core/index.js';
import * as dash from './pixelfx/fx/custom/dash-wake.js';
import * as jump from './pixelfx/fx/custom/jump-bloom.js';
import * as land from './pixelfx/fx/custom/landing-crown.js';
import * as shatter from './pixelfx/fx/custom/soul-shatter.js';
import * as cleave from './pixelfx/fx/custom/cleave-contact.js';

const palettes=[
 ["#102941","#1d4d6a","#2b7b9b","#42b6c0","#75e8dd","#bbfff0","#ffffff"],
 ["#371c26","#70333f","#aa565a","#e47e66","#f2b68e","#ffe0b1","#ffffff"],
 ["#1b1c4b","#3e3374","#7063a8","#998ed8","#b7d5fa","#e1ebff","#ffffff"]
];
const scenes=[
 {id:"dash-wake",title:"01 / DASH WAKE",desc:"An instant pressure cut, two crescent wakes and flying glass filaments. The release lasts only a handful of frames.",mod:dash},
 {id:"jump-bloom",title:"02 / JUMP BLOOM",desc:"A luminous takeoff: floor rings roll in depth while gravity tugs the motes back.",mod:jump},
 {id:"landing-crown",title:"03 / LANDING CROWN",desc:"A heavy contact frame breaks into shallow shock rings, dust volumes and tumbling stones.",mod:land},
 {id:"soul-shatter",title:"04 / SOUL SHATTER",desc:"A guardian breaks apart in asymmetric glass wedges; high-energy white gives way to a long soft decay.",mod:shatter},
 {id:"cleave-contact",title:"05 / CLEAVE CONTACT",desc:"The sword connects: a one-frame white seam, glass pressure crescents and weighted bright fragments with soft vapour.",mod:cleave}
];
const cards=[],container=document.querySelector("#grid");
let theme=0,last=0,acc=0;
function makeFx(scene,seed=31){
 return createFx(scene.mod,{x:94,y:96,seed,palette:palettes[theme],light:.85});
}
for(const scene of scenes){
 const card=document.createElement("article");card.className="card";
 const stage=document.createElement("div");stage.className="preview";
 const canvas=document.createElement("canvas");canvas.width=188;canvas.height=144;
 const context=canvas.getContext("2d",{alpha:true});context.imageSmoothingEnabled=false;
 stage.append(canvas);
 const info=document.createElement("div");info.className="info";
 const title=document.createElement("h2");title.textContent=scene.title;
 const desc=document.createElement("p");desc.textContent=scene.desc;
 const tags=document.createElement("div");tags.className="tags";
 const link=document.createElement("a");link.href="./records/custom/"+scene.id+"/contact.png";link.textContent="FRAME CONTACT SHEET";link.style.fontSize="10px";
 const replay=document.createElement("button");replay.textContent="↻ REPLAY";
 tags.append(link,replay);info.append(title,desc,tags);card.append(stage,info);container.append(card);
 const frame=createFrame(canvas.width,canvas.height),pixels=context.createImageData(canvas.width,canvas.height);
 const item={scene,context,frame,pixels,fx:makeFx(scene),elapsed:0,hold:0};
 replay.addEventListener("click",()=>{item.fx=makeFx(scene);item.elapsed=0;item.hold=0;});
 cards.push(item);
}
function resetAll(){
 for(const item of cards){item.fx=makeFx(item.scene);item.elapsed=0;item.hold=0;}
}
document.querySelectorAll("[data-theme]").forEach(btn=>btn.addEventListener("click",()=>{
 theme=+btn.dataset.theme;
 document.querySelectorAll("[data-theme]").forEach(b=>b.classList.toggle("active",b===btn));
 resetAll();
}));
document.querySelector("#replay-all").addEventListener("click",resetAll);
function tick(time){
 const dt=Math.min(.04,(time-last)/1000||.017);last=time;
 acc+=dt;
 if(acc>=1/30){
  const step=Math.min(acc,.08);acc=0;
  for(const it of cards){
   it.elapsed+=step;
   if(it.elapsed>it.scene.mod.meta.duration+.65){
    it.fx=makeFx(it.scene);it.elapsed=0;
   }else{
    it.fx.update(step);
   }
   clearFrame(it.frame);
   it.fx.draw(it.frame);
   composite(it.frame,it.pixels.data,null,.85);
   it.context.putImageData(it.pixels,0,0);
  }
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);