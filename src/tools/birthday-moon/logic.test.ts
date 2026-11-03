import { describe, expect, it } from 'vitest';
import {
  deltaT,
  illuminationAt,
  illuminationAtJde,
  jdeFromMs,
  lunationAt,
  moonPosition,
  msFromJde,
  phaseJde,
  phaseMs,
  sunPosition,
  SYNODIC_MONTH,
} from './astronomy';
import {
  ageDifference,
  classifyPhase,
  fullMoonBirthdays,
  instantOf,
  localDate,
  lunarDay,
  metonicEchoes,
  moonReport,
  normalizeInput,
  parseDate,
  parseShareQuery,
  parseTime,
  phaseName,
  sameDayIn,
  shareQuery,
  type MoonInput,
  type PhaseId,
} from './logic';
import { litOnRight, litPath, moonSvg, seededRandom } from './render';
import { lunarToSolar, monthsOf } from '../lunar-converter/logic';
import { addDays, toISODate, type YMD } from '../date-diff/logic';

const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;
const utc = (iso: string) => Date.parse(iso);
/** The phase with fraction `frac` (0, .25, .5, .75) nearest to an instant. */
function phaseNear(iso: string, frac: number): number {
  const k = Math.round((jdeFromMs(utc(iso)) - 2451550.09766) / SYNODIC_MONTH - frac) + frac;
  return phaseMs(k);
}
const ymd = (iso: string) => parseDate(iso)!;

describe('Meeus worked examples', () => {
  it('ch. 47: position of the Moon, 1992 April 12 0h TD (example 47.a)', () => {
    const m = moonPosition(2448724.5);
    expect(m.sums.l).toBeCloseTo(-1127527, 0);
    expect(m.sums.b).toBeCloseTo(-3229126, 0);
    expect(m.sums.r).toBeCloseTo(-16590875, 0);
    expect(m.lon).toBeCloseTo(133.162655, 6);
    expect(m.lat).toBeCloseTo(-3.229126, 6);
    expect(m.distanceKm).toBeCloseTo(368409.7, 1);
  });

  it('ch. 25: apparent longitude of the Sun, 1992 October 13.0 TD (example 25.a)', () => {
    const s = sunPosition(2448908.5);
    expect(s.lon).toBeCloseTo(199.90895, 4);
    expect(s.distanceKm / 149_597_870.7).toBeCloseTo(0.99766, 5);
  });

  it('ch. 48: illuminated fraction 0.6786, 1992 April 12 0h TD (example 48.a)', () => {
    const i = illuminationAtJde(2448724.5);
    expect(i.fraction).toBeCloseTo(0.6786, 4);
    expect(i.phaseAngle).toBeCloseTo(69.0756, 2);
    expect(i.waxing).toBe(true);
  });

  it('ch. 49: new moon of 1977 February and last quarter of 2044 January (examples 49.a, 49.b)', () => {
    expect(phaseJde(-283)).toBeCloseTo(2443192.65118, 5);
    expect(phaseJde(544.75)).toBeCloseTo(2467636.49186, 5);
  });
});

describe('phase times against well-documented eclipses', () => {
  // Solar eclipses happen at new moon, lunar eclipses at full moon; their conjunction times are widely published.
  it.each([
    ['new moon of the 2017-08-21 total solar eclipse', '2017-08-21T18:30:00Z', 0],
    ['new moon of the 2024-04-08 total solar eclipse', '2024-04-08T18:21:00Z', 0],
    ['full moon of the 2000-01-21 total lunar eclipse', '2000-01-21T04:40:00Z', 0.5],
    ['full moon of the 2022-11-08 total lunar eclipse', '2022-11-08T11:02:00Z', 0.5],
    ['full moon of the 2024-09-18 partial lunar eclipse', '2024-09-18T02:34:00Z', 0.5],
  ])('%s', (_, iso, frac) => {
    expect(Math.abs(phaseNear(iso, frac) - utc(iso))).toBeLessThan(5 * MIN);
  });
});

