// 擲筊 (moon blocks): outcome model, 三聖筊 tracking, history stats, shake detection and the toss path
// the animation follows. Pure functions; randomness is injected so tests can seed it.

/** Fills the array with uniformly random 32-bit integers. */
export type RandomSource = (array: Uint32Array) => Uint32Array;

const defaultRandom: RandomSource = (array) => {
  // TS 5.7+ types getRandomValues as ArrayBuffer-backed only; our buffers always are.
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

/** Which side of one block faces up: `flat` = 平面, `round` = 凸面 (the convex back). */
export type Face = 'flat' | 'round';

/**
 * - `sheng` 聖筊: one flat side and one round side up (神明同意, 允筊).
 * - `xiao` 笑筊: both FLAT sides up (神明笑而不答).
 * - `yin` 陰筊: both ROUND (convex) sides up (不同意, 再想想).
 */
export type Outcome = 'sheng' | 'xiao' | 'yin';
export const OUTCOMES: readonly Outcome[] = ['sheng', 'xiao', 'yin'];

/** `single` = one throw per question; `triple` = 連續三聖筊 confirmation. */
export type Mode = 'single' | 'triple';
export const MODES: readonly Mode[] = ['single', 'triple'];

export function outcomeOf(a: Face, b: Face): Outcome {
  if (a !== b) return 'sheng';
  return a === 'flat' ? 'xiao' : 'yin';
}

/** The faces that make up an outcome, for drawing legends: 聖筊 shows one of each. */
export function facesOf(outcome: Outcome): [Face, Face] {
  if (outcome === 'sheng') return ['flat', 'round'];
  return outcome === 'xiao' ? ['flat', 'flat'] : ['round', 'round'];
}

/** The top bit of a random word decides one block: 50% flat, 50% round. */
const faceOf = (word: number): Face => (word >>> 31 === 0 ? 'flat' : 'round');

/** One throw: each block lands flat or round side up independently, 50% each. */
export function throwBlocks(random: RandomSource = defaultRandom): [Face, Face] {
  const words = random(new Uint32Array(2));
  return [faceOf(words[0]), faceOf(words[1])];
}

/** Chance of each outcome with two fair blocks: 聖筊 has two of the four combinations. */
export const THEORETICAL: Readonly<Record<Outcome, number>> = { sheng: 0.5, xiao: 0.25, yin: 0.25 };

/** Average number of throws until `n` successes in a row, each with chance `p`. 三聖筊 (p = ½, n = 3) → 14. */
export function expectedThrowsForStreak(p: number, n: number): number {
  if (!(p > 0 && p <= 1) || !Number.isInteger(n) || n < 1) throw new RangeError('Invalid streak');
  if (p === 1) return n;
  return (1 / p ** n - 1) / (1 - p);
}

/* ---------- 連續三聖筊 ---------- */

export const STREAK_TARGET = 3;

export interface StreakStep {
  /** 聖筊 in a row after this throw (0 after a 笑筊 or 陰筊). */
  count: number;
  /** The target was just reached. */
  done: boolean;
  /** A run of at least one 聖筊 was cut short by this throw. */
  broken: boolean;
}

/** Next state of a 三聖筊 attempt. A finished attempt (count ≥ target) starts over with this throw. */
export function advanceStreak(count: number, outcome: Outcome, target = STREAK_TARGET): StreakStep {
  const before = count >= target ? 0 : Math.max(0, Math.floor(count) || 0);
  if (outcome !== 'sheng') return { count: 0, done: false, broken: before > 0 };
  const next = before + 1;
  return { count: next, done: next >= target, broken: false };
}

/* ---------- History ---------- */

export interface ThrowRecord {
  faces: [Face, Face];
  outcome: Outcome;
  mode: Mode;
  /** Epoch ms. */
  at: number;
  /** The question asked, if any. */
  q?: string;
  /** In `triple` mode: 聖筊 in a row after this throw. */
  streak?: number;
}

export interface Stats {
  total: number;
  counts: Record<Outcome, number>;
  /** 0–1 per outcome; all 0 when there are no throws. */
  shares: Record<Outcome, number>;
}

export function historyStats(records: readonly ThrowRecord[]): Stats {
  const counts: Record<Outcome, number> = { sheng: 0, xiao: 0, yin: 0 };
  for (const r of records) counts[r.outcome]++;
  const total = records.length;
  const share = (n: number) => (total === 0 ? 0 : n / total);
  return { total, counts, shares: { sheng: share(counts.sheng), xiao: share(counts.xiao), yin: share(counts.yin) } };
}

export const HISTORY_MAX = 100;
export const QUESTION_MAX = 60;

/** Appends a throw and keeps only the newest `max`. */
export function addRecord(history: readonly ThrowRecord[], record: ThrowRecord, max = HISTORY_MAX): ThrowRecord[] {
  return [...history, record].slice(-max);
}

export function cleanQuestion(text: unknown): string {
  return typeof text === 'string' ? Array.from(text.replace(/\s+/g, ' ').trim()).slice(0, QUESTION_MAX).join('') : '';
}

const isFace = (v: unknown): v is Face => v === 'flat' || v === 'round';
const isMode = (v: unknown): v is Mode => MODES.includes(v as Mode);

/** Keeps only well-formed records from storage; the outcome is always recomputed from the faces. */
export function normalizeHistory(raw: unknown, max = HISTORY_MAX): ThrowRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: ThrowRecord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const faces = r.faces;
    if (!Array.isArray(faces) || faces.length !== 2 || !isFace(faces[0]) || !isFace(faces[1])) continue;
    if (typeof r.at !== 'number' || !Number.isFinite(r.at)) continue;
    const record: ThrowRecord = {
      faces: [faces[0], faces[1]],
      outcome: outcomeOf(faces[0], faces[1]),
      mode: isMode(r.mode) ? r.mode : 'single',
      at: r.at,
    };
    const q = cleanQuestion(r.q);
    if (q) record.q = q;
    if (record.mode === 'triple' && typeof r.streak === 'number' && r.streak >= 0 && r.streak <= STREAK_TARGET) {
      record.streak = Math.floor(r.streak);
    }
    out.push(record);
  }
  return out.slice(-max);
}

