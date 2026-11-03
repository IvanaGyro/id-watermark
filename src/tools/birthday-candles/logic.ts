// Pure logic for the birthday-candles tool: the share-link format, candle rules and cake layout,
// blow detection on microphone analyser frames, tap hit tests and the "Happy Birthday" note table.
// No DOM here; the browser glue lives in Tool.astro, cake.ts, sound.ts and confetti.ts.
import { t } from '../../i18n/format';

/* ---------- Card data and the share link ---------- */

export const THEME_IDS = ['strawberry', 'chocolate', 'matcha', 'vanilla', 'blueberry'] as const;
export type ThemeId = (typeof THEME_IDS)[number];
export const DEFAULT_THEME: ThemeId = 'strawberry';

export const LIMITS = {
  name: 30,
  from: 30,
  message: 300,
  /** Lines kept in a message; any further line breaks become spaces. */
  messageLines: 12,
  minAge: 1,
  maxAge: 120,
  /** Longest fragment body (base64url characters) we try to decode. A full card is about 2,000. */
  hash: 4096,
} as const;

export interface Card {
  /** The birthday person. */
  name: string;
  age: number | null;
  message: string;
  /** The sender. */
  from: string;
  theme: ThemeId;
}

export const CARD_VERSION = 1;
/** The fragment looks like #c=<base64url of UTF-8 JSON>. Other fragments are left alone. */
export const HASH_KEY = 'c=';

// C0/C1 controls (except \n, handled separately), zero-width no-break space, and bidi
// overrides/isolates that could make a name render as something else.
const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

/** Trim, strip control characters and cut to `max` code points. Single-line text also folds whitespace. */
export function cleanText(value: unknown, max: number, multiline = false): string {
  if (typeof value !== 'string') return '';
  let text = value.normalize('NFC').replace(/\r\n?|[\u2028\u2029]/g, '\n').replace(/\t/g, ' ').replace(CONTROL, '');
  if (multiline) {
    text = text
      .split('\n')
      .map((line) => line.replace(/\s+$/u, ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    const lines = text.split('\n');
    if (lines.length > LIMITS.messageLines) {
      const keep = LIMITS.messageLines - 1;
      text = [...lines.slice(0, keep), lines.slice(keep).filter(Boolean).join(' ')].join('\n');
    }
  } else {
    text = text.replace(/\s+/gu, ' ').trim();
  }
  const chars = Array.from(text);
  return chars.length > max ? chars.slice(0, max).join('').trimEnd() : text;
}

/** Whole years between 1 and 120; accepts a number or a digit string (full-width digits too). */
export function parseAge(value: unknown): number | null {
  let n = Number.NaN;
  if (typeof value === 'number') n = value;
  else if (typeof value === 'string') {
    const digits = value.trim().replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    if (/^\d{1,3}$/.test(digits)) n = Number(digits);
  }
  return Number.isInteger(n) && n >= LIMITS.minAge && n <= LIMITS.maxAge ? n : null;
}

export function isTheme(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value);
}

/** Turn anything (form values, a stored draft, decoded JSON) into a valid card. */
export function normalizeCard(input: Partial<Record<keyof Card, unknown>> | null | undefined): Card {
  const src = input && typeof input === 'object' ? input : {};
  return {
    name: cleanText(src.name, LIMITS.name),
    age: parseAge(src.age),
    message: cleanText(src.message, LIMITS.message, true),
    from: cleanText(src.from, LIMITS.from),
    theme: isTheme(src.theme) ? src.theme : DEFAULT_THEME,
  };
}

export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text) || text.length % 4 === 1) return null;
  const padded = text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4);
  try {
    const binary = atob(padded);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

/** The fragment body for a card, without the leading '#'. Empty fields are left out to keep links short. */
export function encodeCard(card: Card): string {
  const c = normalizeCard(card);
  const data: Record<string, string | number> = { v: CARD_VERSION };
  if (c.name) data.n = c.name;
  if (c.age !== null) data.a = c.age;
  if (c.message) data.m = c.message;
  if (c.from) data.f = c.from;
  data.t = c.theme;
  return HASH_KEY + toBase64Url(new TextEncoder().encode(JSON.stringify(data)));
}

export type DecodeResult = { status: 'none' } | { status: 'invalid' } | { status: 'ok'; card: Card };

/**
 * Read a card from location.hash. 'none' = no card in the fragment (show the maker),
 * 'invalid' = it looks like a card link but cannot be read (show the maker with a notice).
 */
export function decodeHash(hash: string): DecodeResult {
  let raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (raw.includes('%')) {
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* keep the raw text; it fails below if it matters */
    }
  }
  if (!raw.startsWith(HASH_KEY)) return { status: 'none' };
  // Chat apps sometimes glue punctuation onto the end of a pasted link.
  const body = raw.slice(HASH_KEY.length).replace(/[^A-Za-z0-9_-]+$/, '');
  if (!body || body.length > LIMITS.hash) return { status: 'invalid' };
  const bytes = fromBase64Url(body);
  if (!bytes) return { status: 'invalid' };
  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return { status: 'invalid' };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { status: 'invalid' };
  const d = data as Record<string, unknown>;
  if (d.v !== CARD_VERSION) return { status: 'invalid' };
  // Links carry the age as a JSON number; only form input may be a digit string.
  const age = typeof d.a === 'number' ? d.a : null;
  return { status: 'ok', card: normalizeCard({ name: d.n, age, message: d.m, from: d.f, theme: d.t }) };
}