describe('internal consistency of the two Meeus methods', () => {
  it('ch. 47/25 elongation is 0°, 90°, 180°, 270° at the ch. 49 phase times (1900–2100)', () => {
    let worst = 0;
    for (let k = -1236; k <= 1236; k += 0.25) {
      const e = illuminationAtJde(phaseJde(k)).elongation;
      const target = (k - Math.floor(k)) * 360;
      worst = Math.max(worst, Math.abs((((e - target) % 360) + 540) % 360 - 180));
    }
    // 0.03° of elongation is about 3.5 minutes of time.
    expect(worst).toBeLessThan(0.03);
  });

  it('new moon ~0 %, quarters ~50 %, full moon ~100 % lit', () => {
    for (let k = -1200; k <= 1200; k += 37) {
      expect(illuminationAt(phaseMs(k)).fraction).toBeLessThan(0.003);
      expect(Math.abs(illuminationAt(phaseMs(k + 0.25)).fraction - 0.5)).toBeLessThan(0.005);
      expect(illuminationAt(phaseMs(k + 0.5)).fraction).toBeGreaterThan(0.997);
      expect(Math.abs(illuminationAt(phaseMs(k + 0.75)).fraction - 0.5)).toBeLessThan(0.005);
    }
  });

  it('lunations last 29.2–29.9 days and average the mean synodic month', () => {
    let min = Infinity;
    let max = 0;
    for (let k = -500; k < 500; k++) {
      const len = (phaseMs(k + 1) - phaseMs(k)) / DAY;
      min = Math.min(min, len);
      max = Math.max(max, len);
    }
    expect(min).toBeGreaterThan(29.2);
    expect(max).toBeLessThan(29.9);
    expect((phaseMs(500) - phaseMs(-500)) / DAY / 1000).toBeCloseTo(SYNODIC_MONTH, 3);
  });

  it('the lit fraction only grows from new to full and only shrinks from full to new', () => {
    const k = lunationAt(utc('2026-11-04T00:00:00Z'));
    const [n, f, n2] = [phaseMs(k), phaseMs(k + 0.5), phaseMs(k + 1)];
    let prev = -1;
    for (let t = n; t <= f; t += 2 * HOUR) {
      const x = illuminationAt(t);
      expect(x.fraction).toBeGreaterThanOrEqual(prev);
      prev = x.fraction;
    }
    prev = 2;
    for (let t = f + HOUR; t <= n2; t += 2 * HOUR) {
      const x = illuminationAt(t);
      expect(x.fraction).toBeLessThanOrEqual(prev);
      expect(x.waxing).toBe(false);
      prev = x.fraction;
    }
  });

  it('lunationAt finds the last new moon at or before an instant', () => {
    for (const iso of ['1900-01-01T00:00:00Z', '1969-07-20T20:17:00Z', '2026-11-04T12:00:00Z', '2100-12-31T23:59:00Z']) {
      const t = utc(iso);
      const k = lunationAt(t);
      expect(phaseMs(k)).toBeLessThanOrEqual(t + 1000);
      expect(phaseMs(k + 1)).toBeGreaterThan(t);
    }
  });
});

