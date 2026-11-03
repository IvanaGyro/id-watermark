import { describe, expect, it } from 'vitest';
import {
  ageOn,
  cellAt,
  cellOf,
  cellRange,
  checkBirth,
  colX,
  countWeekday,
  countYearly,
  decodeShare,
  DEFAULT_SETTINGS,
  encodeShare,
  gridLayout,
  lifeOf,
  lunarNewYearOf,
  normalizeSettings,
  progressOf,
  remainingOf,
  rowStart,
  rowY,
  stageBounds,
  stageOf,
  visitsLeft,
  type Settings,
  type YMD,
} from './logic';

const d = (iso: string): YMD => {
  const [y, m, day] = iso.split('-').map(Number);
  return { y, m, d: day };
};
/** Independent day count via Date.UTC, to cross-check the calendar code. */
const days = (a: string, b: string) => (Date.UTC(...ymdArgs(b)) - Date.UTC(...ymdArgs(a))) / 86_400_000;
const ymdArgs = (iso: string): [number, number, number] => {
  const { y, m, d: day } = d(iso);
  return [y, m - 1, day];
};

describe('rows and weeks', () => {
  it('starts every row on a birthday', () => {
    expect(rowStart(d('1990-06-15'), 0)).toEqual(d('1990-06-15'));
    expect(rowStart(d('1990-06-15'), 36)).toEqual(d('2026-06-15'));
  });

  it('puts a 2/29 birthday on 3/1 in common years', () => {
    const leap = d('2000-02-29');
    expect(rowStart(leap, 1)).toEqual(d('2001-03-01'));
    expect(rowStart(leap, 4)).toEqual(d('2004-02-29'));
    expect(ageOn(leap, d('2023-02-28'))).toBe(22);
    expect(ageOn(leap, d('2023-03-01'))).toBe(23);
    expect(ageOn(leap, d('2024-02-29'))).toBe(24);
  });

  it('finds the cell of a date', () => {
    const birth = d('1990-06-15');
    // 2026-06-15 → 2026-11-04 is 142 days = week 20 (0-based) of the 37th year
    expect(cellOf(birth, d('2026-11-04'))).toEqual({ row: 36, col: 20 });
    expect(cellOf(birth, d('2026-06-15'))).toEqual({ row: 36, col: 0 });
    expect(cellOf(birth, d('2026-06-14'))).toEqual({ row: 35, col: 51 });
  });

  it('lets the last cell of a row absorb the extra 1–2 days', () => {
    const birth = d('2024-01-01'); // first year of life is the leap year 2024 (366 days)
    expect(cellOf(birth, d('2024-12-22'))).toEqual({ row: 0, col: 50 }); // day 356
    expect(cellOf(birth, d('2024-12-23'))).toEqual({ row: 0, col: 51 }); // day 357
    expect(cellOf(birth, d('2024-12-31'))).toEqual({ row: 0, col: 51 }); // day 365
    expect(cellOf(birth, d('2025-01-01'))).toEqual({ row: 1, col: 0 });
    expect(cellRange(birth, 0, 51)).toEqual({ from: d('2024-12-23'), to: d('2024-12-31') }); // 9 days
    expect(cellRange(birth, 1, 51)).toEqual({ from: d('2025-12-24'), to: d('2025-12-31') }); // 8 days
    expect(cellRange(birth, 1, 0)).toEqual({ from: d('2025-01-01'), to: d('2025-01-07') });
  });

  it('handles leap-day birthdays across rows', () => {
    const leap = d('2000-02-29');
    // The row for age 23 runs 2023-03-01 → 2024-02-28 (365 days); its last cell ends the day before 2/29.
    expect(cellRange(leap, 23, 51).to).toEqual(d('2024-02-28'));
    expect(cellOf(leap, d('2024-02-29'))).toEqual({ row: 24, col: 0 });
  });
});

