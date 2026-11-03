// Image to ASCII art: pure conversion steps on RGBA pixel arrays (no DOM).
// Pipeline: downscaled pixels → tone (luminance, levels, brightness/contrast) → ink per cell
// → optional edge boost → quantize to the character ramp (optionally dithered) → lines of text.

export type CharsetId = 'classic' | 'simple' | 'blocks' | 'braille' | 'cjk' | 'custom';
export type OutputMode = 'plain' | 'color';
export type Background = 'light' | 'dark';

export const CHARSET_IDS: CharsetId[] = ['classic', 'simple', 'blocks', 'braille', 'cjk', 'custom'];

/**
 * Characters of the ramp presets, roughly from least to most ink. The page measures each
 * glyph's ink coverage in the preview font and re-sorts them; this order is only the fallback.
 */
export const PRESET_CHARS: Record<'classic' | 'simple' | 'blocks' | 'cjk', string> = {
  // Paul Bourke's 70-level ramp.
  classic: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  simple: ' .:-=+*#%@',
  blocks: ' ░▒▓█',
  // Full-width: the ideographic space U+3000 keeps blank cells as wide as the ideographs.
  cjk: '　一二十三王日目田品晶轟',
};

export const DEFAULT_CUSTOM = ' .oO@';
export const MAX_CUSTOM_CHARS = 64;
export const BRAILLE_BLANK = '⠀';
export const WIDE_BLANK = '　';

/** Output width in half-width columns. A full-width character counts as two. */
export const MIN_COLUMNS = 20;
export const MAX_COLUMNS = 240;
/** Very tall pictures are narrowed so the art never exceeds this many lines. */
export const MAX_ROWS = 360;

export const WIDTH_PRESETS = [
  { id: 'phone', columns: 32 },
  { id: 'chat', columns: 80 },
  { id: 'poster', columns: 200 },
] as const;
export type WidthPresetId = (typeof WIDTH_PRESETS)[number]['id'];

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const unique = (chars: string[]) => Array.from(new Set(chars));

/* ---------- Geometry ---------- */

/**
 * How one character cell maps to pixels. `cellRatio` = cell height ÷ cell width as displayed:
 * a half-width monospace cell is about twice as tall as wide, a full-width CJK cell is square.
 * Braille packs 2 × 4 dots into one half-width cell, so each dot is a square pixel.
 */
export interface Geometry {
  wide: boolean;
  dotsX: number;
  dotsY: number;
  cellRatio: number;
}

export const NARROW: Geometry = { wide: false, dotsX: 1, dotsY: 1, cellRatio: 2 };
export const WIDE: Geometry = { wide: true, dotsX: 1, dotsY: 1, cellRatio: 1 };
export const BRAILLE: Geometry = { wide: false, dotsX: 2, dotsY: 4, cellRatio: 2 };

/** East Asian Wide / Fullwidth characters (CJK, kana, Hangul, full-width forms). */
export function isWideChar(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x33ff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xa000 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6) ||
    (cp >= 0x20000 && cp <= 0x3fffd)
  );
}

export function isBlank(ch: string): boolean {
  return ch === ' ' || ch === WIDE_BLANK || ch === BRAILLE_BLANK;
}

export interface CustomChars {
  chars: string[];
  wide: boolean;
  /** Full-width and half-width characters were mixed, so columns will not line up. */
  mixed: boolean;
}

/** Splits a custom set into unique characters (light to dark as typed) and decides its cell width. */
export function parseCustomChars(input: string): CustomChars {
  let chars = unique(Array.from(input).filter((ch) => ch >= ' ' && ch !== '\u007f')).slice(0, MAX_CUSTOM_CHARS);
  if (chars.length === 0) chars = Array.from(DEFAULT_CUSTOM);
  const solid = chars.filter((ch) => !isBlank(ch));
  const wideCount = solid.filter(isWideChar).length;
  const wide = wideCount > 0 && wideCount === solid.length;
  const mixed = wideCount > 0 && wideCount < solid.length;
  chars = unique(chars.map((ch) => (wide && ch === ' ' ? WIDE_BLANK : !wide && ch === WIDE_BLANK ? ' ' : ch)));
  return { chars, wide, mixed };
}

export interface CharsetSpec {
  /** Ramp characters, empty for braille. */
  chars: string[];
  geometry: Geometry;
  mixed: boolean;
}