describe('agreement with the Chinese calendar (Hong Kong Observatory table)', () => {
  it('every 農曆初一 from 1930 to 2100 is the UTC+8 date of a computed new moon', () => {
    const mismatches: string[] = [];
    let checked = 0;
    for (let year = 1930; year <= 2100; year++) {
      for (const m of monthsOf(year)) {
        const first = lunarToSolar({ year, month: m.month, day: 1, isLeap: m.isLeap })!;
        checked++;
        if (lunarDay(first, 480) === 1) continue;
        // Allow only cases where the computed new moon is within minutes of midnight in Beijing.
        const k = lunationAt(Date.UTC(first.y, first.m - 1, first.d) - 8 * HOUR + DAY - 1);
        const local = (phaseMs(k) + 8 * HOUR) % DAY;
        const fromMidnight = Math.min(local, DAY - local);
        if (fromMidnight > 10 * MIN) mismatches.push(toISODate(first));
      }
    }
    expect(checked).toBeGreaterThan(2100);
    expect(mismatches).toEqual([]);
  });

  it('lunarDay counts days from the new moon day (農曆 day numbers)', () => {
    // 2024 中秋節 (八月十五) was 2024-09-17; 2026 春節 was 2026-02-17.
    expect(lunarDay(ymd('2024-09-17'), 480)).toBe(15);
    expect(lunarDay(ymd('2026-02-17'), 480)).toBe(1);
    expect(lunarDay(ymd('2026-02-18'), 480)).toBe(2);
  });
});

describe('ΔT', () => {
  it('matches known values and has no large jumps between the polynomial pieces', () => {
    expect(deltaT(2000)).toBeCloseTo(63.9, 0);
    expect(deltaT(1950)).toBeCloseTo(29.1, 0);
    for (const y of [1700, 1800, 1860, 1900, 1920, 1941, 1961, 1986, 2005, 2050, 2150]) {
      expect(Math.abs(deltaT(y - 1e-6) - deltaT(y))).toBeLessThan(2.5);
    }
  });

  it('round-trips between UT and TT', () => {
    const t = utc('2026-11-04T12:00:00Z');
    expect(Math.abs(msFromJde(jdeFromMs(t)) - t)).toBeLessThan(5);
  });
});

describe('moonReport and phase names', () => {
  it('names the full moon of the 2022-11-08 lunar eclipse in Taipei', () => {
    const r = moonReport(instantOf(ymd('2022-11-08'), '', 'Asia/Taipei'), 'Asia/Taipei');
    expect(r.phase).toBe('full');
    expect(r.fraction).toBeGreaterThan(0.99);
    expect(r.age).toBeGreaterThan(14);
    expect(r.age).toBeLessThan(15.5);
  });

  it('names the new moon on the local day it happens (2024-04-08 18:21 UTC is April 9 in Taipei)', () => {
    const zone = 'Asia/Taipei';
    expect(moonReport(instantOf(ymd('2024-04-09'), '21:00', zone), zone).phase).toBe('new');
    expect(moonReport(instantOf(ymd('2024-04-08'), '12:00', 'America/Chicago'), 'America/Chicago').phase).toBe('new');
    const crescent = moonReport(instantOf(ymd('2024-04-12'), '21:00', zone), zone);
    expect(crescent.phase).toBe('waxingCrescent');
    expect(crescent.waxing).toBe(true);
    expect(crescent.age).toBeGreaterThan(3);
    expect(crescent.age).toBeLessThan(4);
    expect(crescent.nearestNew.kind).toBe('new');
    expect(crescent.nearestNew.at).toBe(crescent.cycle[0].at);
  });

  it('walks through all eight phases in order over one lunation', () => {
    const k = lunationAt(utc('2025-01-01T00:00:00Z'));
    const seen: PhaseId[] = [];
    for (let t = phaseMs(k) + HOUR; t < phaseMs(k + 1) - HOUR; t += 6 * HOUR) {
      const p = moonReport(t, 'UTC').phase;
      if (seen[seen.length - 1] !== p) seen.push(p);
    }
    expect(seen).toEqual([
      'new',
      'waxingCrescent',
      'firstQuarter',
      'waxingGibbous',
      'full',
      'waningGibbous',
      'lastQuarter',
      'waningCrescent',
      'new',
    ]);
  });

  it('classifies by elongation when no principal phase is near', () => {
    const far = [{ kind: 'full' as const, at: utc('2026-01-01T00:00:00Z') }];
    const at = utc('2026-02-01T00:00:00Z');
    expect(classifyPhase(at, 45, far, 'UTC')).toBe('waxingCrescent');
    expect(classifyPhase(at, 135, far, 'UTC')).toBe('waxingGibbous');
    expect(classifyPhase(at, 225, far, 'UTC')).toBe('waningGibbous');
    expect(classifyPhase(at, 315, far, 'UTC')).toBe('waningCrescent');
  });

  it('cycle holds the five principal phases in order, progress in 0–1', () => {
    const r = moonReport(utc('1995-08-15T13:00:00Z'), 'Asia/Taipei');
    expect(r.cycle.map((e) => e.kind)).toEqual(['new', 'firstQuarter', 'full', 'lastQuarter', 'new']);
    for (let i = 1; i < r.cycle.length; i++) expect(r.cycle[i].at).toBeGreaterThan(r.cycle[i - 1].at);
    expect(r.progress).toBeGreaterThanOrEqual(0);
    expect(r.progress).toBeLessThan(1);
    expect(Math.abs(r.nearestFull.at - r.at)).toBeLessThanOrEqual(SYNODIC_MONTH * DAY * 0.6);
  });

  it('uses Japanese traditional names for in-between phases only', () => {
    const names = Object.fromEntries(
      ['new', 'waxingCrescent', 'firstQuarter', 'waxingGibbous', 'full', 'waningGibbous', 'lastQuarter', 'waningCrescent'].map((p) => [p, p]),
    ) as Record<PhaseId, string>;
    const traditional = { 3: '三日月', 15: '十五夜', 16: '十六夜' };
    expect(phaseName('waxingCrescent', names, 3, traditional)).toBe('三日月');
    expect(phaseName('waningGibbous', names, 16, traditional)).toBe('十六夜');
    expect(phaseName('full', names, 15, traditional)).toBe('full');
    expect(phaseName('waxingCrescent', names, 5, traditional)).toBe('waxingCrescent');
    expect(phaseName('waxingCrescent', names)).toBe('waxingCrescent');
  });
});

