// 會議燒錢計數器: what a meeting costs in salary, live and per recurrence.
// Pure functions only; the page calls meterCost() on every animation frame.
// Pay periods, currencies and the reward list come from the sibling tool salary-per-second.
import { CURRENCIES, DEFAULTS as PAY_DEFAULTS, type PayPeriod } from '../salary-per-second/logic';

export {
  CURRENCIES,
  REWARD_IDS,
  REWARD_PRICES,
  countOf,
  decimalsFor,
  formatDuration,
  headlineReward,
  rewardsFor,
  type PayPeriod,
  type Reward,
  type RewardId,
} from '../salary-per-second/logic';

export type Mode = 'quick' | 'detail';
export type Recurrence = 'once' | 'daily' | 'weekly' | 'monthly';
export const RECURRENCES: readonly Recurrence[] = ['once', 'daily', 'weekly', 'monthly'];
export const PERIODS: readonly PayPeriod[] = ['month', 'year', 'hour'];
/** Planned lengths offered as one-tap presets, in minutes. */
export const PLAN_PRESETS = [15, 30, 45, 60, 90] as const;

/** A row of attendees who earn about the same: "4 engineers at 50,000 a month". */
export interface Group {
  label: string;
  count: number;
  pay: number;
  period: PayPeriod;
}

export interface Settings {
  /** ISO 4217 code. */
  currency: string;
  /** quick = one row "N people × average pay"; detail = several rows by role. */
  mode: Mode;
  quick: Group;
  groups: Group[];
  /** Working days per month and paid hours per day: turn monthly or yearly pay into an hourly rate. */
  workDays: number;
  hoursPerDay: number;
  /** Multiplier on salary for employer costs on top of pay (insurance, benefits, office). 1 = salary only. */
  overhead: number;
  /** Planned length of the meeting, in minutes. */
  planMinutes: number;
  recurrence: Recurrence;
}

export const LIMITS = {
  count: [0, 10_000],
  pay: [0, 1e12],
  workDays: [1, 31],
  hoursPerDay: [0.25, 24],
  overhead: [1, 5],
  planMinutes: [1, 1440],
} as const;

export const MAX_GROUPS = 20;
export const MAX_LABEL = 40;

/** A fresh row for the "Add a role" button. */
export function newGroup(like: Pick<Group, 'pay' | 'period'>): Group {
  return { label: '', count: 1, pay: like.pay, period: like.period };
}

/* ---------- Settings ---------- */

function num(value: unknown, [min, max]: readonly [number, number], fallback: number): number {
  if (value === '' || value === null || value === undefined || typeof value === 'boolean') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function isPeriod(value: unknown): value is PayPeriod {
  return value === 'month' || value === 'year' || value === 'hour';
}

/** Coerces one stored or typed row, falling back to `fallback` field by field. */
export function normalizeGroup(raw: unknown, fallback: Group): Group {
  const out = { ...fallback };
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.label === 'string') out.label = r.label.trim().slice(0, MAX_LABEL);
  out.count = Math.round(num(r.count, LIMITS.count, out.count));
  out.pay = num(r.pay, LIMITS.pay, out.pay);
  if (isPeriod(r.period)) out.period = r.period;
  return out;
}

/** Coerces stored or user-entered values into valid settings, falling back to `defaults`. */
export function normalizeSettings(raw: unknown, defaults: Settings): Settings {
  const out: Settings = { ...defaults, quick: { ...defaults.quick }, groups: defaults.groups.map((g) => ({ ...g })) };
  if (!raw || typeof raw !== 'object') return out;
  const r = raw as Record<string, unknown>;
  if (typeof r.currency === 'string' && (CURRENCIES as readonly string[]).includes(r.currency)) out.currency = r.currency;
  if (r.mode === 'quick' || r.mode === 'detail') out.mode = r.mode;
  if ((RECURRENCES as readonly unknown[]).includes(r.recurrence)) out.recurrence = r.recurrence as Recurrence;
  out.workDays = num(r.workDays, LIMITS.workDays, out.workDays);
  out.hoursPerDay = num(r.hoursPerDay, LIMITS.hoursPerDay, out.hoursPerDay);
  out.overhead = num(r.overhead, LIMITS.overhead, out.overhead);
  out.planMinutes = num(r.planMinutes, LIMITS.planMinutes, out.planMinutes);
  out.quick = normalizeGroup(r.quick, out.quick);
  out.quick.label = '';
  if (Array.isArray(r.groups) && r.groups.length > 0) {
    out.groups = r.groups
      .slice(0, MAX_GROUPS)
      .map((g, i) => normalizeGroup(g, out.groups[i] ?? newGroup(out.groups[out.groups.length - 1] ?? out.quick)));
  }
  return out;
}

/* ---------- Cost per hour ---------- */

