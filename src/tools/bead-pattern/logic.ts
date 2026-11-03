// Bead pattern maker: pure functions, no DOM. The tool script draws the picture onto a small
// canvas, hands the pixels to averageCells(), and everything after that happens here:
// background removal, nearest-color matching in CIELAB (CIEDE2000), color reduction,
// optional Floyd–Steinberg dithering, counts, pegboards and edit bookkeeping.
import type { Locale } from '../../i18n/locales';

export type Rgb = [number, number, number];
export type Lab = [number, number, number];

/* ---------- Color math ---------- */

export function hexToRgb(hex: string): Rgb {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Bad hex color: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
}

function srgbToLinear(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

const LAB_E = (6 / 29) ** 3;
const LAB_K = 3 * (6 / 29) ** 2;
const labF = (t: number) => (t > LAB_E ? Math.cbrt(t) : t / LAB_K + 4 / 29);

/** sRGB (0–255) to CIELAB, D65 white point. */
export function rgbToLab(r: number, g: number, b: number): Lab {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  const x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  const y = 0.2126729 * R + 0.7151522 * G + 0.072175 * B;
  const z = (0.0193339 * R + 0.119192 * G + 0.9503041 * B) / 1.08883;
  const fy = labF(y);
  return [116 * fy - 16, 500 * (labF(x) - fy), 200 * (fy - labF(z))];
}

const DEG = Math.PI / 180;
const POW25_7 = 25 ** 7;

function hueDeg(b: number, a: number): number {
  if (a === 0 && b === 0) return 0;
  const h = Math.atan2(b, a) / DEG;
  return h < 0 ? h + 360 : h;
}

/** CIEDE2000 color difference (Sharma, Wu & Dalal 2005), kL = kC = kH = 1. */
export function deltaE2000(lab1: Lab, lab2: Lab): number {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  const cBar = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2;
  const cBar7 = cBar ** 7;
  const g = 0.5 * (1 - Math.sqrt(cBar7 / (cBar7 + POW25_7)));
  const a1p = (1 + g) * a1;
  const a2p = (1 + g) * a2;
  const c1p = Math.hypot(a1p, b1);
  const c2p = Math.hypot(a2p, b2);
  const h1p = hueDeg(b1, a1p);
  const h2p = hueDeg(b2, a2p);

  const dLp = L2 - L1;
  const dCp = c2p - c1p;
  let dhp = 0;
  if (c1p * c2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(c1p * c2p) * Math.sin((dhp / 2) * DEG);

  const lBarp = (L1 + L2) / 2;
  const cBarp = (c1p + c2p) / 2;
  let hBarp = h1p + h2p;
  if (c1p * c2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hBarp = (h1p + h2p) / 2;
    else if (h1p + h2p < 360) hBarp = (h1p + h2p + 360) / 2;
    else hBarp = (h1p + h2p - 360) / 2;
  }
  const t =
    1 -
    0.17 * Math.cos((hBarp - 30) * DEG) +
    0.24 * Math.cos(2 * hBarp * DEG) +
    0.32 * Math.cos((3 * hBarp + 6) * DEG) -
    0.2 * Math.cos((4 * hBarp - 63) * DEG);
  const dTheta = 30 * Math.exp(-(((hBarp - 275) / 25) ** 2));
  const cBarp7 = cBarp ** 7;
  const rc = 2 * Math.sqrt(cBarp7 / (cBarp7 + POW25_7));
  const l50 = (lBarp - 50) ** 2;
  const sl = 1 + (0.015 * l50) / Math.sqrt(20 + l50);
  const sc = 1 + 0.045 * cBarp;
  const sh = 1 + 0.015 * cBarp * t;
  const rt = -Math.sin(2 * dTheta * DEG) * rc;
  const vl = dLp / sl;
  const vc = dCp / sc;
  const vh = dHp / sh;
  return Math.sqrt(vl * vl + vc * vc + vh * vh + rt * vc * vh);
}

/** Relative luminance (WCAG), 0–1. */
export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** Black or white text, whichever reads better on the bead. */
export function textColorFor(rgb: Rgb): '#000000' | '#ffffff' {
  const l = luminance(rgb);
  // Contrast against black is (l + 0.05) / 0.05, against white 1.05 / (l + 0.05); they meet near l = 0.179.
  return l > 0.179 ? '#000000' : '#ffffff';
}

/* ---------- Palette ---------- */

export interface PaletteColor {
  id: string;
  hex: string;
  names: Record<Locale, string>;
}

export interface PaletteEntry extends PaletteColor {
  /** Index in PALETTE; grids store this number (-1 = empty peg). */
  index: number;
  rgb: Rgb;
  lab: Lab;
  /** One character drawn on the bead in printable patterns. Fixed per color so it never shuffles. */
  symbol: string;
}

// Generic bead-like colors. Approximate everyday shades, not any brand's color codes.
const COLORS: PaletteColor[] = [
  { id: 'white', hex: '#f8f8f6', names: { 'zh-TW': '白', en: 'White', ja: '白' } },
  { id: 'cream', hex: '#f3e7c2', names: { 'zh-TW': '米白', en: 'Cream', ja: 'クリーム' } },
  { id: 'lightGray', hex: '#c9cacd', names: { 'zh-TW': '淺灰', en: 'Light gray', ja: 'ライトグレー' } },
  { id: 'gray', hex: '#8e9095', names: { 'zh-TW': '灰', en: 'Gray', ja: 'グレー' } },
  { id: 'darkGray', hex: '#505257', names: { 'zh-TW': '深灰', en: 'Dark gray', ja: 'ダークグレー' } },
  { id: 'black', hex: '#1d1d1f', names: { 'zh-TW': '黑', en: 'Black', ja: '黒' } },
  { id: 'lightPink', hex: '#f6c4d2', names: { 'zh-TW': '淺粉紅', en: 'Light pink', ja: 'ライトピンク' } },
  { id: 'pink', hex: '#ee8ab1', names: { 'zh-TW': '粉紅', en: 'Pink', ja: 'ピンク' } },
  { id: 'hotPink', hex: '#e0457f', names: { 'zh-TW': '桃紅', en: 'Hot pink', ja: 'ショッキングピンク' } },
  { id: 'magenta', hex: '#b8338f', names: { 'zh-TW': '紫紅', en: 'Magenta', ja: 'マゼンタ' } },
  { id: 'red', hex: '#d3272c', names: { 'zh-TW': '紅', en: 'Red', ja: '赤' } },
  { id: 'burgundy', hex: '#8b1e2d', names: { 'zh-TW': '酒紅', en: 'Burgundy', ja: 'ワインレッド' } },
  { id: 'coral', hex: '#f2776a', names: { 'zh-TW': '珊瑚紅', en: 'Coral', ja: 'コーラル' } },
  { id: 'orange', hex: '#f07b22', names: { 'zh-TW': '橘', en: 'Orange', ja: 'オレンジ' } },
  { id: 'peach', hex: '#f7bc8d', names: { 'zh-TW': '蜜桃', en: 'Peach', ja: 'ピーチ' } },
  { id: 'yellow', hex: '#f6d11f', names: { 'zh-TW': '黃', en: 'Yellow', ja: '黄色' } },
  { id: 'lightYellow', hex: '#f7eb92', names: { 'zh-TW': '淺黃', en: 'Light yellow', ja: 'ライトイエロー' } },
  { id: 'mustard', hex: '#d6a21e', names: { 'zh-TW': '土黃', en: 'Mustard', ja: 'マスタード' } },
  { id: 'lime', hex: '#a9cb3b', names: { 'zh-TW': '黃綠', en: 'Lime green', ja: '黄緑' } },
  { id: 'lightGreen', hex: '#96d47e', names: { 'zh-TW': '淺綠', en: 'Light green', ja: 'ライトグリーン' } },
  { id: 'green', hex: '#2ea44f', names: { 'zh-TW': '綠', en: 'Green', ja: '緑' } },
  { id: 'darkGreen', hex: '#1c6638', names: { 'zh-TW': '深綠', en: 'Dark green', ja: '深緑' } },
  { id: 'olive', hex: '#6f7a2e', names: { 'zh-TW': '橄欖綠', en: 'Olive', ja: 'オリーブ' } },
  { id: 'mint', hex: '#a7e1cd', names: { 'zh-TW': '薄荷綠', en: 'Mint', ja: 'ミント' } },
  { id: 'teal', hex: '#16968f', names: { 'zh-TW': '藍綠', en: 'Teal', ja: '青緑' } },
  { id: 'turquoise', hex: '#27b6d1', names: { 'zh-TW': '土耳其藍', en: 'Turquoise', ja: 'ターコイズ' } },
  { id: 'lightBlue', hex: '#bcdcf3', names: { 'zh-TW': '淺藍', en: 'Light blue', ja: 'ライトブルー' } },
  { id: 'skyBlue', hex: '#74c0ec', names: { 'zh-TW': '天藍', en: 'Sky blue', ja: '水色' } },
  { id: 'blue', hex: '#2d6bcf', names: { 'zh-TW': '藍', en: 'Blue', ja: '青' } },
  { id: 'navy', hex: '#1e2c69', names: { 'zh-TW': '深藍', en: 'Navy', ja: '紺' } },
  { id: 'dustyBlue', hex: '#6f87a7', names: { 'zh-TW': '灰藍', en: 'Dusty blue', ja: 'くすみブルー' } },
  { id: 'lavender', hex: '#c4b2e2', names: { 'zh-TW': '薰衣草紫', en: 'Lavender', ja: 'ラベンダー' } },
  { id: 'purple', hex: '#7d4aa7', names: { 'zh-TW': '紫', en: 'Purple', ja: '紫' } },
  { id: 'darkPurple', hex: '#4c2a6b', names: { 'zh-TW': '深紫', en: 'Dark purple', ja: 'ダークパープル' } },
  { id: 'dustyRose', hex: '#c88d95', names: { 'zh-TW': '乾燥玫瑰', en: 'Dusty rose', ja: 'くすみピンク' } },
  { id: 'sand', hex: '#edcda8', names: { 'zh-TW': '沙色', en: 'Sand', ja: 'ベージュ' } },
  { id: 'tan', hex: '#d4a373', names: { 'zh-TW': '卡其', en: 'Tan', ja: 'キャメル' } },
  { id: 'lightBrown', hex: '#a9744a', names: { 'zh-TW': '淺咖啡', en: 'Light brown', ja: 'ライトブラウン' } },
  { id: 'brown', hex: '#774727', names: { 'zh-TW': '咖啡', en: 'Brown', ja: '茶色' } },
  { id: 'darkBrown', hex: '#472a1a', names: { 'zh-TW': '深咖啡', en: 'Dark brown', ja: 'こげ茶' } },
  { id: 'rust', hex: '#a8462a', names: { 'zh-TW': '磚紅', en: 'Rust', ja: 'レンガ色' } },
  { id: 'taupe', hex: '#a39a8d', names: { 'zh-TW': '灰褐', en: 'Taupe', ja: 'グレージュ' } },
];

/** Readable in print: no I/O/l/o/0 that look alike. */
export const SYMBOLS = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabdefghkmnqrty';

export const PALETTE: PaletteEntry[] = COLORS.map((c, index) => {
  const rgb = hexToRgb(c.hex);
  return { ...c, index, rgb, lab: rgbToLab(...rgb), symbol: SYMBOLS[index] };
});

export const PALETTE_IDS = ['full', 'basic', 'gray'] as const;
export type PaletteId = (typeof PALETTE_IDS)[number];

const PALETTE_SETS: Record<PaletteId, string[]> = {
  full: COLORS.map((c) => c.id),
  basic: [
    'white',
    'lightGray',
    'gray',
    'black',
    'pink',
    'red',
    'orange',
    'yellow',
    'lightGreen',
    'green',
    'darkGreen',
    'skyBlue',
    'blue',
    'purple',
    'sand',
    'tan',
    'brown',
    'darkBrown',
  ],
  gray: ['white', 'lightGray', 'gray', 'darkGray', 'black'],
};

/** PALETTE indices offered by a palette choice. */
export function paletteIndices(id: PaletteId): number[] {
  const ids = PALETTE_SETS[id] ?? PALETTE_SETS.full;
  return ids.map((name) => {
    const i = COLORS.findIndex((c) => c.id === name);
    if (i < 0) throw new Error(`Unknown bead color ${name}`);
    return i;
  });
}

/** Index into `labs` of the closest color (CIEDE2000), skipping entries where `use` is false. */
export function nearestIndex(lab: Lab, labs: Lab[], use?: ArrayLike<boolean>): number {
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < labs.length; i++) {
    if (use && !use[i]) continue;
    const d = deltaE2000(lab, labs[i]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/* ---------- Settings ---------- */

export const FRAMES = ['original', 'squareCrop', 'squareFit'] as const;
export type Frame = (typeof FRAMES)[number];
export const SHAPES = ['circle', 'square'] as const;
export type Shape = (typeof SHAPES)[number];

export const WIDTH_PRESETS = [29, 58, 87];
export const MIN_SIDE = 5;
export const MAX_SIDE = 200;

export interface Settings {
  /** Beads across. */
  width: number;
  frame: Frame;
  palette: PaletteId;
  maxColors: number;
  dither: boolean;
  removeBg: boolean;
  shape: Shape;
  symbols: boolean;
  /** Pegs per side of one square pegboard. */
  board: number;
}

export const DEFAULT_SETTINGS: Settings = {
  width: 29,
  frame: 'original',
  palette: 'full',
  maxColors: 16,
  dither: false,
  removeBg: true,
  shape: 'circle',
  symbols: false,
  board: 29,
};

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'string' ? Number(value.trim()) : typeof value === 'number' ? value : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function pick<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

/** Saved or typed settings → a valid Settings object; anything unusable falls back. */
export function normalizeSettings(raw: unknown, defaults: Settings = DEFAULT_SETTINGS): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
  return {
    width: clampInt(r.width, MIN_SIDE, MAX_SIDE, defaults.width),
    frame: pick(r.frame, FRAMES, defaults.frame),
    palette: pick(r.palette, PALETTE_IDS, defaults.palette),
    maxColors: clampInt(r.maxColors, 2, PALETTE.length, defaults.maxColors),
    dither: bool(r.dither, defaults.dither),
    removeBg: bool(r.removeBg, defaults.removeBg),
    shape: pick(r.shape, SHAPES, defaults.shape),
    symbols: bool(r.symbols, defaults.symbols),
    board: clampInt(r.board, 5, 100, defaults.board),
  };
}

/* ---------- Grid size and resampling ---------- */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridLayout {
  cols: number;
  rows: number;
  /** Part of the source image to use, in source pixels. */
  src: Rect;
  /** Where that part lands, in bead (cell) units; smaller than the grid only for squareFit. */
  dest: Rect;
}

/**
 * Pattern size from the image size. `original`: height follows the aspect ratio.
 * `squareCrop`: center square of the image. `squareFit`: whole image inside a square, rest empty.
 * Neither side exceeds MAX_SIDE; a very tall image gets fewer columns instead.
 */
export function layoutGrid(srcW: number, srcH: number, width: number, frame: Frame, maxSide = MAX_SIDE): GridLayout {
  const w = Math.max(1, srcW);
  const h = Math.max(1, srcH);
  let cols = Math.min(maxSide, Math.max(1, Math.round(width)));
  const full: Rect = { x: 0, y: 0, w, h };
  if (frame === 'squareCrop') {
    const side = Math.min(w, h);
    return { cols, rows: cols, src: { x: (w - side) / 2, y: (h - side) / 2, w: side, h: side }, dest: { x: 0, y: 0, w: cols, h: cols } };
  }
  if (frame === 'squareFit') {
    const scale = Math.min(cols / w, cols / h);
    const dw = w * scale;
    const dh = h * scale;
    return { cols, rows: cols, src: full, dest: { x: (cols - dw) / 2, y: (cols - dh) / 2, w: dw, h: dh } };
  }
  let rows = Math.max(1, Math.round((cols * h) / w));
  if (rows > maxSide) {
    rows = maxSide;
    cols = Math.max(1, Math.round((rows * w) / h));
  }
  return { cols, rows, src: full, dest: { x: 0, y: 0, w: cols, h: rows } };
}

/** Pixels sampled per bead side: the work canvas stays near `budget` px wide, between 1 and 8 per bead. */
export function samplingFactor(cols: number, rows: number, budget = 480): number {
  return Math.max(1, Math.min(8, Math.floor(budget / Math.max(cols, rows, 1))));
}

/** Largest source size worth keeping after loading; bigger photos are downscaled once up front. */
export function downscaleSize(w: number, h: number, max = 1024): { width: number; height: number } {
  const s = Math.min(1, max / Math.max(w, h, 1));
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) };
}

export interface Cells {
  cols: number;
  rows: number;
  /** One color per bead, 3 bytes each (see averageCells). */
  rgb: Uint8ClampedArray;
  /** Average alpha per bead. */
  alpha: Uint8ClampedArray;
}

/**
 * One color per bead from RGBA pixels (cols·k × rows·k). When one color clearly dominates the
 * bead's pixels (at least `dominantShare` of the opaque ones, grouped in 16-level steps), the bead
 * takes that color, so outlines in drawings stay crisp instead of blending into muddy in-between
 * shades. Otherwise (photos, gradients) it takes the alpha-weighted average of all its pixels.
 */
export function averageCells(data: ArrayLike<number>, cols: number, rows: number, k: number, dominantShare = 0.4): Cells {
  const n = cols * rows;
  const rgb = new Uint8ClampedArray(n * 3);
  const alpha = new Uint8ClampedArray(n);
  const stride = cols * k * 4;
  const area = k * k;
  const bins = new Map<number, number>();
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let opaque = 0;
      let best = -1;
      let bestCount = 0;
      bins.clear();
      for (let y = cy * k; y < (cy + 1) * k; y++) {
        let p = y * stride + cx * k * 4;
        for (let x = 0; x < k; x++, p += 4) {
          const pa = data[p + 3];
          r += data[p] * pa;
          g += data[p + 1] * pa;
          b += data[p + 2] * pa;
          a += pa;
          if (pa < 128) continue;
          opaque++;
          const bin = ((data[p] >> 4) << 8) | ((data[p + 1] >> 4) << 4) | (data[p + 2] >> 4);
          const count = (bins.get(bin) ?? 0) + 1;
          bins.set(bin, count);
          if (count > bestCount) {
            bestCount = count;
            best = bin;
          }
        }
      }
      if (area > 1 && opaque > 0 && bestCount < opaque && bestCount >= dominantShare * opaque) {
        // Average only the pixels of the dominant color; coverage still counts every pixel.
        const cover = a;
        r = g = b = a = 0;
        for (let y = cy * k; y < (cy + 1) * k; y++) {
          let p = y * stride + cx * k * 4;
          for (let x = 0; x < k; x++, p += 4) {
            const pa = data[p + 3];
            if (pa < 128 || (((data[p] >> 4) << 8) | ((data[p + 1] >> 4) << 4) | (data[p + 2] >> 4)) !== best) continue;
            r += data[p] * pa;
            g += data[p + 1] * pa;
            b += data[p + 2] * pa;
            a += pa;
          }
        }
        const i = cy * cols + cx;
        rgb[i * 3] = r / a;
        rgb[i * 3 + 1] = g / a;
        rgb[i * 3 + 2] = b / a;
        alpha[i] = cover / area;
        continue;
      }
      const i = cy * cols + cx;
      if (a > 0) {
        rgb[i * 3] = r / a;
        rgb[i * 3 + 1] = g / a;
        rgb[i * 3 + 2] = b / a;
      } else {
        rgb.fill(255, i * 3, i * 3 + 3);
      }
      alpha[i] = a / area;
    }
  }
  return { cols, rows, rgb, alpha };
}

