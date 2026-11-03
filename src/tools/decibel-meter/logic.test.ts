import { describe, expect, it } from 'vitest';
import i18n from './i18n';
import {
  DBFS_FLOOR,
  DEFAULT_OFFSET,
  OFFSET_MAX,
  OFFSET_MIN,
  RANKS,
  REFERENCE_LEVELS,
  Ring,
  TAU_MS,
  aWeightingBiquads,
  aWeightingDb,
  addToStats,
  applyBiquads,
  biquadsResponseDb,
  calibrationOffset,
  cardFilename,
  challengeClock,
  clampOffset,
  emptyStats,
  energyAverage,
  estimateDb,
  formatElapsed,
  gaugeFraction,
  isNewBest,
  meanSquare,
  msToDbfs,
  nearestReferenceIndex,
  normalizeBest,
  normalizePrefs,
  peakOf,
  rankFor,
  rmsOf,
  rmsToDbfs,
  scoreChallenge,
  smoothPower,
  smoothingFactor,
  summarize,
  wrapText,
  zoneFor,
} from './logic';

const RATE = 48000;

function sine(freq: number, amplitude: number, seconds = 1, rate = RATE): Float64Array {
  const n = Math.round(seconds * rate);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / rate);
  return out;
}

describe('levels', () => {
  it('reads a full-scale sine as -3.01 dBFS and a half-scale sine 6 dB lower', () => {
    const full = sine(1000, 1);
    expect(rmsOf(full)).toBeCloseTo(Math.SQRT1_2, 4);
    expect(rmsToDbfs(rmsOf(full))).toBeCloseTo(-3.01, 2);
    expect(msToDbfs(meanSquare(sine(1000, 0.5)))).toBeCloseTo(-9.03, 2);
  });

  it('reads a full-scale square wave as 0 dBFS', () => {
    const square = Array.from({ length: 480 }, (_, i) => (i % 48 < 24 ? 1 : -1));
    expect(msToDbfs(meanSquare(square))).toBeCloseTo(0, 6);
    expect(peakOf(square)).toBe(1);
  });

  it('floors silence and empty buffers', () => {
    expect(meanSquare(new Float32Array(2048))).toBe(0);
    expect(meanSquare([])).toBe(0);
    expect(msToDbfs(0)).toBe(DBFS_FLOOR);
    expect(msToDbfs(1e-20)).toBe(DBFS_FLOOR);
    expect(rmsToDbfs(Number.NaN)).toBe(DBFS_FLOOR);
  });

  it('adds the calibration offset and rounds to 0.1 dB, never below 0', () => {
    expect(estimateDb(-30.04, DEFAULT_OFFSET)).toBe(64);
    expect(estimateDb(-3.01, 94)).toBe(91);
    expect(estimateDb(-41.26, 100)).toBe(58.7);
    expect(estimateDb(DBFS_FLOOR, 60)).toBe(0);
  });
});

describe('time weighting', () => {
  it('uses the IEC time constants', () => {
    expect(TAU_MS).toEqual({ fast: 125, slow: 1000 });
  });

  it('weights a new value by 1 − e^(−dt/τ)', () => {
    expect(smoothingFactor(125, 125)).toBeCloseTo(1 - Math.exp(-1), 10);
    expect(smoothingFactor(0, 125)).toBe(0);
    expect(smoothingFactor(16, 0)).toBe(1);
  });

  it('starts from the first value', () => {
    expect(smoothPower(null, 0.25, 16, 125)).toBe(0.25);
  });

  it('reaches 63 % of a step after one time constant, whatever the frame rate', () => {
    for (const tau of [TAU_MS.fast, TAU_MS.slow]) {
      for (const frames of [4, 8, 15, 60]) {
        let power = 0;
        for (let i = 0; i < frames; i++) power = smoothPower(power, 1, tau / frames, tau);
        expect(power).toBeCloseTo(1 - Math.exp(-1), 10);
      }
    }
  });

  it('lets Fast follow a 20 dB burst that Slow barely notices', () => {
    let fast = 1e-6;
    let slow = 1e-6;
    for (let i = 0; i < 6; i++) {
      // 100 ms at +20 dB
      fast = smoothPower(fast, 1e-4, 16.7, TAU_MS.fast);
      slow = smoothPower(slow, 1e-4, 16.7, TAU_MS.slow);
    }
    expect(msToDbfs(fast)).toBeGreaterThan(-48);
    expect(msToDbfs(slow)).toBeLessThan(-49);
    expect(msToDbfs(slow)).toBeGreaterThan(-60);
  });
});

