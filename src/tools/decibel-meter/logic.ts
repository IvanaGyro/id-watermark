// Pure, DOM-free helpers for the decibel meter: levels, time weighting, statistics,
// A-weighting filter design, the reference chart and the scream challenge.
//
// Level pipeline (per animation frame, per frequency weighting):
//   samples -> mean square (ms) -> exponential time weighting (Fast 125 ms / Slow 1 s) on ms
//   -> dBFS = 10·log10(ms) -> estimated dB SPL = dBFS + calibration offset.
// dBFS here is plain 20·log10(RMS): a full-scale sine reads -3.01 dBFS, a full-scale square 0 dBFS.

// Microphone errors and permission help are shared with mic-test (and webcam-test).
export { describeMediaError, detectEnv, deviceLabel, permissionHelp } from '../mic-test/logic';

/** Level reported for digital silence. */
export const DBFS_FLOOR = -100;
/** Default calibration offset: estimated dB = dBFS + offset. A starting point, not a measured value. */
export const DEFAULT_OFFSET = 94;
export const OFFSET_MIN = 40;
export const OFFSET_MAX = 160;
/** Range of the gauge, the history graph and the reference chart (estimated dB). */
export const SCALE_MIN = 20;
export const SCALE_MAX = 120;
/** Sound level meter time constants (IEC 61672): Fast 125 ms, Slow 1 s. */
export const TAU_MS = { fast: 125, slow: 1000 } as const;
/** Readings start after the stream has settled, so the first silent buffers don't become the minimum. */
export const WARMUP_MS = 300;
/** A sample this close to full scale means the input clipped. */
export const CLIP_LEVEL = 0.985;

export type TimeWeighting = keyof typeof TAU_MS;
export type FreqWeighting = 'A' | 'Z';

// ---------- Levels ----------

/** Mean of the squared samples (signal power relative to full scale). */
export function meanSquare(samples: ArrayLike<number>): number {
  const n = samples.length;
  if (n === 0) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += samples[i] * samples[i];
  return sum / n;
}

export function rmsOf(samples: ArrayLike<number>): number {
  return Math.sqrt(meanSquare(samples));
}

/** Largest absolute sample value. */
export function peakOf(samples: ArrayLike<number>): number {
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = Math.abs(samples[i]);
    if (v > max) max = v;
  }
  return max;
}

/** Mean square to dBFS (10·log10), floored at DBFS_FLOOR. */
export function msToDbfs(ms: number): number {
  if (!(ms > 0)) return DBFS_FLOOR;
  return Math.max(DBFS_FLOOR, 10 * Math.log10(ms));
}

/** RMS amplitude to dBFS (20·log10), floored at DBFS_FLOOR. */
export function rmsToDbfs(rms: number): number {
  return msToDbfs(rms * rms);
}

/** dB back to a power ratio: 10^(dB/10). */
export function dbToPower(db: number): number {
  return 10 ** (db / 10);
}

/** Estimated sound level in dB, one decimal, never below 0. */
export function estimateDb(dbfs: number, offset: number): number {
  return Math.max(0, Math.round((dbfs + offset) * 10) / 10);
}

// ---------- Time weighting ----------

/** Weight of a new value in an exponential average after `dtMs`: 1 − e^(−dt/τ). */
export function smoothingFactor(dtMs: number, tauMs: number): number {
  if (!(dtMs > 0)) return 0;
  if (!(tauMs > 0)) return 1;
  return 1 - Math.exp(-dtMs / tauMs);
}

/**
 * Exponential time weighting applied to mean square (power), as sound level meters do.
 * `previous` null starts the average at the current value.
 */
export function smoothPower(previous: number | null, current: number, dtMs: number, tauMs: number): number {
  if (previous === null || !Number.isFinite(previous)) return current;
  return previous + smoothingFactor(dtMs, tauMs) * (current - previous);
}

// ---------- Statistics ----------

