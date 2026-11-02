// SHARD RUNNER ORIGINAL — Cleave contact, v1
// Art direction: an off-axis white blade collision opens a thin glass fracture,
// a tilted shock arc tears outward, and weighted luminous splinters settle in pale vapour.
// Built at 1px scale for PixelFX's 24×38 actor. No sampled textures or screen-wide flashes.
import { fit, clamp, ease, smooth, rand, sparkle, WHITE, READY, TAU } from "../../core/index.js";

export const meta = {
  name: "Cleave contact",
  desc: "A one-frame sword glint fractures into a diagonal blade scar, two offset pressure arcs and slow-falling crystal chips.",
  tags: ["custom", "combat", "slash", "impact", "directional", "one-shot"],
  size: [160, 160], origin: [80, 80],
  duration: .76, loop: false, fps: 30, bg: "ground",
  options: {
    palette: ["#111e38", "#263960", "#335e88", "#4e93b9", "#81cfe0", "#c4f8fa", "#ffffff"],
    seed: 41, force: 1
  }
};

// The host game reuses these timings for a held preparation pose and contact hit-stop.
// Negative time is the wind-up before effect time zero.
export const act = {
  poses: [
    [-.075, { ...READY, crouch: 8, lean: -6, fx: -9, fy: -29, bx: 9, by: -17, weapon: "sword", sa: -2.2 }],
    [0, { ...READY, crouch: 5, lean: 9, fx: 20, fy: -19, bx: -8, by: -20, weapon: "sword", sa: .35, ghost: 1 }, "snap"],
    [.19, { ...READY, crouch: 6, lean: 5, fx: 15, fy: -19, bx: -6, by: -21, weapon: "sword", sa: .5 }],
    [.51, { ...READY, weapon: "sword", sa: -.65 }]
  ],
  hits: [{ t: 0, stop: .065, shake: .16, amp: 2.0, push: 2.0 }]
};
const D = meta.duration;