/** Full share link: the page URL without any old fragment, plus the card. */
export function shareUrl(pageUrl: string, card: Card): string {
  return `${pageUrl.split('#')[0]}#${encodeCard(card)}`;
}

/* ---------- Text shown on the cake ---------- */

export interface HeadlineTemplates {
  /** No name, no age. */
  plain: string;
  /** {name} */
  name: string;
  /** {age} = ordinal text */
  age: string;
  /** {name}, {age} */
  nameAge: string;
}

export function headline(card: Pick<Card, 'name' | 'age'>, tpl: HeadlineTemplates, ordinalText: (n: number) => string): string {
  const vars = { name: card.name, age: card.age === null ? '' : ordinalText(card.age) };
  if (card.name && card.age !== null) return t(tpl.nameAge, vars);
  if (card.name) return t(tpl.name, vars);
  if (card.age !== null) return t(tpl.age, vars);
  return tpl.plain;
}

export type OrdinalForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/** ordinal(21, { one: '{n}st', two: '{n}nd', few: '{n}rd', other: '{n}th' }, 'en') → '21st'. */
export function ordinal(n: number, forms: OrdinalForms, intlTag: string): string {
  const rule = new Intl.PluralRules(intlTag, { type: 'ordinal' }).select(n);
  return t(forms[rule] ?? forms.other, { n });
}

/* ---------- Candles ---------- */

/** Up to this age the cake gets one candle per year; older birthdays get number candles. */
export const MAX_CLASSIC = 10;
/** Candles on a cake without an age. */
export const DEFAULT_CANDLES = 5;

export type CandlePlan = { kind: 'classic'; count: number } | { kind: 'digits'; digits: number[] };

export function candlePlan(age: number | null): CandlePlan {
  if (age === null) return { kind: 'classic', count: DEFAULT_CANDLES };
  if (age <= MAX_CLASSIC) return { kind: 'classic', count: age };
  return { kind: 'digits', digits: String(age).split('').map(Number) };
}

export function flameCount(plan: CandlePlan): number {
  return plan.kind === 'classic' ? plan.count : plan.digits.length;
}

/** The cake drawing's coordinate system (SVG user units). */
export const CAKE = {
  width: 360,
  viewTop: 26,
  viewBottom: 296,
  cx: 180,
  /** Centre of the top (frosted) ellipse. */
  topY: 156,
  rx: 122,
  ry: 30,
  bodyHeight: 88,
  /** Five or more candles stand in two staggered rows this far from the centre line, over this width. */
  frontRow: 10,
  backRow: -8,
  spread: 190,
  candleWidth: 12,
  candleHeight: 50,
  digitSize: 88,
  rowGap: 46,
  digitGap: 58,
} as const;

