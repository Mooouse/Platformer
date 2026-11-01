// Shard Runner original: a brief upward discharge from the hero's feet.
// Ground ellipses and angled glass sparks create depth without blanketing the hero.
import { fit, clamp, smooth, ease, rand, band, sparkle, WHITE, TAU } from "../../core/index.js";
export const meta = {
  name: "Jump bloom",
  desc: "A white-hot takeoff glyph breaks into tilted floor rings, curved rising shards, dancing blue sparks and a faint updraft.",
  tags: ["custom", "jump", "movement", "ground", "magic"],
  size: [122, 112],
  origin: [61, 86],
  duration: .72,
  loop: false,
  fps: 30,
  bg: "ground",
  options: {
    palette: ["#102941","#1d4d6a","#2b7b9b","#42b6c0","#75e8dd","#bbfff0","#ffffff"],
    seed: 17,
    power: 1
  }
};
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const C=fit(o.palette,7),power=clamp(o.power||1,.5,1.5);
 const attack=1-clamp(t/.16),settle=1-smooth(.18,.70,t);
 if(t<.105){
   const k=1-clamp(t/.105);
   p.ellipse(0,-2,9*power*k+4,1.1,C[6],k);
   p.glow(0,-6,18,C[4],.35*k);
   p.line(0,-3,0,-4-19*ease.outExpo(clamp(t/.105)),t<.04?WHITE:C[5],k);
 }
 for(let i=0;i<2;i++){
   const age=t-i*.095;
   if(age<0)continue;
   const f=age/(.40+i*.09);if(f>=1)continue;
   const rad=6+(24+i*15)*ease.outCubic(f);
   band(p,0,0,rad,.18,Math.max(.65,2.6*(1-f)),(1-f)*(.88-i*.18),C,(g)=>Math.sin(g)<0);
   band(p,0,0,rad,.18,Math.max(.55,2.1*(1-f)),(1-f)*(.58-i*.13),C,(g)=>Math.sin(g)>=0);
 }
 // Ribbons follow opposite arcs so take-off has motion, not a radial sticker.
 for(let j=0;j<2;j++){
   const f=t/(.24+j*.12);if(f>=1)continue;
   const side=j?1:-1,r=8+12*f;
   p.arc(side*5,-11,r,2.2*(1-f),j?.1:2.6,j?2.2:4.8,C[4],.7*(1-f));
 }
 for(let i=0;i<18;i++){
   const seed=rand(i,o.seed,15),delay=seed*.095,life=.27+rand(i,o.seed,16)*.39;
   const age=t-delay;if(age<0||age>=life)continue;
   const u=age/life, side=i%2?1:-1,angle=(.2+rand(i,o.seed,34)*.9);
   const v=29+rand(i,o.seed,71)*66;
   const x=side*(4+angle*v*age+(rand(i,o.seed,11)-.5)*10*age);
   const y=-3-v*age*(.8+rand(i,o.seed,35)*.35)+98*age*age;
   const c=u<.2?C[6]:i%3===0?C[4]:C[5];
   if(i%4===0){
     const s=2.4*(1-.4*u);
     p.poly([[x,y-s*1.5],[x+s,y],[x,y+s*1.5],[x-s,y]],c,1-u);
     if(u<.5)p.glow(x,y,6,C[4],.14*(1-u));
   }else p.line(x-1.4,y,x+1.4,y,c,1-u);
 }
 const g=(t-.1)/.33;
 if(g>0&&g<1)sparkle(p,0,-16-16*g,5*(1-g),C[6],C[4],.27*(1-g));
 if(settle>0&&t>.11)p.glow(0,-2,26,C[2],.08*settle);
}