describe('statistics', () => {
  it('tracks min / max of the time-weighted level and the energy average', () => {
    let stats = emptyStats();
    expect(summarize(stats)).toBeNull();
    stats = addToStats(stats, -40, 1e-4, 1000);
    stats = addToStats(stats, -20, 1e-2, 1000);
    const sum = summarize(stats)!;
    expect(sum.min).toBe(-40);
    expect(sum.max).toBe(-20);
    expect(sum.duration).toBe(2000);
    // Energy average of -40 and -20 dB for equal time: 10·log10((1e-4 + 1e-2) / 2) = -22.97 dB
    expect(sum.leq).toBeCloseTo(-22.97, 2);
  });

  it('weights the average by time', () => {
    let stats = emptyStats();
    stats = addToStats(stats, -40, 1e-4, 9000);
    stats = addToStats(stats, -20, 1e-2, 1000);
    expect(summarize(stats)!.leq).toBeCloseTo(10 * Math.log10(0.1 * 1e-2 + 0.9 * 1e-4), 6);
  });

  it('energy average is not the arithmetic mean', () => {
    expect(energyAverage([60, 80])).toBeCloseTo(77.03, 2);
    expect(energyAverage([70, 70, 70])).toBeCloseTo(70, 10);
    expect(energyAverage([])).toBeNaN();
  });

  it('averaging the time-weighted power converges to the Leq of the raw signal', () => {
    // 60 s alternating between -40 and -20 dBFS every half second, at ~60 frames per second.
    const dt = 1000 / 60;
    let raw = emptyStats();
    for (const tau of [TAU_MS.fast, TAU_MS.slow]) {
      let smoothed = emptyStats();
      raw = emptyStats();
      let p: number | null = null;
      for (let t = 0; t < 60_000; t += dt) {
        const power = Math.floor(t / 500) % 2 ? 1e-2 : 1e-4;
        p = smoothPower(p, power, dt, tau);
        raw = addToStats(raw, msToDbfs(power), power, dt);
        smoothed = addToStats(smoothed, msToDbfs(p), p, dt);
      }
      const s = summarize(smoothed)!;
      expect(Math.abs(s.leq - summarize(raw)!.leq)).toBeLessThan(0.1);
      expect(s.leq).toBeLessThanOrEqual(s.max);
      expect(s.leq).toBeGreaterThanOrEqual(s.min);
    }
    expect(summarize(raw)!.leq).toBeCloseTo(-22.97, 1);
  });

  it('ignores frames without time', () => {
    const stats = addToStats(emptyStats(), -30, 1e-3, 0);
    expect(summarize(stats)).toBeNull();
  });
});

describe('Ring', () => {
  it('keeps the newest values in order', () => {
    const ring = new Ring(3);
    expect(ring.length).toBe(0);
    for (const v of [1, 2, 3, 4, 5]) ring.push(v);
    expect(ring.length).toBe(3);
    expect(ring.capacity).toBe(3);
    expect(ring.at(0)).toBe(3);
    expect(ring.last()).toEqual([3, 4, 5]);
    expect(ring.last(2)).toEqual([4, 5]);
    expect(ring.last(10)).toEqual([3, 4, 5]);
    ring.clear();
    expect(ring.last()).toEqual([]);
  });
});

describe('display', () => {
  it('maps the 20–120 dB scale to the gauge', () => {
    expect(gaugeFraction(20)).toBe(0);
    expect(gaugeFraction(70)).toBe(0.5);
    expect(gaugeFraction(120)).toBe(1);
    expect(gaugeFraction(5)).toBe(0);
    expect(gaugeFraction(150)).toBe(1);
    expect(gaugeFraction(Number.NaN)).toBe(0);
  });

  it('colours by zone', () => {
    expect(zoneFor(45)).toBe('quiet');
    expect(zoneFor(69.9)).toBe('quiet');
    expect(zoneFor(70)).toBe('moderate');
    expect(zoneFor(85)).toBe('loud');
  });

  it('finds the nearest reference row', () => {
    const at = (db: number) => REFERENCE_LEVELS[nearestReferenceIndex(db)];
    expect(at(61)).toBe(60);
    expect(at(64.9)).toBe(60);
    expect(at(65)).toBe(70);
    expect(at(3)).toBe(20);
    expect(at(140)).toBe(120);
    expect(nearestReferenceIndex(Number.NaN)).toBe(-1);
    expect(nearestReferenceIndex(50, [])).toBe(-1);
  });

  it('formats elapsed time', () => {
    expect(formatElapsed(0)).toBe('0:00');
    expect(formatElapsed(83_400)).toBe('1:23');
    expect(formatElapsed(3_723_000)).toBe('1:02:03');
  });
});