export interface CandleSpot {
  /** Flame index, 0-based, in the order the plan lists candles (left to right). */
  index: number;
  x: number;
  /** Where the candle meets the cake. */
  base: number;
  /** Wick tip, where the flame sits. */
  top: number;
  width: number;
  height: number;
  /** 0.9 at the back of the cake, 1 at the front. */
  scale: number;
  digit?: number;
}

/** Candle positions; the result is sorted back to front, which is also the drawing order. */
export function layoutCandles(plan: CandlePlan): CandleSpot[] {
  const C = CAKE;
  const spots: CandleSpot[] = [];
  if (plan.kind === 'digits') {
    const n = plan.digits.length;
    const height = C.digitSize * 0.72;
    plan.digits.forEach((digit, i) => {
      const x = C.cx + (i - (n - 1) / 2) * C.digitGap;
      const base = C.topY + 6;
      spots.push({ index: i, x, base, top: base - height - 4, width: C.digitSize * 0.6, height, scale: 1, digit });
    });
    return spots;
  }
  const n = plan.count;
  if (n <= 4) {
    for (let i = 0; i < n; i++) {
      const x = C.cx + (i - (n - 1) / 2) * C.rowGap;
      const base = C.topY + 4;
      spots.push({ index: i, x, base, top: base - C.candleHeight - 6, width: C.candleWidth, height: C.candleHeight, scale: 1 });
    }
    return spots;
  }
  // Two staggered rows, so every candle has its own column and no flame hides behind another.
  // The pattern is mirrored: the ends and the middle stand in the front row.
  const gap = Math.min(C.rowGap, C.spread / (n - 1));
  for (let i = 0; i < n; i++) {
    const front = Math.min(i, n - 1 - i) % 2 === 0;
    const scale = front ? 1 : 0.92;
    const base = C.topY + (front ? C.frontRow : C.backRow);
    const height = C.candleHeight * scale;
    spots.push({
      index: i,
      x: C.cx + (i - (n - 1) / 2) * gap,
      base,
      top: base - height - 6 * scale,
      width: C.candleWidth * scale,
      height,
      scale,
    });
  }
  return spots.sort((a, b) => a.base - b.base || a.x - b.x);
}

/** The order a breath from in front of the cake puts candles out: the middle of the front row first, the far ends last. */
export function blowOrder(spots: CandleSpot[]): number[] {
  const fx = CAKE.cx;
  const fy = CAKE.topY + 80;
  return [...spots]
    .sort((a, b) => Math.hypot(a.x - fx, a.base - fy) - Math.hypot(b.x - fx, b.base - fy) || a.x - b.x)
    .map((s) => s.index);
}

export interface Point {
  x: number;
  y: number;
}

/** Index of the candle under a point (cake units), or -1. Where hit areas overlap, the nearest column wins. */
export function hitCandle(spots: CandleSpot[], p: Point, pad = 12): number {
  let best = -1;
  let bestDx = Infinity;
  for (const s of spots) {
    const dx = Math.abs(p.x - s.x);
    if (dx <= s.width / 2 + pad && p.y >= s.top - 30 - pad && p.y <= s.base + pad / 2 && dx < bestDx) {
      best = s.index;
      bestDx = dx;
    }
  }
  return best;
}

/** Candles a swipe from `a` to `b` passes over, in the order it meets them. */
export function sweepCandles(spots: CandleSpot[], a: Point, b: Point, pad = 12): number[] {
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 4));
  const hits: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const hit = hitCandle(spots, { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }, pad);
    if (hit >= 0 && !hits.includes(hit)) hits.push(hit);
  }
  return hits;
}

/* ---------- Blow detection ---------- */

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const SILENT_DB = -160;

/** RMS level of a block of samples in dBFS. */
export function rmsDb(samples: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  const rms = samples.length ? Math.sqrt(sum / samples.length) : 0;
  return rms > 0 ? Math.max(SILENT_DB, 20 * Math.log10(rms)) : SILENT_DB;
}

export interface SpectrumFeatures {
  /**
   * How noise-like the 150–2,350 Hz range is: spectral flatness measured in 200 Hz bands and averaged,
   * weighted by band energy. Breath noise scores high (about 0.5–0.9); voiced speech, even breathy speech,
   * singing and tones mostly stay under 0.45 because their energy sits in narrow harmonic peaks.
   */
  flatness: number;
  /** Share of 60–8,000 Hz energy below 1 kHz. Blowing on a mic is a low rumble; "sss" and hiss are not. */
  lowShare: number;
}

