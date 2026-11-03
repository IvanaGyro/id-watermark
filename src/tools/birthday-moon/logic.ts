// What the Moon looked like on a date: phase, age, illumination, the surrounding lunation,
// full-moon birthdays and the 19-year (Metonic) echo. Pure functions; astronomy lives in astronomy.ts.

import { illuminationAt, lunationAt, phaseMs, SYNODIC_MONTH } from './astronomy';
import { instantToZoned, isValidTimeZone, zonedToInstant } from '../timezone-converter/logic';
import { fromDayNumber, isLeapYear, parseISODate, toDayNumber, toISODate, type YMD } from '../date-diff/logic';

export { SYNODIC_MONTH } from './astronomy';
export type { YMD } from '../date-diff/logic';

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** Date range offered in the UI and accepted from share links. */
export const MIN_DATE = '1900-01-01';
export const MAX_DATE = '2100-12-31';
/** Time used when none is given: "that night". */
export const DEFAULT_TIME = '21:00';
/** Illuminated fraction from which a moon counts as "nearly full". */
export const NEAR_FULL = 0.97;

export const PHASE_IDS = [
  'new',
  'waxingCrescent',
  'firstQuarter',
  'waxingGibbous',
  'full',
  'waningGibbous',
  'lastQuarter',
  'waningCrescent',
] as const;
export type PhaseId = (typeof PHASE_IDS)[number];

/** The four instants of a lunation, plus the next new moon. */
export const EVENT_KINDS = ['new', 'firstQuarter', 'full', 'lastQuarter'] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export interface PhaseEvent {
  kind: EventKind;
  /** UT instant, ms. */
  at: number;
}

/** Common zones offered in the picker (labels live in i18n.ts). */
export const ZONES = [
  'Asia/Taipei',
  'Asia/Tokyo',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Pacific/Honolulu',
  'Australia/Sydney',
  'Australia/Perth',
  'Pacific/Auckland',
  'UTC',
] as const;

/* ---------- Dates, times and zones ---------- */

