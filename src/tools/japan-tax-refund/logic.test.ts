import { describe, expect, it } from 'vitest';
import {
  addDays,
  bucket,
  clampFee,
  daysBetween,
  deadlineFor,
  evaluateReceipt,
  isOldSystem,
  isValidDate,
  summarize,
  topUpFor,
} from './logic';

const r = (std: number, food = 0, date = '2026-11-10') => ({ date, std, food });

describe('dates', () => {
  it('validates real calendar dates only', () => {
    expect(isValidDate('2026-11-01')).toBe(true);
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('2026-02-29')).toBe(false);
    expect(isValidDate('2026-13-01')).toBe(false);
    expect(isValidDate('2026-1-01')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });

  it('counts 90 days from the day after purchase (NTA example: 11/1 → 1/30)', () => {
    expect(deadlineFor('2026-11-01')).toBe('2027-01-30');
    expect(deadlineFor('2026-12-15')).toBe('2027-03-15');
    expect(deadlineFor('2027-12-01')).toBe('2028-02-29');
    expect(daysBetween('2026-11-01', '2027-01-30')).toBe(90);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('puts purchases up to 2026-10-31 on the old system', () => {
    expect(isOldSystem('2026-10-31')).toBe(true);
    expect(isOldSystem('2026-11-01')).toBe(false);
  });
});

describe('amounts', () => {
  it('refunds the tax inside a tax-included price (10/110 and 8/108)', () => {
    expect(bucket(11000, 10, 'gross')).toEqual({ net: 10000, tax: 1000, gross: 11000 });
    expect(bucket(5400, 8, 'gross')).toEqual({ net: 5000, tax: 400, gross: 5400 });
    expect(bucket(1000, 10, 'gross')).toEqual({ net: 909, tax: 90, gross: 1000 });
  });

  it('adds tax to before-tax prices', () => {
    expect(bucket(10000, 10, 'net')).toEqual({ net: 10000, tax: 1000, gross: 11000 });
    expect(bucket(999, 8, 'net')).toEqual({ net: 999, tax: 79, gross: 1078 });
  });

  it('needs 5,000 yen before tax, with 10% and 8% goods combined', () => {
    expect(evaluateReceipt(r(5500), 'gross').status).toBe('ok');
    expect(evaluateReceipt(r(5499), 'gross').status).toBe('below');
    expect(evaluateReceipt(r(0, 5400), 'gross').status).toBe('ok');
    expect(evaluateReceipt(r(0, 5399), 'gross').status).toBe('below');
    expect(evaluateReceipt(r(3300, 2160), 'gross')).toMatchObject({ status: 'ok', net: 5000, refund: 460 });
    expect(evaluateReceipt(r(5000), 'net').status).toBe('ok');
    expect(evaluateReceipt(r(4999), 'net').status).toBe('below');
  });

  it('says how much more 10% shopping reaches the threshold', () => {
    expect(topUpFor(0, 0, 'gross')).toBe(5500);
    expect(topUpFor(3300, 1080, 'gross')).toBe(1100);
    expect(topUpFor(5500, 0, 'gross')).toBe(0);
    expect(topUpFor(3000, 1000, 'net')).toBe(1000);
    const below = evaluateReceipt(r(3300, 1080), 'gross');
    expect(below).toMatchObject({ status: 'below', shortNet: 1000, topUp: 1100, refund: 0 });
    expect(evaluateReceipt(r(3300 + 1100, 1080), 'gross').status).toBe('ok');
    expect(evaluateReceipt(r(3300 + 1099, 1080), 'gross').status).toBe('below');
  });
});

describe('receipt status', () => {
  it('flags empty, bad and old receipts', () => {
    expect(evaluateReceipt(r(0, 0), 'gross').status).toBe('empty');
    expect(evaluateReceipt(r(Number.NaN), 'gross').status).toBe('badAmount');
    expect(evaluateReceipt(r(-1), 'gross').status).toBe('badAmount');
    expect(evaluateReceipt(r(1.5), 'gross').status).toBe('badAmount');
    expect(evaluateReceipt(r(11000, 0, '2026-02-30'), 'gross').status).toBe('badDate');
    expect(evaluateReceipt(r(11000, 0, '2026-10-31'), 'gross')).toMatchObject({ status: 'old', refund: 0 });
  });

  it('checks the departure date against the 90-day deadline', () => {
    const buy = '2026-11-01';
    expect(evaluateReceipt(r(11000, 0, buy), 'gross', '2027-01-30')).toMatchObject({ status: 'ok', refund: 1000 });
    expect(evaluateReceipt(r(11000, 0, buy), 'gross', '2027-01-31')).toMatchObject({
      status: 'expired',
      refund: 0,
      deadline: '2027-01-30',
    });
    expect(evaluateReceipt(r(11000, 0, buy), 'gross', '2026-10-30').status).toBe('departBefore');
    expect(evaluateReceipt(r(11000, 0, buy), 'gross', buy).status).toBe('ok');
    expect(evaluateReceipt(r(11000, 0, buy), 'gross', 'not a date').status).toBe('ok');
  });
});

describe('summary', () => {
  it('adds eligible refunds and takes off the agent fee', () => {
    const s = summarize([r(11000, 5400), r(3300), r(0), r(22000, 0, '2026-12-01')], 'gross', '2026-12-05', 2);
    expect(s.filled).toBe(3);
    expect(s.eligible).toBe(2);
    expect(s.refund).toBe(1400 + 2000);
    expect(s.fee).toBe(68);
    expect(s.received).toBe(3332);
    expect(s.firstDeadline).toBe('2027-02-08');
  });

  it('clamps the fee to 0–30%', () => {
    expect(clampFee(-5)).toBe(0);
    expect(clampFee(Number.NaN)).toBe(0);
    expect(clampFee(99)).toBe(30);
    expect(clampFee(2.5)).toBe(2.5);
  });
});