/** Paid hours in a month: working days × paid hours per day. */
export function monthlyHours(workDays: number, hoursPerDay: number): number {
  return workDays * hoursPerDay;
}

/** Hourly pay of one person: monthly pay ÷ (days × hours); yearly pay is divided by 12 first. */
export function hourlyPay(pay: number, period: PayPeriod, workDays: number, hoursPerDay: number): number {
  if (period === 'hour') return pay;
  const hours = monthlyHours(workDays, hoursPerDay);
  if (!(hours > 0)) return 0;
  const monthly = period === 'year' ? pay / 12 : pay;
  return monthly / hours;
}

/** Hourly cost of one person in a row, overhead included. */
export function personHourly(group: Group, s: Settings): number {
  return hourlyPay(group.pay, group.period, s.workDays, s.hoursPerDay) * s.overhead;
}

/** Hourly cost of a whole row. */
export function groupHourly(group: Group, s: Settings): number {
  return personHourly(group, s) * group.count;
}

/** The rows that count in the current mode. */
export function activeGroups(s: Settings): Group[] {
  return s.mode === 'quick' ? [s.quick] : s.groups;
}

export function headcount(s: Settings): number {
  return activeGroups(s).reduce((sum, g) => sum + g.count, 0);
}

/** What the meeting costs per hour with everyone in it. */
export function costPerHour(s: Settings): number {
  return activeGroups(s).reduce((sum, g) => sum + groupHourly(g, s), 0);
}

/** Average hourly cost per attendee; 0 without attendees. */
export function averageHourly(s: Settings): number {
  const n = headcount(s);
  return n > 0 ? costPerHour(s) / n : 0;
}

/** Cost of `minutes` of meeting at `perHour`. */
export function costOf(minutes: number, perHour: number): number {
  return (Math.max(0, minutes) / 60) * perHour;
}

/* ---------- Live meter ---------- */
// Time is never counted by ticks: elapsed time and cost are derived from timestamps, so a throttled
// background tab, a locked phone or a reload stay accurate. A change of attendees while the meter runs
// only affects the cost from that moment on: the running segment is closed at the old rate first.

export interface Meter {
  /** Date.now() when the running segment began; null while paused or idle. */
  startedAt: number | null;
  /** Meeting time in closed segments, ms. */
  elapsedMs: number;
  /** Cost of closed segments. */
  cost: number;
  /** Cost per hour of the running (or next) segment. */
  rate: number;
}

export type Phase = 'idle' | 'running' | 'paused';

export function initialMeter(rate = 0): Meter {
  return { startedAt: null, elapsedMs: 0, cost: 0, rate };
}

export function isRunning(m: Meter): boolean {
  return m.startedAt !== null;
}

function segmentMs(m: Meter, now: number): number {
  return m.startedAt === null ? 0 : Math.max(0, now - m.startedAt);
}

export function meterElapsed(m: Meter, now: number): number {
  return m.elapsedMs + segmentMs(m, now);
}

export function meterCost(m: Meter, now: number): number {
  return m.cost + (segmentMs(m, now) / 3_600_000) * m.rate;
}

export function meterPhase(m: Meter, now: number): Phase {
  if (isRunning(m)) return 'running';
  return meterElapsed(m, now) > 0 ? 'paused' : 'idle';
}

/** Closes the running segment into the totals; the meter keeps running from `now` if it was. */
function fold(m: Meter, now: number): Meter {
  if (m.startedAt === null) return m;
  return { ...m, elapsedMs: meterElapsed(m, now), cost: meterCost(m, now), startedAt: now };
}

export function startMeter(m: Meter, now: number): Meter {
  return isRunning(m) ? m : { ...m, startedAt: now };
}

export function pauseMeter(m: Meter, now: number): Meter {
  return isRunning(m) ? { ...fold(m, now), startedAt: null } : m;
}

export function toggleMeter(m: Meter, now: number): Meter {
  return isRunning(m) ? pauseMeter(m, now) : startMeter(m, now);
}

/** New cost per hour from `now` on; time already spent keeps its old cost. */
export function setRate(m: Meter, now: number, rate: number): Meter {
  if (m.rate === rate) return m;
  return { ...fold(m, now), rate };
}

/** Prices the whole meeting so far at `rate` (after a currency change, old amounts mean nothing). */
export function rebaseMeter(m: Meter, now: number, rate: number): Meter {
  const elapsedMs = meterElapsed(m, now);
  return { startedAt: isRunning(m) ? now : null, elapsedMs, cost: (elapsedMs / 3_600_000) * rate, rate };
}

export function resetMeter(rate: number): Meter {
  return initialMeter(rate);
}