/** Features of one AnalyserNode frequency frame (getFloatFrequencyData, dB per bin). */
export function spectrumFeatures(db: ArrayLike<number>, binHz: number): SpectrumFeatures {
  const power = (k: number) => {
    const d = db[k];
    return 10 ** ((Number.isFinite(d) ? Math.max(d, SILENT_DB) : SILENT_DB) / 10);
  };
  const bin = (hz: number) => Math.min(db.length, Math.max(0, Math.round(hz / binHz)));

  let low = 0;
  let all = 0;
  const lowEnd = bin(1000);
  for (let k = bin(60); k < bin(8000); k++) {
    const p = power(k);
    all += p;
    if (k < lowEnd) low += p;
  }

  let weighted = 0;
  let weights = 0;
  for (let lo = 150; lo < 2350; lo += 200) {
    const a = bin(lo);
    const b = bin(lo + 200);
    if (b - a < 4) continue;
    let arith = 0;
    let logSum = 0;
    for (let k = a; k < b; k++) {
      const p = power(k);
      arith += p;
      logSum += Math.log(p);
    }
    // Sum of geometric means over sum of arithmetic means = flatness per band, weighted by band energy.
    weighted += Math.exp(logSum / (b - a));
    weights += arith / (b - a);
  }
  return { flatness: weights > 0 ? weighted / weights : 0, lowShare: all > 0 ? low / all : 0 };
}

export interface Features extends SpectrumFeatures {
  levelDb: number;
}

export interface BlowTuning {
  /** A blow starts to count at this level (dBFS) and counts fully at fullDb. */
  minDb: number;
  fullDb: number;
  minFlatness: number;
  minLowShare: number;
  /** A breath-like sound must last this long before any candle goes out (rejects claps and coughs). */
  onsetMs: number;
  /** Gaps up to this long do not end a blow. */
  gapMs: number;
}

export const DEFAULT_TUNING: BlowTuning = {
  minDb: -32,
  fullDb: -16,
  minFlatness: 0.44,
  minLowShare: 0.45,
  onsetMs: 180,
  gapMs: 90,
};

/** Thresholds from the room's background level, measured for a moment after the mic opens. */
export function tuningFor(noiseFloorDb: number, base: BlowTuning = DEFAULT_TUNING): BlowTuning {
  const floor = Number.isFinite(noiseFloorDb) ? noiseFloorDb : SILENT_DB;
  const minDb = clamp(floor + 24, -34, -24);
  return { ...base, minDb, fullDb: minDb + 16 };
}

