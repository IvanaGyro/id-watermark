import { describe, expect, it } from 'vitest';
import {
  DEFAULTS,
  averageHourly,
  costOf,
  costPerHour,
  countOf,
  formatClock,
  groupHourly,
  headcount,
  headlineReward,
  hourlyPay,
  initialMeter,
  meetingsPer,
  meterCost,
  meterElapsed,
  meterPhase,
  normalizeSettings,
  pauseMeter,
  plan,
  planProgress,
  planRemaining,
  rebaseMeter,
  resetMeter,
  restoreMeter,
  rewardsFor,
  savings,
  setRate,
  startMeter,
  toggleMeter,
  trimMinutes,
  type Settings,
} from './logic';

const MIN = 60_000;

// 22 days × 8 hours = 176 paid hours a month.
const base: Settings = {
  currency: 'TWD',
  mode: 'detail',
  quick: { label: '', count: 6, pay: 52_800, period: 'month' },
  groups: [
    { label: '主管', count: 1, pay: 88_000, period: 'month' },
    { label: '工程師', count: 4, pay: 52_800, period: 'month' },
  ],
  workDays: 22,
  hoursPerDay: 8,
  overhead: 1,
  planMinutes: 60,
  recurrence: 'weekly',
};

describe('hourlyPay', () => {
  it('turns monthly, yearly and hourly pay into an hourly rate', () => {
    expect(hourlyPay(88_000, 'month', 22, 8)).toBe(500);
    expect(hourlyPay(1_056_000, 'year', 22, 8)).toBe(500);
    expect(hourlyPay(200, 'hour', 22, 8)).toBe(200);
  });

  it('follows the working days and hours settings', () => {
    expect(hourlyPay(336_000, 'month', 21, 8)).toBe(2000);
    expect(hourlyPay(84_480, 'year', 22, 8)).toBe(40);
    expect(hourlyPay(1000, 'month', 0, 8)).toBe(0);
  });
});

describe('cost per hour', () => {
  it('adds up every row', () => {
    expect(groupHourly(base.groups[0], base)).toBe(500);
    expect(groupHourly(base.groups[1], base)).toBe(1200);
    expect(costPerHour(base)).toBe(1700);
    expect(headcount(base)).toBe(5);
    expect(averageHourly(base)).toBe(340);
  });

  it('mixes pay periods in one meeting', () => {
    const mixed: Settings = {
      ...base,
      groups: [...base.groups, { label: '實習生', count: 2, pay: 200, period: 'hour' }, { label: '顧問', count: 1, pay: 1_056_000, period: 'year' }],
    };
    expect(costPerHour(mixed)).toBe(1700 + 400 + 500);
    expect(headcount(mixed)).toBe(8);
  });

  it('uses only the single row in quick mode', () => {
    const quick: Settings = { ...base, mode: 'quick' };
    expect(costPerHour(quick)).toBe(1800);
    expect(headcount(quick)).toBe(6);
  });

  it('applies the overhead multiplier to every row', () => {
    expect(costPerHour({ ...base, overhead: 1.3 })).toBeCloseTo(2210);
    expect(averageHourly({ ...base, overhead: 1.3 })).toBeCloseTo(442);
  });

  it('is zero without attendees', () => {
    const empty: Settings = { ...base, groups: [{ label: '', count: 0, pay: 50_000, period: 'month' }] };
    expect(costPerHour(empty)).toBe(0);
    expect(averageHourly(empty)).toBe(0);
  });

  it('prices minutes of meeting', () => {
    expect(costOf(30, 1700)).toBe(850);
    expect(costOf(-5, 1700)).toBe(0);
  });
});