/**
 * Running min / max of the time-weighted level, plus the energy needed for the average.
 * The average is the energy average (Leq), as real meters report it: 10·log10 of the mean power,
 * not the arithmetic mean of dB values. A loud moment raises it more than a quiet moment lowers it
 * (60 dB and 80 dB for equal time average to 77 dB, not 70 dB).
 */
export interface LevelStats {
  /** Lowest time-weighted level, dBFS. */
  min: number;
  /** Highest time-weighted level, dBFS. */
  max: number;
  /** Σ power × time (ms). */
  energy: number;
  /** Σ time (ms). */
  duration: number;
}

export function emptyStats(): LevelStats {
  return { min: Infinity, max: -Infinity, energy: 0, duration: 0 };
}

/**
 * Adds one frame: `levelDbfs` is the time-weighted level, `power` the mean square to average,
 * `weightMs` the time the frame stands for. The meter passes the time-weighted power, so the average
 * always lies between min and max; exponential weighting keeps the energy, so after a few time
 * constants this average equals the Leq of the raw signal.
 */
export function addToStats(stats: LevelStats, levelDbfs: number, power: number, weightMs: number): LevelStats {
  const w = weightMs > 0 ? weightMs : 0;
  return {
    min: Math.min(stats.min, levelDbfs),
    max: Math.max(stats.max, levelDbfs),
    energy: stats.energy + Math.max(0, power) * w,
    duration: stats.duration + w,
  };
}

export interface StatsSummary {
  min: number;
  max: number;
  /** Energy average (Leq), dBFS. */
  leq: number;
  duration: number;
}

/** min / max / Leq in dBFS, or null before any frame was added. */
export function summarize(stats: LevelStats): StatsSummary | null {
  if (!(stats.duration > 0) || !Number.isFinite(stats.min)) return null;
  return { min: stats.min, max: stats.max, leq: msToDbfs(stats.energy / stats.duration), duration: stats.duration };
}

/** Energy average of equally weighted levels in dB: 10·log10(mean(10^(L/10))). */
export function energyAverage(levels: readonly number[]): number {
  if (levels.length === 0) return Number.NaN;
  let sum = 0;
  for (const l of levels) sum += dbToPower(l);
  return 10 * Math.log10(sum / levels.length);
}

/** Fixed-size ring buffer of numbers, oldest first. */
export class Ring {
  private data: Float64Array;
  private start = 0;
  private count = 0;

  constructor(capacity: number) {
    this.data = new Float64Array(Math.max(1, Math.floor(capacity)));
  }

  get capacity(): number {
    return this.data.length;
  }

  get length(): number {
    return this.count;
  }

  push(value: number): void {
    const cap = this.data.length;
    if (this.count < cap) {
      this.data[(this.start + this.count) % cap] = value;
      this.count++;
    } else {
      this.data[this.start] = value;
      this.start = (this.start + 1) % cap;
    }
  }

  /** i = 0 is the oldest value. */
  at(i: number): number {
    return this.data[(this.start + i) % this.data.length];
  }

  /** The newest `n` values (all when n is omitted), oldest first. */
  last(n = this.count): number[] {
    const k = Math.max(0, Math.min(n, this.count));
    const out: number[] = [];
    for (let i = this.count - k; i < this.count; i++) out.push(this.at(i));
    return out;
  }

  clear(): void {
    this.start = 0;
    this.count = 0;
  }
}

// ---------- Display ----------

/** Position on the gauge, 0 at SCALE_MIN and 1 at SCALE_MAX. */
export function gaugeFraction(db: number, min = SCALE_MIN, max = SCALE_MAX): number {
  if (!Number.isFinite(db) || db <= min) return 0;
  if (db >= max) return 1;
  return (db - min) / (max - min);
}

export type Zone = 'quiet' | 'moderate' | 'loud';

/** Colour band for a level: below 70 dB, 70–85 dB, 85 dB and up. */
export function zoneFor(db: number): Zone {
  if (db >= 85) return 'loud';
  if (db >= 70) return 'moderate';
  return 'quiet';
}

