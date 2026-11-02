// TRY AGAIN original. Meteor collision: a directional crystal core,
// grounded broken rings, weighted shards and falling spark fragments.
import {fit,clamp,ease,smooth,rand,band,sparkle,WHITE,TAU} from '../../core/index.js';
export const meta={
 name:'Meteor strike',desc:'A falling star fractures the floor: white-hot contact, expanding tilted ring, crystalline debris and glowing dust.',
 tags:['custom','meteor','impact','ground','arcane'],size:[178,144],origin:[89,85],
 duration:.92,loop:false,fps:30,bg:'ground',
 options:{palette:['#171931','#30345b','#595c91','#8489c4','#b4c6ed','#e1ecff','#ffffff'],seed:71}
};
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const C=fit(o.palette,7);
 if(t<.07){
  const k=1-t/.07;
  p.ellipse(0,-1,10+(1-k)*21,2.0,t<.026?WHITE:C[5],k);
  p.line(-15,-10,15,2,C[4],k);
  p.glowLine(-18,-1,18,-1,9,C[4],.34*k);
  p.glow(0,-5,26,C[5],.30*k);
 }
 for(let j=0;j<2;j++){
  const age=t-j*.09,life=.41+j*.16;
  if(age<0||age>=life)continue;
  const u=age/life,r=8+(j?51:40)*ease.outQuart(u);
  band(p,0,0,r,.20,Math.max(.55,(j?2.3:4.2)*(1-u)),(1-u)*(.8-j*.16),C,g=>Math.sin(g)<0);
  band(p,0,0,r,.20,Math.max(.55,2.1*(1-u)),(1-u)*(.51-j*.1),C,g=>Math.sin(g)>=0);
 }
 // Large facets fly first, smaller grit lags behind and falls.
 for(let i=0;i<24;i++){
  const delay=rand(i,o.seed,14)*.095,age=t-delay,life=.40+rand(i,o.seed,17)*.36;
  if(age<0||age>=life)continue;
  const angle=(i/24)*TAU+rand(i,o.seed,19)*.20;
  const speed=29+rand(i,o.seed,31)*87;
  const x=Math.cos(angle)*speed*age;
  const y=-5+Math.sin(angle)*speed*age*.62+168*age*age;
  if(y>43)continue;
  const u=age/life,a=1-smooth(.53,1,u);
  const sz=i%4===0?3.4:1.4+rand(i,o.seed,37)*.6;
  if(i%3===0){
   p.poly([[x,y-sz],[x+sz*.8,y],[x,y+sz*.9],[x-sz*.7,y]],i%2?C[5]:C[3],a);
   p.line(x,y-sz,x,y,C[6],a*.55);
  }else p.line(x-sz,y,x+sz,y+sz*.4,i%2?C[4]:C[5],a);
  if(i%7===0&&u<.37)p.glow(x,y,6,C[4],.13*(1-u));
 }
 for(let i=0;i<10;i++){
  const delay=.07+rand(i,o.seed,46)*.11,age=t-delay,life=.39+rand(i,o.seed,52)*.25;
  if(age<0||age>=life)continue;
  const u=age/life,sgn=i%2?1:-1;
  p.disc(sgn*(4+age*(25+rand(i,o.seed,55)*32)),
    -1-age*(8+rand(i,o.seed,59)*10),2+rand(i,o.seed,61)*3+age*4,
    C[2],.14*(1-u)*(1-u));
 }
 for(let i=0;i<4;i++){
  const age=t-.20-i*.08;
  if(age>=0&&age<.25){
   sparkle(p,(rand(i,o.seed,81)-.5)*65,-13-(i%2)*17,4*(1-age/.25),C[5],C[3],.35*(1-age/.25));
  }
 }
}