export function charsetSpec(id: CharsetId, custom: string): CharsetSpec {
  if (id === 'braille') return { chars: [], geometry: BRAILLE, mixed: false };
  if (id === 'custom') {
    const c = parseCustomChars(custom);
    return { chars: c.chars, geometry: c.wide ? WIDE : NARROW, mixed: c.mixed };
  }
  return { chars: Array.from(PRESET_CHARS[id]), geometry: id === 'cjk' ? WIDE : NARROW, mixed: false };
}

export interface GridLayout {
  /** Characters per line. */
  cols: number;
  rows: number;
  /** Size of the pixel grid to sample the picture at. */
  pxW: number;
  pxH: number;
}

/** Characters per line and lines for a picture, keeping its proportions on screen. */
export function layoutGrid(imgW: number, imgH: number, columns: number, geo: Geometry, maxRows = MAX_ROWS): GridLayout {
  const c = Math.round(clamp(Number.isFinite(columns) ? columns : MIN_COLUMNS, MIN_COLUMNS, MAX_COLUMNS));
  let cols = geo.wide ? Math.max(1, Math.round(c / 2)) : c;
  const ratio = imgW > 0 && imgH > 0 ? imgH / imgW : 1;
  let rows = Math.max(1, Math.round((cols * ratio) / geo.cellRatio));
  if (rows > maxRows) {
    cols = Math.max(1, Math.round((cols * maxRows) / rows));
    rows = maxRows;
  }
  return { cols, rows, pxW: cols * geo.dotsX, pxH: rows * geo.dotsY };
}

/* ---------- Tone ---------- */

/** Rec. 709 luma of 8-bit sRGB values, 0 (black) to 1 (white). */
export function luminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Slider −100…100 → multiplier: −100 flattens to grey, 0 keeps, +100 is ×4. */
export function contrastFactor(contrast: number): number {
  const c = clamp(contrast, -100, 100);
  return c >= 0 ? 1 + (3 * c) / 100 : 1 + c / 100;
}

/** Brightness −100…100 shifts by up to half the range; contrast pivots around mid-grey. */
export function adjustTone(t: number, brightness: number, contrast: number): number {
  return clamp01((t - 0.5) * contrastFactor(contrast) + 0.5 + clamp(brightness, -100, 100) / 200);
}

/** The tones at the `clip` and 1 − `clip` quantiles, from a 256-bin histogram. */
export function levelsRange(tones: ArrayLike<number>, clip = 0.01): [number, number] {
  const n = tones.length;
  if (n === 0) return [0, 1];
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) hist[Math.round(clamp01(tones[i]) * 255)]++;
  const cut = Math.floor(n * clip);
  let lo = 0;
  for (let acc = 0; lo < 255; lo++) {
    acc += hist[lo];
    if (acc > cut) break;
  }
  let hi = 255;
  for (let acc = 0; hi > 0; hi--) {
    acc += hist[hi];
    if (acc > cut) break;
  }
  return hi > lo ? [lo / 255, hi / 255] : [0, 1];
}

/** Sobel gradient magnitude, 0…1 (a hard black-to-white step gives 1). Borders repeat the edge pixel. */
export function sobel(t: ArrayLike<number>, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  const at = (x: number, y: number) => t[clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1)];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const tl = at(x - 1, y - 1);
      const tc = at(x, y - 1);
      const tr = at(x + 1, y - 1);
      const ml = at(x - 1, y);
      const mr = at(x + 1, y);
      const bl = at(x - 1, y + 1);
      const bc = at(x, y + 1);
      const br = at(x + 1, y + 1);
      const gx = tr + 2 * mr + br - tl - 2 * ml - bl;
      const gy = bl + 2 * bc + br - tl - 2 * tc - tr;
      out[y * w + x] = Math.min(1, Math.sqrt(gx * gx + gy * gy) / 4);
    }
  }
  return out;
}

/** Gain applied to the Sobel magnitude when edges are emphasized. */
export const EDGE_GAIN = 2.5;

export interface ToneOptions {
  /** Where the art will be shown. On light paper dark pixels get ink; on dark paper bright ones do. */
  background: Background;
  invert: boolean;
  brightness: number;
  contrast: number;
  autoLevels: boolean;
  edges: boolean;
}

/**
 * Ink amount per pixel, 0 (blank cell) to 1 (densest character).
 * Transparent pixels are composited onto the paper colour, so they stay blank.
 */