describe('live meter', () => {
  const t0 = 1_800_000_000_000;

  it('accumulates time and cost across pauses', () => {
    let m = startMeter(initialMeter(1200), t0);
    expect(meterPhase(m, t0)).toBe('running');
    expect(meterCost(m, t0 + 10 * MIN)).toBeCloseTo(200);

    m = pauseMeter(m, t0 + 10 * MIN);
    expect(meterPhase(m, t0 + 99 * MIN)).toBe('paused');
    // Nothing is added while paused, however long the break.
    expect(meterElapsed(m, t0 + 15 * MIN)).toBe(10 * MIN);
    expect(meterCost(m, t0 + 15 * MIN)).toBeCloseTo(200);

    m = startMeter(m, t0 + 15 * MIN);
    expect(meterElapsed(m, t0 + 35 * MIN)).toBe(30 * MIN);
    expect(meterCost(m, t0 + 35 * MIN)).toBeCloseTo(600);
  });

  it('toggles and ignores repeated start or pause', () => {
    let m = toggleMeter(initialMeter(600), t0);
    expect(startMeter(m, t0 + MIN)).toBe(m);
    m = toggleMeter(m, t0 + 6 * MIN);
    expect(pauseMeter(m, t0 + 7 * MIN)).toBe(m);
    expect(meterCost(m, t0 + 7 * MIN)).toBeCloseTo(60);
  });

  it('charges a new headcount only from the moment it changes', () => {
    let m = startMeter(initialMeter(1200), t0);
    m = setRate(m, t0 + 10 * MIN, 2400); // someone senior joins after 10 minutes
    expect(meterCost(m, t0 + 20 * MIN)).toBeCloseTo(200 + 400);
    expect(meterElapsed(m, t0 + 20 * MIN)).toBe(20 * MIN);

    // While paused, a new rate changes nothing that already happened.
    m = pauseMeter(m, t0 + 20 * MIN);
    m = setRate(m, t0 + 25 * MIN, 600);
    expect(meterCost(m, t0 + 30 * MIN)).toBeCloseTo(600);
    m = startMeter(m, t0 + 30 * MIN);
    expect(meterCost(m, t0 + 40 * MIN)).toBeCloseTo(700);
  });

  it('reprices the whole meeting after a currency change', () => {
    let m = startMeter(initialMeter(1200), t0);
    m = setRate(m, t0 + 10 * MIN, 2400);
    m = rebaseMeter(m, t0 + 20 * MIN, 60);
    expect(meterCost(m, t0 + 20 * MIN)).toBeCloseTo(20);
    expect(meterCost(m, t0 + 30 * MIN)).toBeCloseTo(30);
    expect(meterPhase(m, t0 + 30 * MIN)).toBe('running');
  });

  it('resets to idle and keeps the rate', () => {
    const m = resetMeter(1700);
    expect(meterPhase(m, t0)).toBe('idle');
    expect(meterCost(m, t0 + MIN)).toBe(0);
    expect(m.rate).toBe(1700);
  });

  it('restores a saved meter and keeps running across a reload', () => {
    const saved = JSON.parse(JSON.stringify(pauseMeter(startMeter(initialMeter(1200), t0), t0 + 5 * MIN)));
    const running = JSON.parse(JSON.stringify(startMeter(saved, t0 + 6 * MIN)));
    const restored = restoreMeter(running, t0 + 16 * MIN);
    expect(meterElapsed(restored, t0 + 16 * MIN)).toBe(15 * MIN);
    expect(meterCost(restored, t0 + 16 * MIN)).toBeCloseTo(300);
  });

  it('rejects corrupted storage and clamps a start time from the future', () => {
    expect(restoreMeter(null, t0)).toEqual(initialMeter());
    expect(restoreMeter({ startedAt: 'x', elapsedMs: 0, cost: 0, rate: 0 }, t0)).toEqual(initialMeter());
    expect(restoreMeter({ startedAt: null, elapsedMs: -1, cost: 0, rate: 0 }, t0)).toEqual(initialMeter());
    expect(restoreMeter({ startedAt: t0 + MIN, elapsedMs: 0, cost: 0, rate: 60 }, t0).startedAt).toBe(t0);
  });

  it('tracks the planned length', () => {
    expect(planProgress(15 * MIN, 30)).toBe(0.5);
    expect(planProgress(45 * MIN, 30)).toBe(1);
    expect(planRemaining(25 * MIN, 30)).toBe(5 * MIN);
    expect(planRemaining(33 * MIN, 30)).toBe(-3 * MIN);
  });

  it('formats elapsed time rounded down', () => {
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(999)).toBe('00:00');
    expect(formatClock(125_400)).toBe('02:05');
    expect(formatClock(3_725_900)).toBe('1:02:05');
  });
});