describe('calibration', () => {
  it('computes the offset that matches a reference meter', () => {
    expect(calibrationOffset(65, -32.4)).toBe(97.4);
    expect(calibrationOffset(65.3, -32.44)).toBe(97.7);
  });

  it('rejects unusable references and measurements', () => {
    expect(calibrationOffset(5, -30)).toBeNull();
    expect(calibrationOffset(200, -30)).toBeNull();
    expect(calibrationOffset(Number.NaN, -30)).toBeNull();
    expect(calibrationOffset(60, DBFS_FLOOR)).toBeNull();
  });

  it('clamps the offset', () => {
    expect(clampOffset(500)).toBe(OFFSET_MAX);
    expect(clampOffset(-5)).toBe(OFFSET_MIN);
    expect(clampOffset(Number.NaN)).toBe(DEFAULT_OFFSET);
    expect(calibrationOffset(140, -60)).toBe(OFFSET_MAX);
  });
});

describe('A-weighting', () => {
  it('matches the standard A-weighting table', () => {
    const table: [number, number][] = [
      [31.5, -39.4],
      [63, -26.2],
      [100, -19.1],
      [125, -16.1],
      [250, -8.6],
      [500, -3.2],
      [1000, 0],
      [2000, 1.2],
      [4000, 1.0],
      [8000, -1.1],
      [16000, -6.6],
    ];
    for (const [f, db] of table) expect(aWeightingDb(f)).toBeCloseTo(db, 0);
    expect(Math.abs(aWeightingDb(1000))).toBeLessThan(0.01);
    expect(aWeightingDb(0)).toBe(-Infinity);
  });

  it.each([44100, 48000])('digital filter stays within 0.4 dB of the curve up to 10 kHz at %i Hz', (fs) => {
    const sections = aWeightingBiquads(fs);
    expect(sections).toHaveLength(3);
    for (const { a } of sections) expect(a[0]).toBe(1);
    expect(Math.abs(biquadsResponseDb(sections, 1000, fs))).toBeLessThan(1e-9);
    for (let f = 20; f <= 10000; f *= 1.05) {
      expect(Math.abs(biquadsResponseDb(sections, f, fs) - aWeightingDb(f))).toBeLessThan(0.4);
    }
  });

  it('keeps every section stable', () => {
    for (const fs of [16000, 22050, 44100, 48000, 96000]) {
      for (const { a } of aWeightingBiquads(fs)) {
        // A biquad is stable when both poles are inside the unit circle.
        expect(Math.abs(a[2])).toBeLessThan(1);
        expect(Math.abs(a[1])).toBeLessThan(1 + a[2]);
      }
    }
  });

  it('attenuates a 100 Hz tone by about 19 dB and passes 1 kHz unchanged', () => {
    const sections = aWeightingBiquads(RATE);
    const level = (f: number) => {
      const x = sine(f, 0.5, 1);
      const y = applyBiquads(sections, x).subarray(RATE / 2); // skip the filter's start-up
      return rmsToDbfs(rmsOf(y)) - rmsToDbfs(rmsOf(x.subarray(RATE / 2)));
    };
    expect(level(100)).toBeCloseTo(-19.1, 0);
    expect(Math.abs(level(1000))).toBeLessThan(0.05);
  });
});