export function inkMap(rgba: ArrayLike<number>, w: number, h: number, o: ToneOptions): Float32Array {
  const n = w * h;
  const tone = new Float32Array(n);
  const paper = o.background === 'light' ? 1 : 0;
  for (let i = 0; i < n; i++) {
    const p = i * 4;
    const a = rgba[p + 3] / 255;
    tone[i] = a * luminance(rgba[p], rgba[p + 1], rgba[p + 2]) + (1 - a) * paper;
  }
  if (o.autoLevels) {
    const [lo, hi] = levelsRange(tone);
    if (hi - lo > 0.02) for (let i = 0; i < n; i++) tone[i] = clamp01((tone[i] - lo) / (hi - lo));
  }
  if (o.brightness !== 0 || o.contrast !== 0) {
    for (let i = 0; i < n; i++) tone[i] = adjustTone(tone[i], o.brightness, o.contrast);
  }
  const edge = o.edges ? sobel(tone, w, h) : null;
  const flip = (o.background === 'light') !== o.invert;
  const ink = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let v = flip ? 1 - tone[i] : tone[i];
    if (edge) v = 1 - (1 - v) * (1 - Math.min(1, edge[i] * EDGE_GAIN));
    ink[i] = v;
  }
  return ink;
}

/* ---------- Ramp ---------- */

/** Characters sorted from least to most ink, with their ink as 0…1 (lightest 0, darkest 1). */
export interface Ramp {
  chars: string[];
  weights: number[];
}

/** Ink coverage of a glyph drawn on a transparent canvas: mean alpha, 0…1. */
export function inkCoverage(rgba: ArrayLike<number>): number {
  const n = Math.floor(rgba.length / 4);
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 3; i < rgba.length; i += 4) sum += rgba[i];
  return sum / 255 / n;
}

/**
 * Builds a ramp. With `coverage` (one value per character, e.g. measured ink), characters are
 * sorted by it and weighted proportionally; without it, the given order is used, evenly spaced.
 */
export function buildRamp(chars: string[], coverage?: ArrayLike<number>): Ramp {
  const seen = new Set<string>();
  const items: { ch: string; cov: number; order: number }[] = [];
  chars.forEach((ch, i) => {
    if (seen.has(ch)) return;
    seen.add(ch);
    items.push({ ch, cov: coverage && coverage.length === chars.length ? coverage[i] : i, order: items.length });
  });
  if (items.length === 0) return { chars: [' '], weights: [0] };
  if (items.length === 1) return { chars: [items[0].ch], weights: [0] };
  const measured = coverage !== undefined && coverage.length === chars.length;
  if (measured) items.sort((a, b) => a.cov - b.cov || a.order - b.order);
  const lo = items[0].cov;
  const hi = items[items.length - 1].cov;
  const even = !measured || hi - lo <= 0;
  return {
    chars: items.map((it) => it.ch),
    weights: items.map((it, i) => (even ? i / (items.length - 1) : (it.cov - lo) / (hi - lo))),
  };
}

/** Index of the weight nearest to v. `weights` must be ascending. */
export function nearestIndex(weights: ArrayLike<number>, v: number): number {
  const n = weights.length;
  if (n <= 1 || v <= weights[0]) return 0;
  if (v >= weights[n - 1]) return n - 1;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (weights[mid] <= v) lo = mid;
    else hi = mid;
  }
  return v - weights[lo] <= weights[hi] - v ? lo : hi;
}

/**
 * Maps each ink value to a ramp level. With `dither`, Floyd–Steinberg error diffusion
 * (serpentine) spreads each rounding error to the neighbours (7/16, 3/16, 5/16, 1/16).
 */
export function quantize(ink: ArrayLike<number>, w: number, h: number, weights: ArrayLike<number>, dither: boolean): Uint8Array {
  const out = new Uint8Array(w * h);
  if (!dither) {
    for (let i = 0; i < out.length; i++) out[i] = nearestIndex(weights, ink[i]);
    return out;
  }
  const buf = Float32Array.from(ink as ArrayLike<number>);
  for (let y = 0; y < h; y++) {
    const ltr = y % 2 === 0;
    const dir = ltr ? 1 : -1;
    for (let k = 0; k < w; k++) {
      const x = ltr ? k : w - 1 - k;
      const i = y * w + x;
      const v = clamp(buf[i], -0.5, 1.5);
      const idx = nearestIndex(weights, v);
      out[i] = idx;
      const err = v - weights[idx];
      if (err === 0) continue;
      const fwd = x + dir >= 0 && x + dir < w;
      const back = x - dir >= 0 && x - dir < w;
      if (fwd) buf[i + dir] += (err * 7) / 16;
      if (y + 1 < h) {
        if (back) buf[i + w - dir] += (err * 3) / 16;
        buf[i + w] += (err * 5) / 16;
        if (fwd) buf[i + w + dir] += err / 16;
      }
    }
  }
  return out;
}