export function draw(p, t, o) {
  if (t < 0 || t >= D) return;
  const C = fit(o.palette, 7), f = clamp(o.force ?? 1, .65, 1.5);

  // First two animation frames are an intense, but very small, focal slash.
  if (t < .085) {
    const a = 1 - smooth(.008, .085, t);
    const core = t < .036;
    p.line(-16, 17, 18, -23, core ? WHITE : C[5], a);
    p.line(-13, 18, 18, -18, C[4], a * .75);
    p.line(-19, 11, 2, -15, C[3], a * .52);
    p.glowLine(-14, 14, 16, -20, 8, C[5], .36 * a);
    if (t < .044) {
      p.circle(1, -4, 3.2, WHITE, 1 - t / .052);
      p.glow(1, -4, 17, C[5], .48 * (1 - t / .044));
      p.light(1, -4, WHITE, .9);
    }
  }

  // Glancing "broken lens" pressure wave: offset centers make it directional.
  for (let j = 0; j < 2; j++) {
    const delay = .023 + j * .048;
    const age = t - delay, life = .23 + j * .12;
    if (age < 0 || age >= life) continue;
    const u = age / life, e = ease.outQuart(clamp(u));
    const radius = 8 + (j ? 25 : 32) * e * f;
    const width = (j ? 2.4 : 3.6) * (1 - u) + .55;
    const cx = (j ? -4 : 2) + (j ? -7 : 10) * e;
    const cy = -4 + (j ? 3 : -3) * e;
    // An open near and far crescent, never a complete concentric sticker.
    p.arc(cx, cy, radius, width, -.95, 1.23, j ? C[3] : C[5], (1 - u) * (j ? .66 : .92));
    p.arc(cx, cy, radius * .90, Math.max(.6, width * .55), 2.10, 3.57,
      j ? C[2] : C[4], (1 - u) * .57);
    if (u < .62) p.glow(cx + radius * .55, cy, 8, C[4], .13 * (1 - u));
  }

  // Shattered impact filaments. Curves are deterministic; each strand has
  // its own delay and width while staying aligned with the attack's diagonal.
  for (let i = 0; i < 11; i++) {
    const delay = .018 + rand(i, o.seed, 19) * .065;
    const age = t - delay, life = .21 + rand(i, o.seed, 23) * .22;
    if (age < 0 || age >= life) continue;
    const u = age / life, side = i % 2 ? 1 : -1;
    const x0 = -9 + (i - 5) * 2.0, y0 = 7 - i * 1.9;
    const len = (15 + rand(i, o.seed, 37) * 30) * f;
    const dx = side * (len * ease.outQuart(u)), dy = -12 * u + u * u * 15;
    const c = u < .16 && i % 3 === 0 ? C[6] : i % 3 === 1 ? C[3] : C[4];
    const a = (1 - smooth(.26, 1, u)) * .84;
    p.line(x0 + dx * .36, y0 + dy - 5, x0 + dx, y0 + dy, c, a);
    if (i % 4 === 0 && u < .45) p.light(x0 + dx, y0 + dy, C[5], .35 * (1 - u));
  }

  // Heavy fractured facets travel on ballistic arcs, slow enough to read.
  for (let i = 0; i < 14; i++) {
    const delay = .025 + rand(i, o.seed, 47) * .09;
    const age = t - delay, life = .36 + rand(i, o.seed, 49) * .28;
    if (age < 0 || age >= life) continue;
    const u = age / life, angle = -.7 + rand(i, o.seed, 55) * 3.2;
    const speed = (29 + rand(i, o.seed, 57) * 53) * f;
    const x = Math.cos(angle) * speed * age;
    const y = -5 + Math.sin(angle) * speed * age + 104 * age * age;
    const fade = 1 - smooth(.53, 1, u);
    const size = (i % 4 === 0 ? 3.2 : 1.3) * (1 - .33 * u);
    const r = angle + age * (i % 2 ? -7 : 7);
    const vx = Math.cos(r), vy = Math.sin(r);
    if (i % 3 === 0) {
      p.poly([[x + vx * size * 1.4, y + vy * size * 1.4],
        [x - vy * size * .7, y + vx * size * .7],
        [x - vx * size, y - vy * size],
        [x + vy * size * .5, y - vx * size * .5]], i % 2 ? C[4] : C[3], fade);
      p.line(x, y, x + vx * size, y + vy * size, C[5], fade * .8);
    } else p.line(x - size, y, x + size, y + .5, i % 2 ? C[5] : C[4], fade * .86);
    if (i % 5 === 0 && u < .38) p.glow(x, y, 5, C[4], .12 * (1 - u));
  }

  // Soft coloured vapour gives volume without checkerboard or color wash.
  for (let i = 0; i < 7; i++) {
    const delay = .10 + rand(i, o.seed, 65) * .09;
    const age = t - delay, life = .38 + rand(i, o.seed, 67) * .16;
    if (age < 0 || age >= life) continue;
    const u = age / life, side = i % 2 ? 1 : -1;
    const x = side * (3 + age * (19 + rand(i, o.seed, 69) * 15));
    const y = -3 - age * (10 + rand(i, o.seed, 71) * 9);
    const radius = (2.5 + rand(i, o.seed, 73) * 3) * (1 + u * .7);
    p.disc(x, y, radius, C[2], .16 * (1 - u) * (1 - u));
  }

  for (let i = 0; i < 3; i++) {
    const age = t - (.20 + i * .095), life = .21;
    if (age >= 0 && age < life) {
      const x = (rand(i, o.seed, 83) - .5) * 56;
      const y = -6 + (rand(i, o.seed, 89) - .5) * 35;
      sparkle(p, x, y, (2.6 + i * .5) * (1 - age / life), C[5], C[3], .32 * (1 - age / life));
    }
  }
}