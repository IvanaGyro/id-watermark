// Scratch card maker. Pure, DOM-free: the card format inside the link, validation,
// prize draw, scratched-area math and message sizing. The canvas lives in scratch.ts.
//
// Link format: <page URL>#card=<base64url(UTF-8 JSON)>. The JSON carries a version field (v)
// and short keys so links stay short. Everything after # stays in the browser: it is never
// sent to a server and link previews cannot see it.

/** Fills the array with uniformly random 32-bit integers. Injected for testability. */
export type RandomSource = (array: Uint32Array) => Uint32Array;

const defaultRandom: RandomSource = (array) => {
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

export const FORMAT_VERSION = 1;
/** Only fragments that start with this are card data; other anchors (#faq …) are ignored. */
export const FRAGMENT_KEY = 'card=';

/** Limits in code points (an emoji or a CJK character counts as one). */
export const LIMITS = {
  message: 200,
  messageLines: 10,
  title: 30,
  from: 30,
  prize: 30,
  prizes: 10,
  /** Longest fragment accepted when decoding (characters after #). A full legit card is ~2,400. */
  fragment: 4096,
} as const;

export const COVERS = ['silver', 'gold', 'rose', 'mint', 'hearts', 'stars'] as const;
export type CoverId = (typeof COVERS)[number];

export const THEMES = ['cream', 'blush', 'sky', 'mint', 'lilac', 'night'] as const;
export type ThemeId = (typeof THEMES)[number];

export const THRESHOLD = { min: 30, max: 90, step: 5, default: 50 } as const;

export type CardMode = 'message' | 'prize';

/** A card as the recipient sees it. `prizes` non-empty = prize mode. */
export interface Card {
  message: string;
  title: string;
  from: string;
  cover: CoverId;
  theme: ThemeId;
  /** Percent of the cover that must be scratched off before it reveals itself. */
  threshold: number;
  prizes: string[];
}

/** What the maker form holds (and what is remembered in localStorage). */
export interface Draft {
  mode: CardMode;
  message: string;
  /** One prize per line, as typed. */
  prizesText: string;
  title: string;
  from: string;
  cover: CoverId;
  theme: ThemeId;
  threshold: number;
}

export const PRESET_IDS = ['confession', 'birthday', 'gender', 'prize', 'proposal', 'news'] as const;
export type PresetId = (typeof PRESET_IDS)[number];

/** Look of each use-case preset; the words live in i18n.ts. */
export const PRESET_STYLE: Record<PresetId, { mode: CardMode; cover: CoverId; theme: ThemeId; icon: string }> = {
  confession: { mode: 'message', cover: 'hearts', theme: 'blush', icon: 'Heart' },
  birthday: { mode: 'message', cover: 'gold', theme: 'cream', icon: 'Cake' },
  gender: { mode: 'message', cover: 'silver', theme: 'blush', icon: 'Baby' },
  prize: { mode: 'prize', cover: 'gold', theme: 'cream', icon: 'Gift' },
  proposal: { mode: 'message', cover: 'stars', theme: 'night', icon: 'Gem' },
  news: { mode: 'message', cover: 'silver', theme: 'mint', icon: 'Megaphone' },
};

export const isCover = (v: unknown): v is CoverId => typeof v === 'string' && (COVERS as readonly string[]).includes(v);
export const isTheme = (v: unknown): v is ThemeId => typeof v === 'string' && (THEMES as readonly string[]).includes(v);

/** Length in code points, so a CJK character or a character outside the BMP counts as one. */
export function charCount(text: string): number {
  let n = 0;
  for (const _ of text) n++;
  return n;
}

function sliceChars(text: string, max: number): string {
  return charCount(text) <= max ? text : Array.from(text).slice(0, max).join('');
}

// C0/C1 controls except tab and line feed, plus bidi overrides/isolates that could flip the layout.
const CONTROL_RE = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g;

/** Single-line field: no line breaks or control characters, trimmed, cut to `max`. */
export function cleanLine(text: string, max: number): string {
  return sliceChars(text.replace(/\r\n|\r|\n|\t/g, ' ').replace(CONTROL_RE, '').replace(/\s+/g, ' ').trim(), max);
}

/** Multi-line message: \n line breaks, at most one blank line in a row, at most `maxLines` lines. */
export function cleanMessage(text: string, max: number = LIMITS.message, maxLines: number = LIMITS.messageLines): string {
  const lines = text
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(CONTROL_RE, '')
    .split('\n')
    .map((line) => line.replace(/[^\S\n]+$/u, ''));
  const kept: string[] = [];
  for (const line of lines) {
    if (line.trim() === '' && (kept.length === 0 || kept[kept.length - 1] === '')) continue;
    kept.push(line.trim() === '' ? '' : line);
  }
  while (kept.length && kept[kept.length - 1] === '') kept.pop();
  if (kept.length > maxLines) kept.splice(maxLines - 1, kept.length, kept.slice(maxLines - 1).filter(Boolean).join(' '));
  return sliceChars(kept.join('\n'), max);
}

/** One prize per line; blank lines skipped, each cut to the prize limit, at most LIMITS.prizes. */
export function parsePrizes(text: string): string[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => cleanLine(line, LIMITS.prize))
    .filter(Boolean)
    .slice(0, LIMITS.prizes);
}