describe('dates, times and zones', () => {
  it('parses times and dates defensively', () => {
    expect(parseTime('21:05')).toBe(1265);
    expect(parseTime('7:30')).toBe(450);
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('ab:cd')).toBeNull();
    expect(parseTime(undefined)).toBeNull();
    expect(parseDate('1995-08-15')).toEqual({ y: 1995, m: 8, d: 15 });
    expect(parseDate('2023-02-29')).toBeNull();
    expect(parseDate('1899-12-31')).toBeNull();
    expect(parseDate('2101-01-01')).toBeNull();
    expect(parseDate('1995-08-15<script>')).toBeNull();
    expect(parseDate(19950815)).toBeNull();
  });

  it('converts a wall time in a zone to an instant, defaulting to 21:00', () => {
    expect(instantOf(ymd('2026-11-04'), '21:00', 'Asia/Taipei')).toBe(utc('2026-11-04T13:00:00Z'));
    expect(instantOf(ymd('2026-11-04'), '', 'Asia/Tokyo')).toBe(utc('2026-11-04T12:00:00Z'));
    expect(instantOf(ymd('2026-07-04'), '21:00', 'America/New_York')).toBe(utc('2026-07-05T01:00:00Z'));
    expect(instantOf(ymd('2026-07-04'), '21:00', 'Not/AZone')).toBe(utc('2026-07-04T21:00:00Z'));
    expect(localDate(utc('2026-11-04T17:00:00Z'), 'Asia/Tokyo')).toEqual({ y: 2026, m: 11, d: 5 });
  });

  it('moves 29 February to 28 February in common years', () => {
    expect(sameDayIn(ymd('2000-02-29'), 2001)).toEqual({ y: 2001, m: 2, d: 28 });
    expect(sameDayIn(ymd('2000-02-29'), 2004)).toEqual({ y: 2004, m: 2, d: 29 });
    expect(sameDayIn(ymd('1995-08-15'), 2030)).toEqual({ y: 2030, m: 8, d: 15 });
  });
});

