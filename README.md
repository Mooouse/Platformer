# Shard Runner — a PixelFX platformer

A handcrafted, three-stage HTML5 action platformer featuring real effects from [patch-gg/pixelfx](https://github.com/patch-gg/pixelfx).

**Play:** https://mooouse.github.io/Platformer/

## Controls
- **A / D** or **← / →** — move
- **W / ↑ / Space** — jump, then double-jump
- **Shift / X / J** — dash attack (damages enemies)
- **Esc / P** — pause
- **R** — restart stage
- **M** — toggle sound

Mobile has on-screen touch controls.

Collect at least **3 shards** to activate the exit portal. Health replenishes on every stage. Checkpoints save your respawn position.

## Technology
Vanilla JavaScript + HTML5 Canvas; no build step or external runtime. PixelFX's MIT-licensed source is vendored in `pixelfx/` (selected effects, helpers and core) to run offline and avoid CDN failure.

PixelFX copyright (c) Patch contributors and upstream authors. MIT license and notices: `pixelfx/LICENSE`, `pixelfx/NOTICE.md`.

## GitHub Pages
Enable **Settings → Pages → Deploy from branch → main / (root)**. Then open the play URL above. No Actions or stored artifacts are needed.

This is a prototype meant to be expanded with new maps, bosses, and effects.