describe('lifeOf', () => {
  it('summarises a life at a given date', () => {
    const life = lifeOf(d('1990-06-15'), 80, d('2026-11-04'));
    expect(life.age).toBe(36);
    expect(life.cell).toBe(36 * 52 + 20);
    expect(life.end).toEqual(d('2070-06-15'));
    expect(life.daysLived).toBe(days('1990-06-15', '2026-11-04'));
    expect(life.totalDays).toBe(days('1990-06-15', '2070-06-15'));
    expect(life.daysLeft).toBe(days('2026-11-04', '2070-06-15'));
    expect(life.weeksLived).toBe(Math.floor(life.daysLived / 7));
    expect(life.weeksLeft).toBe(Math.floor(life.daysLeft / 7));
    expect(life.rows).toBe(80);
    expect(life.passed).toBe(false);
    expect(life.isBirthday).toBe(false);
  });

  it('runs calendar weeks a little ahead of the 52-cell rows', () => {
    const life = lifeOf(d('1986-01-01'), 80, d('2026-01-01'));
    expect(life.cell).toBe(40 * 52);
    // 40 years ≈ 40 × 1.24 extra days ≈ 7 more calendar weeks than cells
    expect(life.weeksLived - life.cell).toBe(7);
  });

  it('marks a birthday today', () => {
    const life = lifeOf(d('1990-11-04'), 80, d('2026-11-04'));
    expect(life.isBirthday).toBe(true);
    expect(life.age).toBe(36);
    expect(life.col).toBe(0);
    expect(lifeOf(d('2026-11-04'), 80, d('2026-11-04')).isBirthday).toBe(false); // born today
  });

  it('copes with being born today', () => {
    const life = lifeOf(d('2026-11-04'), 80, d('2026-11-04'));
    expect(life.cell).toBe(0);
    expect(life.daysLived).toBe(0);
    expect(progressOf(life, 0)).toBe(0);
    expect(progressOf(life, 12 * 3_600_000)).toBeCloseTo(0.5 / life.totalDays, 12);
  });

  it('shows life past the lifespan setting gracefully', () => {
    const life = lifeOf(d('1930-01-01'), 80, d('2026-11-04'));
    expect(life.passed).toBe(true);
    expect(life.daysLeft).toBe(0);
    expect(life.weeksLeft).toBe(0);
    expect(life.age).toBe(96);
    expect(life.rows).toBe(97); // grid grows so this week can still be drawn
    expect(progressOf(life, 0)).toBe(1);
    expect(remainingOf(life)).toEqual({ weekends: 0, summers: 0, newYears: 0, lunarNewYears: 0, birthdays: 0 });
  });

  it('counts the day you turn the lifespan as reached', () => {
    const life = lifeOf(d('1946-11-04'), 80, d('2026-11-04'));
    expect(life.passed).toBe(true);
    expect(life.rows).toBe(81);
  });
});

describe('progressOf', () => {
  it('ticks through the day', () => {
    const life = lifeOf(d('1990-06-15'), 80, d('2026-11-04'));
    const morning = progressOf(life, 0);
    const evening = progressOf(life, 18 * 3_600_000);
    expect(morning).toBeCloseTo(life.daysLived / life.totalDays, 12);
    expect(evening - morning).toBeCloseTo(0.75 / life.totalDays, 12);
  });
});

