// TRY AGAIN original. Prism launcher: a hard white release, oblique
// floor rings and staggered upward crystal filaments. Uses seeded geometry.
import {fit,clamp,ease,smooth,rand,band,sparkle,WHITE,TAU} from '../../core/index.js';
export const meta={
 name:'Prism launch',desc:'Charged bounce crystal detonates into two floor halos and an upward spiral of prismatic glints.',
 tags:['custom','spring','launch','rebound','magic'],size:[152,140],origin:[76,95],
 duration:.78,loop:false,fps:30,bg:'ground',
 options:{palette:['#152b3c','#256077','#348c9c','#58b9c2','#8ce9d9','#c3fff0','#ffffff'],seed:44}
};
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const C=fit(o.palette,7),D=meta.duration;
 if(t<.095){
  const k=1-t/.095;
  p.ellipse(0,-2,8+(1-k)*17,2.2,t<.04?WHITE:C[5],k);
  p.glow(0,-9,32,C[4],.36*k);
  p.line(0,-5,0,-16-21*(1-k),C[6],k);
  p.light(0,-8,C[5],.5*k);
 }
 for(let j=0;j<2;j++){
  const age=t-j*.10,life=.42+j*.10;
  if(age<0||age>=life)continue;
  const u=age/life,r=4+(25+j*15)*ease.outCubic(u);
  band(p,0,0,r,.16,Math.max(.6,2.8*(1-u)),(1-u)*(.75-j*.10),C,g=>Math.sin(g)<0);
  band(p,0,0,r,.16,Math.max(.6,2.0*(1-u)),(1-u)*(.57-j*.08),C,g=>Math.sin(g)>=0);
 }
 for(let i=0;i<19;i++){
  const delay=rand(i,o.seed,19)*.11,life=.30+rand(i,o.seed,21)*.37,age=t-delay;
  if(age<0||age>=life)continue;
  const u=age/life,angle=rand(i,o.seed,29)*TAU;
  const sideways=(i%2?-1:1)*(5+rand(i,o.seed,32)*42)*age;
  const x=sideways+5*Math.sin(u*4+angle);
  const y=-6-(40+rand(i,o.seed,33)*75)*age+80*age*age;
  const k=1-smooth(.42,1,u);
  if(i%3===0){
   const size=2.0+rand(i,o.seed,38)*1.2;
   p.poly([[x,y-size*1.7],[x+size,y],[x,y+size*1.5],[x-size,y]],u<.18?C[6]:C[4],k);
   p.line(x,y-size,x,y,C[6],k*.55);
  }else{
   const dx=(i%2?-2:2)*(1-u);
   p.line(x-dx,y+4*(1-u),x,y,u<.25?C[6]:C[4],k);
  }
  if(i%6===0&&u<.45)p.glow(x,y,5,C[4],.11*(1-u));
 }
 for(let i=0;i<3;i++){
  const age=t-.13-i*.11;
  if(age<0||age>=.22)continue;
  sparkle(p,(i-1)*13,-23-i*9,5*(1-age/.22),C[6],C[4],.40*(1-age/.22));
 }
}