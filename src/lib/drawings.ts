// Ported from docs/mockups/website-b3.html's inline <script> (lossFieldSVG, evaFanSVG).
// Runs at build time (imported from .astro frontmatter) instead of in the browser;
// same deterministic math, same markup shape, so the picture is byte-identical.

export interface DrawingColors {
  accent: string;
  ink: string;
  muted: string;
  contour: string;
}

function f1(n: number): number {
  return Math.round(n * 10) / 10;
}

type Point = [number, number];

/**
 * B3 · the header lines are the contour lines of a loss landscape; the dotted path is
 * gradient descent with momentum — how a model learns, step by step, downhill
 * (perpendicular to the contours).
 */
export function lossFieldSVG(c: DrawingColors): string {
  const W = 1200;
  const H = 560;
  const n = 120;
  const m = 56;
  const dx = W / n;
  const dy = H / m;

  const wells: [number, number, number, number][] = [
    [0.8, 0.64, -1.0, 165],
    [0.56, 0.3, -0.42, 105],
    [0.7, 0.26, 0.38, 115],
    [0.97, 0.18, -0.28, 95],
    [0.4, 0.78, -0.3, 120],
    [0.3, 0.3, 0.25, 140],
  ];

  function L(x: number, y: number): number {
    let s = (0.9 * ((x - W * 0.8) * (x - W * 0.8) + (y - H * 0.62) * (y - H * 0.62))) / (W * W * 0.35);
    for (const w of wells) {
      const ax = x - W * w[0];
      const ay = y - H * w[1];
      s += w[2] * Math.exp(-(ax * ax + ay * ay) / (2 * w[3] * w[3]));
    }
    return s;
  }

  const g: number[][] = [];
  for (let j = 0; j <= m; j++) {
    g.push([]);
    for (let i = 0; i <= n; i++) g[j].push(L(i * dx, j * dy));
  }

  let lo = Infinity;
  let hi = -Infinity;
  g.forEach((r) => r.forEach((v) => { if (v < lo) lo = v; if (v > hi) hi = v; }));

  const K = 20;
  const levels: number[] = [];
  for (let i = 1; i < K; i++) levels.push(lo + (hi - lo) * Math.pow(i / K, 1.35));

  function it(p: number, q: number, lv: number): number {
    return (lv - p) / (q - p);
  }

  function seg(lv: number): string {
    let d = "";
    for (let j = 0; j < m; j++) {
      for (let i = 0; i < n; i++) {
        const a = g[j][i];
        const b = g[j][i + 1];
        const cc = g[j + 1][i + 1];
        const e = g[j + 1][i];
        const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (cc > lv ? 2 : 0) | (e > lv ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const x = i * dx;
        const y = j * dy;
        const top: Point = [x + dx * it(a, b, lv), y];
        const rt: Point = [x + dx, y + dy * it(b, cc, lv)];
        const bt: Point = [x + dx * it(e, cc, lv), y + dy];
        const lf: Point = [x, y + dy * it(a, e, lv)];
        const S: Record<number, Point[][]> = {
          1: [[lf, bt]],
          2: [[bt, rt]],
          3: [[lf, rt]],
          4: [[top, rt]],
          5: [[lf, top], [bt, rt]],
          6: [[top, bt]],
          7: [[lf, top]],
          8: [[lf, top]],
          9: [[top, bt]],
          10: [[top, rt], [lf, bt]],
          11: [[top, rt]],
          12: [[lf, rt]],
          13: [[bt, rt]],
          14: [[lf, bt]],
        };
        for (const sg of S[idx]) {
          d += "M" + f1(sg[0][0]) + " " + f1(sg[0][1]) + "L" + f1(sg[1][0]) + " " + f1(sg[1][1]);
        }
      }
    }
    return d;
  }

  let out = "";
  levels.forEach((lv) => {
    out += '<path d="' + seg(lv) + '" fill="none" stroke="' + c.contour + '" stroke-width="1"/>';
  });

  // gradient descent with momentum from the top edge
  let px = W * 0.6;
  let py = H * 0.04;
  let vx = 0;
  let vy = 0;
  const eta = 5200;
  const beta = 0.82;
  const h = 1;
  const pts: Point[] = [[px, py]];
  for (let t = 0; t < 600; t++) {
    const gx = (L(px + h, py) - L(px - h, py)) / (2 * h);
    const gy = (L(px, py + h) - L(px, py - h)) / (2 * h);
    vx = beta * vx - eta * gx;
    vy = beta * vy - eta * gy;
    const sp = Math.sqrt(vx * vx + vy * vy);
    if (sp > 16) {
      vx *= 16 / sp;
      vy *= 16 / sp;
    }
    px += vx;
    py += vy;
    pts.push([px, py]);
    if (sp < 0.25 && t > 40) break;
  }

  const path =
    '<polyline points="' +
    pts.map((p) => f1(p[0]) + "," + f1(p[1])).join(" ") +
    '" fill="none" stroke="' +
    c.accent +
    '" stroke-width="1.6" stroke-dasharray="1 5" stroke-linecap="round"/>';

  let dots = "";
  for (let i = 0; i < pts.length; i += 4) {
    dots += '<circle cx="' + f1(pts[i][0]) + '" cy="' + f1(pts[i][1]) + '" r="3.4" fill="' + c.accent + '"/>';
  }
  const e = pts[pts.length - 1];
  dots +=
    '<circle cx="' + f1(e[0]) + '" cy="' + f1(e[1]) + '" r="10" fill="none" stroke="' + c.accent + '" stroke-width="2"/>' +
    '<circle cx="' + f1(e[0]) + '" cy="' + f1(e[1]) + '" r="4.5" fill="' + c.accent + '"/>';

  return '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + out + path + dots + "</svg>";
}

/**
 * B2 · Eva's title plot, redrawn in the site's one colour: observed past, "now", a
 * forecast whose nested quantile bands widen and fade with lead time. Shape traced from
 * her PDF; data illustrative.
 *
 * Currently unrendered: the "What you get back." section it lived in was dropped because
 * the surrounding copy no longer earned it. Kept here so the drawing can come back.
 * Its markup is at 33f4dfe: `git show 33f4dfe:src/components/Range.astro`. Note that
 * component passed `fan-${lang}-wide` / `-narrow` as class names while the stylesheet
 * matched `.fan-wide` / `.fan-narrow`, so both variants rendered at once — fix that
 * before reusing it.
 */
export function evaFanSVG(c: DrawingColors, lab: [string, string, string], gid: string, aria: string, fs: number): string {
  const obsY = [486, 522, 508, 450, 494, 500, 458, 465, 436];
  const fcY = [457, 443, 421, 436, 378, 392, 385, 357, 400, 372, 400, 343, 357];

  function X(xh: number): number {
    return f1(50 + ((xh - 107) * 920) / 1420);
  }
  function Y(yh: number): number {
    return f1(30 + ((yh - 90) * 330) / 560);
  }

  const obs: Point[] = obsY.map((y, i) => [159 + 62 * i, y]);
  const fc: Point[] = fcY.map((y, j) => [717 + 62 * j, y]);
  const now = obs[8];

  const fr = [1, 0.8, 0.6, 0.42, 0.24];
  const op = [0.22, 0.32, 0.45, 0.62, 0.85];
  let bands = "";
  fr.forEach((k, b) => {
    const up: Point[] = [now];
    const dn: Point[] = [now];
    fc.forEach((p, h) => {
      const w = (12 + 158 * Math.sqrt(h / 12)) * k;
      up.push([p[0], p[1] - w * 1.05]);
      dn.push([p[0], p[1] + w * 0.95]);
    });
    const pts = up.concat(dn.reverse()).map((p) => X(p[0]) + "," + Y(p[1])).join(" ");
    bands += '<polygon points="' + pts + '" fill="url(#' + gid + ')" fill-opacity="' + op[b] + '"/>';
  });

  function pl(a: Point[]): string {
    return a.map((p) => X(p[0]) + "," + Y(p[1])).join(" ");
  }

  const dots =
    obs.map((p) => '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="5" fill="' + c.accent + '" stroke="' + c.ink + '" stroke-width="1"/>').join("") +
    fc.map((p) => '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="4.6" fill="#FFFFFF" stroke="' + c.ink + '" stroke-width="1.1"/>').join("");

  const ax =
    '<path d="M' + X(107) + " " + Y(650) + "V" + Y(100) + "M" + X(107) + " " + Y(650) + "H" + X(1515) + '" stroke="' + c.ink + '" stroke-width="1.3" fill="none"/>' +
    '<path d="M' + (X(107) - 5) + " " + (Y(100) + 9) + "L" + X(107) + " " + Y(100) + "L" + (+X(107) + 5) + " " + (Y(100) + 9) + 'Z" fill="' + c.ink + '"/>' +
    '<path d="M' + (X(1515) - 9) + " " + (Y(650) - 5) + "L" + X(1515) + " " + Y(650) + "L" + (X(1515) - 9) + " " + (+Y(650) + 5) + 'Z" fill="' + c.ink + '"/>';

  return (
    '<svg viewBox="0 0 1000 ' + (372 + fs) + '" role="img" aria-label="' + aria + '" font-family="DM Mono,monospace" font-size="' + fs + '" fill="' + c.muted + '">' +
    '<defs><linearGradient id="' + gid + '" gradientUnits="userSpaceOnUse" x1="' + X(655) + '" y1="0" x2="' + X(1461) + '" y2="0"><stop offset="0" stop-color="#27411A"/><stop offset=".45" stop-color="#4E7A32"/><stop offset="1" stop-color="#C9D8B4" stop-opacity=".55"/></linearGradient></defs>' +
    ax +
    bands +
    '<line x1="' + X(655) + '" x2="' + X(655) + '" y1="' + Y(112) + '" y2="' + Y(650) + '" stroke="' + c.ink + '" stroke-dasharray="4 4"/>' +
    '<polyline points="' + pl(obs) + '" fill="none" stroke="' + c.ink + '" stroke-width="1.2"/><polyline points="' + pl([now].concat(fc)) + '" fill="none" stroke="' + c.ink + '" stroke-width="1.2"/>' +
    dots +
    '<text x="' + X(655) + '" y="' + (+Y(650) + fs + 6) + '" text-anchor="middle" fill="' + c.ink + '">' + lab[1] + '</text><text x="' + X(380) + '" y="' + (+Y(650) + fs + 6) + '" text-anchor="middle">' + lab[0] + '</text><text x="' + X(1100) + '" y="' + (+Y(650) + fs + 6) + '" text-anchor="middle">' + lab[2] + "</text></svg>"
  );
}

/* ---- "What we do": one drawing in three beats ----------------------------------------
   The kinds of data you have · a model on it (the fan, unchanged) · it running, and going on
   running. Wide screens get the three under the three columns; below 860px the columns stack
   and each item carries the same drawing at its own size — the fan fills its column, the two
   marks sit at the size they are drawn.

   Decorative: the headings next to them say the same thing in words, so they are aria-hidden
   rather than carrying an English label onto /de/.

   Earlier passes are in git if one is ever wanted back: a histogram and a horizontal pipeline
   at 5dc8e3b, three abstract tiles and a vertical pipeline at ea77661. */

/** The page ground (--ground), for a mark knocked out of a filled glyph. */
const GROUND = "#F3F5F0";

/** Beat 1 · a stack of photos — image-shaped data: weather, satellite, a scan. 92 × 48. */
function photosGlyph(c: DrawingColors): string {
  const w = 76, h = 38, sw = 2.4, fy = 10;
  let s = "";
  for (const [dx, dy] of [[16, 0], [8, 5]]) {
    s += '<rect x="' + dx + '" y="' + dy + '" width="' + w + '" height="' + h + '" rx="3" fill="' + c.accent + '" stroke="' + GROUND + '" stroke-width="' + sw + '"/>';
  }
  return (
    s +
    '<rect x="0" y="' + fy + '" width="' + w + '" height="' + h + '" rx="3" fill="' + c.accent + '" stroke="' + GROUND + '" stroke-width="' + sw + '"/>' +
    '<circle cx="16" cy="' + (fy + 10) + '" r="4.2" fill="' + GROUND + '"/>' +
    '<polyline points="5,' + (fy + 31) + " 22," + (fy + 14) + " 33," + (fy + 22) + " 48," + (fy + 8) + " 71," + (fy + 31) +
    '" fill="none" stroke="' + GROUND + '" stroke-width="' + sw + '" stroke-linejoin="round" stroke-linecap="round"/>'
  );
}

/** Beat 1 · the drum everyone draws for stored records. 52 × 48. */
function drumGlyph(c: DrawingColors): string {
  const cx = 26, rx = 26, ry = 8, top = 9, bot = 39, sw = 2.4;
  let s = '<path d="M' + (cx - rx) + " " + top + "V" + bot + "A" + rx + " " + ry + " 0 0 0 " + (cx + rx) + " " + bot + "V" + top +
    '" fill="' + c.accent + '" stroke="' + GROUND + '" stroke-width="' + sw + '"/>';
  for (const d of [19, 29]) {
    s += '<path d="M' + (cx - rx) + " " + d + "A" + rx + " " + ry + " 0 0 0 " + (cx + rx) + " " + d +
      '" fill="none" stroke="' + GROUND + '" stroke-width="' + sw + '" stroke-opacity="0.75"/>';
  }
  return s + '<ellipse cx="' + cx + '" cy="' + top + '" rx="' + rx + '" ry="' + ry + '" fill="' + c.accent + '" stroke="' + GROUND + '" stroke-width="' + sw + '"/>';
}

/** Beat 1 · a stack of pages — the text a language model reads. 54 × 48. */
function pagesGlyph(c: DrawingColors): string {
  const w = 40, h = 38, sw = 2.4, fy = 10;
  let s = "";
  for (const [dx, dy] of [[14, 0], [7, 5]]) {
    s += '<rect x="' + dx + '" y="' + dy + '" width="' + w + '" height="' + h + '" rx="2.5" fill="' + c.accent + '" stroke="' + GROUND + '" stroke-width="' + sw + '"/>';
  }
  s += '<rect x="0" y="' + fy + '" width="' + w + '" height="' + h + '" rx="2.5" fill="' + c.accent + '" stroke="' + GROUND + '" stroke-width="' + sw + '"/>';
  [1, 0.82, 0.93, 0.6].forEach((k, i) => {
    const y = fy + 9 + i * 7;
    s += '<line x1="7" y1="' + y + '" x2="' + f1(7 + 26 * k) + '" y2="' + y + '" stroke="' + GROUND + '" stroke-width="' + sw +
      '" stroke-opacity="' + (i === 0 ? "0.9" : "0.55") + '" stroke-linecap="round"/>';
  });
  return s;
}

const G = (g: string, x: number, y: number, s: number) => '<g transform="translate(' + f1(x) + " " + f1(y) + ") scale(" + s + ')">' + g + "</g>";

/**
 * Beat 1 — what the work runs on, and that it is not one shape of data: pictures over a
 * database and a pile of text. Drawn at the origin; the block is DATA_KINDS wide and tall.
 */
const DATA_KINDS = { w: 168, h: 151 };
function dataKindsSVG(c: DrawingColors): string {
  const s = 1.3, gap = 30, rowH = 48 * s;
  const row2 = rowH + 26;
  const rowW = 52 * s + gap + 54 * s;
  return (
    G(photosGlyph(c), (rowW - 92 * s) / 2, 0, s) +
    G(drumGlyph(c), 0, row2, s) +
    G(pagesGlyph(c), 52 * s + gap, row2, s)
  );
}

/**
 * Beat 3 — production is not a finish line. Three stops on a ring that keeps turning, one of
 * them filled: the model is live, and somebody is still running it.
 */
function loopSVG(c: DrawingColors, cx: number, cy: number, r: number, sw: number): string {
  const at = (a: number): [number, number] => [f1(cx + r * Math.cos(a)), f1(cy + r * Math.sin(a))];
  const gap = 0.42;                                   // the ring stops just short of closing
  const [sx, sy] = at(-Math.PI / 2 + gap);
  const [ex, ey] = at(-Math.PI / 2 - gap);
  const tan = -Math.PI / 2 - gap + Math.PI / 2;       // tangent at the head, pointing round
  const L = r * 0.24;
  const barb = (d: number) => f1(ex + L * Math.cos(tan + d)) + " " + f1(ey + L * Math.sin(tan + d));
  return (
    '<path d="M' + sx + " " + sy + "A" + r + " " + r + " 0 1 1 " + ex + " " + ey + '" fill="none" stroke="' + c.accent +
    '" stroke-width="' + sw + '" stroke-linecap="round"/>' +
    '<path d="M' + barb(-2.5) + "L" + ex + " " + ey + "L" + barb(2.5) + '" fill="none" stroke="' + c.accent +
    '" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"/>' +
    [Math.PI / 6, (Math.PI * 5) / 6, -Math.PI / 2]
      .map((a, i) => {
        const [x, y] = at(a);
        return '<circle cx="' + x + '" cy="' + y + '" r="' + f1(r * 0.17) + '" fill="' + (i === 0 ? c.accent : GROUND) +
          '" stroke="' + c.accent + '" stroke-width="' + f1(sw * 0.8) + '"/>';
      })
      .join("")
  );
}

/** evaFanSVG placed inside another drawing: no labels, no role, positioned and scaled. */
function fanInset(c: DrawingColors, gid: string, attrs: string): string {
  return evaFanSVG(c, ["", "", ""], gid, "", 12)
    .replace(' role="img" aria-label=""', "")
    .replace("<svg ", "<svg " + attrs + " ");
}

/** Wide screens: the three beats as one drawing under the three columns. */
export function svcStripSVG(c: DrawingColors): string {
  /* The columns are (1200 - 2*34) / 3 = 377.3 wide, starting at 0, 411.3 and 822.7. The fan
     holds the middle; the block of marks and the ring stand at the strip's own left and right
     edges, mirrored about its centre, which puts the two widest empty spans either side of
     the chart. */
  const right = 1200 - DATA_KINDS.w / 2;
  return (
    '<svg viewBox="0 0 1200 200" width="100%" height="200" aria-hidden="true" style="display:block">' +
    G(dataKindsSVG(c), 0, 96 - DATA_KINDS.h / 2, 1) +
    fanInset(c, "fan-svc-wide", 'x="389" y="10" width="450" height="172.8"') +
    loopSVG(c, right, 96, 54, 5) +
    "</svg>"
  );
}

/** Below 860px the columns stack, so each item carries its own beat above its heading. */
export function svcMarkSVGs(c: DrawingColors): [string, string, string] {
  const kinds =
    '<svg viewBox="0 0 ' + DATA_KINDS.w + " " + DATA_KINDS.h + '" width="' + DATA_KINDS.w + '" height="' + DATA_KINDS.h +
    '" aria-hidden="true" style="display:block">' + dataKindsSVG(c) + "</svg>";
  const loop =
    '<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true" style="display:block">' +
    loopSVG(c, 60, 60, 46, 4.4) + "</svg>";
  return [kinds, fanInset(c, "fan-svc-narrow", 'width="100%" aria-hidden="true" style="display:block"'), loop];
}

export const B3_COLORS: DrawingColors = { accent: "#43682B", ink: "#18200F", muted: "#58624F", contour: "#A9B79B" };