describe('counting things left', () => {
  it('counts weekdays in an inclusive range', () => {
    // 2026-11-04 is a Wednesday; the next Saturdays are 11/7, 11/14, 11/21, 11/28
    expect(countWeekday(d('2026-11-04'), d('2026-11-28'), 6)).toBe(4);
    expect(countWeekday(d('2026-11-04'), d('2026-11-27'), 6)).toBe(3);
    expect(countWeekday(d('2026-11-07'), d('2026-11-07'), 6)).toBe(1); // a Saturday today counts
    expect(countWeekday(d('2026-11-08'), d('2026-11-13'), 6)).toBe(0);
    expect(countWeekday(d('2026-11-08'), d('2026-11-01'), 6)).toBe(0); // reversed range
  });

  it('counts yearly dates in an inclusive range', () => {
    const jan1 = (y: number) => ({ y, m: 1, d: 1 });
    expect(countYearly(d('2026-11-04'), d('2030-01-01'), jan1)).toBe(4); // 2027–2030
    expect(countYearly(d('2027-01-01'), d('2029-12-31'), jan1)).toBe(3);
  });

  it('counts weekends, summers, new years and birthdays to the lifespan', () => {
    const life = lifeOf(d('1990-06-15'), 80, d('2026-11-04'));
    const left = remainingOf(life);
    expect(left.newYears).toBe(44); // 2027 … 2070
    expect(left.summers).toBe(43); // summer 2027 … 2069; 2070 is not over by 6/15
    expect(left.birthdays).toBe(44); // turning 37 … 80
    expect(left.lunarNewYears).toBe(44); // 2027 … 2070, all before 6/15
    const saturdays = Math.floor((days('2026-11-07', '2070-06-15')) / 7) + 1;
    expect(left.weekends).toBe(saturdays);
  });

  it('counts today when it is the day itself', () => {
    const birthday = remainingOf(lifeOf(d('1990-11-04'), 80, d('2026-11-04')));
    expect(birthday.birthdays).toBe(45); // today (36) … 80
    const newYear = remainingOf(lifeOf(d('1990-06-15'), 80, d('2027-01-01')));
    expect(newYear.newYears).toBe(44); // today … 2070
    const summerEnd = remainingOf(lifeOf(d('1990-06-15'), 80, d('2026-08-31')));
    expect(summerEnd.summers).toBe(44); // this summer still counts on its last day
    expect(remainingOf(lifeOf(d('1990-06-15'), 80, d('2026-09-01'))).summers).toBe(43);
  });

  it('counts leap-day birthdays every year', () => {
    const left = remainingOf(lifeOf(d('2000-02-29'), 30, d('2026-11-04')));
    expect(left.birthdays).toBe(4); // 2027-03-01, 2028-02-29, 2029-03-01, 2030-03-01 (turning 30)
  });

  it('uses real lunar new year dates and estimates beyond the table', () => {
    expect(lunarNewYearOf(2026)).toEqual(d('2026-02-17'));
    expect(lunarNewYearOf(2027)).toEqual(d('2027-02-06'));
    expect(lunarNewYearOf(2101)).toEqual(d('2101-02-01'));
    // 2026-02-10: this year's 春節 (2/17) is still ahead
    const left = remainingOf(lifeOf(d('2000-03-01'), 27, d('2026-02-10')));
    expect(left.lunarNewYears).toBe(2); // 2026-02-17, 2027-02-06 (the end is 2027-03-01)
    const after = remainingOf(lifeOf(d('2000-03-01'), 27, d('2026-02-18')));
    expect(after.lunarNewYears).toBe(1);
  });
});

describe('visitsLeft', () => {
  it('multiplies the years they have left by visits a year', () => {
    expect(visitsLeft({ age: 60, perYear: 6 }, 80, 40 * 365.2425)).toEqual({ years: 20, visits: 120, bonus: false });
    expect(visitsLeft({ age: 60, perYear: 0.5 }, 80, 40 * 365.2425).visits).toBe(10);
  });

  it('is capped by your own years left', () => {
    const v = visitsLeft({ age: 10, perYear: 12 }, 80, 30 * 365.2425);
    expect(v.years).toBeCloseTo(30);
    expect(v.visits).toBe(360);
  });

  it('makes no estimate for someone past the lifespan setting', () => {
    expect(visitsLeft({ age: 85, perYear: 4 }, 80, 1000)).toEqual({ years: 0, visits: 0, bonus: true });
    expect(visitsLeft({ age: 80, perYear: 4 }, 80, 1000).bonus).toBe(true);
  });

  it('still estimates when you are past the setting yourself', () => {
    expect(visitsLeft({ age: 50, perYear: 2 }, 80, 0)).toEqual({ years: 30, visits: 60, bonus: false });
  });
});

describe('stages', () => {
  it('assigns each row a stage', () => {
    const bounds = stageBounds({ schoolStart: 6, schoolEnd: 22, retire: 65 });
    expect(stageOf(0, bounds)).toBe('child');
    expect(stageOf(5, bounds)).toBe('child');
    expect(stageOf(6, bounds)).toBe('school');
    expect(stageOf(22, bounds)).toBe('work');
    expect(stageOf(64, bounds)).toBe('work');
    expect(stageOf(65, bounds)).toBe('retired');
  });

  it('keeps out-of-order ages in order without rewriting them', () => {
    expect(stageBounds({ schoolStart: 6, schoolEnd: 3, retire: 2 })).toEqual([6, 6, 6]);
    expect(stageBounds({ schoolStart: 6, schoolEnd: 70, retire: 65 })).toEqual([6, 70, 70]);
  });
});