/** Levels of the reference chart (labels live in i18n.ts, one per level, same order). */
export const REFERENCE_LEVELS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120] as const;

/** Index of the reference row nearest to `db` (halfway rounds up), or -1 without a reading. */
export function nearestReferenceIndex(db: number, levels: readonly number[] = REFERENCE_LEVELS): number {
  if (!Number.isFinite(db) || levels.length === 0) return -1;
  let best = 0;
  for (let i = 1; i < levels.length; i++) {
    if (Math.abs(levels[i] - db) <= Math.abs(levels[best] - db)) best = i;
  }
  return best;
}

/** 83 000 ms → '1:23'; an hour or more → '1:02:03'. */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

// ---------- Calibration ----------

export function clampOffset(offset: number): number {
  if (!Number.isFinite(offset)) return DEFAULT_OFFSET;
  return Math.min(OFFSET_MAX, Math.max(OFFSET_MIN, Math.round(offset * 10) / 10));
}

/** A reference reading must look like a real sound level meter value. */
export const REFERENCE_MIN = 20;
export const REFERENCE_MAX = 140;

/**
 * Offset that makes the measured level read as the reference meter does, or null if the
 * reference is out of range or there is no usable measurement.
 */
export function calibrationOffset(referenceDb: number, measuredDbfs: number): number | null {
  if (!Number.isFinite(referenceDb) || referenceDb < REFERENCE_MIN || referenceDb > REFERENCE_MAX) return null;
  if (!Number.isFinite(measuredDbfs) || measuredDbfs <= DBFS_FLOOR) return null;
  return clampOffset(referenceDb - measuredDbfs);
}

// ---------- A-weighting ----------

/** Pole frequencies of the A-weighting curve (IEC 61672-1), Hz. */
const F1 = 20.598997;
const F2 = 107.65265;
const F3 = 737.86223;
const F4 = 12194.217;

/** A-weighting in dB at frequency f (analog curve, 0 dB at 1 kHz). */
export function aWeightingDb(f: number): number {
  if (!(f > 0)) return -Infinity;
  const f2 = f * f;
  const ra = (F4 * F4 * f2 * f2) / ((f2 + F1 * F1) * Math.sqrt((f2 + F2 * F2) * (f2 + F3 * F3)) * (f2 + F4 * F4));
  return 20 * Math.log10(ra) + 2.0;
}

/** Second-order IIR section, a[0] = 1. Feeds Web Audio's IIRFilterNode directly. */
export interface Biquad {
  b: [number, number, number];
  a: [number, number, number];
}

type FirstOrder = { b: [number, number]; a: [number, number] };

/**
 * Analog corner (rad/s) to feed the bilinear transform for a pole at `f` Hz. Full pre-warping puts
 * the digital pole exactly at `f`; `amount` < 1 pre-warps part of the way.
 */
function prewarp(f: number, fs: number, amount = 1): number {
  const x = (Math.PI * Math.min(f, fs * 0.45)) / fs;
  return 2 * Math.PI * f * (1 + amount * (Math.tan(x) / x - 1));
}

/**
 * How far to pre-warp the 12.2 kHz poles. Full pre-warping fixes the corner but overshoots the
 * 4–10 kHz slope by up to 0.8 dB at 44.1 / 48 kHz; half-way keeps the whole 20 Hz–10 kHz range
 * within about 0.4 dB of the analog curve.
 */
const HIGH_PREWARP = 0.5;

/**
 * Bilinear transform (s = 2fs·(1−z⁻¹)/(1+z⁻¹)) of s/(s+w) or w/(s+w); both have unity gain in the
 * pass band, so every section keeps coefficients near 1.
 */
function firstOrder(kind: 'high' | 'low', f: number, fs: number): FirstOrder {
  const k = 2 * fs;
  const w = prewarp(f, fs, kind === 'low' ? HIGH_PREWARP : 1);
  const a: [number, number] = [k + w, w - k];
  const b: [number, number] = kind === 'high' ? [k, -k] : [w, w];
  return { b, a };
}