describe('full-moon birthdays', () => {
  it('lists upcoming years when the moon is full or nearly full on the date', () => {
    const today: YMD = { y: 2026, m: 11, d: 4 };
    const list = fullMoonBirthdays(ymd('1995-08-15'), '', 'Asia/Taipei', today);
    expect(list.length).toBe(6);
    let last = 2025;
    for (const item of list) {
      expect(item.year).toBeGreaterThan(last);
      last = item.year;
      expect(item.date).toEqual({ y: item.year, m: 8, d: 15 });
      expect(item.exact || item.fraction >= 0.97).toBe(true);
      // Cross-check with an independent report.
      const r = moonReport(instantOf(item.date, '', 'Asia/Taipei'), 'Asia/Taipei');
      expect(r.fraction).toBeCloseTo(item.fraction, 6);
    }
  });

  it('starts this year when the date is still ahead, next year otherwise', () => {
    const today: YMD = { y: 2026, m: 11, d: 4 };
    const all = fullMoonBirthdays(ymd('2000-11-04'), '', 'UTC', today, { count: 200, years: 40 });
    expect(all.every((x) => x.year >= 2026 && x.year <= 2066)).toBe(true);
    // Roughly one year in nine has a (nearly) full moon on a given date.
    expect(all.length).toBeGreaterThan(2);
    expect(all.length).toBeLessThan(10);
    const later = fullMoonBirthdays(ymd('2000-01-01'), '', 'UTC', today, { count: 200, years: 40 });
    expect(later.every((x) => x.year >= 2027)).toBe(true);
  });

  it('includes 2022-11-08 (total lunar eclipse) as an exact full-moon date', () => {
    const list = fullMoonBirthdays(ymd('1990-11-08'), '', 'Asia/Taipei', { y: 2022, m: 1, d: 1 }, { count: 1 });
    expect(list[0]).toMatchObject({ year: 2022, exact: true });
  });
});

describe('Metonic cycle', () => {
  it('the moon on the same date 19 years later is within about a day of the same age', () => {
    let worst = 0;
    let oneYearMean = 0;
    let n = 0;
    for (let d = ymd('1900-01-03'); toISODate(d) < '2080-01-01'; d = addDays(d, 23)) {
      const [echo] = metonicEchoes(d, '', 'UTC', [19]);
      worst = Math.max(worst, Math.abs(echo.ageDiff));
      oneYearMean += Math.abs(metonicEchoes(d, '', 'UTC', [1])[0].ageDiff);
      n++;
    }
    expect(worst).toBeLessThan(1.5);
    // A single year shifts the phase by about 11 days, so 19 years is a real recurrence, not chance.
    expect(oneYearMean / n).toBeGreaterThan(9);
  });

  it('reports 19, 38 and 57 years later and stops at 2200', () => {
    expect(metonicEchoes(ymd('1995-08-15'), '', 'Asia/Taipei').map((e) => e.date.y)).toEqual([2014, 2033, 2052]);
    expect(metonicEchoes(ymd('2100-01-01'), '', 'UTC').map((e) => e.years)).toEqual([19, 38, 57]);
    expect(metonicEchoes(ymd('2100-01-01'), '', 'UTC', [19, 101]).map((e) => e.years)).toEqual([19]);
  });

  it('wraps age differences into half a lunation', () => {
    expect(ageDifference(29, 1)).toBeCloseTo(1 + SYNODIC_MONTH - 29, 6);
    expect(ageDifference(1, 29)).toBeCloseTo(29 - 1 - SYNODIC_MONTH, 6);
    expect(ageDifference(10, 12)).toBe(2);
  });
});

