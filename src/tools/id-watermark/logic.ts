// Pure helpers for the ID watermark tool: text templates, colors, tile layout,
// mask rectangles, output sizes and file names. No DOM access, so it runs under vitest.

export type LayoutMode = 'tile' | 'center' | 'both';
export type MaskKind = 'black' | 'mosaic';
export type MaskMode = 'off' | MaskKind;
export type OutputFormat = 'jpeg' | 'png' | 'avif';
export type TemplateId = 'apply' | 'copy' | 'custom';
export type PresetId = Exclude<TemplateId, 'custom'>;
export type ColorId = 'red' | 'gray' | 'black' | 'blue' | 'white';

export interface Point {
  x: number;
  y: number;
}
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Mask extends Rect {
  kind: MaskKind;
}

export const LAYOUTS: LayoutMode[] = ['tile', 'center', 'both'];
export const TEMPLATES: TemplateId[] = ['apply', 'copy', 'custom'];
export const MASK_MODES: MaskMode[] = ['off', 'black', 'mosaic'];
export const COLOR_PRESETS: Record<ColorId, string> = {
  red: '#dc2626',
  gray: '#6b7280',
  black: '#111111',
  blue: '#1d4ed8',
  white: '#ffffff',
};
export const COLOR_IDS = Object.keys(COLOR_PRESETS) as ColorId[];
/** Longest output edge in px; 0 keeps the original size. */
export const MAX_SIDE_OPTIONS = [0, 3000, 2400, 1600, 1200] as const;
export const MAX_FILES = 20;
export const LINE_HEIGHT = 1.3;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const rad = (deg: number) => (deg * Math.PI) / 180;

// ---------- Watermark text ----------

/** One preset sentence in four shapes, depending on which fields the user filled in. */
export interface TemplateVariants {
  both: string;
  org: string;
  purpose: string;
  none: string;
}
export interface TextFields {
  org: string;
  purpose: string;
}

/** A fill-in field is a single short line: whitespace (incl. line breaks) collapses, length is capped. */
export function cleanField(value: unknown, max = 40): string {
  if (typeof value !== 'string') return '';
  return Array.from(value.replace(/\s+/g, ' ').trim()).slice(0, max).join('').trim();
}

/** Picks the variant that matches the filled fields and substitutes them. User text is inserted literally. */
export function fillTemplate(variants: TemplateVariants, fields: TextFields): string {
  const org = cleanField(fields.org);
  const purpose = cleanField(fields.purpose);
  const tpl = org && purpose ? variants.both : org ? variants.org : purpose ? variants.purpose : variants.none;
  return tpl.replace(/\{(org|purpose)\}/g, (_, key: string) => (key === 'org' ? org : purpose));
}

export const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Local calendar date of `now` as YYYY-MM-DD (the value format of <input type="date">). */
export function todayIso(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * '2026-11-04' + '{y}/{mm}/{dd}' → '2026/11/04'. Placeholders: {y} {m} {mm} {d} {dd} {mon}.
 * Returns null for anything that is not a real calendar date.
 */
export function formatIsoDate(iso: string, template: string, months: string[] = EN_MONTHS): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  const vars: Record<string, string> = {
    y: String(y),
    m: String(m),
    mm: match[2],
    d: String(d),
    dd: match[3],
    mon: months[m - 1] ?? String(m),
  };
  return template.replace(/\{(y|mm|m|dd|d|mon)\}/g, (_, key: string) => vars[key]);
}

/** Joins the sentence and the date with a locale pattern such as '{text}\n{date}' or '{text} – {date}'. */
export function composeText(sentence: string, date: string, join: string): string {
  const text = sentence.trim();
  if (!date) return text;
  if (!text) return date;
  return join.replace(/\{(text|date)\}/g, (_, key: string) => (key === 'text' ? text : date));
}

/** Watermark lines: tabs and runs of spaces collapse, blank lines drop, line count and length are capped. */
export function splitLines(text: string, maxLines = 6, maxChars = 80): string[] {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => Array.from(line.replace(/[ \t]+/g, ' ').trim()).slice(0, maxChars).join('').trim())
    .filter(Boolean)
    .slice(0, maxLines);
}

