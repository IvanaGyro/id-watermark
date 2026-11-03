// 薪動力: turns a salary into "money earned so far today", second by second.
// Pure functions only; the page calls snapshot() on every animation frame.

export type PayPeriod = 'month' | 'year' | 'hour';
export type WorkStatus = 'before' | 'working' | 'break' | 'after';

export interface Settings {
  /** ISO 4217 code. */
  currency: string;
  /** Pay amount for `period`. */
  pay: number;
  period: PayPeriod;
  /** Working days per month; used for monthly and yearly pay. */
  workDays: number;
  /** 'HH:MM' local time. An end at or before the start means the shift ends the next day. */
  start: string;
  end: string;
  breakOn: boolean;
  breakStart: string;
  breakEnd: string;
}

export const CURRENCIES = ['TWD', 'USD', 'JPY', 'HKD', 'CNY', 'EUR', 'GBP', 'KRW', 'SGD', 'MYR', 'AUD', 'CAD'] as const;

export const LIMITS = {
  pay: [0, 1e12],
  workDays: [1, 31],
} as const;

const DAY = 1440;

/** 'HH:MM' → minutes after midnight, or null when malformed. */
export function parseTime(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

/** Coerces stored or user-entered values into valid settings, falling back to `defaults`. */
export function normalizeSettings(raw: Partial<Record<keyof Settings, unknown>> | null | undefined, defaults: Settings): Settings {
  const out = { ...defaults };
  if (!raw || typeof raw !== 'object') return out;
  if (typeof raw.currency === 'string' && (CURRENCIES as readonly string[]).includes(raw.currency)) out.currency = raw.currency;
  if (raw.period === 'month' || raw.period === 'year' || raw.period === 'hour') out.period = raw.period;
  for (const key of ['pay', 'workDays'] as const) {
    const value = Number(raw[key]);
    if (raw[key] === '' || raw[key] === null || raw[key] === undefined || !Number.isFinite(value)) continue;
    const [min, max] = LIMITS[key];
    out[key] = Math.min(max, Math.max(min, value));
  }
  for (const key of ['start', 'end', 'breakStart', 'breakEnd'] as const) {
    if (parseTime(raw[key]) !== null) out[key] = String(raw[key]).trim().padStart(5, '0');
  }
  if (typeof raw.breakOn === 'boolean') out.breakOn = raw.breakOn;
  return out;
}

/** One shift in minutes from the midnight of the day it starts. end > start; the break lies inside [start, end]. */
export interface Shift {
  start: number;
  end: number;
  breakStart: number;
  breakEnd: number;
}

export function buildShift(s: Settings): Shift {
  const start = parseTime(s.start) ?? 9 * 60;
  let end = parseTime(s.end) ?? 18 * 60;
  if (end <= start) end += DAY;
  let breakStart = end;
  let breakEnd = end;
  const bs = parseTime(s.breakStart);
  const be = parseTime(s.breakEnd);
  if (s.breakOn && bs !== null && be !== null && be !== bs) {
    const from = bs < start ? bs + DAY : bs;
    const to = from + ((be - bs + DAY) % DAY);
    breakStart = Math.min(Math.max(from, start), end);
    breakEnd = Math.min(Math.max(to, start), end);
    if (breakEnd <= breakStart) breakStart = breakEnd = end;
  }
  return { start, end, breakStart, breakEnd };
}

/** Paid minutes in one shift (the break is unpaid). */
export function paidMinutes(shift: Shift): number {
  return shift.end - shift.start - (shift.breakEnd - shift.breakStart);
}

/** Pay for one working day. */
export function dailyPay(s: Settings, shift: Shift = buildShift(s)): number {
  if (s.period === 'hour') return (s.pay * paidMinutes(shift)) / 60;
  const monthly = s.period === 'year' ? s.pay / 12 : s.pay;
  return monthly / s.workDays;
}

export interface Rates {
  daily: number;
  hourly: number;
  perMinute: number;
  perSecond: number;
}

export function rates(s: Settings, shift: Shift = buildShift(s)): Rates {
  const daily = dailyPay(s, shift);
  const seconds = paidMinutes(shift) * 60;
  const perSecond = seconds > 0 ? daily / seconds : 0;
  return { daily, hourly: perSecond * 3600, perMinute: perSecond * 60, perSecond };
}

export interface Snapshot {
  status: WorkStatus;
  /** Earned so far in the current shift. */
  earned: number;
  daily: number;
  /** Share of today's paid time already worked, 0–1. */
  progress: number;
  /** Wall-clock milliseconds until the next change: the start, the end of the break or the end of the shift. 0 after work. */
  untilNextMs: number;
}

/**
 * State of the shift at `msOfDay` (milliseconds after local midnight).
 * During an overnight shift the early-morning hours still belong to the shift that began yesterday.
 */
export function snapshot(s: Settings, msOfDay: number, shift: Shift = buildShift(s)): Snapshot {
  let t = msOfDay / 60_000;
  if (shift.end > DAY && t + DAY < shift.end) t += DAY;
  const { daily } = rates(s, shift);
  const total = paidMinutes(shift);
  const clamped = Math.min(Math.max(t, shift.start), shift.end);
  const inBreak = Math.max(0, Math.min(clamped, shift.breakEnd) - shift.breakStart);
  const worked = clamped - shift.start - inBreak;
  const progress = total > 0 ? Math.min(1, Math.max(0, worked / total)) : 0;

  let status: WorkStatus;
  let next: number;
  if (t < shift.start) {
    status = 'before';
    next = shift.start;
  } else if (t >= shift.end) {
    status = 'after';
    next = t;
  } else if (t >= shift.breakStart && t < shift.breakEnd) {
    status = 'break';
    next = shift.breakEnd;
  } else {
    status = 'working';
    next = shift.end;
  }
  return { status, earned: daily * progress, daily, progress, untilNextMs: Math.max(0, (next - t) * 60_000) };
}

/**
 * Decimal places for the ticking amount: enough that the last digit changes on almost every
 * animation frame (about 16 ms), so the number always looks alive.
 */
export function decimalsFor(perSecond: number): number {
  if (!(perSecond > 0)) return 2;
  const perFrame = perSecond * 0.016;
  return Math.min(8, Math.max(2, Math.ceil(-Math.log10(perFrame)) + 1));
}

/** 3_725_000 ms → '1:02:05'; under an hour → '02:05'. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const mmss = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

/* ---------- Equivalents: "today you have earned 3.2 lunches" ---------- */

export type RewardId = 'coffee' | 'bubbleTea' | 'lunch' | 'movie' | 'dinner' | 'concert';
export const REWARD_IDS: readonly RewardId[] = ['coffee', 'bubbleTea', 'lunch', 'movie', 'dinner', 'concert'];

/** Rough everyday prices. Only these currencies have equivalents. */
export const REWARD_PRICES: Record<string, Record<RewardId, number>> = {
  TWD: { coffee: 55, bubbleTea: 65, lunch: 120, movie: 330, dinner: 600, concert: 3800 },
  USD: { coffee: 5, bubbleTea: 7, lunch: 15, movie: 15, dinner: 60, concert: 150 },
  JPY: { coffee: 400, bubbleTea: 600, lunch: 1000, movie: 2000, dinner: 5000, concert: 12000 },
};

export interface Reward {
  id: RewardId;
  price: number;
}

/** Rewards for a currency, cheapest first; empty when the currency has no price list. */
export function rewardsFor(currency: string): Reward[] {
  const prices = REWARD_PRICES[currency];
  if (!prices) return [];
  return REWARD_IDS.map((id) => ({ id, price: prices[id] })).sort((a, b) => a.price - b.price);
}

/** How many of a reward `earned` buys, rounded down to one decimal so the number only grows. */
export function countOf(reward: Reward, earned: number): number {
  return Math.floor((Math.max(0, earned) / reward.price) * 10 + 1e-9) / 10;
}

/**
 * The reward to name in the headline: the priciest one `earned` already buys at least once,
 * so the count stays meaningful for any salary. Null while not even the cheapest one is earned.
 */
export function headlineReward(rewards: Reward[], earned: number): Reward | null {
  let best: Reward | null = null;
  for (const reward of rewards) if (earned >= reward.price && (!best || reward.price > best.price)) best = reward;
  return best;
}

/** Milliseconds after local midnight for a Date. */
export function msOfDay(date: Date): number {
  return ((date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds()) * 1000 + date.getMilliseconds();
}

/** Starting values for each locale: local currency and the usual way pay is quoted there. */
export const DEFAULTS: Record<'zh-TW' | 'en' | 'ja', Settings> = {
  'zh-TW': {
    currency: 'TWD',
    pay: 40_000,
    period: 'month',
    workDays: 22,
    start: '09:00',
    end: '18:00',
    breakOn: true,
    breakStart: '12:00',
    breakEnd: '13:00',
  },
  en: {
    currency: 'USD',
    pay: 60_000,
    period: 'year',
    workDays: 22,
    start: '09:00',
    end: '17:00',
    breakOn: true,
    breakStart: '12:00',
    breakEnd: '12:30',
  },
  ja: {
    currency: 'JPY',
    pay: 300_000,
    period: 'month',
    workDays: 21,
    start: '09:00',
    end: '18:00',
    breakOn: true,
    breakStart: '12:00',
    breakEnd: '13:00',
  },
};
