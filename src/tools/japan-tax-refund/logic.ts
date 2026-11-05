/**
 * Japan tax-free shopping under the refund method (リファンド方式), in force for purchases from 2026-11-01.
 *
 * Rules used here, checked against official sources on 2026-11-06:
 * - Threshold: one store, one day, 5,000 yen or more before tax; general goods and consumables are combined.
 *   Japan Tourism Agency traveler page: 「同一店舗における１日の購入額（税抜）が5,000円以上」.
 *   A tax-free procedure counter may add up same-day purchases from several shops (NTA Q&A 概要編 問24-2), so
 *   the UI tells users to enter such a counter receipt as one receipt.
 * - Deadline: customs must confirm at departure within 90 days of the purchase date, counted from the next day
 *   (NTA Q&A 問36: bought X1.11.1, deadline X2.1.30), i.e. purchase date + 90 days.
 * - Refunded: the consumption-tax amount (10% → price × 10/110, 8% food and drink → price × 8/108).
 * - Fees: the government charges none; refund agents may charge one, and who pays is not fixed (JTA FAQ,
 *   「諸外国では、旅行者負担とすることが一般的」). So the fee is a user input, default 0.
 * - Purchases up to 2026-10-31 are on the old system: tax-free at the till, nothing to refund.
 * Refund amounts are estimates: the tax per rate is rounded down once per receipt, the common practice in shops.
 */
import { taxFromGross, taxFromNet, type TaxRate } from '../consumption-tax/logic';

export const REFUND_START = '2026-11-01';
export const MIN_NET = 5000;
export const DEADLINE_DAYS = 90;
export const MAX_RECEIPTS = 30;
export const MAX_AMOUNT = 100_000_000;
export const MAX_FEE = 30;

/** Whether the amounts typed in include tax (price tags in Japan show the tax-included total). */
export type PriceMode = 'gross' | 'net';

export interface ReceiptInput {
  /** Purchase date, YYYY-MM-DD. */
  date: string;
  /** Goods at the standard 10% rate. NaN = not a valid number. */
  std: number;
  /** Food and drink (not alcohol) at the reduced 8% rate. */
  food: number;
}

export type ReceiptStatus =
  | 'empty'
  | 'badAmount'
  | 'badDate'
  | 'old'
  | 'below'
  | 'departBefore'
  | 'expired'
  | 'ok';

export interface ReceiptResult {
  status: ReceiptStatus;
  /** Totals for the receipt, before tax / tax / including tax. */
  net: number;
  tax: number;
  gross: number;
  /** Refund for this receipt: the tax when eligible, else 0. */
  refund: number;
  /** Last day customs can confirm the goods (YYYY-MM-DD), or null without a valid date. */
  deadline: string | null;
  /** Before-tax yen still missing to reach the threshold (status 'below'). */
  shortNet: number;
  /** Smallest extra amount of 10% goods, in the receipt's price mode, that reaches the threshold. */
  topUp: number;
}

