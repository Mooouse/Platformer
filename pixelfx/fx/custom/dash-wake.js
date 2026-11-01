// Shard Runner original: dash wake. Fast forward white cut, two staggered pressure crescents,
// sharp streaks and light with a quiet decay. Authored at PixelFX's native 1px scale.
import { fit, clamp, ease, rand, TAU, WHITE } from "../../core/index.js";

export const meta = {
  name: "Dash wake",
  desc: "An instantaneous cyan blade of pressure tears forward, leaving twin luminous crescents, fractured filaments and fading sparks.",
  tags: ["custom", "dash", "movement", "impact", "directional"],
  size: [144, 148],
  origin: [73, 75],
  duration: 0.62,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#112b45","#255075","#337f9b","#49b5c6","#77e4dc","#b8fff1","#ffffff"],
    seed: 31
  }
};
export function draw(p,t,o){
  const D=meta.duration;
  if(t<0 || t>=D)return;
  const C=fit(o.palette,7), k=clamp(t/D), snap=1-clamp((t-.055)/.17);
  // A pressure wound opens for just two frames, then clears. Keep white very sparse.
  if(t<.09){
    const v=1-clamp(t/.09);
    p.line(-18,-13,23+22*(1-v),-13,t<.032?WHITE:C[5],v);
    p.line(-13,-12,22,-12,C[3],.85*v);
    p.glowLine(-8,-13,33,-13,10,C[4],.39*v);
    p.glow(20,-13,26,C[5],.46*v);
    p.ring(23,-13,4+10*(1-v),2,C[6],v);
  }
  // The leading crescent moves ahead with a 2-frame acceleration and a very quick cut.
  for(let j=0;j<2;j++){
    const a=(t-j*.055)/(.22+j*.055);
    if(a<=0||a>=1)continue;
    const q=ease.outExpo(clamp(a)),cx=8+20*q+j*5,cy=-14;
    const r=10+20*q+j*6,thick=(j?3.1:5.2)*(1-a)+.5;
    p.arc(cx,cy,r,thick,-1.82,-.10,j?C[3]:C[5],(1-a)*(.8-j*.15));
    p.arc(cx,cy,r*.93,Math.max(.6,thick*.6),.15,1.65,j?C[2]:C[4],(1-a)*.72);
    if(a<.7)p.glow(cx+r*.35,cy,18,C[4],.12*(1-a));
  }
  // Each filament has a seeded offset and its own lifetime. Broad coherent sweeps, not speckle.
  for(let i=0;i<13;i++){
    const v=rand(i,o.seed,11),life=.18+rand(i,o.seed,17)*.32,age=t-(i%4)*.017;
    if(age<0||age>=life)continue;
    const f=age/life, yy=-26+i*2.3+(v-.5)*5;
    const front=8+26*ease.outQuart(clamp(age/.20));
    const back=front-(20+32*rand(i,o.seed,33))*(1-.12*f);
    const lightness=f<.2?C[5]:i%3?C[3]:C[4];
    p.line(back,yy+Math.sin(f*PI2+i)*1.1,front,yy+(v-.5)*3,lightness,(1-f)*(.60+.22*v));
    if(i%3===0&&f<.7)p.light(front,yy,C[5],.45*(1-f));
  }
  // Larger diamond chips slow, fall and wink out.
  for(let i=0;i<14;i++){
    const delay=rand(i,o.seed,51)*.12,life=.24+rand(i,o.seed,72)*.32,u=(t-delay)/life;
    if(u<0||u>=1)continue;
    const seed=rand(i,o.seed,81),ang=-1.4+seed*2.8,
    speed=24+rand(i,o.seed,85)*78, x=4+Math.cos(ang)*speed*u-31*u,
    y=-14+Math.sin(ang)*speed*u+32*u*u, size=(i%4===0?2.8:1.35)*(1-u*.42);
    if(i%3===0){
      p.poly([[x,y-size*1.5],[x+size,y],[x,y+size*1.5],[x-size,y]],u<.3?C[6]:C[4],1-u);
    } else {
      p.line(x-size,y,x+size,y,C[5],(1-u)*.8);
    }
    if(i%5===0)p.glow(x,y,7,C[4],.12*(1-u));
  }
  if(t>.12&&t<.45){
    const u=(t-.12)/.33;
    p.glow(-1,-13,20+12*u,C[2],.14*(1-u));
  }
}
const PI2=Math.PI*2;
