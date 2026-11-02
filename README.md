# SHARD RUNNER — a PixelFX platformer

Three handcrafted side-scrolling realms. Fast dash combat, double jumps, collectible shards, checkpoints, enemies and exit portals. Built with HTML5 Canvas and the [PixelFX](https://github.com/patch-gg/pixelfx) code-first pixel VFX engine.

**[Play the game](https://mooouse.github.io/Platformer/)** · **[Open the FX Lab](https://mooouse.github.io/Platformer/effects.html)**

## What's new in v0.3

Five **original, hand-coded PixelFX effects** written expressly for this game and rendered at the same native pixel scale:

| Event | Effect module | Artistic direction |
| --- | --- | --- |
| Jump / double-jump | `pixelfx/fx/custom/jump-bloom.js` | white takeoff, rolling ground rings, rising motes |
| Dash attack | `pixelfx/fx/custom/dash-wake.js` | pressure crescents, sharp fast streaks, glints |
| Hard landing | `pixelfx/fx/custom/landing-crown.js` | ground ripple, tumbling stone, soft dust |
| Enemy defeat | `pixelfx/fx/custom/soul-shatter.js` | brief white contact frame, flying crystal facets |
| Dash hit / blade contact | `pixelfx/fx/custom/cleave-contact.js` | wind-up pose, brilliant 2-frame contact, broken lens shockwaves and weighted facets |

These are integrated into `game.js`, alongside selected upstream PixelFX effects. The FX Lab renders their **real code**, with replay and palette switching between the three worlds. Contact sheets are built on deployment and served at `records/custom/<effect>/contact.png`.

## Fullscreen and mobile controls

The game now fills the whole available browser viewport rather than living inside a 16:9 framed box. The HTML5 canvas changes its **native logical resolution** to match screen proportions, so square pixels remain square and the camera sees more of a wide landscape level. In portrait mode the renderer extends the vertical sky above the level while preserving all world positions. UI respects the device notch and home-indicator safe areas.

Touch input supports two thumbs simultaneously, moving a held thumb from LEFT to RIGHT, one-tap jumping, and the dash button. The gameplay surface disables unwanted page scrolling, long-press selection, pinch and double-tap zoom.

On devices supporting the Fullscreen API, use the game HUD expand icon. On iOS where browser fullscreen is restricted, choose **Share → Add to Home Screen** in Safari and launch from the new home screen icon for a standalone game window. Browser chrome cannot be removed by web code inside every third-party in-app browser.

### Mobile regression check

`node --test tests/mobile.test.js` exercises portrait and landscape iPhone proportions, desktop 16:9, tablet sizes, square-pixel ratios, ground placement and touch gesture guards.

## Controls

| Key | Action |
| --- | --- |
| A / D or ← / → | Move |
| W / ↑ / Space | Jump, then double-jump |
| Shift / X / J | Dash strike |
| Esc / P | Pause |
| R | Restart stage |
| M | Toggle sound |

Touch controls appear on mobile. Collect at least 3 shards to activate each gate.

## The PixelFX authoring workflow

This repository includes the upstream **[AI skill](skills/pixelfx/SKILL.md)** and **[technical art guide](docs/AUTHORING.md)**, with local integration notes in **[AGENTS.md](AGENTS.md)** and **[FX-PIPELINE.md](docs/FX-PIPELINE.md)**.

A new effect is not done after one code pass: choose references, create distinct drafts, render a contact sheet and animation, compare the motion, refine at least three times, and run the upstream quality checker. Keep only the selected, reviewed variant.

```sh
node tools/list.mjs custom
node tools/new.mjs custom/my-effect
node tools/render.mjs custom/my-effect --max 16 --zoom 3
node tools/check.mjs custom/my-effect
npm run check
```

`npm run fx:preview` renders all custom contact sheets locally; `npm run fx:check` enforces PixelFX's own effect quality checks. The `records/` directory is generated and ignored by Git. GitHub Pages regenerates the previews automatically during deployment, without storing build archives in Git.

**Combat timing:** pressing dash now triggers a short `cleave-contact.act` anticipation pose before movement. On hitting an enemy the hit frame spawns the authored collision FX; the same act supplies the short hit-stop, while the enemy breaks into shatter FX. This keeps the player movement, sword strike, and contact at coherent times.

## Technical notes

- Vanilla ECMAScript modules + HTML5 Canvas, native 480 × 270 game resolution.
- All selected upstream PixelFX code is vendored under `pixelfx/` and requires no CDN or npm install to play.
- Automated tests cover character art, all realms, the imported PixelFX effects and the original-effect quality checker.
- GitHub Pages deploys from Actions on every push to `main`.
- Upstream PixelFX is MIT-licensed; see `pixelfx/LICENSE` and `pixelfx/NOTICE.md`. The Patch Pixel gallery font is **not** bundled.