function combine(p: FirstOrder, q: FirstOrder): Biquad {
  const a0 = p.a[0] * q.a[0];
  return {
    b: [(p.b[0] * q.b[0]) / a0, (p.b[0] * q.b[1] + p.b[1] * q.b[0]) / a0, (p.b[1] * q.b[1]) / a0],
    a: [1, (p.a[0] * q.a[1] + p.a[1] * q.a[0]) / a0, (p.a[1] * q.a[1]) / a0],
  };
}

/** Magnitude response of a cascade of biquads at frequency f, in dB. */
export function biquadsResponseDb(sections: readonly Biquad[], f: number, fs: number): number {
  const w = (2 * Math.PI * f) / fs;
  const c1 = Math.cos(w);
  const s1 = Math.sin(w);
  const c2 = Math.cos(2 * w);
  const s2 = Math.sin(2 * w);
  let db = 0;
  for (const { b, a } of sections) {
    const nr = b[0] + b[1] * c1 + b[2] * c2;
    const ni = -(b[1] * s1 + b[2] * s2);
    const dr = a[0] + a[1] * c1 + a[2] * c2;
    const di = -(a[1] * s1 + a[2] * s2);
    db += 10 * Math.log10((nr * nr + ni * ni) / (dr * dr + di * di));
  }
  return db;
}

/**
 * Digital A-weighting filter for a sample rate: three biquads (two double poles at 20.6 Hz and
 * 12.2 kHz, single poles at 107.7 Hz and 737.9 Hz), bilinear transform with each corner pre-warped,
 * normalized to 0 dB at 1 kHz. Close to the analog curve up to about 10 kHz at 44.1 / 48 kHz.
 */
export function aWeightingBiquads(sampleRate: number): Biquad[] {
  const fs = sampleRate;
  const sections = [
    combine(firstOrder('high', F1, fs), firstOrder('high', F1, fs)),
    combine(firstOrder('high', F2, fs), firstOrder('high', F3, fs)),
    combine(firstOrder('low', F4, fs), firstOrder('low', F4, fs)),
  ];
  const gain = 10 ** (-biquadsResponseDb(sections, 1000, fs) / 20);
  const [first] = sections;
  first.b = [first.b[0] * gain, first.b[1] * gain, first.b[2] * gain];
  return sections;
}

/** Runs samples through a cascade of biquads (transposed direct form II). For tests and offline use. */
export function applyBiquads(sections: readonly Biquad[], samples: ArrayLike<number>): Float64Array {
  const out = Float64Array.from(samples as ArrayLike<number>);
  for (const { b, a } of sections) {
    let z1 = 0;
    let z2 = 0;
    for (let i = 0; i < out.length; i++) {
      const x = out[i];
      const y = b[0] * x + z1;
      z1 = b[1] * x - a[1] * y + z2;
      z2 = b[2] * x - a[2] * y;
      out[i] = y;
    }
  }
  return out;
}

// ---------- Scream challenge ----------

export const COUNTDOWN_MS = 3000;
export const MEASURE_MS = 3000;

export type ChallengePhase = 'countdown' | 'measure' | 'done';

export interface ChallengeClock {
  phase: ChallengePhase;
  /** 3, 2, 1 during the countdown; 0 otherwise. */
  count: number;
  /** 0–1 progress through the measuring window. */
  progress: number;
}

/** Where the challenge is, `elapsedMs` after the start button. */
export function challengeClock(elapsedMs: number, countdownMs = COUNTDOWN_MS, measureMs = MEASURE_MS): ChallengeClock {
  const t = Math.max(0, elapsedMs);
  if (t < countdownMs) return { phase: 'countdown', count: Math.ceil((countdownMs - t) / 1000), progress: 0 };
  const m = t - countdownMs;
  if (m < measureMs) return { phase: 'measure', count: 0, progress: m / measureMs };
  return { phase: 'done', count: 0, progress: 1 };
}

