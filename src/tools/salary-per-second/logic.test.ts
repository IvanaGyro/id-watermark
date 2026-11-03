import { describe, expect, it } from 'vitest';
import {
  buildShift,
  dailyPay,
  decimalsFor,
  formatDuration,
  normalizeSettings,
  paidMinutes,
  parseTime,
  rates,
  countOf,
  headlineReward,
  rewardsFor,
  snapshot,
  type Settings,
} from './logic';

const base: Settings = {
  currency: 'TWD',
  pay: 44_000,
  period: 'month',
  workDays: 22,
  start: '09:00',
  end: '18:00',
  breakOn: true,
  breakStart: '12:00',
  breakEnd: '13:00',
};

const at = (hhmm: string, seconds = 0) => (parseTime(hhmm)! * 60 + seconds) * 1000;

describe('parseTime', () => {
  it('reads HH:MM and rejects bad input', () => {
    expect(parseTime('09:30')).toBe(570);
    expect(parseTime('9:05')).toBe(545);
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('12:60')).toBeNull();
    expect(parseTime('noon')).toBeNull();
    expect(parseTime(9)).toBeNull();
  });
});

describe('normalizeSettings', () => {
  it('keeps valid values and falls back for the rest', () => {
    const s = normalizeSettings(
      { currency: 'XXX', pay: '-5', period: 'year', workDays: 40, start: '8:30', end: 'later', breakOn: false },
      base,
    );
    expect(s).toEqual({ ...base, pay: 0, period: 'year', workDays: 31, start: '08:30', breakOn: false });
  });

  it('ignores empty or missing input', () => {
    expect(normalizeSettings(null, base)).toEqual(base);
    expect(normalizeSettings({ pay: '' }, base).pay).toBe(44_000);
  });
});

describe('shift and pay', () => {
  it('excludes the lunch break from paid time', () => {
    expect(paidMinutes(buildShift(base))).toBe(8 * 60);
  });

  it('turns monthly, yearly and hourly pay into daily pay', () => {
    expect(dailyPay(base)).toBe(2000);
    expect(dailyPay({ ...base, pay: 528_000, period: 'year' })).toBe(2000);
    expect(dailyPay({ ...base, pay: 200, period: 'hour' })).toBe(1600);
  });

  it('derives hourly, per-minute and per-second rates', () => {
    const r = rates(base);
    expect(r.hourly).toBeCloseTo(250);
    expect(r.perMinute).toBeCloseTo(250 / 60);
    expect(r.perSecond).toBeCloseTo(250 / 3600);
  });

  it('handles shifts that end after midnight', () => {
    const night = { ...base, start: '22:00', end: '06:00', breakStart: '02:00', breakEnd: '02:30' };
    const shift = buildShift(night);
    expect(shift).toEqual({ start: 1320, end: 1800, breakStart: 1560, breakEnd: 1590 });
    expect(paidMinutes(shift)).toBe(450);
  });

  it('drops a break outside the shift', () => {
    const shift = buildShift({ ...base, breakStart: '19:00', breakEnd: '20:00' });
    expect(paidMinutes(shift)).toBe(9 * 60);
  });
});

describe('snapshot', () => {
  it('earns nothing before work', () => {
    const snap = snapshot(base, at('08:00'));
    expect(snap.status).toBe('before');
    expect(snap.earned).toBe(0);
    expect(snap.untilNextMs).toBe(60 * 60_000);
  });

  it('accrues while working and pauses during the break', () => {
    const morning = snapshot(base, at('11:00'));
    expect(morning.status).toBe('working');
    expect(morning.earned).toBeCloseTo(500);
    expect(morning.untilNextMs).toBe(7 * 60 * 60_000);

    const lunch = snapshot(base, at('12:30'));
    expect(lunch.status).toBe('break');
    expect(lunch.earned).toBeCloseTo(750);
    expect(lunch.untilNextMs).toBe(30 * 60_000);

    const afternoon = snapshot(base, at('15:00'));
    expect(afternoon.earned).toBeCloseTo(1250);
    expect(afternoon.progress).toBeCloseTo(5 / 8);
  });

  it('keeps the full day after work', () => {
    const snap = snapshot(base, at('20:00'));
    expect(snap.status).toBe('after');
    expect(snap.earned).toBeCloseTo(2000);
    expect(snap.progress).toBe(1);
  });

  it('counts the early hours of an overnight shift toward the shift that began yesterday', () => {
    const night = { ...base, start: '22:00', end: '06:00', breakOn: false };
    const snap = snapshot(night, at('02:00'));
    expect(snap.status).toBe('working');
    expect(snap.progress).toBeCloseTo(0.5);
    expect(snapshot(night, at('07:00')).status).toBe('before');
  });

  it('moves a little every second', () => {
    const a = snapshot(base, at('10:00')).earned;
    const b = snapshot(base, at('10:00', 1)).earned;
    expect(b - a).toBeCloseTo(250 / 3600);
  });
});

describe('decimalsFor', () => {
  it('picks enough decimals for the last digit to move every frame', () => {
    expect(decimalsFor(250 / 3600)).toBe(4);
    expect(decimalsFor(100)).toBe(2);
    expect(decimalsFor(0.0001)).toBe(7);
    expect(decimalsFor(1e-6)).toBe(8);
    expect(decimalsFor(0)).toBe(2);
  });
});

describe('formatDuration', () => {
  it('shows hours only when needed', () => {
    expect(formatDuration(3_725_000)).toBe('1:02:05');
    expect(formatDuration(125_000)).toBe('02:05');
    expect(formatDuration(-1)).toBe('00:00');
  });
});

describe('equivalents', () => {
  it('has a sorted list for TWD, USD and JPY only', () => {
    const twd = rewardsFor('TWD');
    expect(twd.map((r) => r.price)).toEqual([...twd.map((r) => r.price)].sort((a, b) => a - b));
    expect(rewardsFor('USD')).toHaveLength(6);
    expect(rewardsFor('JPY')).toHaveLength(6);
    expect(rewardsFor('EUR')).toEqual([]);
  });

  it('counts rewards rounded down to one decimal', () => {
    const lunch = { id: 'lunch' as const, price: 120 };
    expect(countOf(lunch, 390)).toBe(3.2);
    expect(countOf(lunch, 360)).toBe(3);
    expect(countOf(lunch, -5)).toBe(0);
  });

  it('names the priciest reward already earned at least once', () => {
    const list = rewardsFor('TWD');
    expect(headlineReward(list, 40)).toBeNull();
    expect(headlineReward(list, 60)?.id).toBe('coffee');
    expect(headlineReward(list, 700)?.id).toBe('dinner');
    expect(headlineReward(list, 10_000)?.id).toBe('concert');
  });
});