export interface Prefs {
  mode: Mode;
  question: string;
  sound: boolean;
  history: ThrowRecord[];
}

export function normalizePrefs(raw: unknown): Prefs {
  const p = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    mode: isMode(p.mode) ? p.mode : 'single',
    question: cleanQuestion(p.question),
    sound: p.sound !== false,
    history: normalizeHistory(p.history),
  };
}

/* ---------- Shake to throw ---------- */

export const GRAVITY = 9.81;

export interface Motion {
  x: number | null;
  y: number | null;
  z: number | null;
}

/**
 * How hard the phone is moving, in m/s² without gravity. `includesGravity` is true for
 * DeviceMotionEvent.accelerationIncludingGravity, where a phone at rest reads about 9.81.
 */
export function motionForce(sample: Motion, includesGravity: boolean): number | null {
  const { x, y, z } = sample;
  if (x === null || y === null || z === null || ![x, y, z].every(Number.isFinite)) return null;
  const magnitude = Math.hypot(x, y, z);
  return includesGravity ? Math.abs(magnitude - GRAVITY) : magnitude;
}

export interface ShakeOptions {
  /** A jolt starts when the force rises to this (m/s²). */
  threshold: number;
  /** The force must fall below threshold × release before the next jolt can start. */
  release: number;
  /** Jolts needed inside `windowMs`. */
  jolts: number;
  windowMs: number;
  /** Jolts closer than this count once (one swing often crosses the threshold twice). */
  minGapMs: number;
  /** After a shake, ignore motion for this long. */
  cooldownMs: number;
}

/** Two firm swings within 0.9 s. Walking (2–5 m/s²) or picking the phone up (one jolt) does not throw. */
export const SHAKE: ShakeOptions = { threshold: 13, release: 0.6, jolts: 2, windowMs: 900, minGapMs: 90, cooldownMs: 1500 };

export interface ShakeState {
  above: boolean;
  jolts: number[];
  lastShake: number;
}

