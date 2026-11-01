import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrame, clearFrame, createFx, composite} from '../pixelfx/core/index.js';
import * as pickup from '../pixelfx/fx/pickups/collect-burst.js';
import * as hit from '../pixelfx/fx/impacts/hit-spark.js';
import * as slash from '../pixelfx/fx/melee/sword-slash.js';
import * as portal from '../pixelfx/fx/arcane/portal.js';
import * as explosion from '../pixelfx/fx/explosions/small-explosion.js';
import * as pad from '../pixelfx/fx/scifi/teleporter-pad.js';
import * as torch from '../pixelfx/fx/fire/torch.js';

const effects = {pickup, hit, slash, portal, explosion, pad, torch};

test('PixelFX effects instantiate, animate and composite into an RGBA buffer', () => {
  const frame = createFrame(240, 160);
  const pixels = new Uint8ClampedArray(frame.w * frame.h * 4);
  for (const [name, mod] of Object.entries(effects)) {
    assert.ok(mod.meta, name + ': metadata missing');
    const fx = createFx(mod, {x:110, y:114, seed:42});
    assert.equal(typeof fx.update, 'function');
    assert.equal(typeof fx.draw, 'function');
    clearFrame(frame);
    for(let i=0;i<6;i++)fx.update(1/60);
    fx.draw(frame);
    composite(frame, pixels, null);
    const hasColor = frame.color.some(v => v!==0);
    const hasLight = frame.light.some(v => v!==0);
    assert.ok(hasColor || hasLight, name + ': no visible pixels produced');
  }
});