export interface Summary {
  results: ReceiptResult[];
  /** Receipts with any amount entered. */
  filled: number;
  eligible: number;
  /** Sum of refunds on eligible receipts. */
  refund: number;
  /** Refund agent fee at the given percentage. */
  fee: number;
  /** refund - fee. */
  received: number;
  /** Earliest deadline among eligible receipts. */
  firstDeadline: string | null;
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parse YYYY-MM-DD to a UTC day number; NaN when malformed or not a real date. */
export function dayNumber(date: string): number {
  const m = DATE_RE.exec(date);
  if (!m) return Number.NaN;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const back = new Date(t);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return Number.NaN;
  return t / 86_400_000;
}

export function isValidDate(date: string): boolean {
  return Number.isFinite(dayNumber(date));
}

export function addDays(date: string, days: number): string {
  const n = dayNumber(date);
  if (!Number.isFinite(n)) throw new RangeError(`Invalid date: ${date}`);
  return new Date((n + days) * 86_400_000).toISOString().slice(0, 10);
}

/** Last day to get the customs confirmation: purchase date + 90 days. */
export function deadlineFor(purchase: string): string {
  return addDays(purchase, DEADLINE_DAYS);
}

/** Purchases before 2026-11-01 were tax-free at the till (old system). */
export function isOldSystem(purchase: string): boolean {
  return purchase < REFUND_START;
}

const validAmount = (n: number) => Number.isInteger(n) && n >= 0 && n <= MAX_AMOUNT;

/**
 * One rate bucket. The tax (the refund) is rounded down once. From a tax-included amount the before-tax amount is
 * also rounded down (gross × 100/110), so 5,499 yen counts as 4,999 and only 5,500 reaches the threshold; this
 * never says "eligible" when a shop could round the other way.
 */
export function bucket(amount: number, rate: TaxRate, mode: PriceMode): { net: number; tax: number; gross: number } {
  if (mode === 'gross') {
    const tax = taxFromGross(amount, rate, 'floor');
    return { net: Math.floor((amount * 100) / (100 + rate)), tax, gross: amount };
  }
  const tax = taxFromNet(amount, rate, 'floor');
  return { net: amount, tax, gross: amount + tax };
}

function totals(std: number, food: number, mode: PriceMode) {
  const a = bucket(std, 10, mode);
  const b = bucket(food, 8, mode);
  return { net: a.net + b.net, tax: a.tax + b.tax, gross: a.gross + b.gross };
}

/** Smallest extra 10% amount (in the price mode) that lifts the receipt to the threshold. */
export function topUpFor(std: number, food: number, mode: PriceMode): number {
  const short = MIN_NET - totals(std, food, mode).net;
  if (short <= 0) return 0;
  if (mode === 'net') return short;
  // Rounding the tax per bucket can move the answer by a yen, so search up from just below the estimate.
  let x = Math.max(0, Math.ceil((short * 110) / 100) - 3);
  while (totals(std + x, food, mode).net < MIN_NET) x++;
  return x;
}

export function evaluateReceipt(r: ReceiptInput, mode: PriceMode, departure = ''): ReceiptResult {
  const blank: ReceiptResult = {
    status: 'empty',
    net: 0,
    tax: 0,
    gross: 0,
    refund: 0,
    deadline: null,
    shortNet: 0,
    topUp: 0,
  };
  if (!validAmount(r.std) || !validAmount(r.food)) return { ...blank, status: 'badAmount' };
  const t = totals(r.std, r.food, mode);
  const base = { ...blank, ...t };
  if (r.std === 0 && r.food === 0) return base;
  if (!isValidDate(r.date)) return { ...base, status: 'badDate' };
  if (isOldSystem(r.date)) return { ...base, status: 'old' };
  const deadline = deadlineFor(r.date);
  const withDeadline = { ...base, deadline };
  if (t.net < MIN_NET) {
    return { ...withDeadline, status: 'below', shortNet: MIN_NET - t.net, topUp: topUpFor(r.std, r.food, mode) };
  }
  if (isValidDate(departure)) {
    if (departure < r.date) return { ...withDeadline, status: 'departBefore' };
    if (departure > deadline) return { ...withDeadline, status: 'expired' };
  }
  return { ...withDeadline, status: 'ok', refund: t.tax };
}

export function clampFee(fee: number): number {
  if (!Number.isFinite(fee) || fee < 0) return 0;
  return Math.min(fee, MAX_FEE);
}

export function summarize(receipts: readonly ReceiptInput[], mode: PriceMode, departure: string, feePct: number): Summary {
  const results = receipts.map((r) => evaluateReceipt(r, mode, departure));
  const eligible = results.filter((r) => r.status === 'ok');
  const refund = eligible.reduce((sum, r) => sum + r.refund, 0);
  const fee = Math.round((refund * clampFee(feePct)) / 100);
  const deadlines = eligible.map((r) => r.deadline!).sort();
  return {
    results,
    filled: results.filter((r) => r.status !== 'empty').length,
    eligible: eligible.length,
    refund,
    fee,
    received: refund - fee,
    firstDeadline: deadlines[0] ?? null,
  };
}

/** Whole days from `from` to `to` (both YYYY-MM-DD); NaN when either is invalid. */
export function daysBetween(from: string, to: string): number {
  return dayNumber(to) - dayNumber(from);
}