export function initialShake(): ShakeState {
  return { above: false, jolts: [], lastShake: Number.NEGATIVE_INFINITY };
}

/** Feeds one motion sample (force in m/s², time in ms); `shaken` is true on the sample that completes a shake. */
export function shakeStep(
  state: ShakeState,
  force: number,
  time: number,
  opts: ShakeOptions = SHAKE,
): { state: ShakeState; shaken: boolean } {
  let above = state.above;
  let jolts = state.jolts.filter((j) => time - j <= opts.windowMs);
  let rising = false;
  if (force >= opts.threshold) {
    rising = !above;
    above = true;
  } else if (force < opts.threshold * opts.release) {
    above = false;
  }
  if (time - state.lastShake < opts.cooldownMs) return { state: { above, jolts: [], lastShake: state.lastShake }, shaken: false };
  if (rising && (jolts.length === 0 || time - jolts[jolts.length - 1] >= opts.minGapMs)) jolts = [...jolts, time];
  if (jolts.length >= opts.jolts) return { state: { above, jolts: [], lastShake: time }, shaken: true };
  return { state: { above, jolts, lastShake: state.lastShake }, shaken: false };
}

/* ---------- Toss path (drawn by Tool.astro) ---------- */
// Stage units: a 360 × 250 floor seen from the front, y grows toward the viewer.

export const STAGE = { width: 360, height: 250 } as const;
/** Where the blocks are held before a throw: bottom centre, close to the viewer. */
export const HAND = { x: 180, y: 236 } as const;

/** Flip angle: cos ≥ 0 shows the flat side, cos < 0 the round side. */
export function faceAtFlip(flip: number): Face {
  return Math.cos(flip) >= 0 ? 'flat' : 'round';
}

export function flipFor(face: Face): number {
  return face === 'flat' ? 0 : Math.PI;
}

export interface Hop {
  start: number;
  end: number;
  height: number;
}

export interface TossPlan {
  face: Face;
  from: { x: number; y: number };
  to: { x: number; y: number };
  /** Extra sideways slide while bouncing. */
  slide: number;
  /** Airborne hops in ms from release: the throw itself, then two small bounces. */
  hops: Hop[];
  /** Everything has stopped (after rocking), ms. */
  settle: number;
  spinFrom: number;
  spinTo: number;
  flipFrom: number;
  flipTo: number;
  /** Rocking amplitude in radians after landing; only a convex underside rocks. */
  rock: number;
}

