// 手機跑馬燈 / LED Scrolling Text: settings, share links and scroll geometry.
// Pure functions only; Tool.astro does the DOM work.

export type Direction = 'left' | 'right' | 'static';
export const DIRECTIONS: readonly Direction[] = ['left', 'right', 'static'];

export type ColorName = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'pink' | 'white' | 'black' | 'navy' | 'purple';

export interface Swatch {
  name: ColorName;
  hex: string;
}

/** Bright, LED-like text colors plus black for light backgrounds. */
export const TEXT_SWATCHES: readonly Swatch[] = [
  { name: 'red', hex: '#ff2a2a' },
  { name: 'orange', hex: '#ff8a00' },
  { name: 'yellow', hex: '#ffe100' },
  { name: 'green', hex: '#2bff5e' },
  { name: 'cyan', hex: '#22e4ff' },
  { name: 'pink', hex: '#ff4fd1' },
  { name: 'white', hex: '#ffffff' },
  { name: 'black', hex: '#000000' },
];

export const BG_SWATCHES: readonly Swatch[] = [
  { name: 'black', hex: '#000000' },
  { name: 'navy', hex: '#0b1a4a' },
  { name: 'purple', hex: '#3a0b5e' },
  { name: 'red', hex: '#d0021b' },
  { name: 'pink', hex: '#ff2f92' },
  { name: 'yellow', hex: '#ffd400' },
  { name: 'white', hex: '#ffffff' },
];

export interface Settings {
  text: string;
  /** '#rrggbb' */
  fg: string;
  bg: string;
  dir: Direction;
  /** 1 (slow) to 10 (fast). */
  speed: number;
  /** Text size in % of the largest size that fits the screen height (100 = fill). */
  size: number;
  blink: boolean;
  /** LED dot-matrix overlay. */
  dots: boolean;
  mirror: boolean;
}

export const LIMITS = {
  speed: [1, 10],
  size: [20, 100],
  textLength: 200,
} as const;

/** Defaults shared by every locale; the default text comes from i18n.ts. */
export const DEFAULTS: Omit<Settings, 'text'> = {
  fg: '#ff2a2a',
  bg: '#000000',
  dir: 'left',
  speed: 5,
  size: 100,
  blink: false,
  dots: true,
  mirror: false,
};

/** Share of the screen height the text takes at size 100, leaving room for accents and descenders. */
export const FILL = 0.84;
/** Static text may use this share of the screen width and height. */
export const STATIC_MARGIN = 0.92;
/** Speed 1 moves the text 0.4 screen heights per second; speed 10 moves it 4. */
export const SPEED_FACTOR = 0.4;
/** LED dots per text height (em), so small text keeps enough dots to stay readable. */
export const DOTS_PER_EM = 24;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function isDirection(value: unknown): value is Direction {
  return typeof value === 'string' && (DIRECTIONS as readonly string[]).includes(value);
}

/** Accepts '#rgb', '#rrggbb' or the same without '#'; returns lowercase '#rrggbb' or null. Nothing else gets into CSS. */
export function normalizeColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!match) return null;
  const hex = match[1].toLowerCase();
  return `#${hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex}`;
}

// C0/C1 controls and bidi embeddings/overrides/isolates; line breaks and tabs become spaces first.
const STRIP = /[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩]/g;

