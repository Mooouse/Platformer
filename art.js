// SHARD RUNNER — environment and character art.
// PixelFX's rig is used directly for the animated hero: no placeholder rectangles.
// Scene is hand-rasterized in the same low-resolution, hard-edged ink/shading language.
import { posed, DUMMY_PAL, hex } from './pixelfx/core/index.js';
import { act as cleaveAct } from './pixelfx/fx/custom/cleave-contact.js';

export function createArt(ctx, W=480, H=270) {
  const PI=Math.PI,TAU=PI*2;
  const R=(n)=>{const v=Math.sin(n*127.1+78.233)*43758.5453;return v-Math.floor(v)};
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const px=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))};
  const path=(v,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(Math.round(v[0][0]),Math.round(v[0][1]));for(let i=1;i<v.length;i++)ctx.lineTo(Math.round(v[i][0]),Math.round(v[i][1]));ctx.closePath();ctx.fill()};
  const line=(x1,y1,x2,y2,c,w=1)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke()};
  const light=(x,y,r,c,a=.2)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'transparent');ctx.globalAlpha=a;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1};
  const palettes=[
    {ink:'#080f20',far:'#172738',mid:'#203c48',rock:'#233644',shade:'#142a36',face:'#364f58',edge:'#6d9892',cap:'#548e81',hi:'#9bd4b7',moss:'#397668',leaves:'#1c504c',spark:'#8ef7d6',flower:'#e1d3a0',rune:'#61cdd1'},
    {ink:'#130d20',far:'#3c2735',mid:'#5e3038',rock:'#44303a',shade:'#2b202d',face:'#74505a',edge:'#b57970',cap:'#9a5f5b',hi:'#f3b68a',moss:'#7e4850',leaves:'#63343d',spark:'#ffb997',flower:'#ffd1a2',rune:'#f5977c'},
    {ink:'#0b112b',far:'#202c57',mid:'#30376a',rock:'#282c57',shade:'#1b2447',face:'#444978',edge:'#737eb8',cap:'#666ca5',hi:'#c3c9ff',moss:'#45477d',leaves:'#292e62',spark:'#a2e6ff',flower:'#c3b6ff',rune:'#8dc4ff'}
  ];
  function architecture(x,y,seed,sc,p,t){
    const roof=Math.round(15+R(seed*13)*29),ww=Math.round(13+R(seed*71)*12);
    px(x,y-roof,ww,roof+18,p.ink);
    px(x+2,y-roof+1,ww-4,roof-5,p.far);
    px(x-3,y-roof-3,ww+6,3,p.ink);px(x-4,y-roof-6,ww+8,3,p.mid);
    for(let h=10;h<roof-4;h+=12){
      px(x+ww/2-2,y-roof+h,5,7,p.ink);
      px(x+ww/2-1,y-roof+h+1,3,3,sc===1?'#bd6555':'#4b9da1');
      px(x+ww/2,y-roof+h+5,1,1,p.edge);
    }
    px(x+2,y-roof+2,1,roof-6,p.edge);
    if(seed%3===0){
      px(x+ww+4,y-roof+7,6,4,p.ink);
      px(x+ww+7,y-roof+10,2,10,p.far);
    }
  }
  function branches(x,y,scale,seed,p){
    ctx.save();ctx.translate(Math.round(x),Math.round(y));
    px(-3*scale,-36*scale,6*scale,36*scale,p.ink);
    path([[-1*scale,-25*scale],[-19*scale,-39*scale],[-18*scale,-43*scale],[3*scale,-30*scale]],p.ink);
    path([[0,-19*scale],[14*scale,-34*scale],[16*scale,-35*scale],[4*scale,-16*scale]],p.ink);
    for(let i=0;i<9;i++){
      const a=i*2.399+seed,u=Math.cos(a)*17*scale,v=-35*scale+Math.sin(a)*11*scale;
      px(u-5*scale,v-4*scale,11*scale,8*scale,p.leaves);
      px(u-3*scale,v-3*scale,6*scale,3*scale,p.moss);
      if(i%3===0)px(u-1*scale,v-1*scale,2*scale,2*scale,p.cap);
    }
    ctx.restore();
  }
  function background(theme, stage,camera,t) {
    const p=palettes[stage];
    const grd=ctx.createLinearGradient(0,0,0,H);
    const sky=stage===0?['#071326','#182c3e','#284c50']:stage===1?['#1c1021','#49303b','#704747']:['#090f29','#18204e','#343d68'];
    grd.addColorStop(0,sky[0]);grd.addColorStop(.6,sky[1]);grd.addColorStop(1,sky[2]);ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
    // Dithered celestial haze, sparse stars and drifting fireflies.
    for(let i=0;i<135;i++){
      const depth=i%3, x=(((R(i*32+5)*1153-camera*(.045+depth*.04))%W)+W)%W;
      const y=8+R(i*19+4)*161,tw=.35+.48*Math.sin(t*(.6+R(i)*1.3)+i);
      ctx.globalAlpha=clamp(tw,.12,.78);
      px(x,y,i%17===0?2:1,1,i%7===0?p.spark:'#98aab9');
    }
    ctx.globalAlpha=1;
    const moon=stage===1?'#ffa58a':stage===2?'#acc6ff':'#b9f5dc';
    const mx=354-camera*.026,my=49;
    light(mx,my,90,moon,.14);
    ctx.fillStyle=moon;ctx.beginPath();ctx.arc(mx,my,21,0,TAU);ctx.fill();
    ctx.globalAlpha=.22;
    for(let i=0;i<6;i++)px(mx+Math.cos(i*4)*12,my+Math.sin(i*4)*11,3,2,p.mid);
    ctx.globalAlpha=1;
    if(stage===2){
      ctx.globalAlpha=.28;
      for(let i=0;i<34;i++){const x=(R(i*43)*W+R(i)*t*2)%W,y=15+R(i*84)*132;
        px(x,y,R(i*23)> .6?2:1,1,p.spark);
      }ctx.globalAlpha=1;
    }
    // Hand-drawn silhouettes rather than geometric mountain triangles.
    for(let layer=0;layer<3;layer++){
      const speed=[.10,.24,.40][layer],base=[174,205,228][layer],ink=[p.far,p.mid,p.shade][layer];
      const unit=30,off=Math.floor(camera*speed/unit);
      const points=[[0,H]];
      for(let i=-2;i<=Math.ceil(W/unit)+2;i++){
        const id=i+off,xx=(id*unit-camera*speed),j=R(id*13+layer*41)*25;
        points.push([xx,base-j]);points.push([xx+unit*.37,base-j-5+R(id*31)*9]);
      }
      points.push([W+40,H]);path(points,ink);
    }
    // Parallax ruins: clustered columns, broken windows and bridges.
    const speed=.38,segment=82,off=Math.floor(camera*speed/segment);
    for(let i=off-2;i<off+10;i++){
      const x=Math.round(i*segment-camera*speed),bottom=stage===0?214:220;
      if(R(i*11+stage)<.30)continue;
      architecture(x,bottom,i+19,stage,p,t);
      if(i%4===0){
        px(x+22,bottom-24,50,4,p.ink);
        for(let j=0;j<3;j++)px(x+29+j*13,bottom-20,7,15,p.far);
      }
    }
    if(stage===0){
      const off2=Math.floor(camera*.58/112);
      for(let i=off2-2;i<off2+9;i++)if(i%3!==1)branches(i*112-camera*.58,220,.75,i,p);
    } else if(stage===1){
      for(let i=-1;i<13;i++){
        const x=i*64-camera*.52;
        path([[x,218],[x+14,188-R(i*9)*18],[x+17,219]],p.far);
        px(x+15,218,11,17,p.ink);
        if(i%3===0)light(x+16,180,40,'#e9806c',.11);
      }
    } else {
      for(let i=-1;i<11;i++){
        const x=i*80-camera*.35;
        px(x,155,2,53,p.ink);px(x-5,151,12,6,p.far);
        px(x-8,143,18,3,p.far);
        line(x-4,155,x+2,163,p.edge,1);
      }
    }
    // The player-space silhouette stays legible against soft background fog.
    const haze=ctx.createLinearGradient(0,145,0,228);
    haze.addColorStop(0,'transparent');haze.addColorStop(1,p.ink);
    ctx.globalAlpha=.16;ctx.fillStyle=haze;ctx.fillRect(0,145,W,83);ctx.globalAlpha=1;
  }
  function terrain(level,camera,t){
    const p=palettes[level.stage??0];
    for(const s of level.solids) {
      const x=Math.round(s.x-camera),end=x+s.w;
      if(end<0||x>W)continue;
      const top=s.y, h=Math.min(s.h,H-top+12),floating=!s.ground;
      // Continuous ink silhouette with bright weathered cap, never disconnected boxes.
      px(x-1,top-1,s.w+2,h+2,p.ink);
      px(x+1,top+4,s.w-2,h-3,p.rock);
      px(x+1,top+1,s.w-2,5,p.face);
      px(x,top,s.w,2,p.cap);
      px(x+1,top+2,s.w-2,1,p.hi);
      px(x,top+6,s.w,2,p.shade);
      const start=Math.max(0,Math.floor((-x)/13)),finish=Math.min(Math.ceil(s.w/13),Math.ceil((W-x)/13));
      for(let i=start;i<=finish;i++){
        const bx=x+i*13,seed=Math.floor((s.x+i*13)/13)*13+level.stage*81;
        const dy=9+(R(seed+4)>.5?2:0);
        // Distinct hand-placed stone facets, cracks and surface grit.
        px(bx+1,top+dy,11,1,p.shade);
        px(bx+R(seed)*3,top+dy+4,3,2,p.face);
        if(R(seed*7)>.39)px(bx+2,top+3,1,2,p.hi);
        if(R(seed*13)>.43) {
          px(bx+4,top+14,7,1,p.shade);
          px(bx+8,top+15,1,4,p.shade);
          px(bx+5,top+16,2,1,p.edge);
        }
        if(R(seed*19)>.65)px(bx+4,top+20,3,2,p.face);
        if(R(seed*23)>.80){
          px(bx+7,top+4,1,5,p.moss);
          px(bx+8,top+5,2,2,p.cap);
        }
        if(R(seed*29)>.86&&floating){
          const len=5+Math.round(R(seed*31)*9);
          px(bx+6,top+11,2,len,p.shade);px(bx+6,top+11+len,1,3,p.moss);
        }
        // Metal rivets and inlaid illuminated rune on the occasional brick.
        if(R(seed*71)>.945){
          px(bx+2,top+9,5,4,p.shade);
          px(bx+3,top+10,3,1,p.rune);
          px(bx+4,top+11,1,2,p.hi);
        }
      }
      if(floating){
        px(x+5,top+11,s.w-10,3,p.ink);px(x+7,top+14,s.w-14,2,p.face);
        for(let i=8;i<s.w-8;i+=18){
          path([[x+i-5,top+14],[x+i+6,top+14],[x+i+1,top+18]],p.ink);
          px(x+i,top+17,2,2,p.edge);
        }
        px(x+4,top+3,3,7,p.edge);px(end-7,top+3,3,7,p.edge);
      } else {
        for(let i=start;i<finish;i++){
          const bx=x+i*13,seed=(s.x+i*13)*.81;
          if(R(seed*19)>.78){px(bx+4,top+29,8,1,p.shade);px(bx+8,top+30,1,9,p.shade)}
          if(R(seed*13)>.83){px(bx+2,top+5,2,2,p.moss);px(bx+1,top+6,4,1,p.cap)}
        }
      }
    }
    // Jagged, outlined metal thorns — clear hit silhouettes.
    for(const [a,b] of level.spikes){
      if(b<camera||a>camera+W)continue;
      for(let wx=a;wx<b;wx+=7){
        const x=Math.round(wx-camera),tip=level.stage===1?13:11;
        path([[x-1,232],[x+3,232-tip-1],[x+8,232]],p.ink);
        path([[x+1,230],[x+3,232-tip+1],[x+5,230]],p.edge);
        line(x+3,232-tip+1,x+3,229,p.hi);
      }
    }
    for(const x of level.torches){
      const sx=Math.round(x-camera);if(sx<-30||sx>W+30)continue;
      px(sx-7,212,14,2,p.ink);px(sx-3,211,6,21,p.ink);
      px(sx-2,213,4,14,p.face);px(sx-4,227,8,4,p.shade);
      px(sx-7,211,14,3,p.edge);px(sx-1,213,2,3,p.hi);
      light(sx,196,29,level.stage===1?'#ff9c65':'#5ce9d6',.17);
    }
    for(const x of level.checkpoints){
      const sx=Math.round(x-camera);if(sx<-35||sx>W+35)continue;
      const active=level.activeCheckpoints.has(x),c=active?p.spark:p.edge;
      px(sx-6,225,12,7,p.ink);px(sx-4,218,8,9,p.face);
      px(sx-2,207,4,12,p.edge);px(sx-5,205,10,3,p.ink);
      path([[sx,185],[sx+8,197],[sx,210],[sx-8,197]],p.ink);
      path([[sx,189],[sx+5,197],[sx,206],[sx-5,197]],c);
      px(sx-1,192,2,6,'#e1ffff');
      if(active)light(sx,197,32,c,.19);
    }
    // Scattered foliage and hanging chains have deterministic world positions.
    for(let x=32;x<level.end;x+=29){
      const sx=Math.round(x-camera);if(sx<-22||sx>W+22)continue;
      let grounded=false;
      for(const [a,w] of level.ground)if(x>a+10&&x<a+w-10){grounded=true;break}
      if(!grounded)continue;
      const seed=R(x*13+level.stage);
      if(seed>.65){
        const h=4+Math.round(R(x*17)*5);
        line(sx,231,sx+1,231-h,p.moss);
        line(sx,231,sx-3,229-h/2,p.cap);
        if(seed>.85){px(sx-1,230-h,3,3,p.flower);px(sx,230-h+1,1,1,p.spark)}
      } else if(seed>.35){
        px(sx,229,5,2,p.shade);
        px(sx+1,228,2,1,p.edge);
      }
    }
  }
  const armorMap=new Map([
    ['k','#090e20'],['A','#d3eff0'],['B','#a4c3cf'],['C','#6e9bad'],
    ['D','#456a84'],['E','#607c91'],['F','#3c4e69'],['G','#253451'],
    ['J','#101e34'],['m','#ffcc8c']
  ].map(([k,v])=>[hex(DUMMY_PAL[k])>>>0,v]));
  let bodyCache=new Map();
  function poseSprite(frame,face,type=0){
    const k=frame+','+face+','+type;if(bodyCache.has(k))return bodyCache.get(k);
    const phase=frame/8*TAU,run=type===1,air=type===2,dash=type===3,windup=type===4;
    const p=windup||dash ? {...cleaveAct.poses[windup?0:1][1],face} : {
      face,
      crouch:dash?7:air?1:run?3+Math.round(Math.sin(phase)*2):3,
      lean:dash?10:air?-2:run?5:1,
      fx:dash?17:air?1:run?2+Math.sin(phase)*7:9,
      fy:dash?-22:air?-31:run?-20+Math.cos(phase)*6:-20,
      bx:dash?-13:air?-7:run?2-Math.sin(phase)*7:-8,
      by:dash?-24:air?-31:run?-20-Math.cos(phase)*6:-21,
      ffx:dash?11:air?4:run?Math.round(9*Math.sin(phase)):5,
      ffy:dash?-8:air?-7:run?Math.round(4+5*Math.cos(phase)):-3,
      fbx:dash?-15:air?-4:run?Math.round(-9*Math.sin(phase)):-5,
      fby:dash?-5:air?-6:run?Math.round(4-5*Math.cos(phase)):-3,
      weapon:'sword',sa:dash?.18:run?.3:-.6,wl:dash?.85:.65
    };
    const sprite=posed(p);
    const c=document.createElement('canvas');c.width=78;c.height=72;
    const g=c.getContext('2d');
    const fills=new Map();
    for(let i=0;i<sprite.n;i++){
      const color=sprite.color[i]>>>0;
      let fill=fills.get(color);
      if(!fill){const r=color&255,green=(color>>>8)&255,b=(color>>>16)&255;
        fill=armorMap.get(color)||'rgb('+r+','+green+','+b+')';fills.set(color,fill);}
      g.fillStyle=fill;g.fillRect(Math.round(sprite.xs[i])+39,Math.round(sprite.ys[i])+60,1,1);
    }
    // A scarf pin/visor ties the PixelFX grey rig to the luminous world.
    g.fillStyle='#52e5dd';g.fillRect(34,34,4,2);
    if(bodyCache.size>80)bodyCache.clear();bodyCache.set(k,c);return c;
  }
  function hero(player,camera,t,theme){
    const footX=Math.round(player.x+6-camera),footY=Math.round(player.y+player.h);
    const type=player.windup>0?4:player.dash>0?3:!player.grounded?2:Math.abs(player.vx)>20?1:0;
    const frame=type===1?Math.floor(t*12)%8:type===3?1:0;
    const sprite=poseSprite(frame,player.face,type),p=palettes[theme];
    // Intentional contact shadow to anchor the animated 3D rig.
    ctx.globalAlpha=.38;px(footX-10,footY+1,20,2,p.ink);ctx.globalAlpha=1;
    if(player.windup>0){
      light(footX+player.face*13,footY-24,18,p.spark,.13);
      px(footX+player.face*17,footY-27,2,2,p.hi);
    }
    if(player.dash>0){
      for(let i=3;i>=1;i--){
        ctx.globalAlpha=.11/i;
        ctx.drawImage(sprite,footX-39-player.face*i*7,footY-60);
      }ctx.globalAlpha=1;
      light(footX,footY-16,40,p.spark,.23);
    }
    ctx.drawImage(sprite,footX-39,footY-60);
    // Hand-pixelled cape/scarf silhouette, with movement response.
    const sway=player.dash>0?13:player.windup>0?3:Math.abs(player.vx)>35?8:4,sign=player.face;
    path([[footX-sign*4,footY-27],[footX-sign*(sway+6),footY-24+Math.round(Math.sin(t*9)*2)],[footX-sign*(sway+3),footY-20],[footX-sign*2,footY-20]],'#163a51');
    px(footX-sign*(sway+2),footY-24+Math.round(Math.sin(t*9)*2),4,2,p.spark);
  }
  function enemy(e,camera,t,stage){
    if(!e.alive)return;
    const p=palettes[stage],x=Math.round(e.x-camera),y=Math.round(e.y);
    if(x<-35||x>W+35)return;
    // Armour silhouette with layered facets, claws and one bright eye.
    if(e.flying){
      const flap=Math.round(Math.sin(t*13+e.x)*4);
      path([[x-3,y-4],[x-18,y-7-flap],[x-12,y+6],[x,y+4]],p.shade);
      path([[x+3,y-4],[x+18,y-7-flap],[x+12,y+6],[x,y+4]],p.shade);
      px(x-14,y-5-flap,9,3,p.edge);px(x+5,y-5-flap,9,3,p.edge);
      path([[x,y-11],[x+9,y-7],[x+10,y+3],[x+5,y+9],[x-5,y+9],[x-10,y+3],[x-9,y-7]],p.ink);
      path([[x,y-9],[x+7,y-6],[x+8,y+3],[x,y+7],[x-8,y+3],[x-7,y-6]],p.face);
      path([[x-4,y-1],[x,y-3],[x+4,y-1],[x,y+3]],p.spark);
      px(x-1,y-1,2,2,'#ffffff');
      px(x-5,y+9,2,4,p.edge);px(x+4,y+9,2,4,p.edge);
    }else{
      const stride=Math.sin(t*e.speed*.15)*2;
      px(x-7,y+4,3,8,p.ink);px(x+4,y+4,3,8,p.ink);
      px(x-8,y+9+Math.max(0,stride),6,3,p.edge);px(x+2,y+9+Math.max(0,-stride),6,3,p.edge);
      path([[x-11,y-2],[x-8,y-8],[x-4,y-10],[x+5,y-10],[x+10,y-5],[x+11,y+6],[x+7,y+10],[x-7,y+10],[x-11,y+5]],p.ink);
      path([[x-8,y-3],[x-5,y-8],[x+4,y-8],[x+8,y-3],[x+8,y+5],[x-8,y+5]],p.face);
      px(x-7,y-8,13,2,p.edge);
      px(x-5,y-4,3,3,p.spark);px(x+2,y-4,3,3,p.spark);
      px(x-4,y-3,1,1,'#fff');px(x+2,y-3,1,1,'#fff');
      px(x-3,y+3,7,2,p.shade);
      path([[x-9,y-9],[x-12,y-13],[x-3,y-10]],p.ink);
      path([[x+9,y-9],[x+12,y-13],[x+3,y-10]],p.ink);
      px(x-10,y-1,3,4,p.edge);px(x+8,y-1,3,4,p.edge);
    }
    light(x,y,24,p.spark,.10);
  }
  function gem(g,camera,t,stage){
    if(g.taken)return;
    const p=palettes[stage],x=Math.round(g.x-camera),y=Math.round(g.y+Math.sin(t*3.2+g.x)*2);
    if(x<-20||x>W+20)return;
    light(x,y,22,p.spark,.26);
    path([[x,y-10],[x+7,y-3],[x+7,y+4],[x,y+11],[x-7,y+4],[x-7,y-3]],p.ink);
    path([[x,y-9],[x+5,y-3],[x+5,y+4],[x,y+9],[x-5,y+4],[x-5,y-3]],p.edge);
    path([[x,y-9],[x+5,y-3],[x,y+1],[x-5,y-3]],'#e0ffff');
    path([[x,y+1],[x+5,y-3],[x+5,y+4],[x,y+9]],p.rune);
    path([[x,y+1],[x-5,y-3],[x-5,y+4],[x,y+9]],p.cap);
    px(x-1,y-6,2,2,'#ffffff');
    if(Math.sin(t*4+g.x)>.8){px(x+9,y-9,2,2,'#fff');px(x+10,y-11,1,6,'#fff')}
  }
  function goal(level,camera,t,shards,player){
    const x=Math.round(level.end-camera),p=palettes[level.stage??0];
    if(x<-90||x>W+90)return;
    // Ribbed stone arch frames the actual PixelFX animated portal.
    px(x-32,224,64,8,p.ink);px(x-28,217,56,7,p.face);
    px(x-35,177,11,45,p.ink);px(x+24,177,11,45,p.ink);
    px(x-32,176,8,37,p.face);px(x+25,176,8,37,p.face);
    path([[x-36,177],[x-32,163],[x-20,154],[x+20,154],[x+32,163],[x+36,177]],p.ink);
    path([[x-30,178],[x-25,165],[x-18,160],[x+18,160],[x+25,165],[x+30,178]],p.face);
    px(x-22,161,44,4,p.cap);px(x-22,165,44,2,p.hi);
    px(x-35,177,11,3,p.edge);px(x+24,177,11,3,p.edge);
    for(const v of [-1,1]) {
      const bx=x+v*28;
      for(let i=0;i<4;i++){px(bx-2,181+i*9,5,1,p.shade);px(bx-1,182+i*9,2,1,p.hi)}
    }
    const unlocked=shards>=3;
    path([[x,147],[x+8,156],[x,167],[x-8,156]],p.ink);
    path([[x,150],[x+5,156],[x,164],[x-5,156]],unlocked?p.spark:p.face);
    if(unlocked)light(x,156,39,p.spark,.21);
    if(Math.abs(player.x-level.end)<110){
      ctx.textAlign='center';ctx.font='bold 7px monospace';ctx.fillStyle=unlocked?'#caffef':'#ffb4a2';
      ctx.fillText(unlocked?'ENTER THE PORTAL':'COLLECT 3 SHARDS',x,132);
    }
  }
  function foreground(stage,t){
    const p=palettes[stage];
    // Thin film-grain / ink-stipple; atmosphere without blurring pixels.
    ctx.globalAlpha=.10;
    for(let i=0;i<40;i++){
      const x=(i*97+(t*6|0))%W,y=H-11-R(i*13)*90;
      px(x,y,1,1,p.hi);
    }
    ctx.globalAlpha=1;
    const grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,'rgba(1,4,14,.29)');grad.addColorStop(.25,'rgba(1,4,14,0)');
    grad.addColorStop(.7,'rgba(1,4,14,0)');grad.addColorStop(1,'rgba(1,4,14,.19)');
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  }
  return {background,terrain,hero,enemy,gem,goal,foreground};
}