describe('share links and stored input', () => {
  const fallback: MoonInput = { date: '2026-11-04', time: '', zone: 'Asia/Taipei', south: false };

  it('round-trips a share link', () => {
    const input: MoonInput = { date: '1995-08-15', time: '06:30', zone: 'America/New_York', south: true };
    const q = shareQuery(input);
    expect(q).toBe('?d=1995-08-15&t=06%3A30&tz=America%2FNew_York&h=s');
    expect(parseShareQuery(q)).toEqual(input);
    expect(parseShareQuery('?d=1995-08-15')).toEqual({ date: '1995-08-15' });
  });

  it('ignores bad or hostile values', () => {
    expect(parseShareQuery('')).toBeNull();
    expect(parseShareQuery('?d=1995-13-01')).toBeNull();
    expect(parseShareQuery('?d=<img src=x onerror=alert(1)>')).toBeNull();
    expect(parseShareQuery('?d=1995-08-15&t=99:99&tz=Mars/Olympus&h=x')).toEqual({ date: '1995-08-15' });
    expect(parseShareQuery('?d=1995-08-15&tz=../../etc')).toEqual({ date: '1995-08-15' });
    expect(parseShareQuery(`?d=1995-08-15&tz=${'A'.repeat(500)}`)).toEqual({ date: '1995-08-15' });
  });

  it('normalizes stored input', () => {
    expect(normalizeInput(null, fallback)).toEqual(fallback);
    expect(normalizeInput({ date: '2000-02-30', time: '9:05', zone: 'Asia/Tokyo', south: 'yes' }, fallback)).toEqual({
      ...fallback,
      time: '09:05',
      zone: 'Asia/Tokyo',
    });
    expect(normalizeInput({ date: '1969-07-20', time: '', south: true }, { ...fallback, time: '21:00' })).toEqual({
      ...fallback,
      date: '1969-07-20',
      time: '',
      south: true,
    });
  });
});

describe('moon drawing', () => {
  it('draws the lit part with the right terminator', () => {
    // New moon: the terminator coincides with the lit limb (zero area). Full: both halves are the limb.
    expect(litPath(0, 100)).toBe('M0 -100A100 100 0 0 1 0 100A100 100 0 0 0 0 -100Z');
    expect(litPath(1, 100)).toBe('M0 -100A100 100 0 0 1 0 100A100 100 0 0 1 0 -100Z');
    // Quarter: a straight terminator. Crescent and gibbous bulge opposite ways.
    expect(litPath(0.5, 100)).toBe('M0 -100A100 100 0 0 1 0 100A0 100 0 0 1 0 -100Z');
    expect(litPath(0.25, 100)).toContain('A50 100 0 0 0 0 -100Z');
    expect(litPath(0.75, 100)).toContain('A50 100 0 0 1 0 -100Z');
    expect(litPath(-1, 100)).toBe(litPath(0, 100));
  });

  it('puts the lit limb on the correct side for each hemisphere', () => {
    expect(litOnRight(true, false)).toBe(true);
    expect(litOnRight(false, false)).toBe(false);
    expect(litOnRight(true, true)).toBe(false);
    expect(litOnRight(false, true)).toBe(true);
  });

  it('builds a self-contained SVG with unique ids', () => {
    const svg = moonSvg({ fraction: 0.3, waxing: true, south: true, id: 'm1', size: 300, label: 'A "moon"' });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain('url(#m1-mask)');
    expect(svg).toContain('rotate(180)');
    expect(svg).toContain('aria-label="A &quot;moon&quot;"');
    expect(svg).not.toContain('NaN');
    const icon = moonSvg({ fraction: 0.9, waxing: false, south: false, id: 'm2', size: 28, detail: false });
    expect(icon).toContain('scale(-1 1)');
    expect(icon).toContain('aria-hidden="true"');
  });

  it('seeds the star field from the date', () => {
    const a = seededRandom('1995-08-15');
    const b = seededRandom('1995-08-15');
    const c = seededRandom('1995-08-16');
    const xs = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(xs);
    expect(c()).not.toBe(xs[0]);
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
  });
});