/* ---------- Background ---------- */

/** Paper-white: very light and nearly colorless. Cream, pale yellow and pale blue stay. */
export function isNearWhite(lab: Lab): boolean {
  return lab[0] >= 90 && Math.hypot(lab[1], lab[2]) <= 10;
}

export interface Prepared {
  /** Colors with partial transparency flattened onto white. */
  rgb: Uint8ClampedArray;
  /** 1 = leave the peg empty. */
  empty: Uint8Array;
}

/**
 * With removeBg, mostly transparent beads are empty, and so is near-white that touches the edge
 * (a white backdrop), while white inside the picture (eyes, highlights) is kept.
 * Without it, every bead gets a color and transparency becomes white.
 */
export function prepareCells(cells: Cells, removeBg: boolean): Prepared {
  const { cols, rows, alpha } = cells;
  const n = cols * rows;
  const rgb = new Uint8ClampedArray(n * 3);
  for (let i = 0; i < n; i++) {
    const a = alpha[i] / 255;
    for (let c = 0; c < 3; c++) rgb[i * 3 + c] = cells.rgb[i * 3 + c] * a + 255 * (1 - a);
  }
  const empty = new Uint8Array(n);
  if (!removeBg) return { rgb, empty };

  const open = new Uint8Array(n); // transparent or near-white: background can spread through it
  for (let i = 0; i < n; i++) {
    if (alpha[i] < 128) {
      empty[i] = 1;
      open[i] = 1;
    } else if (isNearWhite(rgbToLab(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]))) {
      open[i] = 1;
    }
  }
  const seen = new Uint8Array(n);
  const queue: number[] = [];
  const push = (i: number) => {
    if (open[i] && !seen[i]) {
      seen[i] = 1;
      queue.push(i);
    }
  };
  for (let x = 0; x < cols; x++) {
    push(x);
    push((rows - 1) * cols + x);
  }
  for (let y = 0; y < rows; y++) {
    push(y * cols);
    push(y * cols + cols - 1);
  }
  for (let q = 0; q < queue.length; q++) {
    const i = queue[q];
    empty[i] = 1;
    const x = i % cols;
    if (x > 0) push(i - 1);
    if (x < cols - 1) push(i + 1);
    if (i >= cols) push(i - cols);
    if (i < n - cols) push(i + cols);
  }
  return { rgb, empty };
}

