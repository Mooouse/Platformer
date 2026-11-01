// Shard Runner original: defeat feedback that reads as an explosion of crystal-like armour,
// not a stock particle circle. The 2-frame cut and delayed fall follow PixelFX choreography.
import { fit, clamp, ease, rand, smooth, sparkle, TAU, WHITE } from "../../core/index.js";
export const meta={
 name:"Soul shatter",
 desc:"A struck guardian splits into four bright crystal wedges, then flying ink shards, pale embers and drifting motes disperse.",
 tags:["custom","enemy","death","impact","shatter","magic"],
 size:[126,166],origin:[63,70],duration:1.06,loop:false,fps:30,bg:"dark",
 options:{
  palette:["#211527","#4a2842","#824663","#c67785","#f6b5a9","#ffe1c4","#ffffff"],seed:89
 }
};
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const C=fit(o.palette,7);
 const peak=1-clamp(t/.13);
 if(t<.072){
  p.circle(0,-9,8+9*ease.outExpo(t/.072),t<.032?WHITE:C[5],peak);
  p.arc(0,-9,16+18*t/.072,2.5,0,TAU,C[5],peak*.8);
  p.glow(0,-9,39,C[4],.47*peak);
  p.glow(0,-9,16,C[6],.37*peak);
 }
 // Wedges and broken facets fly along four asymmetrical trajectories.
 for(let i=0;i<17;i++){
  const lag=rand(i,o.seed,25)*.055,life=.46+rand(i,o.seed,27)*.45,age=t-lag;
  if(age<0||age>=life)continue;
  const a=i/17*TAU+rand(i,o.seed,11)*.22;
  const speed=25+rand(i,o.seed,42)*81,phase=age/life;
  const x=(Math.cos(a)*speed*age)*(1-.22*phase),
  y=-8+Math.sin(a)*speed*age+95*age*age,
  size=(i%4===0?4.2:1.8)+rand(i,o.seed,35)*1.7,fade=1-smooth(.53,1,phase);
  const dx=Math.cos(a+age*5),dy=Math.sin(a+age*5);
  if(i%3===0){
    p.poly([[x+dx*size*1.5,y+dy*size*1.5],[x-dy*size*.65,y+dx*size*.65],
      [x-dx*size,y-dy*size],[x+dy*size*.55,y-dx*size*.55]],i%2?C[4]:C[3],fade);
    p.line(x,y,x+dx*size,y+dy*size,C[5],fade*.8);
  } else {
    p.line(x-dx*size,y-dy*size,x+dx*size*.45,y+dy*size*.45,i%3===1?C[5]:C[3],fade);
  }
  if(i%5===0&&phase<.43)p.glow(x,y,6,C[4],.16*(1-phase));
 }
 // Tiny final cross-glints keep the tail alive without busy noise.
 for(let i=0;i<5;i++){
  const delay=.17+rand(i,o.seed,44)*.36,age=t-delay;
  if(age<0||age>=.37)continue;
  const x=(rand(i,o.seed,51)-.5)*71, y=-10+(rand(i,o.seed,52)-.5)*63;
  sparkle(p,x,y,3.5*(1-age/.37),C[6],C[4],.35*(1-age/.37));
 }
 if(t>.06&&t<.55){
  const q=(t-.06)/.49;
  p.glow(0,-8,14+30*q,C[2],.16*(1-q));
 }
}