/** "HH:MM" → minutes after midnight, or null. */
export function parseTime(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

export function formatTime(minutes: number): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(minutes / 60))}:${p(minutes % 60)}`;
}

/** A valid ISO date inside MIN_DATE…MAX_DATE, or null. */
export function parseDate(value: unknown): YMD | null {
  if (typeof value !== 'string' || value.length > 10) return null;
  const date = parseISODate(value);
  if (!date) return null;
  const iso = toISODate(date);
  return iso >= MIN_DATE && iso <= MAX_DATE ? date : null;
}

/** UT instant of a wall-clock time in a zone. An empty or invalid time means DEFAULT_TIME. */
export function instantOf(date: YMD, time: string, zone: string): number {
  const minutes = parseTime(time) ?? parseTime(DEFAULT_TIME)!;
  const tz = isValidTimeZone(zone) ? zone : 'UTC';
  return zonedToInstant({ year: date.y, month: date.m, day: date.d, hour: Math.floor(minutes / 60), minute: minutes % 60 }, tz).instant;
}

/** Calendar date of an instant in a zone. */
export function localDate(at: number, zone: string): YMD {
  const z = instantToZoned(at, isValidTimeZone(zone) ? zone : 'UTC');
  return { y: z.year, m: z.month, d: z.day };
}

/** Calendar date of an instant at a fixed UTC offset (minutes), e.g. 480 for the Chinese calendar. */
export function dateAtOffset(at: number, offsetMinutes: number): YMD {
  return fromDayNumber(Math.floor((at + offsetMinutes * 60_000) / DAY_MS));
}

/* ---------- The moon on a date ---------- */

export interface MoonReport {
  at: number;
  /** Days since the last new moon. */
  age: number;
  /** Illuminated fraction, 0–1. */
  fraction: number;
  /** Moon minus Sun apparent longitude, 0–360°. */
  elongation: number;
  waxing: boolean;
  phase: PhaseId;
  /** Previous new moon, first quarter, full moon, last quarter, next new moon. */
  cycle: PhaseEvent[];
  /** Position within the cycle, 0–1. */
  progress: number;
  nearestNew: PhaseEvent;
  nearestFull: PhaseEvent;
}

function eventsOf(k: number): PhaseEvent[] {
  return [
    { kind: 'new', at: phaseMs(k) },
    { kind: 'firstQuarter', at: phaseMs(k + 0.25) },
    { kind: 'full', at: phaseMs(k + 0.5) },
    { kind: 'lastQuarter', at: phaseMs(k + 0.75) },
    { kind: 'new', at: phaseMs(k + 1) },
  ];
}

function nearest(at: number, a: PhaseEvent, b: PhaseEvent): PhaseEvent {
  return Math.abs(a.at - at) <= Math.abs(b.at - at) ? a : b;
}

/**
 * Phase name for an instant. A principal phase (new, quarters, full) is named when it happens on
 * the same local calendar day, or within 12 hours; otherwise the in-between phase follows the elongation.
 */
export function classifyPhase(at: number, elongation: number, events: PhaseEvent[], zone: string): PhaseId {
  const day = toDayNumber(localDate(at, zone));
  let best: PhaseEvent | null = null;
  for (const e of events) {
    const close = Math.abs(e.at - at) <= 12 * HOUR_MS || toDayNumber(localDate(e.at, zone)) === day;
    if (close && (!best || Math.abs(e.at - at) < Math.abs(best.at - at))) best = e;
  }
  if (best) return best.kind;
  if (elongation < 90) return 'waxingCrescent';
  if (elongation < 180) return 'waxingGibbous';
  if (elongation < 270) return 'waningGibbous';
  return 'waningCrescent';
}

export function moonReport(at: number, zone: string): MoonReport {
  const k = lunationAt(at);
  const cycle = eventsOf(k);
  const ill = illuminationAt(at);
  const prevFull: PhaseEvent = { kind: 'full', at: phaseMs(k - 0.5) };
  const prevLast: PhaseEvent = { kind: 'lastQuarter', at: phaseMs(k - 0.25) };
  const start = cycle[0].at;
  const end = cycle[4].at;
  return {
    at,
    age: (at - start) / DAY_MS,
    fraction: ill.fraction,
    elongation: ill.elongation,
    waxing: ill.waxing,
    phase: classifyPhase(at, ill.elongation, [prevLast, ...cycle], zone),
    cycle,
    progress: (at - start) / (end - start),
    nearestNew: nearest(at, cycle[0], cycle[4]),
    nearestFull: nearest(at, prevFull, cycle[2]),
  };
}

/**
 * Day of the lunar month (1 = the day of the new moon) for a calendar date, counted at a fixed
 * UTC offset: +9:00 gives the Japanese 旧暦 day, +8:00 the Chinese 農曆 day.
 */
export function lunarDay(date: YMD, offsetMinutes: number): number {
  const endOfDay = (toDayNumber(date) + 1) * DAY_MS - offsetMinutes * 60_000;
  const k = lunationAt(endOfDay - 1);
  const first = dateAtOffset(phaseMs(k), offsetMinutes);
  return toDayNumber(date) - toDayNumber(first) + 1;
}

/** Signed difference b − a between two moon ages, wrapped into half a synodic month. */
export function ageDifference(a: number, b: number): number {
  let d = b - a;
  while (d > SYNODIC_MONTH / 2) d -= SYNODIC_MONTH;
  while (d <= -SYNODIC_MONTH / 2) d += SYNODIC_MONTH;
  return d;
}

/* ---------- Birthdays ---------- */

/** The same month and day in another year; 29 February becomes 28 February in common years. */
export function sameDayIn(date: YMD, year: number): YMD {
  if (date.m === 2 && date.d === 29 && !isLeapYear(year)) return { y: year, m: 2, d: 28 };
  return { y: year, m: date.m, d: date.d };
}

export interface FullMoonYear {
  year: number;
  date: YMD;
  fraction: number;
  waxing: boolean;
  /** The full moon itself falls on that local date. */
  exact: boolean;
}

/**
 * Upcoming anniversaries of `date` (from `today` on) when the moon is full or nearly full
 * (at least NEAR_FULL lit at the chosen time).
 */
export function fullMoonBirthdays(
  date: YMD,
  time: string,
  zone: string,
  today: YMD,
  { count = 6, years = 100, lastYear = 2200 } = {},
): FullMoonYear[] {
  const out: FullMoonYear[] = [];
  let year = toDayNumber(sameDayIn(date, today.y)) >= toDayNumber(today) ? today.y : today.y + 1;
  const stop = Math.min(year + years, lastYear);
  for (; year <= stop && out.length < count; year++) {
    const day = sameDayIn(date, year);
    const report = moonReport(instantOf(day, time, zone), zone);
    const full = report.nearestFull;
    const exact = toDayNumber(localDate(full.at, zone)) === toDayNumber(day);
    if (exact || report.fraction >= NEAR_FULL) {
      out.push({ year, date: day, fraction: report.fraction, waxing: report.waxing, exact });
    }
  }
  return out;
}

export interface Echo {
  /** Years after the date. */
  years: number;
  date: YMD;
  age: number;
  fraction: number;
  waxing: boolean;
  /** Moon age on the echo date minus the age on the original date, days. */
  ageDiff: number;
}

/**
 * The moon on the same date 19, 38, 57 … years later. 235 synodic months (6,939.69 days) are almost
 * exactly 19 years (6,939 or 6,940 days), so the phase comes back to within about a day.
 */
export function metonicEchoes(date: YMD, time: string, zone: string, cycles: number[] = [19, 38, 57]): Echo[] {
  const base = moonReport(instantOf(date, time, zone), zone);
  return cycles
    .map((years) => {
      const day = sameDayIn(date, date.y + years);
      const r = moonReport(instantOf(day, time, zone), zone);
      return { years, date: day, age: r.age, fraction: r.fraction, waxing: r.waxing, ageDiff: ageDifference(base.age, r.age) };
    })
    .filter((e) => toISODate(e.date) <= '2200-12-31');
}

/* ---------- Input, preferences and share links ---------- */

export interface MoonInput {
  /** ISO date. */
  date: string;
  /** "HH:MM" or "" (= DEFAULT_TIME). */
  time: string;
  /** IANA time zone. */
  zone: string;
  /** Southern hemisphere view. */
  south: boolean;
}

function validZone(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 64 && /^[A-Za-z0-9_+\-/]+$/.test(value) && isValidTimeZone(value);
}

/** Keeps the valid fields of an untrusted object (localStorage, share link) and falls back for the rest. */
export function normalizeInput(raw: unknown, fallback: MoonInput): MoonInput {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const date = parseDate(r.date);
  const minutes = parseTime(r.time);
  return {
    date: date ? toISODate(date) : fallback.date,
    time: r.time === '' ? '' : minutes !== null ? formatTime(minutes) : fallback.time,
    zone: validZone(r.zone) ? r.zone : fallback.zone,
    south: typeof r.south === 'boolean' ? r.south : fallback.south,
  };
}

/** Reads ?d=YYYY-MM-DD&t=HH:MM&tz=Area/City&h=s from a share link. Null when there is no valid date. */
export function parseShareQuery(search: string): Partial<MoonInput> | null {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search.slice(0, 300));
  } catch {
    return null;
  }
  const date = parseDate(params.get('d'));
  if (!date) return null;
  const out: Partial<MoonInput> = { date: toISODate(date) };
  const minutes = parseTime(params.get('t'));
  if (minutes !== null) out.time = formatTime(minutes);
  const zone = params.get('tz');
  if (validZone(zone)) out.zone = zone;
  const h = params.get('h');
  if (h === 's' || h === 'n') out.south = h === 's';
  return out;
}

export function shareQuery(input: MoonInput): string {
  const params = new URLSearchParams({ d: input.date });
  if (input.time) params.set('t', input.time);
  params.set('tz', input.zone);
  if (input.south) params.set('h', 's');
  return `?${params.toString()}`;
}

/* ---------- Names ---------- */

/**
 * The name shown for a phase. Locales with traditional names per lunar day (Japanese 三日月, 十六夜 …)
 * use them for the in-between phases; principal phases keep their own name.
 */
export function phaseName(
  phase: PhaseId,
  names: Record<PhaseId, string>,
  day?: number,
  traditional?: Partial<Record<number, string>>,
): string {
  const principal = phase === 'new' || phase === 'firstQuarter' || phase === 'full' || phase === 'lastQuarter';
  if (!principal && day !== undefined && traditional?.[day]) return traditional[day]!;
  return names[phase];
}