/* ---------- Matching and color reduction ---------- */

export interface QuantizeOptions {
  /** PALETTE indices allowed. */
  allowed: number[];
  maxColors: number;
  dither: boolean;
}

/**
 * One PALETTE index per bead (-1 = empty). Each bead first takes its nearest palette color;
 * then, while more than maxColors colors remain, the least-used one is dropped and its beads move
 * to the nearest remaining color (measured from the bead's own color, not the dropped one).
 * Without dithering only colors that beads land on show up, so the result may use fewer than
 * maxColors. With dithering, the kept colors are laid out with Floyd–Steinberg error diffusion.
 */
export function quantize(prepared: Prepared, cols: number, rows: number, opts: QuantizeOptions): Int16Array {
  const { rgb, empty } = prepared;
  const n = cols * rows;
  const grid = new Int16Array(n).fill(-1);
  const allowed = opts.allowed.length ? opts.allowed : paletteIndices('full');
  const labs = allowed.map((i) => PALETTE[i].lab);
  const P = allowed.length;

  // Unique colors, so the CIEDE2000 work scales with distinct colors rather than beads.
  const uniq = new Map<number, number>();
  const uOf = new Int32Array(n).fill(-1);
  const uLab: Lab[] = [];
  const uCount: number[] = [];
  for (let i = 0; i < n; i++) {
    if (empty[i]) continue;
    const key = (rgb[i * 3] << 16) | (rgb[i * 3 + 1] << 8) | rgb[i * 3 + 2];
    let u = uniq.get(key);
    if (u === undefined) {
      u = uLab.length;
      uniq.set(key, u);
      uLab.push(rgbToLab(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]));
      uCount.push(0);
    }
    uCount[u]++;
    uOf[i] = u;
  }
  const U = uLab.length;
  if (U === 0) return grid;

  const dist = new Float32Array(U * P);
  for (let u = 0; u < U; u++) for (let p = 0; p < P; p++) dist[u * P + p] = deltaE2000(uLab[u], labs[p]);

  const kept = new Array<boolean>(P).fill(true);
  const assign = new Int32Array(U);
  const counts = new Array<number>(P).fill(0);
  const nearestKept = (u: number) => {
    let best = -1;
    let bestD = Infinity;
    for (let p = 0; p < P; p++) {
      if (!kept[p]) continue;
      const d = dist[u * P + p];
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
    return best;
  };
  for (let u = 0; u < U; u++) {
    assign[u] = nearestKept(u);
    counts[assign[u]] += uCount[u];
  }

  // How close each palette color comes to anything in the picture: breaks ties between equally
  // used colors (mostly unused ones), so the colors left for dithering are the relevant ones.
  const reach = new Float32Array(P).fill(Infinity);
  for (let u = 0; u < U; u++) for (let p = 0; p < P; p++) reach[p] = Math.min(reach[p], dist[u * P + p]);

  let keptCount = P;
  const limit = Math.max(1, Math.min(P, Math.round(opts.maxColors)));
  while (keptCount > limit) {
    let drop = -1;
    for (let p = 0; p < P; p++) {
      if (!kept[p]) continue;
      if (drop < 0 || counts[p] < counts[drop] || (counts[p] === counts[drop] && reach[p] > reach[drop])) drop = p;
    }
    kept[drop] = false;
    keptCount--;
    counts[drop] = 0;
    for (let u = 0; u < U; u++) {
      if (assign[u] !== drop) continue;
      assign[u] = nearestKept(u);
      counts[assign[u]] += uCount[u];
    }
  }

  if (!opts.dither) {
    for (let i = 0; i < n; i++) if (uOf[i] >= 0) grid[i] = allowed[assign[uOf[i]]];
    return grid;
  }

  // Floyd–Steinberg in RGB, serpentine; error never flows into empty pegs.
  const buf = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) buf[i] = rgb[i];
  const cache = new Map<number, number>();
  const spread = (x: number, y: number, e: number[], w: number) => {
    if (x < 0 || x >= cols || y >= rows) return;
    const j = y * cols + x;
    if (empty[j]) return;
    buf[j * 3] += e[0] * w;
    buf[j * 3 + 1] += e[1] * w;
    buf[j * 3 + 2] += e[2] * w;
  };
  for (let y = 0; y < rows; y++) {
    const ltr = y % 2 === 0;
    for (let s = 0; s < cols; s++) {
      const x = ltr ? s : cols - 1 - s;
      const i = y * cols + x;
      if (empty[i]) continue;
      const r = Math.round(Math.min(255, Math.max(0, buf[i * 3])));
      const g = Math.round(Math.min(255, Math.max(0, buf[i * 3 + 1])));
      const b = Math.round(Math.min(255, Math.max(0, buf[i * 3 + 2])));
      const key = (r << 16) | (g << 8) | b;
      let p = cache.get(key);
      if (p === undefined) {
        p = nearestIndex(rgbToLab(r, g, b), labs, kept);
        cache.set(key, p);
      }
      grid[i] = allowed[p];
      const target = PALETTE[allowed[p]].rgb;
      const e = [buf[i * 3] - target[0], buf[i * 3 + 1] - target[1], buf[i * 3 + 2] - target[2]];
      const dir = ltr ? 1 : -1;
      spread(x + dir, y, e, 7 / 16);
      spread(x - dir, y + 1, e, 3 / 16);
      spread(x, y + 1, e, 5 / 16);
      spread(x + dir, y + 1, e, 1 / 16);
    }
  }
  return grid;
}

