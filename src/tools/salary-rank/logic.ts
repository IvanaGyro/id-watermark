import { LATEST, YEARS, type Quartiles, type YearRow } from './data';

export type PayMode = 'monthly' | 'annual';
export type AmountStatus = 'empty' | 'small' | 'big' | 'ok';
export type RankKind = 'below' | 'within' | 'above';
export type DotState = 'beat' | 'ahead' | 'you' | 'zone';

export interface Rank {
  kind: RankKind;
  /** Whole percent beaten, 10 to 90. `below` reports 10 and `above` reports 90: the data stops there. */
  pct: number;
}

export interface Milestone {
  pct: number;
  gap: number;
}

export const DEFAULT_MONTHS = 13;
export const MIN_MONTHLY = 1_000;
export const MIN_ANNUAL = 12_000;
export const MAX_ANNUAL = 1e10;

/** 萬元 to 元, without float noise. */
export function toYuan(wan: number): number {
  return Math.round(wan * 10_000);
}

export function clampMonths(months: number): number {
  if (!Number.isFinite(months)) return DEFAULT_MONTHS;
  return Math.min(36, Math.max(1, months));
}

export function annualPay(mode: PayMode, amount: number, months: number): number {
  return mode === 'annual' ? amount : Math.round(amount * clampMonths(months));
}

export function checkAmount(mode: PayMode, amount: number, months: number): AmountStatus {
  if (!Number.isFinite(amount) || amount <= 0) return 'empty';
  if (amount < (mode === 'annual' ? MIN_ANNUAL : MIN_MONTHLY)) return 'small';
  return annualPay(mode, amount, months) > MAX_ANNUAL ? 'big' : 'ok';
}

/** Official percent → pay points of one year, ascending. */
function cutPoints(row: YearRow): [number, number][] {
  const { d, q1, q3 } = row;
  return [
    [10, d[0]],
    [20, d[1]],
    [25, q1],
    [30, d[2]],
    [40, d[3]],
    [50, d[4]],
    [60, d[5]],
    [70, d[6]],
    [75, q3],
    [80, d[7]],
    [90, d[8]],
  ].map(([pct, wan]) => [pct, toYuan(wan)]);
}

/** Straight-line interpolation between official cut points. Nothing is estimated outside the first and last cut. */
function rankBetween(annual: number, points: [number, number][]): Rank {
  const [firstPct, firstPay] = points[0];
  const [lastPct, lastPay] = points[points.length - 1];
  if (annual < firstPay) return { kind: 'below', pct: firstPct };
  if (annual > lastPay) return { kind: 'above', pct: lastPct };
  const hi = points.findIndex(([, pay]) => pay >= annual);
  if (hi === 0) return { kind: 'within', pct: firstPct };
  const [p0, v0] = points[hi - 1];
  const [p1, v1] = points[hi];
  return { kind: 'within', pct: Math.round(p0 + ((annual - v0) / (v1 - v0)) * (p1 - p0)) };
}

export function rankOf(annual: number, row: YearRow = LATEST): Rank {
  return rankBetween(annual, cutPoints(row));
}

/** Rank inside one group, which only has published quartiles. */
export function groupRank(annual: number, { q1, median, q3 }: Quartiles): Rank {
  return rankBetween(annual, [
    [25, toYuan(q1)],
    [50, toYuan(median)],
    [75, toYuan(q3)],
  ]);
}

/** Rank against a group with only a published median, such as a county. */
export function medianRank(annual: number, medianWan: number): Rank {
  return rankBetween(annual, [[50, toYuan(medianWan)]]);
}

/** The same pay against each published year. Pay is not adjusted for inflation. */
export function rankHistory(annual: number): { year: number; roc: number; rank: Rank }[] {
  return YEARS.map((row) => ({ year: row.year, roc: row.roc, rank: rankOf(annual, row) }));
}

/** The next decile above this pay, or null past D9. */
export function nextMilestone(annual: number): Milestone | null {
  const index = LATEST.d.findIndex((wan) => toYuan(wan) > annual);
  if (index < 0) return null;
  return { pct: (index + 1) * 10, gap: toYuan(LATEST.d[index]) - annual };
}

/** Right edge in 元 for the comparison tracks: fits every group, without letting huge pay squash them. */
export function trackMax(annual: number, tops: readonly number[]): number {
  const top = toYuan(Math.max(...tops));
  return Math.max(top * 1.15, Math.min(annual * 1.05, top * 1.6));
}

/** Dots are numbered from the bottom-left (0) to the top-right (99). */
export function dotState(order: number, rank: Rank | null): DotState {
  if (!rank) return 'ahead';
  if (rank.kind === 'below') return order < 10 ? 'zone' : 'ahead';
  if (rank.kind === 'above') return order < 90 ? 'beat' : 'zone';
  if (order === rank.pct) return 'you';
  return order < rank.pct ? 'beat' : 'ahead';
}

/** Dot order of the cell at a row (0 = top) and column in the 10 × 10 grid. */
export function dotOrder(row: number, column: number): number {
  return (9 - row) * 10 + column;
}