/** One line of sign text: no control characters, at most `max` code points. */
export function cleanText(value: unknown, max: number = LIMITS.textLength): string {
  if (typeof value !== 'string') return '';
  const flat = value.replace(/[\r\n\t]+/g, ' ').replace(STRIP, '');
  const chars = Array.from(flat);
  return chars.length > max ? chars.slice(0, max).join('') : flat;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toBool(value: unknown): boolean | null {
  if (value === true || value === 1 || value === '1' || value === 'true') return true;
  if (value === false || value === 0 || value === '0' || value === 'false') return false;
  return null;
}

/** Coerces stored, shared or user-entered values into valid settings, falling back to `defaults`. */
export function normalizeSettings(raw: unknown, defaults: Settings): Settings {
  const out = { ...defaults };
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Partial<Record<keyof Settings, unknown>>;
  if (typeof r.text === 'string') out.text = cleanText(r.text);
  for (const key of ['fg', 'bg'] as const) {
    const color = normalizeColor(r[key]);
    if (color) out[key] = color;
  }
  if (isDirection(r.dir)) out.dir = r.dir;
  for (const key of ['speed', 'size'] as const) {
    const n = toNumber(r[key]);
    if (n !== null) out[key] = clamp(Math.round(n), LIMITS[key][0], LIMITS[key][1]);
  }
  for (const key of ['blink', 'dots', 'mirror'] as const) {
    const b = toBool(r[key]);
    if (b !== null) out[key] = b;
  }
  return out;
}

/* ---------- Share links: settings live in the URL fragment, which browsers never send to the server ---------- */

const SHARE_KEYS = ['t', 'fg', 'bg', 'dir', 'speed', 'size', 'blink', 'dots', 'mirror'] as const;

/** 't=Hello&fg=ff2a2a&bg=000000&dir=left&speed=5&size=100&blink=0&dots=1&mirror=0' */
export function encodeShare(s: Settings): string {
  const params = new URLSearchParams();
  params.set('t', s.text);
  params.set('fg', s.fg.replace('#', ''));
  params.set('bg', s.bg.replace('#', ''));
  params.set('dir', s.dir);
  params.set('speed', String(s.speed));
  params.set('size', String(s.size));
  params.set('blink', s.blink ? '1' : '0');
  params.set('dots', s.dots ? '1' : '0');
  params.set('mirror', s.mirror ? '1' : '0');
  return params.toString();
}

/** Reads a location.hash written by encodeShare(). Returns null when it holds no sign settings. */
export function decodeShare(hash: string, defaults: Settings): Settings | null {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  if (!SHARE_KEYS.some((key) => params.has(key))) return null;
  const out = normalizeSettings(
    {
      text: params.get('t') ?? undefined,
      fg: params.get('fg'),
      bg: params.get('bg'),
      dir: params.get('dir'),
      speed: params.get('speed'),
      size: params.get('size'),
      blink: params.get('blink'),
      dots: params.get('dots'),
      mirror: params.get('mirror'),
    },
    defaults,
  );
  if (out.text.trim() === '') out.text = defaults.text;
  return out;
}

/* ---------- Geometry (all in CSS px of the sign's own box) ---------- */

/** Font size for a box `boxHeight` px tall at `size` % (100 = fill the height). */
export function fontSizeFor(boxHeight: number, size: number): number {
  return boxHeight * FILL * (clamp(size, LIMITS.size[0], LIMITS.size[1]) / 100);
}

/**
 * Largest font size up to `maxFont` for which `fits(font)` holds, by bisection. Static text wraps at
 * spaces, so a name plus a greeting can grow onto two lines instead of shrinking onto one.
 */
export function fitFont(maxFont: number, fits: (font: number) => boolean, minFont = 6, steps = 12): number {
  if (maxFont <= minFont || fits(maxFont)) return maxFont;
  let lo = minFont;
  let hi = maxFont;
  for (let i = 0; i < steps; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Scroll speed in px per second; relative to the box height so every screen looks the same. */
export function speedPx(speed: number, boxHeight: number): number {
  return boxHeight * SPEED_FACTOR * clamp(speed, LIMITS.speed[0], LIMITS.speed[1]);
}

/**
 * Left edge of the text after it has travelled `travelled` px. Scrolling text enters at one edge,
 * leaves at the other, then starts again, so one cycle is box width + text width.
 */
export function scrollX(travelled: number, boxWidth: number, textWidth: number, dir: Direction): number {
  if (dir === 'static') return (boxWidth - textWidth) / 2;
  const cycle = boxWidth + textWidth;
  if (cycle <= 0) return 0;
  const p = ((travelled % cycle) + cycle) % cycle;
  return dir === 'left' ? boxWidth - p : p - textWidth;
}

/**
 * Static text first wraps only at spaces, so 「王小明 歡迎回台灣」 breaks where the user put the space.
 * When that leaves the text much smaller than breaking anywhere would (CJK text without spaces),
 * break anywhere instead.
 */
export const WRAP_ANYWHERE_GAIN = 1.25;

export function preferWrapAnywhere(atSpacesFont: number, anywhereFont: number): boolean {
  return anywhereFont > atSpacesFont * WRAP_ANYWHERE_GAIN;
}

/** Distance between LED dots for text of `fontSize` px. */
export function dotPitch(fontSize: number): number {
  return Math.max(2, fontSize / DOTS_PER_EM);
}

/**
 * Rotation of the sign in degrees. Full screen on a portrait screen (a phone with rotation lock held
 * sideways, or held upright) turns the text to run along the long side; `flipped` turns it 180°.
 */
export function rotationFor(width: number, height: number, full: boolean, flipped: boolean): 0 | 90 | 180 | 270 {
  if (!full) return 0;
  const base = height > width ? 90 : 0;
  return ((base + (flipped ? 180 : 0)) % 360) as 0 | 90 | 180 | 270;
}

/* ---------- Contrast (WCAG relative luminance) ---------- */

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two '#rrggbb' colors, 1 (same) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const ca = normalizeColor(a);
  const cb = normalizeColor(b);
  if (!ca || !cb) return 1;
  const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Below this the sign is hard to read from a distance (WCAG asks 3:1 for large text). */
export const MIN_CONTRAST = 3;
