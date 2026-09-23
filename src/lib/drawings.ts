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
   Your data (the kinds of it) · a model on it (the fan, unchanged) · it reaching production.
   Wide screens get the three as one drawing under the three columns; below 860px the columns
   stack and each item carries its own.

   In the wide strip the two outer beats stand vertically — they take height instead of width,
   so the gaps either side of the fan are wide and the row breathes. In the stacked marks they
   run horizontally, where each has a column of its own to fill.

   Decorative: the headings next to them say the same thing in words, so they are aria-hidden
   rather than carrying an English label onto /de/. (The fan's miniature L-axis helper lived
   here until the histogram beat went; recover it at 5dc8e3b if a beat ever needs axes again.) */

/** A field of cells — satellite, weather, a scan. Darkness comes from two smooth bumps so it
 *  reads as a measurement, not noise; cells stay square whatever the box's aspect. */
function rasterTile(c: DrawingColors, x: number, y: number, w: number, h: number): string {
  const rows = 4;
  const cols = Math.max(3, Math.round((w / h) * rows));
  const cw = w / cols;
  const ch = h / rows;
  const pad = Math.min(1.5, cw * 0.16);
  let s = "";
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = i / (cols - 1);
      const v = j / (rows - 1);
      const b1 = Math.exp(-((u - 0.25) ** 2 + (v - 0.7) ** 2) / 0.18);
      const b2 = Math.exp(-((u - 0.8) ** 2 + (v - 0.25) ** 2) / 0.12);
      const op = (0.14 + 0.86 * Math.min(1, b1 + b2 * 0.9)).toFixed(2);
      s += '<rect x="' + f1(x + i * cw) + '" y="' + f1(y + j * ch) + '" width="' + f1(cw - pad) + '" height="' + f1(ch - pad) + '" fill="' + c.accent + '" fill-opacity="' + op + '"/>';
    }
  }
  return s;
}

/** Rows and columns — the everyday case: a header row, then three rows of three cells. */
function tableTile(c: DrawingColors, x: number, y: number, w: number, h: number): string {
  const rh = h * 0.158;
  const rg = h * 0.066;
  const cwf = [0.31, 0.345, 0.27];
  let s = '<rect x="' + f1(x) + '" y="' + f1(y + h * 0.13) + '" width="' + f1(w) + '" height="' + f1(rh) + '" fill="' + c.accent + '"/>';
  for (let r = 0; r < 3; r++) {
    let cx = x;
    for (const fw of cwf) {
      s += '<rect x="' + f1(cx) + '" y="' + f1(y + h * 0.395 + r * (rh + rg)) + '" width="' + f1(w * fw) + '" height="' + f1(rh) + '" fill="' + c.accent + '" fill-opacity="0.34"/>';
      cx += w * fw + w * 0.035;
    }
  }
  return s;
}

/** Text — what a language model reads. Five lines, the first set solid like a heading. */
function textTile(c: DrawingColors, x: number, y: number, w: number, h: number): string {
  const lh = h * 0.105;
  const lg = h * 0.118;
  return [1, 0.84, 0.95, 0.71, 0.51]
    .map((fw, i) =>
      '<rect x="' + f1(x) + '" y="' + f1(y + i * (lh + lg)) + '" width="' + f1(w * fw) + '" height="' + f1(lh) + '" rx="1.5" fill="' + c.accent + '" fill-opacity="' + (i === 0 ? "0.85" : "0.42") + '"/>'
    )
    .join("");
}

/**
 * Beat 1 — the kinds of data the work covers, side by side, because the offer is not tied to
 * one shape of data: a raster field, a table, lines of text. `x`/`y` are the first tile's top
 * left, `w`/`h` one tile, and `dir` whether the three run across or down.
 */