export function rampLines(levels: ArrayLike<number>, cols: number, rows: number, chars: string[]): string[] {
  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) line += chars[levels[y * cols + x]] ?? chars[0];
    lines.push(line);
  }
  return lines;
}

/* ---------- Braille ---------- */

/** Unicode braille bit for the dot at [row][column] of a 2 × 4 cell (dots 1–8). */
export const BRAILLE_DOT_BITS = [
  [0x01, 0x08],
  [0x02, 0x10],
  [0x04, 0x20],
  [0x40, 0x80],
] as const;

/** Braille character for 8 dots given row by row: [r0c0, r0c1, r1c0, r1c1, …]. */
export function brailleChar(dots: ArrayLike<number | boolean>): string {
  let code = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 2; c++) if (dots[r * 2 + c]) code |= BRAILLE_DOT_BITS[r][c];
  }
  return String.fromCharCode(0x2800 + code);
}

/** Lines of braille from a 0/1 dot grid of pxW × pxH (multiples of 2 and 4). */
export function brailleLines(dots: ArrayLike<number>, pxW: number, pxH: number): string[] {
  const cols = Math.floor(pxW / 2);
  const rows = Math.floor(pxH / 4);
  const lines: string[] = [];
  for (let cy = 0; cy < rows; cy++) {
    let line = '';
    for (let cx = 0; cx < cols; cx++) {
      let code = 0;
      for (let r = 0; r < 4; r++) {
        const base = (cy * 4 + r) * pxW + cx * 2;
        if (dots[base]) code |= BRAILLE_DOT_BITS[r][0];
        if (dots[base + 1]) code |= BRAILLE_DOT_BITS[r][1];
      }
      line += String.fromCharCode(0x2800 + code);
    }
    lines.push(line);
  }
  return lines;
}

/* ---------- Colour ---------- */

/** Mean RGB of each cell (alpha-weighted), 3 bytes per cell. Fully transparent cells come out grey. */
export function cellColors(rgba: ArrayLike<number>, pxW: number, pxH: number, dotsX: number, dotsY: number): Uint8Array {
  const cols = Math.floor(pxW / dotsX);
  const rows = Math.floor(pxH / dotsY);
  const out = new Uint8Array(cols * rows * 3);
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < dotsY; dy++) {
        for (let dx = 0; dx < dotsX; dx++) {
          const p = ((cy * dotsY + dy) * pxW + cx * dotsX + dx) * 4;
          const w = rgba[p + 3];
          r += rgba[p] * w;
          g += rgba[p + 1] * w;
          b += rgba[p + 2] * w;
          a += w;
        }
      }
      const o = (cy * cols + cx) * 3;
      if (a === 0) {
        out[o] = out[o + 1] = out[o + 2] = 128;
      } else {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
      }
    }
  }
  return out;
}