describe('planning', () => {
  it('counts meetings per month and year', () => {
    expect(meetingsPer('once', 22)).toBeNull();
    expect(meetingsPer('daily', 22)).toEqual({ month: 22, year: 264 });
    expect(meetingsPer('weekly', 22)).toEqual({ month: 52 / 12, year: 52 });
    expect(meetingsPer('monthly', 22)).toEqual({ month: 1, year: 12 });
  });

  it('prices a weekly one-hour meeting per meeting, month and year', () => {
    const p = plan(base);
    expect(p.perMeeting).toBe(1700);
    expect(p.perMonth).toBeCloseTo((1700 * 52) / 12);
    expect(p.perYear).toBe(88_400);
    expect(p.attendeeHours).toBe(5);
    expect(p.hoursPerPersonYear).toBe(52);
  });

  it('shows a daily 15-minute stand-up can cost more than a weekly hour', () => {
    const standup = plan({ ...base, planMinutes: 15, recurrence: 'daily' });
    expect(standup.perMeeting).toBe(425);
    expect(standup.perMonth).toBe(9350);
    expect(standup.perYear).toBe(112_200);
    expect(standup.perYear!).toBeGreaterThan(plan(base).perYear!);
    expect(standup.hoursPerPersonYear).toBe(66);
  });

  it('has no monthly or yearly figure for a one-off meeting', () => {
    const p = plan({ ...base, planMinutes: 90, recurrence: 'once' });
    expect(p.perMeeting).toBe(2550);
    expect(p.perMonth).toBeNull();
    expect(p.perYear).toBeNull();
    expect(p.hoursPerPersonYear).toBeNull();
    expect(p.attendeeHours).toBe(7.5);
  });

  it('suggests a trim and prices it', () => {
    expect(trimMinutes(90)).toBe(15);
    expect(trimMinutes(60)).toBe(15);
    expect(trimMinutes(30)).toBe(10);
    expect(trimMinutes(15)).toBe(5);
    expect(trimMinutes(5)).toBe(0);
    expect(savings(base, 15)).toBe(22_100);
    expect(savings({ ...base, recurrence: 'once' }, 15)).toBe(425);
    expect(savings({ ...base, recurrence: 'once', planMinutes: 10 }, 15)).toBeCloseTo(1700 / 6);
  });
});

describe('equivalents from salary-per-second', () => {
  it('names the priciest thing the meeting has already cost', () => {
    const rewards = rewardsFor('TWD');
    const top = headlineReward(rewards, 850)!;
    expect(top.id).toBe('dinner');
    expect(countOf(top, 850)).toBe(1.4);
    expect(headlineReward(rewards, 30)).toBeNull();
  });
});

describe('normalizeSettings', () => {
  it('keeps valid values and clamps the rest', () => {
    const s = normalizeSettings(
      {
        currency: 'XXX',
        mode: 'quick',
        quick: { count: '7.4', pay: '-5', period: 'year', label: 'ignored' },
        workDays: 40,
        hoursPerDay: '7.5',
        overhead: 0.5,
        planMinutes: '',
        recurrence: 'daily',
      },
      base,
    );
    expect(s.currency).toBe('TWD');
    expect(s.mode).toBe('quick');
    expect(s.quick).toEqual({ label: '', count: 7, pay: 0, period: 'year' });
    expect(s.workDays).toBe(31);
    expect(s.hoursPerDay).toBe(7.5);
    expect(s.overhead).toBe(1);
    expect(s.planMinutes).toBe(60);
    expect(s.recurrence).toBe('daily');
  });

  it('normalizes rows field by field and caps the label length', () => {
    const s = normalizeSettings(
      { groups: [{ label: '  PM  ', count: '', pay: 'abc', period: 'week' }, { label: 'x'.repeat(80), count: 3, pay: 60_000, period: 'month' }, 'junk'] },
      base,
    );
    expect(s.groups[0]).toEqual({ label: 'PM', count: 1, pay: 88_000, period: 'month' });
    expect(s.groups[1]).toEqual({ label: 'x'.repeat(40), count: 3, pay: 60_000, period: 'month' });
    expect(s.groups[2]).toEqual({ label: '', count: 1, pay: 52_800, period: 'month' });
  });

  it('falls back to the defaults for missing or empty input', () => {
    expect(normalizeSettings(null, base)).toEqual(base);
    expect(normalizeSettings({ groups: [] }, base).groups).toEqual(base.groups);
    const copy = normalizeSettings({}, base);
    copy.groups[0].count = 99;
    expect(base.groups[0].count).toBe(1);
  });
});

describe('defaults', () => {
  it('starts each locale in its own currency with a weekly hour-long meeting', () => {
    expect(DEFAULTS['zh-TW'].currency).toBe('TWD');
    expect(DEFAULTS.en.currency).toBe('USD');
    expect(DEFAULTS.en.quick.period).toBe('year');
    expect(DEFAULTS.ja.currency).toBe('JPY');
    expect(DEFAULTS.ja.workDays).toBe(21);
    for (const d of Object.values(DEFAULTS)) {
      expect(d.mode).toBe('quick');
      expect(d.planMinutes).toBe(60);
      expect(d.recurrence).toBe('weekly');
      expect(d.overhead).toBe(1);
      expect(normalizeSettings(d, d)).toEqual(d);
      expect(costPerHour(d)).toBeGreaterThan(0);
    }
  });
});
