// 人生進度條 / Life in Weeks: a life drawn as a grid of weeks, one row per year of age.
// Pure functions on {y, m, d} dates; the page passes in today's local date and the time of day.
//
// Each row starts on a birthday and has 52 cells. A year is 365 or 366 days (52 weeks + 1–2 days),
// so the last cell of a row absorbs the extra day or two and every row starts on the birthday again.

import { birthdayInYear } from '../age-calculator/logic';
import { compareYMD, diffDays, fromDayNumber, parseISODate, toDayNumber, toISODate, weekdayOf, type YMD } from '../date-diff/logic';
import { lunarNewYear, MAX_YEAR as LUNAR_MAX, MIN_YEAR as LUNAR_MIN } from '../lunar-converter/logic';

export type { YMD } from '../date-diff/logic';

export const WEEKS_PER_ROW = 52;
export const MIN_BIRTH_YEAR = 1900;
export const MAX_PEOPLE = 6;
export const MAX_NAME = 30;
const DAY_MS = 86_400_000;
const YEAR_DAYS = 365.2425;

export const LIMITS = {
  lifespan: [1, 120],
  age: [0, 120],
  perYear: [0, 365],
  stageAge: [0, 120],
} as const;

export interface Person {
  /** Optional label, e.g. 「媽媽」. */
  name: string;
  /** Their age now, in years. */
  age: number;
  /** How many times a year you see them. */
  perYear: number;
}

export interface Settings {
  /** 'YYYY-MM-DD'. */
  birth: string;
  /** Expected lifespan in whole years: an assumption the user picks, not a prediction. */
  lifespan: number;
  stagesOn: boolean;
  /** Ages where school starts, school ends and work ends. */
  schoolStart: number;
  schoolEnd: number;
  retire: number;
  people: Person[];
}

export const DEFAULT_SETTINGS: Settings = {
  birth: '1990-06-15',
  lifespan: 80,
  stagesOn: false,
  schoolStart: 6,
  schoolEnd: 22,
  retire: 65,
  people: [{ name: '', age: 60, perYear: 6 }],
};

/* ---------- Input ---------- */

const clamp = (n: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, n));

/** A finite number from user or stored input, or null for blanks and junk. */
function num(value: unknown): number | null {
  if (value === '' || value === null || value === undefined || typeof value === 'boolean') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizePerson(raw: unknown): Person | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const age = num(r.age);
  const perYear = num(r.perYear);
  if (age === null || perYear === null) return null;
  return {
    name: typeof r.name === 'string' ? r.name.trim().slice(0, MAX_NAME) : '',
    age: Math.round(clamp(age, LIMITS.age)),
    perYear: Math.round(clamp(perYear, LIMITS.perYear) * 100) / 100,
  };
}

/** Coerces stored, shared or typed values into valid settings, falling back to `defaults` field by field. */
export function normalizeSettings(raw: unknown, defaults: Settings = DEFAULT_SETTINGS): Settings {
  const out: Settings = { ...defaults, people: defaults.people.map((p) => ({ ...p })) };
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.birth === 'string') {
    const date = parseISODate(r.birth);
    if (date && date.y >= MIN_BIRTH_YEAR) out.birth = toISODate(date);
  }
  const lifespan = num(r.lifespan);
  if (lifespan !== null) out.lifespan = Math.round(clamp(lifespan, LIMITS.lifespan));
  if (typeof r.stagesOn === 'boolean') out.stagesOn = r.stagesOn;
  for (const key of ['schoolStart', 'schoolEnd', 'retire'] as const) {
    const value = num(r[key]);
    if (value !== null) out[key] = Math.round(clamp(value, LIMITS.stageAge));
  }
  if (Array.isArray(r.people)) {
    out.people = r.people
      .slice(0, MAX_PEOPLE)
      .map(normalizePerson)
      .filter((p): p is Person => p !== null);
  }
  return out;
}