/** Lines that will not fit on the card because of the prize limit. */
export function overflowPrizes(text: string): number {
  const all = text.split(/\r\n|\r|\n/).filter((line) => cleanLine(line, LIMITS.prize) !== '').length;
  return Math.max(0, all - LIMITS.prizes);
}

export function clampThreshold(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return THRESHOLD.default;
  const stepped = Math.round(n / THRESHOLD.step) * THRESHOLD.step;
  return Math.min(THRESHOLD.max, Math.max(THRESHOLD.min, stepped));
}

/* ---------- Draft (maker form) ---------- */

export type DraftError = 'empty' | 'prizes' | null;

/** Validates a draft read from localStorage, falling back field by field. */
export function normalizeDraft(raw: unknown, fallback: Draft): Draft {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const str = (v: unknown, d: string, max: number) => (typeof v === 'string' ? sliceChars(v, max) : d);
  return {
    mode: o.mode === 'prize' || o.mode === 'message' ? o.mode : fallback.mode,
    message: str(o.message, fallback.message, LIMITS.message * 2),
    prizesText: str(o.prizesText, fallback.prizesText, (LIMITS.prize + 1) * LIMITS.prizes * 2),
    title: str(o.title, fallback.title, LIMITS.title),
    from: str(o.from, fallback.from, LIMITS.from),
    cover: isCover(o.cover) ? o.cover : fallback.cover,
    theme: isTheme(o.theme) ? o.theme : fallback.theme,
    threshold: o.threshold === undefined ? fallback.threshold : clampThreshold(o.threshold),
  };
}

/** Turns the form into a card, or says why it cannot be shared yet. */
export function cardFromDraft(draft: Draft): { card: Card; error: DraftError } {
  const prizes = draft.mode === 'prize' ? parsePrizes(draft.prizesText) : [];
  const card: Card = {
    message: draft.mode === 'message' ? cleanMessage(draft.message) : '',
    title: cleanLine(draft.title, LIMITS.title),
    from: cleanLine(draft.from, LIMITS.from),
    cover: draft.cover,
    theme: draft.theme,
    threshold: clampThreshold(draft.threshold),
    prizes,
  };
  let error: DraftError = null;
  if (draft.mode === 'message' && card.message === '') error = 'empty';
  if (draft.mode === 'prize' && prizes.length < 2) error = 'prizes';
  return { card, error };
}

/* ---------- Link encoding ---------- */

interface Wire {
  v: number;
  m?: string;
  t?: string;
  f?: string;
  c: string;
  b: string;
  r: number;
  p?: string[];
}

export function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(text) || text.length % 4 === 1) return null;
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** The fragment for a card, without the leading '#': 'card=eyJ2Ijox…'. */
export function encodeCard(card: Card): string {
  const wire: Wire = { v: FORMAT_VERSION, c: card.cover, b: card.theme, r: clampThreshold(card.threshold) };
  if (card.prizes.length) wire.p = card.prizes;
  else wire.m = card.message;
  if (card.title) wire.t = card.title;
  if (card.from) wire.f = card.from;
  return FRAGMENT_KEY + toBase64Url(new TextEncoder().encode(JSON.stringify(wire)));
}

/** Page URL without any fragment + '#card=…'. */
export function shareUrl(pageUrl: string, card: Card): string {
  const cut = pageUrl.indexOf('#');
  return `${cut < 0 ? pageUrl : pageUrl.slice(0, cut)}#${encodeCard(card)}`;
}

export type DecodeResult = { status: 'none' } | { status: 'invalid' } | { status: 'ok'; card: Card };

const INVALID: DecodeResult = { status: 'invalid' };

function textField(value: unknown, max: number, multiline: boolean): string | null {
  if (value === undefined) return '';
  if (typeof value !== 'string' || charCount(value) > max) return null;
  if (multiline && value.split(/\r\n|\r|\n/).length > LIMITS.messageLines) return null;
  return multiline ? cleanMessage(value, max) : cleanLine(value, max);
}

/**
 * Reads a card from location.hash. Never throws: anything that is not a well-formed v1 card
 * within the limits and whitelists is 'invalid'; a fragment that is not card data is 'none'.
 */
