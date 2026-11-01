// Shard Runner original: impact compression -> crown shock rings -> falling rubble.
// Distinct from PixelFX's heavy-landing: no sprite actor, sized for a 24px-scale hero.
import { fit, clamp, ease, smooth, rand, band, sparkle, TAU, WHITE } from "../../core/index.js";
export const meta={
 name:"Landing crown",
 desc:"A hard landing blooms into two uneven elliptical ground ripples while chipped stones bounce through backlit dust.",
 tags:["custom","landing","ground","impact","dust","rock"],
 size:[148,94],origin:[74,57],duration:.86,loop:false,fps:30,bg:"ground",
 options:{
  palette:["#131f30","#2d4655","#476b70","#668c83","#9bbba5","#d2e1c1","#ffffff"],
  seed:73,
  force:1
 }
};
export function draw(p,t,o){
 if(t<0||t>=meta.duration)return;
 const C=fit(o.palette,7),force=clamp(o.force||1,.65,1.4);
 const burst=1-clamp(t/.14),hold=1-smooth(.33,.83,t);
 if(t<.07){
   const k=1-t/.07;
   p.ellipse(0,-1,16+13*(1-k),2.2, t<.03?WHITE:C[5],k);
   p.line(-20,-1,20,-1,C[4],k*.8);
   p.glowLine(-15,-1,15,-1,10,C[5],.37*k);
 }
 // Back and front halves of the oblique pressure wave roll at different speeds.
 for(let j=0;j<2;j++){
   const delay=j*.105,life=j?.61:.43,q=(t-delay)/life;
   if(q<0||q>=1)continue;
   const radius=8+((j?44:57)*force)*ease.outCubic(q), thick=(j?5:3.5)*(1-q)+.5,alpha=(1-q)*(.79-j*.17);
   band(p,0,0,radius,.17,thick,alpha,C,g=>Math.sin(g)<0);
   band(p,0,0,radius,.17,Math.max(.6,thick*.8),alpha*.65,C,g=>Math.sin(g)>=0);
 }
 // A shallow cracked halo, not permanent terrain damage.
 if(t>.025&&t<.72){
   const f=smooth(.03,.15,t)*(1-smooth(.42,.72,t));
   for(let i=0;i<7;i++){
     const a=(i/7)*TAU+rand(i,o.seed,9)*.22,rd=8+rand(i,o.seed,11)*7;
     const sx=Math.cos(a)*rd,sy=Math.sin(a)*rd*.17;
     p.line(sx,sy,sx+Math.cos(a)*(7+rand(i,o.seed,12)*7),sy+Math.sin(a)*2,C[1],f*.73);
   }
 }
 // Airborne chips: accelerate under gravity, then dim, using seeded coordinates.
 for(let i=0;i<22;i++){
   const delay=rand(i,o.seed,18)*.085,age=t-delay;
   const life=.30+rand(i,o.seed,33)*.42;
   if(age<0||age>=life)continue;
   const s=i%2?1:-1,vx=s*(27+rand(i,o.seed,35)*91)*force,
   vy=-(31+rand(i,o.seed,72)*78)*force;
   const x=s*(3+rand(i,o.seed,24)*6)+vx*age,
   y=-1+vy*age+265*age*age, fade=1-smooth(life*.6,life,age);
   if(y>9)continue;
   const size=.7+rand(i,o.seed,55)*2.1;
   if(i%3===0){
     p.poly([[x-size,y],[x,y-size*.8],[x+size*.75,y],[x,y+size]],i%2?C[3]:C[4],fade);
     p.line(x-size*.3,y,x+size*.3,y,C[5],fade*.6);
   }else p.rect(x,y,size,size,i%3?C[3]:C[5],fade);
 }
 // Low translucent volumes against the ground; light pool is intentionally restrained.
 for(let i=0;i<10;i++){
   const delay=rand(i,o.seed,81)*.09,age=t-delay,life=.38+rand(i,o.seed,83)*.27;
   if(age<0||age>=life)continue;
   const side=i%2?1:-1,shift=8+rand(i,o.seed,87)*9;
   const x=side*(4+age*(36+shift)),y=-2-4*Math.sin(age*4+i),
   radius=(2.4+rand(i,o.seed,63)*2.2)*(.75+age*2);
   p.disc(x,y,radius,C[2],.11*(1-age/life));
 }
 if(hold>0&&t<.5)p.glow(0,-2,21,C[4],.13*hold);
}