describe('scream challenge', () => {
  it('counts down 3-2-1, then measures, then finishes', () => {
    expect(challengeClock(0)).toEqual({ phase: 'countdown', count: 3, progress: 0 });
    expect(challengeClock(999).count).toBe(3);
    expect(challengeClock(1000).count).toBe(2);
    expect(challengeClock(2500).count).toBe(1);
    expect(challengeClock(3000)).toEqual({ phase: 'measure', count: 0, progress: 0 });
    expect(challengeClock(4500).progress).toBeCloseTo(0.5, 10);
    expect(challengeClock(6000).phase).toBe('done');
  });

  it('ranks by peak level', () => {
    expect(rankFor(42)).toBe('whisper');
    expect(rankFor(59.9)).toBe('whisper');
    expect(rankFor(60)).toBe('chat');
    expect(rankFor(75)).toBe('strong');
    expect(rankFor(80)).toBe('loud');
    expect(rankFor(95.5)).toBe('roar');
    expect(rankFor(100)).toBe('siren');
    expect(rankFor(130)).toBe('siren');
    expect(RANKS.map((r) => r.min)).toEqual([...RANKS.map((r) => r.min)].sort((a, b) => a - b));
  });

  it('scores peak and average with the offset', () => {
    expect(scoreChallenge(-6.2, -11.75, 94)).toEqual({ peak: 87.8, avg: 82.3, rank: 'loud', clipped: false });
    expect(scoreChallenge(-3, -4, 100, true)).toEqual({ peak: 97, avg: 96, rank: 'roar', clipped: true });
  });

  it('never reports an average above the peak', () => {
    expect(scoreChallenge(-20, -19.9, 94).avg).toBe(74);
  });

  it('remembers only a higher peak', () => {
    const result = scoreChallenge(-6.2, -11.75, 94);
    expect(isNewBest(result, null)).toBe(true);
    expect(isNewBest(result, { peak: 87.8, avg: 80, date: '', weighting: 'A' })).toBe(false);
    expect(isNewBest(result, { peak: 87.7, avg: 80, date: '', weighting: 'A' })).toBe(true);
  });

  it('validates the stored best score', () => {
    expect(normalizeBest(null)).toBeNull();
    expect(normalizeBest('x')).toBeNull();
    expect(normalizeBest({ peak: 'loud' })).toBeNull();
    expect(normalizeBest({ peak: 91.2, avg: 99, date: '2026-11-04', weighting: 'Z' })).toEqual({
      peak: 91.2,
      avg: 91.2,
      date: '2026-11-04',
      weighting: 'Z',
    });
    expect(normalizeBest({ peak: 80, avg: 70 })?.weighting).toBe('A');
  });

  it('names the result card', () => {
    expect(cardFilename(new Date(2026, 10, 4, 9, 30), 91.6)).toBe('scream-challenge-20261104-92dB.png');
  });
});

describe('preferences', () => {
  it('fills defaults and rejects bad values', () => {
    expect(normalizePrefs(null)).toEqual({ offset: DEFAULT_OFFSET, weighting: 'A', time: 'fast', deviceId: '' });
    expect(normalizePrefs({ offset: '101.25', weighting: 'Z', time: 'slow', deviceId: 'abc' })).toEqual({
      offset: 101.3,
      weighting: 'Z',
      time: 'slow',
      deviceId: 'abc',
    });
    expect(normalizePrefs({ offset: 999, weighting: 'C', time: 'impulse', deviceId: 5 })).toEqual({
      offset: OFFSET_MAX,
      weighting: 'A',
      time: 'fast',
      deviceId: '',
    });
  });
});

describe('wrapText', () => {
  const measure = (s: string) => s.length;

  it('wraps English on spaces', () => {
    expect(wrapText('Mind your ears and your voice', 12, measure)).toEqual(['Mind your', 'ears and', 'your voice']);
  });

  it('wraps CJK between characters but keeps punctuation on the line', () => {
    expect(wrapText('這是演唱會等級的音量。', 5, measure)).toEqual(['這是演唱會', '等級的音量。']);
  });

  it('returns one line when it fits', () => {
    expect(wrapText('Short', 20, measure)).toEqual(['Short']);
    expect(wrapText('', 20, measure)).toEqual([]);
  });
});

describe('i18n', () => {
  it('has a reference label per level and a title per rank in every locale', () => {
    for (const [locale, s] of Object.entries(i18n)) {
      expect(s!.references, locale).toHaveLength(REFERENCE_LEVELS.length);
      for (const { id } of RANKS) {
        expect(s!.client.ch.ranks[id].title, `${locale} ${id}`).toBeTruthy();
        expect(s!.client.ch.ranks[id].line, `${locale} ${id}`).toBeTruthy();
      }
    }
  });

  it('uses no emoji', () => {
    expect(JSON.stringify(i18n)).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
