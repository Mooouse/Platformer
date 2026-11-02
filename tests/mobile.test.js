import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {calculateGameViewport} from '../mobile-layout.js';

test('Portrait iPhone keeps square pixels and game ground visible',()=>{
 const p=calculateGameViewport(390,844);
 assert.equal(p.portrait,true);
 assert.equal(p.width,220);
 assert.ok(p.height>400);
 assert.ok(Math.abs(p.width/p.height-390/844)<.003,'game aspect does not match phone');
 assert.equal(p.height-p.worldOffset-232,53,'ground must leave room for thumbs');
});
test('Landscape iPhone expands the camera instead of stretching 16:9 gameplay',()=>{
 const p=calculateGameViewport(844,390);
 assert.equal(p.portrait,false);
 assert.equal(p.height,270);
 assert.ok(Math.abs(p.width/p.height-844/390)<.005);
 assert.equal(p.worldOffset,0);
});
test('Desktop 16:9 keeps original 480×270 pixel scale',()=>{
 const p=calculateGameViewport(1920,1080);
 assert.deepEqual([p.width,p.height],[480,270]);
});
test('Rotations, tablet windows and squarish viewports stay finite and positive',()=>{
 for(const [w,h] of [[320,740],[740,320],[768,1024],[1024,768],[500,600],[600,500],[1280,720],[2560,1080]]){
  const p=calculateGameViewport(w,h);
  assert.ok(p.width>0&&p.height>=270&&p.worldOffset>=0);
  assert.ok(p.cameraLead>0&&p.cameraLead<1);
 }
});
test('Game surface prevents double-tap zoom and keeps touch controls',()=>{
 const css=readFileSync(new URL('../style.css',import.meta.url),'utf8');
 const game=readFileSync(new URL('../game.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(css,/#viewport\{[^}]*touch-action:none/);
 assert.match(css,/\.mobile-controls button\{[^}]*touch-action:none/);
 const guards=readFileSync(new URL('../touch-guards.js',import.meta.url),'utf8');
 assert.match(game,/installGameTouchGuards/);
 assert.match(guards,/doc\.addEventListener\('dblclick'/);
 assert.match(guards,/root\.addEventListener\('touchmove'/);
 assert.match(guards,/doc\.addEventListener\('selectstart'/);
 assert.match(guards,/doc\.addEventListener\('contextmenu'/);
 assert.match(css,/-webkit-user-select:none!important/);
 assert.match(css,/-webkit-touch-callout:none!important/);
 assert.match(game,/calculateGameViewport\(/);
 assert.match(html,/viewport-fit=cover/);
 for(const action of ['left','right','jump','dash'])assert.match(html,new RegExp('data-action="'+action+'"'));
});