export function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('')}`;
}

export interface ColorRun {
  text: string;
  /** null for a run of blanks only. */
  color: string | null;
}

/**
 * Groups one line into runs of the same (quantized) colour, so the coloured preview needs few spans.
 * Blanks carry no colour and join whatever run they are in.
 */
export function colorRuns(line: string, colors: ArrayLike<number>, firstCell: number, step = 16): ColorRun[] {
  const q = (v: number) => Math.min(255, Math.round(v / step) * step);
  const runs: ColorRun[] = [];
  let cur: ColorRun | null = null;
  let i = 0;
  for (const ch of line) {
    if (isBlank(ch)) {
      if (cur) cur.text += ch;
      else runs.push((cur = { text: ch, color: null }));
    } else {
      const o = (firstCell + i) * 3;
      const hex = toHex(q(colors[o]), q(colors[o + 1]), q(colors[o + 2]));
      if (cur && (cur.color === hex || cur.color === null)) {
        cur.color = hex;
        cur.text += ch;
      } else {
        runs.push((cur = { text: ch, color: hex }));
      }
    }
    i++;
  }
  return runs;
}

/* ---------- Conversion ---------- */

export interface ArtOptions extends ToneOptions {
  dither: boolean;
}

export interface Art {
  cols: number;
  rows: number;
  lines: string[];
  /** RGB per cell, row by row. */
  colors: Uint8Array;
  geometry: Geometry;
}

/** Converts pixels sampled at layout.pxW × layout.pxH into art. `ramp` is ignored for braille. */
export function convert(rgba: ArrayLike<number>, layout: GridLayout, geo: Geometry, ramp: Ramp, o: ArtOptions): Art {
  const { pxW, pxH, cols, rows } = layout;
  const ink = inkMap(rgba, pxW, pxH, o);
  const braille = geo.dotsX * geo.dotsY > 1;
  const lines = braille
    ? brailleLines(quantize(ink, pxW, pxH, [0, 1], o.dither), pxW, pxH)
    : rampLines(quantize(ink, pxW, pxH, ramp.weights, o.dither), cols, rows, ramp.chars);
  return { cols, rows, lines, colors: cellColors(rgba, pxW, pxH, geo.dotsX, geo.dotsY), geometry: geo };
}

export function artText(art: Art): string {
  return art.lines.join('\n');
}

/* ---------- Export ---------- */

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export interface HtmlStyle {
  font: string;
  /** px */
  fontSize: number;
  /** Line height as a multiple of the font size. */
  lineHeight: number;
  background: string;
  color: string;
}

/** A self-contained <pre> for pasting into rich-text editors and email; coloured spans in colour mode. */
export function artToHtml(art: Art, mode: OutputMode, style: HtmlStyle): string {
  const css = [
    'margin:0',
    'padding:12px',
    'white-space:pre',
    `font-family:${style.font}`,
    `font-size:${style.fontSize}px`,
    `line-height:${Number(style.lineHeight.toFixed(3))}`,
    `background:${style.background}`,
    `color:${style.color}`,
  ].join(';');
  const body = art.lines
    .map((line, y) => {
      if (mode === 'plain') return escapeHtml(line);
      return colorRuns(line, art.colors, y * art.cols)
        .map((r) => (r.color ? `<span style="color:${r.color}">${escapeHtml(r.text)}</span>` : escapeHtml(r.text)))
        .join('');
    })
    .join('\n');
  return `<pre style="${escapeHtml(css)}">${body}</pre>`;
}

/** "IMG_1234.HEIC" → "IMG_1234-ascii.txt"; unnamed → "ascii-art.txt". */
export function outputName(source: string, ext: 'txt' | 'png'): string {
  const dot = source.lastIndexOf('.');
  const base = (dot > 0 ? source.slice(0, dot) : source)
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '')
    .trim()
    .slice(0, 60);
  return base ? `${base}-ascii.${ext}` : `ascii-art.${ext}`;
}

/* ---------- Settings ---------- */

export interface Settings {
  columns: number;
  charset: CharsetId;
  custom: string;
  autoSort: boolean;
  brightness: number;
  contrast: number;
  autoLevels: boolean;
  invert: boolean;
  /** Per character set: dithering helps sets with few levels (blocks, braille) and only adds speckle to long ramps. */
  dither: Record<CharsetId, boolean>;
  edges: boolean;
  mode: OutputMode;
  background: Background;
}

export const DEFAULT_SETTINGS: Settings = {
  columns: 100,
  charset: 'classic',
  custom: DEFAULT_CUSTOM,
  autoSort: true,
  brightness: 0,
  contrast: 0,
  autoLevels: true,
  invert: false,
  dither: { classic: false, simple: false, blocks: true, braille: true, cjk: false, custom: false },
  edges: false,
  mode: 'plain',
  background: 'light',
};

/** Validates stored or form settings, falling back field by field. */
export function normalizeSettings(raw: unknown, base: Settings = DEFAULT_SETTINGS): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const num = (v: unknown, lo: number, hi: number, fb: number) => {
    const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : typeof v === 'number' ? v : NaN;
    return Number.isFinite(n) ? Math.round(clamp(n, lo, hi)) : fb;
  };
  const bool = (v: unknown, fb: boolean) => (typeof v === 'boolean' ? v : fb);
  const dither = (r.dither && typeof r.dither === 'object' ? r.dither : {}) as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, options: readonly T[], fb: T) => (options.includes(v as T) ? (v as T) : fb);
  return {
    columns: num(r.columns, MIN_COLUMNS, MAX_COLUMNS, base.columns),
    charset: pick(r.charset, CHARSET_IDS, base.charset),
    custom: typeof r.custom === 'string' ? Array.from(r.custom).slice(0, MAX_CUSTOM_CHARS).join('') : base.custom,
    autoSort: bool(r.autoSort, base.autoSort),
    brightness: num(r.brightness, -100, 100, base.brightness),
    contrast: num(r.contrast, -100, 100, base.contrast),
    autoLevels: bool(r.autoLevels, base.autoLevels),
    invert: bool(r.invert, base.invert),
    dither: Object.fromEntries(CHARSET_IDS.map((id) => [id, bool(dither[id], base.dither[id])])) as Settings['dither'],
    edges: bool(r.edges, base.edges),
    mode: pick(r.mode, ['plain', 'color'] as const, base.mode),
    background: pick(r.background, ['light', 'dark'] as const, base.background),
  };
}