function dataKindsSVG(c: DrawingColors, x: number, y: number, w: number, h: number, dir: "row" | "col"): string {
  const g = dir === "row" ? w * 0.11 : h * 0.28;
  const dx = dir === "row" ? w + g : 0;
  const dy = dir === "row" ? 0 : h + g;
  return rasterTile(c, x, y, w, h) + tableTile(c, x + dx, y + dy, w, h) + textTile(c, x + 2 * dx, y + 2 * dy, w, h);
}

/** evaFanSVG placed inside another drawing: no labels, no role, positioned and scaled. */
function fanInset(c: DrawingColors, gid: string, attrs: string): string {
  return evaFanSVG(c, ["", "", ""], gid, "", 12)
    .replace(' role="img" aria-label=""', "")
    .replace("<svg ", "<svg " + attrs + " ");
}

/**
 * Beat 3 — the stops on the way to production: two still open, the last one shipped, and the
 * flow carrying on past it. Drawn along the segment (x0,y0)→(x1,y1), so the same figure runs
 * down the wide strip and across a stacked mark.
 */
function pipelineSVG(c: DrawingColors, x0: number, y0: number, x1: number, y1: number, r: number, sw: number): string {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const ring = (x: number, y: number) =>
    '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + r + '" fill="#F3F5F0" stroke="' + c.accent + '" stroke-width="' + f1(sw * 1.1) + '"/>';
  const ax = x1 + ux * (r + 3);
  const ay = y1 + uy * (r + 3);
  const tx = ax + ux * r * 2.4;
  const ty = ay + uy * r * 2.4;
  const b = r * 0.95;
  return (
    '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y1 + '" stroke="' + c.accent + '" stroke-width="' + sw + '"/>' +
    ring(x0, y0) +
    ring((x0 + x1) / 2, (y0 + y1) / 2) +
    '<circle cx="' + f1(x1) + '" cy="' + f1(y1) + '" r="' + r + '" fill="' + c.accent + '"/>' +
    '<path d="M' + f1(ax) + " " + f1(ay) + "L" + f1(tx) + " " + f1(ty) +
    "M" + f1(tx - ux * b + uy * b) + " " + f1(ty - uy * b - ux * b) +
    "L" + f1(tx) + " " + f1(ty) +
    "L" + f1(tx - ux * b - uy * b) + " " + f1(ty - uy * b + ux * b) +
    '" fill="none" stroke="' + c.accent + '" stroke-width="' + f1(sw * 1.1) + '" stroke-linecap="round" stroke-linejoin="round"/>'
  );
}

/** Wide screens: the three beats as one drawing under the three columns. */
export function svcStripSVG(c: DrawingColors): string {
  /* The columns are (1200 - 2*34) / 3 = 377.3 wide, starting at 0, 411.3 and 822.7. The fan
     holds the middle; the outer two are narrow verticals at the strip's own left and right
     edges, which puts the drawing's widest empty spans either side of the fan. */
  return (
    '<svg viewBox="0 0 1200 200" width="100%" height="200" aria-hidden="true" style="display:block">' +
    dataKindsSVG(c, 0, 12, 120, 48, "col") +
    fanInset(c, "fan-svc-wide", 'x="389" y="10" width="450" height="172.8"') +
    pipelineSVG(c, 1140, 16, 1140, 142, 10, 2.6) +
    "</svg>"
  );
}

/** Below 860px the columns stack, so each item carries its beat at column width. */
export function svcMarkSVGs(c: DrawingColors): [string, string, string] {
  const open = '<svg viewBox="0 0 340 92" width="100%" aria-hidden="true" style="display:block">';
  return [
    open + dataKindsSVG(c, 0, 8, 105, 76, "row") + "</svg>",
    fanInset(c, "fan-svc-narrow", 'width="100%" aria-hidden="true" style="display:block"'),
    open + pipelineSVG(c, 40, 48, 270, 48, 10, 3) + "</svg>",
  ];
}

export const B3_COLORS: DrawingColors = { accent: "#43682B", ink: "#18200F", muted: "#58624F", contour: "#A9B79B" };