/* ---------- Counts ---------- */

export interface LegendRow {
  index: number;
  count: number;
}

/** Beads per PALETTE color. */
export function tally(grid: ArrayLike<number>): number[] {
  const counts = new Array<number>(PALETTE.length).fill(0);
  for (let i = 0; i < grid.length; i++) if (grid[i] >= 0) counts[grid[i]]++;
  return counts;
}

/** Colors in use, most beads first (ties keep palette order). */
export function legend(grid: ArrayLike<number>): LegendRow[] {
  return tally(grid)
    .map((count, index) => ({ index, count }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count || a.index - b.index);
}

export function totalBeads(grid: ArrayLike<number>): number {
  let n = 0;
  for (let i = 0; i < grid.length; i++) if (grid[i] >= 0) n++;
  return n;
}

/** Square pegboards needed to lay out the whole pattern at once. */
export function boardCount(cols: number, rows: number, board: number): { across: number; down: number; total: number } {
  const size = Math.max(1, Math.round(board));
  const across = Math.ceil(cols / size);
  const down = Math.ceil(rows / size);
  return { across, down, total: across * down };
}

/** Finished size in cm, from the bead pitch in mm (standard fuse beads are about 5 mm). */
export function finishedSizeCm(cols: number, rows: number, pitchMm = 5): { width: number; height: number } {
  return { width: (cols * pitchMm) / 10, height: (rows * pitchMm) / 10 };
}

/* ---------- Editing ---------- */

export interface Change {
  index: number;
  /** Override before the change (undefined = none). */
  prev: number | undefined;
  next: number;
}

/** The generated grid with the user's edits on top. */
export function composeGrid(base: Int16Array, overrides: ReadonlyMap<number, number>): Int16Array {
  const grid = base.slice();
  for (const [i, v] of overrides) if (i >= 0 && i < grid.length) grid[i] = v;
  return grid;
}

/**
 * Paint one bead. Returns the change to remember for undo, or null if nothing changed.
 * Painting a bead back to its generated color drops the override instead of storing it.
 */
export function paintCell(base: Int16Array, overrides: Map<number, number>, index: number, value: number): Change | null {
  if (index < 0 || index >= base.length) return null;
  const current = overrides.has(index) ? overrides.get(index)! : base[index];
  if (current === value) return null;
  const prev = overrides.get(index);
  if (base[index] === value) overrides.delete(index);
  else overrides.set(index, value);
  return { index, prev, next: value };
}

/** Undo a stroke (a list of changes), newest first. */
export function revertChanges(overrides: Map<number, number>, changes: Change[]): void {
  for (let k = changes.length - 1; k >= 0; k--) {
    const { index, prev } = changes[k];
    if (prev === undefined) overrides.delete(index);
    else overrides.set(index, prev);
  }
}

/* ---------- Drawing geometry ---------- */

/** Show every Nth coordinate so the numbers never collide. */
export function labelStep(cellPx: number, labelPx: number): number {
  for (const step of [1, 2, 5, 10, 20, 50]) if (step * cellPx >= labelPx) return step;
  return 100;
}

/** Bead index under a point measured from the canvas's top-left corner, or -1 outside the grid. */
export function cellFromPoint(px: number, py: number, originX: number, originY: number, cell: number, cols: number, rows: number): number {
  const x = Math.floor((px - originX) / cell);
  const y = Math.floor((py - originY) / cell);
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return y * cols + x;
}

/** The beads crossed between two pointer positions, so a fast drag leaves no gaps. */
export function cellsOnLine(from: number, to: number, cols: number): number[] {
  if (from < 0) return to < 0 ? [] : [to];
  if (to < 0) return [];
  let x0 = from % cols;
  let y0 = Math.floor(from / cols);
  const x1 = to % cols;
  const y1 = Math.floor(to / cols);
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  const out: number[] = [];
  for (;;) {
    out.push(y0 * cols + x0);
    if (x0 === x1 && y0 === y1) return out;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

export function exportFilename(cols: number, rows: number): string {
  return `bead-pattern-${cols}x${rows}.png`;
}