export type RankId = 'whisper' | 'chat' | 'strong' | 'loud' | 'roar' | 'siren';

/** Rank by peak level (estimated dB): each entry applies from `min` up to the next one. */
export const RANKS: readonly { id: RankId; min: number }[] = [
  { id: 'whisper', min: -Infinity },
  { id: 'chat', min: 60 },
  { id: 'strong', min: 70 },
  { id: 'loud', min: 80 },
  { id: 'roar', min: 90 },
  { id: 'siren', min: 100 },
];

export function rankFor(peakDb: number): RankId {
  let id: RankId = RANKS[0].id;
  for (const rank of RANKS) if (peakDb >= rank.min) id = rank.id;
  return id;
}

export interface ChallengeResult {
  /** Highest Fast-weighted level in the window, estimated dB. */
  peak: number;
  /** Energy average over the window, estimated dB. */
  avg: number;
  rank: RankId;
  /** The input reached full scale: the real level may be higher. */
  clipped: boolean;
}

/** Scores a challenge from the window's Fast maximum and Leq (both dBFS). */
export function scoreChallenge(peakDbfs: number, leqDbfs: number, offset: number, clipped = false): ChallengeResult {
  const peak = estimateDb(peakDbfs, offset);
  const avg = Math.min(peak, estimateDb(leqDbfs, offset));
  return { peak, avg, rank: rankFor(peak), clipped };
}

export interface BestScore {
  peak: number;
  avg: number;
  /** ISO date of the attempt. */
  date: string;
  weighting: FreqWeighting;
}

/** Validates a stored best score; anything malformed becomes null. */
export function normalizeBest(raw: unknown): BestScore | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const peak = Number(r.peak);
  const avg = Number(r.avg);
  if (!Number.isFinite(peak) || !Number.isFinite(avg) || peak < 0 || peak > 200) return null;
  return {
    peak,
    avg: Math.min(avg, peak),
    date: typeof r.date === 'string' ? r.date : '',
    weighting: r.weighting === 'Z' ? 'Z' : 'A',
  };
}

export function isNewBest(result: ChallengeResult, best: BestScore | null): boolean {
  return best === null || result.peak > best.peak;
}

// ---------- Preferences ----------

export interface Prefs {
  offset: number;
  weighting: FreqWeighting;
  time: TimeWeighting;
  deviceId: string;
}

export const DEFAULT_PREFS: Prefs = { offset: DEFAULT_OFFSET, weighting: 'A', time: 'fast', deviceId: '' };

export function normalizePrefs(raw: unknown): Prefs {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    offset: r.offset === undefined ? DEFAULT_OFFSET : clampOffset(Number(r.offset)),
    weighting: r.weighting === 'Z' ? 'Z' : 'A',
    time: r.time === 'slow' ? 'slow' : 'fast',
    deviceId: typeof r.deviceId === 'string' ? r.deviceId : '',
  };
}

// ---------- Result card ----------

/** 'scream-challenge-20261104-92dB.png'. */
export function cardFilename(date: Date, peak: number): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `scream-challenge-${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${Math.round(peak)}dB.png`;
}

/**
 * Greedy line wrapping for canvas text. Latin words stay whole; CJK text may break between any
 * two characters, but not before closing punctuation. `measure` returns a string's width.
 */
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const tokens = text.match(/[A-Za-z0-9'’.,:;!?%()\-–]+|\s+|./gu) ?? [];
  const lines: string[] = [];
  let line = '';
  for (const token of tokens) {
    const next = line + token;
    if (line && measure(next.trimEnd()) > maxWidth && !/^[、。，．！？）」』：；,.!?)]/u.test(token)) {
      lines.push(line.trimEnd());
      line = /^\s+$/.test(token) ? '' : token;
    } else {
      line = next;
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}