// ---------- Colors ----------

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** '#f00', 'f00', '#FF0000' → { r: 255, g: 0, b: 0 }; anything else → null. */
export function parseHexColor(input: unknown): Rgb | null {
  if (typeof input !== 'string') return null;
  const hex = input.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null;
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

/** Canonical '#rrggbb' or null. */
export function normalizeHex(input: unknown): string | null {
  const rgb = parseHexColor(input);
  return rgb ? toHex(rgb) : null;
}

export function rgbaString(hex: string, alpha: number): string {
  const { r, g, b } = parseHexColor(hex) ?? { r: 0, g: 0, b: 0 };
  const a = Number.isFinite(alpha) ? clamp(alpha, 0, 1) : 1;
  return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const ch = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** Outline that contrasts with the text color: white around dark text, near-black around light text. */
export function outlineColor(hex: string): string {
  const rgb = parseHexColor(hex);
  return rgb && relativeLuminance(rgb) > 0.4 ? '#111111' : '#ffffff';
}

/** Slider percent (5–100) → canvas alpha (0.05–1). */
export function opacityFromPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0.4;
  return clamp(percent, 5, 100) / 100;
}

/** Which preset swatch a color belongs to, or null for a custom color. */
export function colorIdOf(hex: string): ColorId | null {
  const norm = normalizeHex(hex);
  return COLOR_IDS.find((id) => COLOR_PRESETS[id] === norm) ?? null;
}

// ---------- Geometry ----------

/** Font size in px as a percentage of the image's short side, so every image gets the same look. */
export function fontSizePx(width: number, height: number, percent: number): number {
  const short = Math.min(width, height);
  if (!(short > 0)) return 0;
  const pct = Number.isFinite(percent) ? clamp(percent, 1, 20) : 4.5;
  return Math.max(6, Math.round((short * pct) / 100));
}

/** A point given relative to the image center, expressed in the text's rotated frame (u along the text). */
export function toRotatedFrame(x: number, y: number, angleDeg: number): { u: number; v: number } {
  const c = Math.cos(rad(angleDeg));
  const s = Math.sin(rad(angleDeg));
  return { u: x * c + y * s, v: -x * s + y * c };
}

/** Inverse of toRotatedFrame. */
export function fromRotatedFrame(u: number, v: number, angleDeg: number): Point {
  const c = Math.cos(rad(angleDeg));
  const s = Math.sin(rad(angleDeg));
  return { x: u * c - v * s, y: u * s + v * c };
}

/** Half extents of the image's bounding box in the rotated frame. */
export function rotatedExtent(width: number, height: number, angleDeg: number): { u: number; v: number } {
  const c = Math.abs(Math.cos(rad(angleDeg)));
  const s = Math.abs(Math.sin(rad(angleDeg)));
  return { u: (width / 2) * c + (height / 2) * s, v: (width / 2) * s + (height / 2) * c };
}

export interface TileInput {
  width: number;
  height: number;
  angleDeg: number;
  /** Size of one text block (all its lines). */
  cellW: number;
  cellH: number;
  gapX: number;
  gapY: number;
  /** Shift every other row by half a step (brick pattern). Default true. */
  stagger?: boolean;
  maxTiles?: number;
}

/**
 * Centers of the repeated text blocks, in the rotated frame around the image center
 * (draw with translate(w/2, h/2) + rotate(angle)). Every pixel of the image lies inside the
 * pitch cell (block + gap) of one returned tile, whatever the angle; tiles that cannot touch
 * the image are skipped.
 */
export function tileLayout(input: TileInput): Point[] {
  const { width, height, angleDeg, cellW, cellH } = input;
  if (!(width > 0 && height > 0 && cellW > 0 && cellH > 0)) return [];
  const pitchX = cellW + Math.max(0, input.gapX || 0);
  const pitchY = cellH + Math.max(0, input.gapY || 0);
  const stagger = input.stagger ?? true;
  const maxTiles = input.maxTiles ?? 5000;
  const ext = rotatedExtent(width, height, angleDeg);
  const rows = Math.ceil((ext.v + pitchY / 2) / pitchY);
  const cols = Math.ceil((ext.u + pitchX) / pitchX);
  const reach = Math.hypot(pitchX, pitchY) / 2;
  const out: Point[] = [];
  for (let j = -rows; j <= rows; j++) {
    const offset = stagger && Math.abs(j) % 2 === 1 ? pitchX / 2 : 0;
    for (let i = -cols; i <= cols; i++) {
      const u = i * pitchX + offset;
      const v = j * pitchY;
      const p = fromRotatedFrame(u, v, angleDeg);
      if (Math.abs(p.x) > width / 2 + reach || Math.abs(p.y) > height / 2 + reach) continue;
      out.push({ x: u, y: v });
      if (out.length >= maxTiles) return out;
    }
  }
  return out;
}

/** Length of the line through the image center at `angleDeg`, edge to edge. */
export function centerLineLength(width: number, height: number, angleDeg: number): number {
  const c = Math.abs(Math.cos(rad(angleDeg)));
  const s = Math.abs(Math.sin(rad(angleDeg)));
  const alongX = c > 1e-9 ? width / c : Infinity;
  const alongY = s > 1e-9 ? height / s : Infinity;
  return Math.min(alongX, alongY);
}

/**
 * Font size for the single large centered text: the widest line fills about 86% of the
 * center line, the block stays within 60% of the perpendicular span, and it never exceeds
 * a quarter of the short side. `widthAt100` is the widest line measured at 100px.
 */
export function centerFontSize(widthAt100: number, lineCount: number, width: number, height: number, angleDeg: number): number {
  if (!(widthAt100 > 0 && lineCount > 0 && width > 0 && height > 0)) return 0;
  const along = centerLineLength(width, height, angleDeg);
  const across = centerLineLength(width, height, angleDeg + 90);
  const byWidth = (100 * 0.86 * along) / widthAt100;
  const byHeight = (0.6 * across) / (lineCount * LINE_HEIGHT);
  const cap = Math.min(width, height) * 0.25;
  return Math.max(6, Math.floor(Math.min(byWidth, byHeight, cap)));
}

// ---------- Masks ----------

export function clampPoint(p: Point, width: number, height: number): Point {
  return { x: clamp(p.x, 0, width), y: clamp(p.y, 0, height) };
}

/** Pointer position over a displayed preview → image pixel coordinates, clamped to the image. */
export function toImagePoint(
  clientX: number,
  clientY: number,
  box: { left: number; top: number; width: number; height: number },
  imageW: number,
  imageH: number,
): Point {
  if (!(box.width > 0 && box.height > 0)) return { x: 0, y: 0 };
  return clampPoint(
    { x: ((clientX - box.left) / box.width) * imageW, y: ((clientY - box.top) / box.height) * imageH },
    imageW,
    imageH,
  );
}

/** Rectangle spanned by two drag points, in either direction, clamped to the image and snapped outward to whole pixels. */
export function rectFromPoints(a: Point, b: Point, width: number, height: number): Rect {
  const p = clampPoint(a, width, height);
  const q = clampPoint(b, width, height);
  const x = Math.floor(Math.min(p.x, q.x));
  const y = Math.floor(Math.min(p.y, q.y));
  const x2 = Math.ceil(Math.max(p.x, q.x));
  const y2 = Math.ceil(Math.max(p.y, q.y));
  return { x, y, w: x2 - x, h: y2 - y };
}

/** Drags smaller than this (a tap or a slip) do not create a mask. */
export function isUsableRect(r: Rect, minSize: number): boolean {
  return r.w >= minSize && r.h >= minSize;
}

/** Image-pixel rect → rect on a copy scaled by `factor`, rounded outward so nothing peeks out. */
export function scaleRect(r: Rect, factor: number): Rect {
  const x = Math.floor(r.x * factor);
  const y = Math.floor(r.y * factor);
  return { x, y, w: Math.ceil((r.x + r.w) * factor) - x, h: Math.ceil((r.y + r.h) * factor) - y };
}

/** Mosaic cell size for an image: coarse enough that digits and faces are unreadable. */
export function mosaicBlock(width: number, height: number): number {
  return Math.max(4, Math.round(Math.min(width, height) / 28));
}

/** Number of mosaic cells for a rect (at least one each way). */
export function mosaicGrid(r: Rect, block: number): { cols: number; rows: number } {
  const b = Math.max(1, block);
  return { cols: Math.max(1, Math.ceil(r.w / b)), rows: Math.max(1, Math.ceil(r.h / b)) };
}

// ---------- Output ----------

/** Shrinks to fit `maxLong` on the longest edge (0 = keep); never enlarges. */
export function fitWithin(width: number, height: number, maxLong: number): { width: number; height: number; scale: number } {
  const long = Math.max(width, height);
  if (!maxLong || maxLong <= 0 || long <= maxLong) return { width, height, scale: 1 };
  const scale = maxLong / long;
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)), scale };
}

