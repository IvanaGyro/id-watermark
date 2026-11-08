import { describe, expect, it } from 'vitest';
import { LATEST, YEARS, AGES, INDUSTRIES } from './data';
import {
  annualPay,
  checkAmount,
  clampMonths,
  dotOrder,
  dotState,
  groupBand,
  nextMilestone,
  rankHistory,
  rankOf,
  toYuan,
  trackMax,
  medianWords,
  versusMedian,
} from './logic';

describe('rankOf', () => {
  it('returns the official percent at each published cut point', () => {
    const cases: [number, number][] = [
      [330_000, 10],
      [381_000, 20],
      [406_000, 25],
      [432_000, 30],
      [487_000, 40],
      [546_000, 50],
      [628_000, 60],
      [753_000, 70],
      [842_000, 75],
      [959_000, 80],
      [1_336_000, 90],
    ];
    for (const [pay, pct] of cases) expect(rankOf(pay)).toEqual({ kind: 'within', pct });
  });

  it('interpolates between cut points', () => {
    expect(rankOf(690_500).pct).toBe(65);
    expect(rankOf(587_000).pct).toBe(55);
  });

  it('stops at the edges of the published data', () => {
    expect(rankOf(329_999)).toEqual({ kind: 'below', pct: 10 });
    expect(rankOf(1_336_001)).toEqual({ kind: 'above', pct: 90 });
  });

  it('never goes down as pay rises', () => {
    let last = 0;
    for (let pay = 330_000; pay <= 1_336_000; pay += 1_000) {
      const { pct } = rankOf(pay);
      expect(pct).toBeGreaterThanOrEqual(last);
      last = pct;
    }
  });
});

describe('rankHistory', () => {
  it('ranks the same pay higher in earlier years', () => {
    const history = rankHistory(600_000);
    expect(history).toHaveLength(YEARS.length);
    expect(history[0].year).toBe(2014);
    expect(history[0].rank.pct).toBeGreaterThan(history[history.length - 1].rank.pct);
  });

  it('uses each year’s own table', () => {
    expect(rankHistory(452_000)[0].rank).toEqual({ kind: 'within', pct: 50 });
  });
});

describe('nextMilestone', () => {
  it('gives the next decile and the exact gap', () => {
    expect(nextMilestone(600_000)).toEqual({ pct: 60, gap: 28_000 });
    expect(nextMilestone(100_000)).toEqual({ pct: 10, gap: 230_000 });
  });

  it('moves on once a cut point is reached', () => {
    expect(nextMilestone(546_000)?.pct).toBe(60);
  });

  it('is null past the last published decile', () => {
    expect(nextMilestone(1_336_000)).toBeNull();
  });
});

describe('groupBand', () => {
  const group = { q1: 40, median: 50, q3: 60 };

  it('places pay against the quartiles', () => {
    expect(groupBand(399_999, group)).toBe('bottom');
    expect(groupBand(400_000, group)).toBe('lower');
    expect(groupBand(500_000, group)).toBe('upper');
    expect(groupBand(600_000, group)).toBe('top');
  });
});

describe('pay input', () => {
  it('turns monthly pay into annual pay', () => {
    expect(annualPay('monthly', 45_000, 13)).toBe(585_000);
    expect(annualPay('annual', 800_000, 13)).toBe(800_000);
  });

  it('falls back and clamps the months', () => {
    expect(clampMonths(Number.NaN)).toBe(13);
    expect(clampMonths(0)).toBe(1);
    expect(clampMonths(99)).toBe(36);
  });

  it('flags amounts that are probably in the wrong unit', () => {
    expect(checkAmount('monthly', Number.NaN, 13)).toBe('empty');
    expect(checkAmount('monthly', 0, 13)).toBe('empty');
    expect(checkAmount('monthly', 45, 13)).toBe('small');
    expect(checkAmount('annual', 80, 13)).toBe('small');
    expect(checkAmount('monthly', 45_000, 13)).toBe('ok');
    expect(checkAmount('annual', 2e10, 13)).toBe('big');
  });
});

describe('versusMedian and trackMax', () => {
  it('compares with a median', () => {
    expect(versusMedian(655_200, 54.6)).toBe(20);
    expect(versusMedian(436_800, 54.6)).toBe(-20);
  });

  it('words the gap, switching to a multiple at double the median', () => {
    expect(medianWords(546_000, 54.6)).toBe('和中位數差不多');
    expect(medianWords(655_200, 54.6)).toBe('比中位數高 20%');
    expect(medianWords(436_800, 54.6)).toBe('比中位數低 20%');
    expect(medianWords(1_081_080, 54.6)).toBe('比中位數高 98%');
    expect(medianWords(1_092_000, 54.6)).toBe('是中位數的 2 倍');
    expect(medianWords(9_000_000, 58.5)).toBe('是中位數的 15.4 倍');
  });

  it('fits the tracks to the pay within limits', () => {
    expect(trackMax(500_000, [100])).toBe(1_150_000);
    expect(trackMax(1_400_000, [100])).toBe(1_470_000);
    expect(trackMax(90_000_000, [100])).toBe(1_600_000);
  });
});

describe('dots', () => {
  it('numbers cells from the bottom-left', () => {
    expect(dotOrder(9, 0)).toBe(0);
    expect(dotOrder(0, 9)).toBe(99);
  });

  it('fills dots up to the rank and marks the position', () => {
    const rank = { kind: 'within', pct: 62 } as const;
    expect(dotState(61, rank)).toBe('beat');
    expect(dotState(62, rank)).toBe('you');
    expect(dotState(63, rank)).toBe('ahead');
  });

  it('marks a zone where the data stops', () => {
    expect(dotState(89, { kind: 'above', pct: 90 })).toBe('beat');
    expect(dotState(90, { kind: 'above', pct: 90 })).toBe('zone');
    expect(dotState(9, { kind: 'below', pct: 10 })).toBe('zone');
    expect(dotState(10, { kind: 'below', pct: 10 })).toBe('ahead');
    expect(dotState(0, null)).toBe('ahead');
  });
});

describe('data', () => {
  it('keeps every year’s cut points ascending', () => {
    for (const row of YEARS) {
      const points = [row.d[0], row.d[1], row.q1, row.d[2], row.d[3], row.d[4], row.d[5], row.d[6], row.q3, row.d[7], row.d[8]];
      expect([...points].sort((a, b) => a - b)).toEqual(points);
    }
  });

  it('keeps every group’s quartiles in order', () => {
    const groups = [...AGES, ...INDUSTRIES.flatMap((i) => i.groups)];
    for (const g of groups) {
      expect(g.q1).toBeLessThanOrEqual(g.median);
      expect(g.median).toBeLessThanOrEqual(g.q3);
    }
  });

  it('matches the published latest figures', () => {
    expect(LATEST.roc).toBe(113);
    expect(toYuan(LATEST.d[4])).toBe(546_000);
  });
});
