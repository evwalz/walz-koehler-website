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

/* The strip runs on the same grid as the columns above it: three tracks of (1200 - 2*34)/3
   with 34 between them. Each beat is centred on its own track, by the box its ink actually
   occupies — which for the fan is not its svg box, since that carries a margin for the axis
   it draws itself. */
const COL_W = (1200 - 2 * 34) / 3;
const colMid = (i: number) => i * (COL_W + 34) + COL_W / 2;
const FAN_BOX = { w: 450, inkL: 20, inkR: 433 };     // ink inside the 450-wide inset

/* The data block is centred on its track and then moved 16 left. Its ink is already balanced —
   the centre of mass measures 1.4px left of the column's centre and the two rows agree within
   0.6px — but the photo and page stacks overhang up and to the right, and those edges read as
   weight that a centre-of-mass calculation cannot see. Eva judged it against the column's own
   edges at 0 / -8 / -16 / -24 and picked -16, so the number is a measurement of the eye, not a
   fudge; it belongs to this arrangement of these glyphs and should be re-judged if they change. */
const KINDS_OPTICAL = -16;

/** Wide screens: the three beats as one drawing under the three columns. */
export function svcStripSVG(c: DrawingColors): string {
  const mid = 96;
  return (
    '<svg viewBox="0 0 1200 200" width="100%" height="200" aria-hidden="true" style="display:block">' +
    G(dataKindsSVG(c), colMid(0) - DATA_KINDS.w / 2 + KINDS_OPTICAL, mid - DATA_KINDS.h / 2, 1) +
    fanInset(c, "fan-svc-wide", 'x="' + f1(colMid(1) - (FAN_BOX.inkL + FAN_BOX.inkR) / 2) +
      '" y="10" width="' + FAN_BOX.w + '" height="172.8"') +
    loopSVG(c, colMid(2), mid, 54, 5) +
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

/* ---- Case study · "the right part, found from a photo" -------------------------------
   Three beats, in the same line-art register as the header and the services strip:
   a photographed part · the catalogue as a cloud of vectors with the query's nearest
   neighbours · the ranked answer. Drawn at build time, text-free apart from the rank
   numerals so the same picture serves /de/ too, and composed twice — side by side on a
   wide screen, stacked below 860px, exactly one rendered at any width. Each beat is drawn
   in its own local 340x240 box and placed with a transform, so composition is trivial. */

/** deterministic scatter — the picture must be byte-identical on every build */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Beat 1 · a part in the viewfinder: a roller guide riding its rail. */
function photoBeat(c: DrawingColors): string {
  const br = 30;
  const corner = (x: number, y: number, dx: number, dy: number) =>
    '<path d="M' + (x + dx * br) + " " + y + "H" + x + "V" + (y + dy * br) +
    '" fill="none" stroke="' + c.accent + '" stroke-width="2.6" stroke-linecap="round"/>';

  const cx = 132;
  const cy = 120;
  let bolts = "";
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    bolts += '<circle cx="' + f1(cx + Math.cos(a) * 36) + '" cy="' + f1(cy + Math.sin(a) * 36) +
      '" r="4.6" fill="#FFFFFF" stroke="' + c.ink + '" stroke-width="1.2"/>';
  }

  return (
    corner(8, 8, 1, 1) + corner(332, 8, -1, 1) + corner(8, 232, 1, -1) + corner(332, 232, -1, -1) +
    // the guide rail the roller runs on
    '<path d="M232 26V214M252 26V214" stroke="' + c.ink + '" stroke-width="1.6" fill="none"/>' +
    '<path d="M222 26h40M222 214h40" stroke="' + c.ink + '" stroke-width="1.6" fill="none"/>' +
    // arm from the wheel to the rail
    '<rect x="186" y="106" width="46" height="28" rx="6" fill="#FFFFFF" stroke="' + c.ink + '" stroke-width="1.5"/>' +
    // the wheel
    '<circle cx="' + cx + '" cy="' + cy + '" r="58" fill="#FFFFFF" stroke="' + c.ink + '" stroke-width="2.2"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="48" fill="none" stroke="' + c.ink + '" stroke-width="1.2"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="20" fill="none" stroke="' + c.ink + '" stroke-width="1.6"/>' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="' + c.accent + '"/>' +
    bolts +
    // a glint, so it reads as a photograph of a thing rather than a diagram
    '<path d="M' + (cx - 41) + " " + (cy - 27) + "A48 48 0 0 1 " + (cx - 13) + " " + (cy - 46) +
    '" fill="none" stroke="' + c.accent + '" stroke-width="2.4" stroke-linecap="round"/>'
  );
}

/** Beat 2 · the catalogue as vectors: the query lands in the cloud, its neighbours light up. */
function vectorBeat(c: DrawingColors): string {
  const qx = 150;
  const qy = 122;
  const rnd = lcg(20260923);
  const pts: Point[] = [];
  for (let i = 0; i < 52; i++) {
    const x = 26 + rnd() * 288;
    const y = 26 + rnd() * 188;
    if (Math.hypot(x - qx, y - qy) < 16) continue;
    pts.push([x, y]);
  }
  const near = [...pts].sort((a, b) => Math.hypot(a[0] - qx, a[1] - qy) - Math.hypot(b[0] - qx, b[1] - qy)).slice(0, 3);
  const isNear = (p: Point) => near.some((n) => n[0] === p[0] && n[1] === p[1]);

  const far = pts.filter((p) => !isNear(p))
    .map((p) => '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="3.2" fill="' + c.muted + '" fill-opacity="0.5"/>').join("");
  const links = near.map((p) =>
    '<line x1="' + qx + '" y1="' + qy + '" x2="' + f1(p[0]) + '" y2="' + f1(p[1]) +
    '" stroke="' + c.accent + '" stroke-width="1.3" stroke-dasharray="2 4" stroke-linecap="round"/>').join("");
  const hits = near.map((p) =>
    '<circle cx="' + f1(p[0]) + '" cy="' + f1(p[1]) + '" r="5.4" fill="' + c.accent + '" stroke="#FFFFFF" stroke-width="1.2"/>').join("");
  const reach = f1(Math.max(...near.map((p) => Math.hypot(p[0] - qx, p[1] - qy))) + 16);

  return (
    far +
    '<circle cx="' + qx + '" cy="' + qy + '" r="' + reach + '" fill="none" stroke="' + c.accent +
    '" stroke-width="1.4" stroke-dasharray="5 6" opacity="0.85"/>' +
    links + hits +
    '<path d="M' + (qx - 20) + " " + qy + "h12M" + (qx + 8) + " " + qy + "h12M" + qx + " " + (qy - 20) + "v12M" + qx + " " + (qy + 8) +
    'v12" stroke="' + c.ink + '" stroke-width="1.5" stroke-linecap="round"/>' +
    '<circle cx="' + qx + '" cy="' + qy + '" r="6.5" fill="' + c.ink + '"/>'
  );
}

/** Beat 3 · the answer: candidates ranked, the first one carried by the accent. */
function rankBeat(c: DrawingColors): string {
  const glyph = (i: number, x: number, y: number): string => {
    if (i === 0)
      return '<circle cx="' + (x + 20) + '" cy="' + (y + 20) + '" r="13" fill="none" stroke="' + c.ink + '" stroke-width="1.6"/>' +
        '<circle cx="' + (x + 20) + '" cy="' + (y + 20) + '" r="4.5" fill="' + c.accent + '"/>';
    if (i === 1)
      return '<path d="M' + (x + 9) + " " + (y + 28) + "v-13h11v-6h11v19z" + '" fill="none" stroke="' + c.muted + '" stroke-width="1.5" stroke-linejoin="round"/>';
    return '<circle cx="' + (x + 20) + '" cy="' + (y + 16) + '" r="7.5" fill="none" stroke="' + c.muted + '" stroke-width="1.5"/>' +
      '<path d="M' + (x + 20) + " " + (y + 24) + 'v8" stroke="' + c.muted + '" stroke-width="1.5" stroke-linecap="round"/>';
  };

  let out = "";
  const barW = [[152, 104], [128, 86], [116, 74]];
  for (let i = 0; i < 3; i++) {
    const y = 10 + i * 78;
    const first = i === 0;
    out +=
      '<rect x="10" y="' + y + '" width="320" height="64" rx="12" fill="#FFFFFF" stroke="' +
      (first ? c.accent : c.contour) + '" stroke-width="' + (first ? 2 : 1.2) + '"/>' +
      '<rect x="24" y="' + (y + 12) + '" width="40" height="40" rx="9" fill="none" stroke="' + c.contour + '" stroke-width="1.2"/>' +
      glyph(i, 24, y + 12) +
      '<rect x="80" y="' + (y + 17) + '" width="' + barW[i][0] + '" height="9" rx="4.5" fill="' + (first ? c.accent : c.contour) + '" fill-opacity="' + (first ? 1 : 0.85) + '"/>' +
      '<rect x="80" y="' + (y + 36) + '" width="' + barW[i][1] + '" height="7" rx="3.5" fill="' + c.contour + '" fill-opacity="0.6"/>' +
      '<circle cx="303" cy="' + (y + 32) + '" r="13" fill="' + (first ? c.accent : "none") + '" stroke="' + (first ? c.accent : c.contour) + '" stroke-width="1.4"/>' +
      '<text x="303" y="' + (y + 37) + '" text-anchor="middle" font-family="DM Mono,monospace" font-size="14" fill="' +
      (first ? "#FFFFFF" : c.muted) + '">' + (i + 1) + "</text>";
  }
  return out;
}

/** the connector between two beats: a dashed run with a solid arrowhead */
function beatArrow(c: DrawingColors, x: number, y: number, len: number, vertical: boolean): string {
  const x2 = vertical ? x : x + len;
  const y2 = vertical ? y + len : y;
  const head = vertical
    ? "M" + (x - 6) + " " + (y2 - 9) + "L" + x + " " + y2 + "L" + (x + 6) + " " + (y2 - 9) + "Z"
    : "M" + (x2 - 9) + " " + (y - 6) + "L" + x2 + " " + y + "L" + (x2 - 9) + " " + (y + 6) + "Z";
  return (
    '<line x1="' + x + '" y1="' + y + '" x2="' + (vertical ? x : x2 - 8) + '" y2="' + (vertical ? y2 - 8 : y) +
    '" stroke="' + c.accent + '" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round"/>' +
    '<path d="' + head + '" fill="' + c.accent + '"/>'
  );
}

function place(inner: string, x: number, y: number): string {
  return '<g transform="translate(' + x + " " + y + ')">' + inner + "</g>";
}

/** Wide screens: the three beats side by side. */
export function partSearchStripSVG(c: DrawingColors): string {
  return (
    '<svg viewBox="0 0 1200 260" width="100%" aria-hidden="true" style="display:block">' +
    place(photoBeat(c), 0, 10) +
    beatArrow(c, 352, 130, 56, false) +
    place(vectorBeat(c), 430, 10) +
    beatArrow(c, 792, 130, 56, false) +
    place(rankBeat(c), 860, 10) +
    "</svg>"
  );
}

/** Below 860px: the same three beats stacked, at column width. */
export function partSearchStackSVG(c: DrawingColors): string {
  return (
    '<svg viewBox="0 0 340 800" width="100%" aria-hidden="true" style="display:block">' +
    place(photoBeat(c), 0, 0) +
    beatArrow(c, 170, 252, 44, true) +
    place(vectorBeat(c), 0, 300) +
    beatArrow(c, 170, 552, 44, true) +
    place(rankBeat(c), 0, 600) +
    "</svg>"
  );
}