export function median(values: number[]): number {
  if (!values.length) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** 0 when the frame is not breath-like, else 0.25–1 by loudness. */
export function blowStrength(f: Features, tune: BlowTuning): number {
  if (!(f.levelDb >= tune.minDb) || f.flatness < tune.minFlatness || f.lowShare < tune.minLowShare) return 0;
  return clamp(0.25 + (0.75 * (f.levelDb - tune.minDb)) / (tune.fullDb - tune.minDb), 0, 1);
}

/** Seconds of full-strength blowing to put out `n` candles; weaker blows take longer. */
export function blowSeconds(n: number): number {
  return 0.4 + 0.14 * n;
}

export interface BlowState {
  /** How long the current breath-like sound has lasted. */
  sustainMs: number;
  gapMs: number;
  /** Candles' worth of blowing so far: floor(progress) candles are out, the fraction is the next one. */
  progress: number;
  /** How far the flames lean, 0–1 (smoothed, for drawing). */
  lean: number;
  /** Strength of the blow that is counting right now, 0 when none. */
  strength: number;
  /** Loud sound that is not breath, e.g. talking or music, recently. */
  talkMs: number;
}

export const IDLE_BLOW: BlowState = { sustainMs: 0, gapMs: 0, progress: 0, lean: 0, strength: 0, talkMs: 0 };

/** Advance the detector by one analyser frame. `total` = candles on the cake. */
export function stepBlow(prev: BlowState, f: Features, dtMs: number, total: number, tune: BlowTuning = DEFAULT_TUNING): BlowState {
  // A long frame (tab in the background, a hiccup) must not count as a long blow.
  const dt = clamp(dtMs, 0, 100);
  const raw = blowStrength(f, tune);
  let { sustainMs, gapMs, progress, talkMs } = prev;

  if (raw > 0) {
    sustainMs += dt;
    gapMs = 0;
  } else {
    gapMs += dt;
    if (gapMs > tune.gapMs) sustainMs = 0;
  }
  const blowing = raw > 0 && sustainMs >= tune.onsetMs;
  const perCandle = blowSeconds(Math.max(1, total)) / Math.max(1, total);
  if (blowing) {
    progress = Math.min(total, progress + (raw * dt) / 1000 / perCandle);
  } else {
    // A half-blown flame recovers when the breath stops.
    progress = Math.max(Math.floor(progress), progress - (dt / 1000) * 0.6);
  }

  const loud = f.levelDb >= tune.minDb;
  talkMs = loud && raw === 0 ? talkMs + dt : Math.max(0, talkMs - dt * 0.25);

  // Flames sway a little with any sound and lean hard while a real blow counts.
  const loudness = clamp((f.levelDb - (tune.minDb - 18)) / (tune.fullDb - tune.minDb + 18), 0, 1);
  const target = blowing ? 0.45 + 0.55 * raw : raw > 0 ? 0.12 + 0.2 * raw : 0.2 * loudness;
  const tau = target > prev.lean ? 60 : 280;
  const lean = prev.lean + (target - prev.lean) * (1 - Math.exp(-dt / tau));

  return { sustainMs, gapMs, progress, lean, strength: blowing ? raw : 0, talkMs };
}

/* ---------- "Happy Birthday to You" (public domain melody), in G major, 3/4 ---------- */

export interface Note {
  /** MIDI note number (60 = middle C). */
  midi: number;
  beats: number;
}

const D4 = 62;
const E4 = 64;
const FS4 = 66;
const G4 = 67;
const A4 = 69;
const B4 = 71;
const C5 = 72;
const D5 = 74;
const n = (midi: number, beats: number): Note => ({ midi, beats });

export const MELODY: Note[] = [
  // Hap-py birth-day to you
  n(D4, 0.75), n(D4, 0.25), n(E4, 1), n(D4, 1), n(G4, 1), n(FS4, 2),
  // Hap-py birth-day to you
  n(D4, 0.75), n(D4, 0.25), n(E4, 1), n(D4, 1), n(A4, 1), n(G4, 2),
  // Hap-py birth-day dear [name]
  n(D4, 0.75), n(D4, 0.25), n(D5, 1), n(B4, 1), n(G4, 1), n(FS4, 1), n(E4, 1),
  // Hap-py birth-day to you
  n(C5, 0.75), n(C5, 0.25), n(B4, 1), n(G4, 1), n(A4, 1), n(G4, 3),
];

/** Bass roots under the melody: `at` = beat where the note starts (beat 0 is the pick-up). */
export const BASS: { midi: number; at: number; beats: number }[] = [
  { midi: 43, at: 1, beats: 3 }, // G
  { midi: 50, at: 4, beats: 3 }, // D
  { midi: 50, at: 7, beats: 3 }, // D
  { midi: 43, at: 10, beats: 3 }, // G
  { midi: 43, at: 13, beats: 3 }, // G
  { midi: 48, at: 16, beats: 3 }, // C
  { midi: 43, at: 19, beats: 2 }, // G
  { midi: 50, at: 21, beats: 1 }, // D
  { midi: 43, at: 22, beats: 3 }, // G
];

export function midiToHz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function totalBeats(notes: Note[]): number {
  return notes.reduce((sum, note) => sum + note.beats, 0);
}

export interface ScheduledNote {
  start: number;
  duration: number;
  hz: number;
}

/** Start times and lengths in seconds at a tempo (quarter notes per minute). */
export function schedule(notes: Note[], bpm: number): ScheduledNote[] {
  const beat = 60 / bpm;
  let at = 0;
  return notes.map((note) => {
    const out = { start: at * beat, duration: note.beats * beat, hz: midiToHz(note.midi) };
    at += note.beats;
    return out;
  });
}