export function outputMime(format: OutputFormat): 'image/png' | 'image/jpeg' | 'image/avif' {
  return format === 'png' ? 'image/png' : format === 'avif' ? 'image/avif' : 'image/jpeg';
}

/** JPG slider 10–100 → encoder 0.1–1; PNG ignores quality. */
export function encoderQuality(format: OutputFormat, quality: number): number | undefined {
  if (format === 'png') return undefined;
  if (!Number.isFinite(quality)) return 0.85;
  return clamp(quality, 10, 100) / 100;
}

/** 'IMG_1234.HEIC' + jpeg → 'IMG_1234-watermark.jpg'. Characters that break file systems become '_'. */
export function outputFilename(name: string, format: OutputFormat, suffix = '-watermark'): string {
  const dot = name.lastIndexOf('.');
  const stem = (dot > 0 ? name.slice(0, dot) : name)
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_')
    .trim();
  return `${stem || 'image'}${suffix}.${format === 'png' ? 'png' : format === 'avif' ? 'avif' : 'jpg'}`;
}

/** Makes names unique for a ZIP: a.jpg, a.jpg → a.jpg, a (2).jpg. */
export function uniqueNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    if (!used.has(name.toLowerCase())) {
      used.add(name.toLowerCase());
      return name;
    }
    const dot = name.lastIndexOf('.');
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    for (let n = 2; ; n++) {
      const candidate = `${stem} (${n})${ext}`;
      if (!used.has(candidate.toLowerCase())) {
        used.add(candidate.toLowerCase());
        return candidate;
      }
    }
  });
}

