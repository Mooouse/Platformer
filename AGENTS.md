# Agent instructions — TRY AGAIN

This repository is a real, playable HTML5 platformer. When asked to improve it, change the working game and commit, not merely describe a plan.

## Non-negotiable visual identity
- **PixelFX quality, everywhere.** Runtime resolution is 480×270. The detailed player rig is built from `pixelfx/core/rig.js`, typically 24×38 world pixels. New VFX must feel proportionate to that scale.
- Keep backgrounds, platforms, enemies, hero and FX in **one coherent pixel-art language**, with intentional 1px marks, well-defined ink silhouettes and limited stage-specific dark-to-light color ramps. No generic geometric placeholders or arbitrary neon gradients.
- Color and light are separate PixelFX buffers. Use stepped hard silhouettes and small white-hot focal pixels; put soft edges in additive light or truly translucent smoke, not in every shape.
- Reserve shaking, hit-stop and full-screen flashes for decisive collisions. No blinking scene, pulsing screen, overblown bloom, huge noisy particle fields or sudden disappearance.
- Preserve gameplay and make changes on all three realms. Keep mobile controls.

## Source and workflow

First read and obey `skills/pixelfx/SKILL.md` (original upstream instructions), `docs/AUTHORING.md` (original upstream art bar), and `docs/FX-PIPELINE.md` (our local path adaptations).

1. Search existing effects and use a matching effect only if it serves the game's art direction.
2. For an original effect, draft an art direction sentence with phases (anticipation, release, spread, decay), palette and length. Sketch 2–3 structurally different candidates if the design is open.
3. Render contact sheets using `node tools/render.mjs custom/<name> --all --zoom 3` and review movement with `--gif` or `--mp4`. Repeat visual review/refinement at least three times for a hero effect. A source file alone is **not** visual validation.
4. Run `node tools/check.mjs custom/<name>`. Fix out-of-bounds drawing, seams, random determinism and warnings. Keep the effect below the upstream frame budget.
5. Integrate into actual input, combat or level triggers in `game.js`, using world coordinates and `flip`; do not make an ornament disconnected from interaction.
6. Run `npm run check` and verify GitHub Actions green. Inspect the game in a browser when possible. Only then ship to Pages.

## Layout

- `game.js` — gameplay, controls, FX spawn and update.
- `art.js` — detailed environment and character rendering.
- `pixelfx/core/` — vendored upstream engine, do not casually change.
- `pixelfx/fx/custom/` — original game effects.
- `pixelfx/fx/{other}/` — selected upstream effects.
- `effects.html`, `effects-lab.js` — live developer/artist review, no separate engine.
- `tools/` — adapted upstream rendering/checking scripts.
- `records/` — generated contact sheets, **not committed**.
- `tests/` — gameplay artwork and PixelFX smoke tests.

## Publishing
GitHub Pages is enabled through `.github/workflows/deploy-pages.yml`. Deployment checks VFX and generates contact sheets before the Pages artifact. Do not persist old build ZIPs or unnecessary Actions artifacts. Use MIT license and keep upstream attribution.
