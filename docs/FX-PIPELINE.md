# Original FX pipeline — SHARD RUNNER

This is the project's **local addendum** to the upstream [PixelFX skill](../skills/pixelfx/SKILL.md) and [authoring contract](AUTHORING.md).

## Important path difference

The stock PixelFX skill refers to `src/core/`, `src/fx/`, and `src/fx/<category>/<effect>.js`. In **this project**, those paths are **`pixelfx/core/`** and **`pixelfx/fx/`**. Our vendored `tools/` have been adapted to these paths. There is no need to copy another repository alongside this one.

## Workflow for each new effect

1. **Art direction:** a one-sentence visual intent, what the player should read, a small dark→light palette, an anchor, a duration, and phases. Avoid copying specific existing effects.
2. **Reference:** inspect at least two close upstream implementations; note timing, size and layering.
3. **Draft:** for a new family of effects create 2–3 different versions; pick the most readable contact sheet and motion, not the one with the most particles.
4. **Render / look:** `node tools/render.mjs custom/<id> --all --zoom 3`. Review the contact sheet (not just source). Use `--mp4` if ffmpeg exists; `--gif` also requires ffmpeg.
5. **Refine / repeat:** do at least 3 passes on a featured effect. Pay attention to: a sharp 1–2 frame contact, believable slow decay, glow not washing out hard pixels, and particles moving in coherent trajectories.
6. **Validate:** `node tools/check.mjs custom/<id>` and fix warnings, including spills outside the canvas and poor seams. `npm run check` runs automated integration tests.
7. **Integrate:** place via `createFx(mod, {x,y,flip,palette,seed})` at the character's feet, the contact point, or the defeated enemy; update and draw once per simulation tick. Reuse level palette ramps.
8. **Publish and inspect:** GitHub Pages deploy workflow generates PNG frame contact sheets and serves them at `/records/custom/<id>/contact.png`. The interactive lab at `/effects.html` previews all 4 current originals with palette switching.

## Commands

```sh
node tools/list.mjs custom
node tools/new.mjs custom/your-effect
node tools/render.mjs custom/your-effect --all --zoom 3
node tools/check.mjs custom/your-effect
npm run fx:preview
npm run check
```

## Current original effects

- `custom/dash-wake`: white release slash → two displaced shock crescents → coherent horizontal filaments → dim glass chips.
- `custom/jump-bloom`: brief foot flash → elliptical floor rings → upward shards and brief motes → clean decay.
- `custom/landing-crown`: compression flash → back/front ground waves → rock fragments and translucent dust → settling light.
- `custom/soul-shatter`: 2-frame fracture → angular debris on seeded ballistic paths → tiny glints → fading energy.

These aren't merely effects in a gallery: `game.js` triggers them on real input/physics/combat events. The standard `pixelfx/fx/` originals remain untouched. New original effects go in `pixelfx/fx/custom/`.

## Performance and art review

- Native 480×270 frame. Avoid global per-pixel filters or hundreds of simultaneous large `p.glow` operations.
- Keep each effect deterministic via `seed` and `rand` (not runtime random state). The upstream check enforces this.
- Prefer a few layered shapes with 1px accents to thousands of noise dots.
- A hit effect should not survive forever: the last frame of a one-shot should be empty.
- A deep edit is reviewed for **motion**, not just a still image.