export function decodeCard(hash: string): DecodeResult {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw.startsWith(FRAGMENT_KEY)) return { status: 'none' };
  const payload = raw.slice(FRAGMENT_KEY.length);
  if (payload.length === 0 || raw.length > LIMITS.fragment) return INVALID;
  const bytes = fromBase64Url(payload);
  if (!bytes) return INVALID;

  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return INVALID;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return INVALID;
  const w = data as Record<string, unknown>;
  if (w.v !== FORMAT_VERSION || !isCover(w.c) || !isTheme(w.b)) return INVALID;
  if (typeof w.r !== 'number' || !Number.isFinite(w.r) || w.r < THRESHOLD.min || w.r > THRESHOLD.max) return INVALID;

  const message = textField(w.m, LIMITS.message, true);
  const title = textField(w.t, LIMITS.title, false);
  const from = textField(w.f, LIMITS.from, false);
  if (message === null || title === null || from === null) return INVALID;

  const prizes: string[] = [];
  if (w.p !== undefined) {
    if (!Array.isArray(w.p) || w.p.length < 2 || w.p.length > LIMITS.prizes) return INVALID;
    for (const item of w.p) {
      const prize = textField(item, LIMITS.prize, false);
      if (!prize) return INVALID;
      prizes.push(prize);
    }
  } else if (message === '') {
    return INVALID;
  }

  // With prizes it is a prize card; a stray message field is ignored.
  return {
    status: 'ok',
    card: { message: prizes.length ? '' : message, title, from, cover: w.c, theme: w.b, threshold: clampThreshold(w.r), prizes },
  };
}

/* ---------- Prize draw ---------- */

/** Unbiased integer in [0, max) by rejection sampling. */
export function randomIndex(max: number, random: RandomSource = defaultRandom): number {
  if (!Number.isInteger(max) || max < 1 || max > 0x1_0000_0000) throw new RangeError(`Invalid range: ${max}`);
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    value = random(buf)[0];
  } while (value >= limit);
  return value % max;
}

/** What the scratch area hides: the message, or one prize drawn at random (every time the card opens). */
export function hiddenText(card: Card, random: RandomSource = defaultRandom): string {
  return card.prizes.length ? card.prizes[randomIndex(card.prizes.length, random)] : card.message;
}

/* ---------- Scratching ---------- */

/**
 * Share of pixels that have been scratched off, 0–1, from RGBA canvas data (as from getImageData).
 * A pixel counts as scratched once its alpha drops below `cutoff`.
 */
export function scratchedRatio(rgba: ArrayLike<number>, cutoff = 128): number {
  const pixels = Math.floor(rgba.length / 4);
  if (pixels === 0) return 0;
  let cleared = 0;
  for (let i = 3; i < pixels * 4; i += 4) if (rgba[i] < cutoff) cleared++;
  return cleared / pixels;
}

/** True once the scratched share reaches the card's threshold (in percent). */
export function shouldReveal(ratio: number, thresholdPercent: number): boolean {
  return ratio * 100 >= clampThreshold(thresholdPercent) - 1e-9;
}

/* ---------- Message size ---------- */

// Wide characters take about one em; Latin letters, digits and punctuation about half.
const WIDE_RE = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]|[\u{1F000}-\u{1FAFF}\u{20000}-\u{3FFFD}]/u;

/** Rough rendered width of a line in em. */
export function textWidth(line: string): number {
  let w = 0;
  for (const ch of line) w += WIDE_RE.test(ch) ? 1 : ch === ' ' ? 0.3 : 0.58;
  return w;
}

export interface FitBox {
  /** Usable width and height in the same unit as the result (e.g. % of the card width). */
  width: number;
  height: number;
  lineHeight?: number;
}

const SIZES = [16, 13, 11, 9.5, 8, 7, 6, 5.2, 4.6, 4];

/** Smallest size worth keeping every line on one row for; below it, long lines may wrap instead. */
const MIN_UNWRAPPED = 6;

/**
 * Largest font size from a fixed scale at which the text fits the box. Used for the hidden message,
 * so 「是女生！」 fills the card and a long letter still fits. Short lines are kept whole when they
 * can be (a two-line note should not break as 「今晚的大餐我／請客」); only text too long for that wraps.
 */
export function fitFontSize(text: string, box: FitBox): number {
  const lineHeight = box.lineHeight ?? 1.35;
  const lines = text.split('\n');
  let wrapped = 0;
  for (const size of SIZES) {
    const perLine = box.width / size;
    let rows = 0;
    let fitsWidth = true;
    for (const line of lines) {
      const words = line.split(/(?<=\s)/);
      // A single word wider than the box would be broken mid-word; prefer a smaller size for it.
      if (words.some((word) => !WIDE_RE.test(word) && textWidth(word.trim()) > perLine)) fitsWidth = false;
      rows += Math.max(1, Math.ceil((textWidth(line) * 1.04) / perLine));
    }
    if (!fitsWidth || rows * size * lineHeight > box.height) continue;
    if (rows === lines.length) return size >= MIN_UNWRAPPED || !wrapped ? size : wrapped;
    wrapped ||= size;
  }
  return wrapped || SIZES[SIZES.length - 1];
}