describe('checkBirth', () => {
  const today = d('2026-11-04');
  it('accepts past dates and today', () => {
    expect(checkBirth('1990-06-15', today)).toEqual({ birth: d('1990-06-15') });
    expect(checkBirth('2026-11-04', today)).toEqual({ birth: today });
  });
  it('explains what is wrong', () => {
    expect(checkBirth('', today)).toEqual({ error: 'empty' });
    expect(checkBirth('1990-02-30', today)).toEqual({ error: 'invalid' });
    expect(checkBirth('2026-11-05', today)).toEqual({ error: 'future' });
    expect(checkBirth('1899-12-31', today)).toEqual({ error: 'tooOld' });
  });
});

describe('settings and share links', () => {
  it('normalizes junk field by field', () => {
    const s = normalizeSettings({
      birth: '1990-13-01',
      lifespan: '300',
      stagesOn: 'yes',
      schoolStart: '7',
      retire: -5,
      people: [{ name: '  媽媽  ', age: '61.6', perYear: '1000' }, { age: 'x', perYear: 2 }, 'nope'],
    });
    expect(s).toEqual({
      ...DEFAULT_SETTINGS,
      lifespan: 120,
      schoolStart: 7,
      retire: 0,
      people: [{ name: '媽媽', age: 62, perYear: 365 }],
    });
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ lifespan: '' }).lifespan).toBe(80);
  });

  it('caps people and name length', () => {
    const many = Array.from({ length: 10 }, () => ({ name: 'x'.repeat(50), age: 50, perYear: 1 }));
    const s = normalizeSettings({ people: many });
    expect(s.people).toHaveLength(6);
    expect(s.people[0].name).toHaveLength(30);
  });

  it('round-trips through a share hash', () => {
    const s: Settings = {
      birth: '1988-02-29',
      lifespan: 90,
      stagesOn: true,
      schoolStart: 7,
      schoolEnd: 24,
      retire: 60,
      people: [
        { name: 'Mom & Dad~2', age: 63, perYear: 4.5 },
        { name: '', age: 90, perYear: 1 },
      ],
    };
    const hash = `#${encodeShare(s)}`;
    expect(normalizeSettings(decodeShare(hash))).toEqual(s);
  });

  it('parses hostile or partial links defensively', () => {
    expect(decodeShare('')).toBeNull();
    expect(decodeShare('#l=80')).toBeNull();
    expect(decodeShare('#b=not-a-date')).toBeNull();
    expect(decodeShare('#b=%E0%A4%A')).toBeNull(); // malformed escape
    const partial = normalizeSettings(decodeShare('#b=2001-01-01&l=abc&s=maybe&a=1~2&p=~~&p=40~x~Bob'));
    expect(partial).toEqual({ ...DEFAULT_SETTINGS, birth: '2001-01-01', people: [] });
    const shared = decodeShare('?b=2001-01-01&p=200~3~<b>Hi</b>');
    expect(normalizeSettings(shared).people).toEqual([{ name: '<b>Hi</b>', age: 120, perYear: 3 }]);
  });
});

describe('gridLayout', () => {
  it('fits 52 whole-pixel columns into the width', () => {
    const l = gridLayout(318 * 3, 80, { gutter: 24 * 3, top: 14 * 3 });
    expect(l.pitch).toBe(Math.floor((318 * 3 - 72) / 52));
    expect(Number.isInteger(l.cell) && Number.isInteger(l.gap)).toBe(true);
    expect(l.width).toBeLessThanOrEqual(318 * 3);
    expect(l.height).toBe(rowY(l, 79) + l.cell);
  });

  it('respects a maximum cell size', () => {
    expect(gridLayout(2000, 80, { gutter: 20, top: 10, maxPitch: 12 }).pitch).toBe(12);
  });

  it('hit-tests cells, including decade gaps and edges', () => {
    const l = gridLayout(560, 80, { gutter: 24, top: 14 });
    const center = (row: number, col: number) => [colX(l, col) + l.cell / 2, rowY(l, row) + l.cell / 2] as const;
    expect(cellAt(l, ...center(0, 0))).toEqual({ row: 0, col: 0 });
    expect(cellAt(l, ...center(36, 20))).toEqual({ row: 36, col: 20 });
    expect(cellAt(l, ...center(79, 51))).toEqual({ row: 79, col: 51 });
    expect(cellAt(l, colX(l, 3), rowY(l, 9) + l.pitch + 1)).toEqual({ row: 9, col: 3 }); // in the gap after row 9
    expect(cellAt(l, 2, 100)).toBeNull();
    expect(cellAt(l, 100, l.height + 1)).toBeNull();
  });
});