/** Accepts images by MIME type or, when the browser reports none, by extension. */
export function isImageFile(type: string, name: string): boolean {
  if (type.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|hif|tiff?)$/i.test(name);
}

// ---------- Settings ----------

export interface Style {
  layout: LayoutMode;
  /** '#rrggbb' */
  color: string;
  /** Font size, % of the short side. */
  size: number;
  /** Degrees; negative rises to the right. */
  angle: number;
  /** Gap between repeats, in multiples of the font size. */
  spacing: number;
  /** Percent, 5–100. */
  opacity: number;
  outline: boolean;
}

export interface Settings extends Style {
  template: TemplateId;
  org: string;
  purpose: string;
  dateOn: boolean;
  custom: string;
  format: OutputFormat;
  quality: number;
  pngLevel: number;
  maxSide: number;
}

export const STYLE_LIMITS = {
  size: { min: 2, max: 12, step: 0.5 },
  angle: { min: -90, max: 90, step: 5 },
  spacing: { min: 0.5, max: 5, step: 0.1 },
  opacity: { min: 5, max: 100, step: 1 },
  quality: { min: 10, max: 100, step: 1 },
} as const;

export const DEFAULT_STYLE: Style = {
  layout: 'tile',
  color: COLOR_PRESETS.red,
  size: 4.5,
  angle: -30,
  spacing: 1.8,
  opacity: 40,
  outline: false,
};

export const DEFAULT_SETTINGS: Settings = {
  ...DEFAULT_STYLE,
  template: 'apply',
  org: '',
  purpose: '',
  dateOn: true,
  custom: '',
  format: 'jpeg',
  quality: 85,
  pngLevel: 3,
  maxSide: 2400,
};

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? clamp(n, min, max) : fallback;
}
function pick<T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Validates settings read back from localStorage; bad or missing values take the default. */
export function normalizeSettings(raw: unknown, defaults: Settings = DEFAULT_SETTINGS): Settings {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const L = STYLE_LIMITS;
  return {
    layout: pick(r.layout, LAYOUTS, defaults.layout),
    color: normalizeHex(r.color) ?? defaults.color,
    size: num(r.size, defaults.size, L.size.min, L.size.max),
    angle: num(r.angle, defaults.angle, L.angle.min, L.angle.max),
    spacing: num(r.spacing, defaults.spacing, L.spacing.min, L.spacing.max),
    opacity: num(r.opacity, defaults.opacity, L.opacity.min, L.opacity.max),
    outline: bool(r.outline, defaults.outline),
    template: pick(r.template, TEMPLATES, defaults.template),
    org: typeof r.org === 'string' ? cleanField(r.org) : defaults.org,
    purpose: typeof r.purpose === 'string' ? cleanField(r.purpose) : defaults.purpose,
    dateOn: bool(r.dateOn, defaults.dateOn),
    custom: typeof r.custom === 'string' ? r.custom.slice(0, 400) : defaults.custom,
    format: pick(r.format, ['jpeg', 'png', 'avif'] as const, defaults.format),
    quality: Math.round(num(r.quality, defaults.quality, L.quality.min, L.quality.max)),
    pngLevel: Math.round(num(r.pngLevel, defaults.pngLevel, 1, 6)),
    maxSide: pick<number>(Number(r.maxSide), MAX_SIDE_OPTIONS, defaults.maxSide),
  };
}