/** Validates a meter restored from storage so a corrupted value can never break the page. */
export function restoreMeter(value: unknown, now: number): Meter {
  if (!value || typeof value !== 'object') return initialMeter();
  const v = value as Record<string, unknown>;
  const ok = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;
  if (!ok(v.elapsedMs) || !ok(v.cost) || !ok(v.rate)) return initialMeter();
  if (v.startedAt !== null && !ok(v.startedAt)) return initialMeter();
  // A clock that moved backwards must not produce negative time.
  const startedAt = v.startedAt === null ? null : Math.min(v.startedAt as number, now);
  return { startedAt, elapsedMs: v.elapsedMs, cost: v.cost, rate: v.rate };
}

/** Share of the planned length already used, 0–1. */
export function planProgress(elapsedMs: number, planMinutes: number): number {
  const planMs = planMinutes * 60_000;
  return planMs > 0 ? Math.min(1, Math.max(0, elapsedMs / planMs)) : 0;
}

/** Milliseconds left in the planned length; negative once the meeting runs over. */
export function planRemaining(elapsedMs: number, planMinutes: number): number {
  return planMinutes * 60_000 - elapsedMs;
}

/** Elapsed time, rounded down: 3_725_900 ms → '1:02:05'; under an hour → '02:05'. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const mmss = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

/* ---------- Planning: per meeting, month and year ---------- */

/** Meetings per month and per year, or null for a one-off. "Daily" means every working day. */
export function meetingsPer(recurrence: Recurrence, workDays: number): { month: number; year: number } | null {
  switch (recurrence) {
    case 'daily':
      return { month: workDays, year: workDays * 12 };
    case 'weekly':
      return { month: 52 / 12, year: 52 };
    case 'monthly':
      return { month: 1, year: 12 };
    default:
      return null;
  }
}

export interface Plan {
  perMeeting: number;
  /** Null for a one-off meeting. */
  perMonth: number | null;
  perYear: number | null;
  /** Hours all attendees together spend in one meeting. */
  attendeeHours: number;
  /** Hours each attendee spends in this meeting per year; null for a one-off. */
  hoursPerPersonYear: number | null;
}

export function plan(s: Settings): Plan {
  const perMeeting = costOf(s.planMinutes, costPerHour(s));
  const per = meetingsPer(s.recurrence, s.workDays);
  return {
    perMeeting,
    perMonth: per ? perMeeting * per.month : null,
    perYear: per ? perMeeting * per.year : null,
    attendeeHours: (s.planMinutes / 60) * headcount(s),
    hoursPerPersonYear: per ? (s.planMinutes / 60) * per.year : null,
  };
}

/** A gentle suggestion for how many minutes to cut: 15 from an hour, 10 from half an hour, 5 from short ones. */
export function trimMinutes(planMinutes: number): number {
  if (planMinutes >= 60) return 15;
  if (planMinutes >= 30) return 10;
  if (planMinutes >= 10) return 5;
  return 0;
}

/** What cutting `minutes` from each meeting saves: per year when it recurs, else for the one meeting. */
export function savings(s: Settings, minutes: number): number {
  const per = meetingsPer(s.recurrence, s.workDays);
  const once = costOf(Math.min(minutes, s.planMinutes), costPerHour(s));
  return per ? once * per.year : once;
}

/* ---------- Defaults ---------- */

type Locale = 'zh-TW' | 'en' | 'ja';

/** Sample role rows per locale (labels come from i18n.ts so they stay translatable). */
const SAMPLE_ROWS: Record<Locale, Omit<Group, 'label'>[]> = {
  'zh-TW': [
    { count: 1, pay: 80_000, period: 'month' },
    { count: 4, pay: 50_000, period: 'month' },
    { count: 1, pay: 200, period: 'hour' },
  ],
  en: [
    { count: 1, pay: 140_000, period: 'year' },
    { count: 4, pay: 110_000, period: 'year' },
    { count: 1, pay: 60, period: 'hour' },
  ],
  ja: [
    { count: 1, pay: 600_000, period: 'month' },
    { count: 4, pay: 350_000, period: 'month' },
    { count: 1, pay: 1_200, period: 'hour' },
  ],
};

function defaultsFor(locale: Locale): Settings {
  const pay = PAY_DEFAULTS[locale];
  return {
    currency: pay.currency,
    mode: 'quick',
    quick: { label: '', count: 6, pay: pay.pay, period: pay.period },
    groups: SAMPLE_ROWS[locale].map((row) => ({ label: '', ...row })),
    workDays: pay.workDays,
    // A full 8-hour paid day everywhere (40-hour week), rather than salary-per-second's 7.5 for en.
    hoursPerDay: 8,
    overhead: 1,
    planMinutes: 60,
    recurrence: 'weekly',
  };
}

/** Starting values per locale: local currency, pay quoted the usual way there, a weekly one-hour meeting. */
export const DEFAULTS: Record<Locale, Settings> = {
  'zh-TW': defaultsFor('zh-TW'),
  en: defaultsFor('en'),
  ja: defaultsFor('ja'),
};