export interface Pose {
  x: number;
  y: number;
  /** Height above the floor. */
  h: number;
  /** In-plane rotation, degrees. */
  spin: number;
  /** Flip angle, radians (see faceAtFlip). */
  flip: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const easeOutQuad = (t: number) => 1 - (1 - t) ** 2;
const ROCK_MS = 620;

/**
 * Plans one block's toss from the hand to its landing spot so that it ends with `face` up.
 * `side` −1 lands left of centre, 1 right. `rand` only varies the look (0–1); the result is already decided.
 */
export function planToss(face: Face, startFace: Face, side: -1 | 1, rand: () => number = Math.random): TossPlan {
  const r = () => clamp01(rand());
  const flight = 720 + r() * 140;
  const peak = 92 + r() * 26;
  const b1 = 200 + r() * 50;
  const b2 = 105 + r() * 30;
  const hops: Hop[] = [
    { start: 0, end: flight, height: peak },
    { start: flight, end: flight + b1, height: peak * (0.08 + r() * 0.04) },
    { start: flight + b1, end: flight + b1 + b2, height: peak * (0.018 + r() * 0.012) },
  ];
  const landed = flight + b1 + b2;
  const rock = face === 'flat' ? 0.42 + r() * 0.12 : 0.06;

  // Half turns: an odd count changes the face. 5–8 half turns read as a real tumble.
  const change = face !== startFace;
  let halfTurns = 5 + Math.floor(r() * 4);
  if (halfTurns % 2 === (change ? 0 : 1)) halfTurns++;
  const flipFrom = flipFor(startFace);
  const flipTo = flipFrom + halfTurns * Math.PI * (r() < 0.5 ? -1 : 1);

  // Rest within ±35° of upright (crescent opening up): drawn in 2D, a block turned upside down
  // looks like a dome in profile and could be misread as the round side.
  const restAngle = (r() - 0.5) * 70;
  const turns = (1 + Math.floor(r() * 2)) * 360 * side;
  return {
    face,
    from: { x: HAND.x + side * (5 + r() * 6), y: HAND.y },
    to: { x: 180 + side * (64 + r() * 26), y: 150 + r() * 26 },
    slide: side * (6 + r() * 12),
    hops,
    settle: landed + (face === 'flat' ? ROCK_MS : 140),
    spinFrom: side * (8 + r() * 10),
    spinTo: restAngle + turns,
    flipFrom,
    flipTo,
    rock,
  };
}

/** Where a block is `ms` after release. Past `settle` it rests at the final pose. */
export function poseAt(plan: TossPlan, ms: number): Pose {
  const t = Math.max(0, ms);
  const [throwHop, bounce1] = plan.hops;
  const landed = plan.hops[plan.hops.length - 1].end;

  let h = 0;
  for (const hop of plan.hops) {
    if (t >= hop.start && t < hop.end) {
      const u = (t - hop.start) / (hop.end - hop.start);
      h = hop.height * 4 * u * (1 - u);
      break;
    }
  }

  let x: number;
  let y: number;
  if (t < throwHop.end) {
    const u = t / throwHop.end;
    x = lerp(plan.from.x, plan.to.x, u);
    y = lerp(plan.from.y, plan.to.y, easeOutQuad(u));
  } else {
    const u = clamp01((t - throwHop.end) / (landed - throwHop.end));
    x = plan.to.x + plan.slide * easeOutCubic(u);
    y = plan.to.y;
  }

  // The tumble slows down and finishes during the first bounce; then the block only rocks.
  const flipDone = bounce1.end;
  let flip = lerp(plan.flipFrom, plan.flipTo, easeOutQuad(clamp01(t / flipDone)));
  if (t > landed) {
    const tau = t - landed;
    flip += plan.rock * Math.exp(-tau / 170) * Math.sin((tau / 230) * Math.PI * 2);
  }
  if (t >= plan.settle) flip = plan.flipTo;

  const spin = lerp(plan.spinFrom, plan.spinTo, easeOutCubic(clamp01(t / landed)));
  return { x, y, h, spin, flip };
}

/** Moments a block hits the floor (ms from release) with a 0–1 loudness, for the clack sounds. */
export function impactsOf(plan: TossPlan): { at: number; strength: number }[] {
  const strengths = [1, 0.42, 0.16];
  return plan.hops.map((hop, i) => ({ at: hop.end, strength: strengths[i] ?? 0.1 }));
}

/**
 * Timing of a whole throw in ms from the click: `pickup` gathers the blocks into the hands,
 * the result shows shortly after the last block lands, never later than the end of the animation.
 */
export function tossTimeline(plans: readonly TossPlan[], pickup: number): { reveal: number; end: number } {
  const landed = Math.max(...plans.map((p) => p.hops[p.hops.length - 1].end));
  const end = pickup + Math.max(...plans.map((p) => p.settle));
  return { reveal: Math.min(pickup + landed + 160, end), end };
}

/** Resting pose of a block that has already landed. */
export function restingPose(plan: TossPlan): Pose {
  return poseAt(plan, plan.settle);
}

/**
 * Shifts a plan by whole turns so it starts from the angles a block is showing now
 * (spin to the nearest 360°, flip to the nearest 2π): picking it up never spins it visibly.
 */
export function alignPlan(plan: TossPlan, now: Pick<Pose, 'spin' | 'flip'>): TossPlan {
  const spinShift = 360 * Math.round((now.spin - plan.spinFrom) / 360);
  const flipShift = 2 * Math.PI * Math.round((now.flip - plan.flipFrom) / (2 * Math.PI));
  return {
    ...plan,
    spinFrom: plan.spinFrom + spinShift,
    spinTo: plan.spinTo + spinShift,
    flipFrom: plan.flipFrom + flipShift,
    flipTo: plan.flipTo + flipShift,
  };
}