export type BirthError = 'empty' | 'invalid' | 'future' | 'tooOld';

/** Validates the birth date field against today. */
export function checkBirth(value: string, today: YMD): { birth: YMD } | { error: BirthError } {
  if (!value.trim()) return { error: 'empty' };
  const birth = parseISODate(value);
  if (!birth) return { error: 'invalid' };
  if (birth.y < MIN_BIRTH_YEAR) return { error: 'tooOld' };
  if (compareYMD(birth, today) > 0) return { error: 'future' };
  return { birth };
}

/* ---------- Share links (#b=1990-06-15&l=80&s=1&a=6~22~65&p=60~6~Mom) ---------- */

export function encodeShare(s: Settings): string {
  const q = new URLSearchParams();
  q.set('b', s.birth);
  q.set('l', String(s.lifespan));
  q.set('s', s.stagesOn ? '1' : '0');
  q.set('a', [s.schoolStart, s.schoolEnd, s.retire].join('~'));
  for (const p of s.people) q.append('p', [p.age, p.perYear, p.name].join('~'));
  return q.toString();
}

/** Reads a share hash or query string. Returns null when it holds no birth date; never throws. */
export function decodeShare(hash: string): Partial<Settings> | null {
  let q: URLSearchParams;
  try {
    q = new URLSearchParams(hash.replace(/^[#?]/, ''));
  } catch {
    return null;
  }
  const birth = q.get('b');
  if (!birth || !parseISODate(birth)) return null;
  const out: Partial<Settings> = { birth };
  const lifespan = num(q.get('l'));
  if (lifespan !== null) out.lifespan = lifespan;
  const stages = q.get('s');
  if (stages === '1' || stages === '0') out.stagesOn = stages === '1';
  const ages = (q.get('a') ?? '').split('~').map(num);
  if (ages.length === 3 && ages.every((n) => n !== null)) {
    [out.schoolStart, out.schoolEnd, out.retire] = ages as number[];
  }
  out.people = q
    .getAll('p')
    .slice(0, MAX_PEOPLE)
    .map((value) => {
      const [age, perYear, ...name] = value.split('~');
      return normalizePerson({ age, perYear, name: name.join('~') });
    })
    .filter((p): p is Person => p !== null);
  return out;
}

/* ---------- The life grid ---------- */

/** First day of row `row`: the day you turn `row`. A 2/29 birthday falls on 3/1 in common years. */
export function rowStart(birth: YMD, row: number): YMD {
  return birthdayInYear(birth, birth.y + row);
}

/** Completed years on `today` (expects birth <= today). */
export function ageOn(birth: YMD, today: YMD): number {
  let age = today.y - birth.y;
  if (compareYMD(rowStart(birth, age), today) > 0) age--;
  return Math.max(0, age);
}

/** Row (age) and column (0–51) of the cell that contains `date`. */
export function cellOf(birth: YMD, date: YMD): { row: number; col: number } {
  const row = ageOn(birth, date);
  const col = Math.min(WEEKS_PER_ROW - 1, Math.floor(diffDays(rowStart(birth, row), date) / 7));
  return { row, col };
}

/** First and last day (inclusive) of a cell. The last cell of a row runs to the day before the next birthday. */
export function cellRange(birth: YMD, row: number, col: number): { from: YMD; to: YMD } {
  const start = toDayNumber(rowStart(birth, row));
  const next = toDayNumber(rowStart(birth, row + 1));
  const from = start + col * 7;
  const to = col >= WEEKS_PER_ROW - 1 ? next - 1 : from + 6;
  return { from: fromDayNumber(from), to: fromDayNumber(to) };
}

export interface Life {
  birth: YMD;
  today: YMD;
  /** The day you turn `lifespan`. */
  end: YMD;
  lifespan: number;
  age: number;
  /** Current cell: row = age, col = week of that year of life, cell = row × 52 + col. */
  row: number;
  col: number;
  cell: number;
  daysLived: number;
  totalDays: number;
  /** 0 once the lifespan setting is reached. */
  daysLeft: number;
  /** Calendar weeks (days ÷ 7), which run slightly ahead of the cell count. */
  weeksLived: number;
  weeksLeft: number;
  /** Rows to draw: the lifespan, or more when you are already past it. */
  rows: number;
  /** Today is on or after the day you turn `lifespan`. */
  passed: boolean;
  isBirthday: boolean;
}

export function lifeOf(birth: YMD, lifespan: number, today: YMD): Life {
  const end = rowStart(birth, lifespan);
  const { row, col } = cellOf(birth, today);
  const daysLived = diffDays(birth, today);
  const daysLeft = Math.max(0, diffDays(today, end));
  return {
    birth,
    today,
    end,
    lifespan,
    age: row,
    row,
    col,
    cell: row * WEEKS_PER_ROW + col,
    daysLived,
    totalDays: diffDays(birth, end),
    daysLeft,
    weeksLived: Math.floor(daysLived / 7),
    weeksLeft: Math.floor(daysLeft / 7),
    rows: Math.max(lifespan, row + 1),
    passed: daysLeft === 0,
    isBirthday: row > 0 && diffDays(rowStart(birth, row), today) === 0,
  };
}

/** Share of the lifespan setting already lived, 0–1, to the millisecond (`msOfDay` = ms since local midnight). */
export function progressOf(life: Life, msOfDay: number): number {
  if (life.totalDays <= 0) return 1;
  return Math.min(1, Math.max(0, (life.daysLived + msOfDay / DAY_MS) / life.totalDays));
}

/* ---------- Things left ---------- */

/** Days in [from, to] (both inclusive) that fall on `weekday` (0 = Sunday … 6 = Saturday). */
export function countWeekday(from: YMD, to: YMD, weekday: number): number {
  const a = toDayNumber(from);
  const b = toDayNumber(to);
  if (b < a) return 0;
  const first = a + ((weekday - weekdayOf(from) + 7) % 7);
  return first > b ? 0 : Math.floor((b - first) / 7) + 1;
}

/** How many years' `dateOf(year)` fall in [from, to] (both inclusive). */
export function countYearly(from: YMD, to: YMD, dateOf: (year: number) => YMD): number {
  let n = 0;
  for (let y = from.y; y <= to.y; y++) {
    const d = dateOf(y);
    if (compareYMD(d, from) >= 0 && compareYMD(d, to) <= 0) n++;
  }
  return n;
}

/** 正月初一 from the lunar table for 1900–2100; outside it, roughly one per year (counted on 2/1). */
export function lunarNewYearOf(year: number): YMD {
  return year >= LUNAR_MIN && year <= LUNAR_MAX ? lunarNewYear(year) : { y: year, m: 2, d: 1 };
}

export interface Remaining {
  /** Saturdays still ahead. */
  weekends: number;
  /** Summers whose last day (8/31) is still ahead. */
  summers: number;
  /** 1/1 days. */
  newYears: number;
  /** 農曆新年. */
  lunarNewYears: number;
  /** Birthdays, the one you turn `lifespan` on included. */
  birthdays: number;
}

/** Counts from today through the day you turn `lifespan`, today included. All zero once it has passed. */
export function remainingOf(life: Life): Remaining {
  if (life.passed) return { weekends: 0, summers: 0, newYears: 0, lunarNewYears: 0, birthdays: 0 };
  const { today, end, birth } = life;
  return {
    weekends: countWeekday(today, end, 6),
    summers: countYearly(today, end, (y) => ({ y, m: 8, d: 31 })),
    newYears: countYearly(today, end, (y) => ({ y, m: 1, d: 1 })),
    lunarNewYears: countYearly(today, end, lunarNewYearOf),
    birthdays: countYearly(today, end, (y) => birthdayInYear(birth, y)),
  };
}

/* ---------- Time with people ---------- */

export interface Visits {
  /** Years you both have left under the lifespan setting. */
  years: number;
  visits: number;
  /** They are already past the lifespan setting, so no estimate is made. */
  bonus: boolean;
}

/**
 * Rough number of visits left with someone, assuming the same lifespan setting for them.
 * Capped by your own years left, since a visit needs you both.
 */
export function visitsLeft(person: Pick<Person, 'age' | 'perYear'>, lifespan: number, yourDaysLeft: number): Visits {
  const theirs = lifespan - person.age;
  if (theirs <= 0) return { years: 0, visits: 0, bonus: true };
  const yours = yourDaysLeft / YEAR_DAYS;
  const years = yours > 0 ? Math.min(theirs, yours) : theirs;
  return { years, visits: Math.round(years * Math.max(0, person.perYear)), bonus: false };
}

/* ---------- Life stages ---------- */

export type Stage = 'child' | 'school' | 'work' | 'retired';
export const STAGES: readonly Stage[] = ['child', 'school', 'work', 'retired'];

/** Stage boundaries in ages, forced into order without rewriting what the user typed. */
export function stageBounds(s: Pick<Settings, 'schoolStart' | 'schoolEnd' | 'retire'>): [number, number, number] {
  const a = s.schoolStart;
  const b = Math.max(a, s.schoolEnd);
  return [a, b, Math.max(b, s.retire)];
}

export function stageOf(row: number, bounds: [number, number, number]): Stage {
  if (row < bounds[0]) return 'child';
  if (row < bounds[1]) return 'school';
  if (row < bounds[2]) return 'work';
  return 'retired';
}

/* ---------- Grid geometry (device pixels) ---------- */

export interface GridLayout {
  rows: number;
  /** Width of the age label column on the left. */
  gutter: number;
  /** Height of the week label row on top. */
  top: number;
  /** Cell size plus gap. */
  pitch: number;
  cell: number;
  gap: number;
  /** Extra space after every 10 rows. */
  decadeGap: number;
  width: number;
  height: number;
}

/** Fits 52 columns into `width` with whole-pixel cells, so the grid stays crisp at any size. */
export function gridLayout(
  width: number,
  rows: number,
  { gutter, top, maxPitch = Infinity }: { gutter: number; top: number; maxPitch?: number },
): GridLayout {
  const pitch = Math.max(3, Math.min(Math.floor(maxPitch), Math.floor((width - gutter) / WEEKS_PER_ROW)));
  const gap = Math.max(1, Math.round(pitch * 0.2));
  const decadeGap = Math.max(gap + 1, Math.round(pitch * 0.6));
  const layout = { rows, gutter, top, pitch, cell: pitch - gap, gap, decadeGap, width: 0, height: 0 };
  layout.width = gutter + WEEKS_PER_ROW * pitch - gap;
  layout.height = rowY(layout, rows - 1) + layout.cell;
  return layout;
}

export function rowY(l: GridLayout, row: number): number {
  return l.top + row * l.pitch + Math.floor(row / 10) * l.decadeGap;
}

export function colX(l: GridLayout, col: number): number {
  return l.gutter + col * l.pitch;
}

/** Cell under a point, or null outside the grid. Points in a gap snap to the nearest cell before it. */
export function cellAt(l: GridLayout, x: number, y: number): { row: number; col: number } | null {
  if (x < l.gutter || y < l.top || x >= l.width || y >= l.height) return null;
  const col = Math.min(WEEKS_PER_ROW - 1, Math.floor((x - l.gutter) / l.pitch));
  const block = 10 * l.pitch + l.decadeGap;
  const decade = Math.floor((y - l.top) / block);
  const inBlock = Math.min(9, Math.floor((y - l.top - decade * block) / l.pitch));
  const row = decade * 10 + inBlock;
  return row < l.rows ? { row, col } : null;
}
