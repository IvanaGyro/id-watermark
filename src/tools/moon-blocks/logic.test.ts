import { describe, expect, it } from 'vitest';
import {
  addRecord,
  advanceStreak,
  alignPlan,
  cleanQuestion,
  expectedThrowsForStreak,
  faceAtFlip,
  flipFor,
  facesOf,
  GRAVITY,
  historyStats,
  HISTORY_MAX,
  impactsOf,
  initialShake,
  motionForce,
  normalizeHistory,
  normalizePrefs,
  OUTCOMES,
  outcomeOf,
  planToss,
  poseAt,
  QUESTION_MAX,
  restingPose,
  SHAKE,
  shakeStep,
  STREAK_TARGET,
  THEORETICAL,
  throwBlocks,
  tossTimeline,
  type Face,
  type Outcome,
  type RandomSource,
  type ShakeState,
  type ThrowRecord,
} from './logic';

/** Deterministic xorshift32 generator. */
function seeded(seed: number): RandomSource {
  let x = seed >>> 0 || 1;
  return (a) => {
    for (let i = 0; i < a.length; i++) {
      x ^= x << 13;
      x >>>= 0;
      x ^= x >>> 17;
      x ^= x << 5;
      x >>>= 0;
      a[i] = x;
    }
    return a;
  };
}

/** 0–1 floats from the same generator, for the cosmetic part of the toss. */
function seededFloat(seed: number): () => number {
  const next = seeded(seed);
  const buf = new Uint32Array(1);
  return () => next(buf)[0] / 0x1_0000_0000;
}

const words =
  (...values: number[]): RandomSource =>
  (a) => {
    a.set(values.slice(0, a.length));
    return a;
  };

describe('outcomeOf', () => {
  it('maps the two faces to the three results', () => {
    expect(outcomeOf('flat', 'round')).toBe('sheng');
    expect(outcomeOf('round', 'flat')).toBe('sheng');
    // 笑筊 is both FLAT sides up; 陰筊 is both ROUND (convex) sides up.
    expect(outcomeOf('flat', 'flat')).toBe('xiao');
    expect(outcomeOf('round', 'round')).toBe('yin');
  });

  it('facesOf is the inverse used by the legend', () => {
    for (const outcome of OUTCOMES) expect(outcomeOf(...facesOf(outcome))).toBe(outcome);
    expect(facesOf('xiao')).toEqual(['flat', 'flat']);
    expect(facesOf('yin')).toEqual(['round', 'round']);
  });
});

describe('throwBlocks', () => {
  it('uses the top bit of each random word for each block', () => {
    expect(throwBlocks(words(0, 0x8000_0000))).toEqual(['flat', 'round']);
    expect(throwBlocks(words(0x7fff_ffff, 0x7fff_ffff))).toEqual(['flat', 'flat']);
    expect(throwBlocks(words(0xffff_ffff, 0x8000_0001))).toEqual(['round', 'round']);
  });

  it('gives 聖筊 50%, 笑筊 25%, 陰筊 25% over many seeded throws', () => {
    for (const seed of [1, 42, 2026]) {
      const random = seeded(seed);
      const n = 40_000;
      const counts: Record<Outcome, number> = { sheng: 0, xiao: 0, yin: 0 };
      const blockA = { flat: 0, round: 0 };
      for (let i = 0; i < n; i++) {
        const faces = throwBlocks(random);
        counts[outcomeOf(...faces)]++;
        blockA[faces[0]]++;
      }
      for (const outcome of OUTCOMES) expect(Math.abs(counts[outcome] / n - THEORETICAL[outcome])).toBeLessThan(0.012);
      expect(Math.abs(blockA.flat / n - 0.5)).toBeLessThan(0.012);
    }
  });

  it('works with the real crypto source', () => {
    const faces = throwBlocks();
    expect(faces).toHaveLength(2);
    for (const f of faces) expect(['flat', 'round']).toContain(f);
  });

  it('theoretical shares add up to 1', () => {
    expect(THEORETICAL.sheng + THEORETICAL.xiao + THEORETICAL.yin).toBe(1);
  });
});

describe('expectedThrowsForStreak', () => {
  it('needs 14 throws on average for three 聖筊 in a row', () => {
    expect(expectedThrowsForStreak(0.5, 3)).toBeCloseTo(14, 10);
    expect(expectedThrowsForStreak(0.5, 1)).toBeCloseTo(2, 10);
    expect(expectedThrowsForStreak(1, 3)).toBe(3);
    expect(() => expectedThrowsForStreak(0, 3)).toThrow(RangeError);
    expect(() => expectedThrowsForStreak(0.5, 0)).toThrow(RangeError);
  });

  it('matches a simulation', () => {
    const random = seeded(7);
    let throws = 0;
    const attempts = 4000;
    for (let i = 0; i < attempts; i++) {
      let count = 0;
      do {
        throws++;
        count = advanceStreak(count, outcomeOf(...throwBlocks(random))).count;
      } while (count < STREAK_TARGET);
    }
    expect(throws / attempts).toBeGreaterThan(13);
    expect(throws / attempts).toBeLessThan(15);
  });
});

describe('advanceStreak', () => {
  it('counts 聖筊 up to three', () => {
    let step = advanceStreak(0, 'sheng');
    expect(step).toEqual({ count: 1, done: false, broken: false });
    step = advanceStreak(step.count, 'sheng');
    expect(step).toEqual({ count: 2, done: false, broken: false });
    step = advanceStreak(step.count, 'sheng');
    expect(step).toEqual({ count: 3, done: true, broken: false });
  });

  it('resets on 笑筊 or 陰筊 and reports a broken run', () => {
    expect(advanceStreak(2, 'xiao')).toEqual({ count: 0, done: false, broken: true });
    expect(advanceStreak(1, 'yin')).toEqual({ count: 0, done: false, broken: true });
    expect(advanceStreak(0, 'yin')).toEqual({ count: 0, done: false, broken: false });
  });

  it('starts a new attempt after a finished one', () => {
    expect(advanceStreak(3, 'sheng')).toEqual({ count: 1, done: false, broken: false });
    expect(advanceStreak(3, 'xiao')).toEqual({ count: 0, done: false, broken: false });
  });

  it('runs a whole sequence', () => {
    const seq: Outcome[] = ['sheng', 'sheng', 'xiao', 'sheng', 'sheng', 'sheng', 'yin'];
    let count = 0;
    const seen = seq.map((o) => {
      const step = advanceStreak(count, o);
      count = step.count;
      return `${step.count}${step.done ? '!' : ''}${step.broken ? 'x' : ''}`;
    });
    expect(seen).toEqual(['1', '2', '0x', '1', '2', '3!', '0']);
  });

  it('tolerates junk counts', () => {
    expect(advanceStreak(Number.NaN, 'sheng').count).toBe(1);
    expect(advanceStreak(-4, 'sheng').count).toBe(1);
  });
});

describe('history', () => {
  const rec = (faces: [Face, Face], extra: Partial<ThrowRecord> = {}): ThrowRecord => ({
    faces,
    outcome: outcomeOf(...faces),
    mode: 'single',
    at: 1_700_000_000_000,
    ...extra,
  });

  it('counts and shares', () => {
    const history = [rec(['flat', 'round']), rec(['round', 'flat']), rec(['flat', 'flat']), rec(['round', 'round'])];
    const stats = historyStats(history);
    expect(stats.total).toBe(4);
    expect(stats.counts).toEqual({ sheng: 2, xiao: 1, yin: 1 });
    expect(stats.shares).toEqual({ sheng: 0.5, xiao: 0.25, yin: 0.25 });
  });

  it('empty history has zero shares, not NaN', () => {
    expect(historyStats([])).toEqual({ total: 0, counts: { sheng: 0, xiao: 0, yin: 0 }, shares: { sheng: 0, xiao: 0, yin: 0 } });
  });

  it('keeps only the newest records', () => {
    let history: ThrowRecord[] = [];
    for (let i = 0; i < HISTORY_MAX + 5; i++) history = addRecord(history, rec(['flat', 'round'], { at: i }));
    expect(history).toHaveLength(HISTORY_MAX);
    expect(history[0].at).toBe(5);
    expect(history.at(-1)!.at).toBe(HISTORY_MAX + 4);
  });

  it('normalizes stored data and recomputes outcomes from faces', () => {
    const stored = [
      { faces: ['flat', 'flat'], outcome: 'sheng', mode: 'single', at: 1 }, // wrong outcome is fixed
      { faces: ['round', 'flat'], mode: 'triple', at: 2, q: '  這份工作  適合我嗎？ ', streak: 2 },
      { faces: ['flat'], at: 3 },
      { faces: ['flat', 'up'], at: 4 },
      { faces: ['round', 'round'], at: 'yesterday' },
      { faces: ['round', 'round'], mode: 'weird', at: 5, streak: 9 },
      null,
      'x',
    ];
    const history = normalizeHistory(stored);
    expect(history).toEqual([
      { faces: ['flat', 'flat'], outcome: 'xiao', mode: 'single', at: 1 },
      { faces: ['round', 'flat'], outcome: 'sheng', mode: 'triple', at: 2, q: '這份工作 適合我嗎？', streak: 2 },
      { faces: ['round', 'round'], outcome: 'yin', mode: 'single', at: 5 },
    ]);
    expect(normalizeHistory('nope')).toEqual([]);
  });

  it('caps the question length by characters', () => {
    expect(cleanQuestion('a'.repeat(QUESTION_MAX + 10))).toHaveLength(QUESTION_MAX);
    expect(cleanQuestion(42)).toBe('');
  });

  it('normalizes prefs with safe defaults', () => {
    expect(normalizePrefs(null)).toEqual({ mode: 'single', question: '', sound: true, history: [] });
    expect(normalizePrefs({ mode: 'triple', sound: false, question: '要不要搬家？' })).toMatchObject({
      mode: 'triple',
      sound: false,
      question: '要不要搬家？',
    });
    expect(normalizePrefs({ mode: 'party' }).mode).toBe('single');
  });
});

describe('shake detection', () => {
  const run = (forces: number[], stepMs = 16, state: ShakeState = initialShake(), t0 = 0) => {
    const hits: number[] = [];
    forces.forEach((f, i) => {
      const t = t0 + i * stepMs;
      const r = shakeStep(state, f, t);
      state = r.state;
      if (r.shaken) hits.push(t);
    });
    return { hits, state };
  };
  /** Accelerometer magnitude (gravity included) of a swing at `hz`, `amp` m/s² on top of gravity. */
  const swing = (ms: number, hz: number, amp: number, stepMs = 16) =>
    Array.from({ length: Math.round(ms / stepMs) }, (_, i) => {
      const g = { x: 0, y: GRAVITY + amp * Math.sin((2 * Math.PI * hz * i * stepMs) / 1000), z: 0 };
      return motionForce(g, true)!;
    });

  it('measures force with and without gravity', () => {
    expect(motionForce({ x: 0, y: 0, z: GRAVITY }, true)).toBeCloseTo(0, 6);
    expect(motionForce({ x: 0, y: -GRAVITY, z: 0 }, true)).toBeCloseTo(0, 6);
    expect(motionForce({ x: 3, y: 4, z: 0 }, false)).toBe(5);
    expect(motionForce({ x: null, y: 1, z: 1 }, false)).toBeNull();
    expect(motionForce({ x: Number.NaN, y: 1, z: 1 }, true)).toBeNull();
  });

  it('a phone lying still or carried while walking never throws', () => {
    const still = Array.from({ length: 300 }, (_, i) => motionForce({ x: 0.05 * Math.sin(i), y: 0.04, z: GRAVITY + 0.08 * Math.cos(i) }, true)!);
    expect(run(still).hits).toEqual([]);
    expect(run(swing(4000, 2, 4)).hits).toEqual([]);
  });

  it('a single jolt (picking the phone up, a bump) does not throw', () => {
    const forces = [...Array(20).fill(0.3), 18, 22, 17, ...Array(80).fill(0.4)];
    expect(run(forces).hits).toEqual([]);
  });

  it('a firm shake throws once, then cools down', () => {
    // 1.2 s of shaking at 4 Hz with ±20 m/s² swings.
    const { hits } = run(swing(1200, 4, 20));
    expect(hits).toHaveLength(1);
    expect(hits[0]).toBeLessThan(600);
  });

  it('shaking again after the cooldown throws again', () => {
    const forces = [...swing(600, 4, 20), ...Array(Math.round(SHAKE.cooldownMs / 16) + 10).fill(0.2), ...swing(600, 4, 20)];
    expect(run(forces).hits).toHaveLength(2);
  });

  it('jolts too far apart do not add up', () => {
    const gap = Array(Math.round((SHAKE.windowMs + 200) / 16)).fill(0.2);
    expect(run([18, 0.2, ...gap, 18, 0.2, ...gap, 18]).hits).toEqual([]);
  });

  it('the threshold has hysteresis so jitter around it is one jolt', () => {
    const jitter = [14, 12.5, 14, 12.8, 13.5, 12.6, 14];
    expect(run(jitter).hits).toEqual([]);
  });
});

describe('toss path', () => {
  const faces: Face[] = ['flat', 'round'];

  it('always lands with the decided face up', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const rand = seededFloat(seed);
      for (const start of faces) {
        for (const face of faces) {
          const plan = planToss(face, start, seed % 2 ? 1 : -1, rand);
          expect(faceAtFlip(poseAt(plan, plan.settle).flip)).toBe(face);
          expect(faceAtFlip(restingPose(plan).flip)).toBe(face);
          const upright = ((restingPose(plan).spin % 360) + 540) % 360 - 180;
          expect(Math.abs(upright)).toBeLessThanOrEqual(35);
          // While rocking it never tips over to the other face.
          for (let t = plan.hops[2].end; t <= plan.settle; t += 10) expect(faceAtFlip(poseAt(plan, t).flip)).toBe(face);
        }
      }
    }
  });

  it('starts in the hand showing the starting face, and tumbles in the air', () => {
    const plan = planToss('flat', 'round', -1, seededFloat(3));
    const start = poseAt(plan, 0);
    expect(start).toMatchObject({ x: plan.from.x, y: plan.from.y, h: 0 });
    expect(faceAtFlip(start.flip)).toBe('round');
    expect(Math.abs(plan.flipTo - plan.flipFrom) / Math.PI).toBeGreaterThanOrEqual(5);
  });

  it('flies up, comes down and bounces lower each time', () => {
    const plan = planToss('round', 'round', 1, seededFloat(9));
    const [toss, b1, b2] = plan.hops;
    expect(b1.height).toBeLessThan(toss.height * 0.2);
    expect(b2.height).toBeLessThan(b1.height);
    expect(poseAt(plan, (toss.start + toss.end) / 2).h).toBeCloseTo(toss.height, 6);
    for (let t = 0; t <= plan.settle + 200; t += 5) expect(poseAt(plan, t).h).toBeGreaterThanOrEqual(0);
    expect(poseAt(plan, toss.end).h).toBe(0);
    expect(poseAt(plan, plan.settle + 500)).toEqual(restingPose(plan));
  });

  it('lands left or right of centre so the two blocks do not overlap', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const left = restingPose(planToss('flat', 'flat', -1, seededFloat(seed)));
      const right = restingPose(planToss('flat', 'flat', 1, seededFloat(seed + 1000)));
      expect(right.x - left.x).toBeGreaterThan(110);
      expect(left.x).toBeGreaterThan(55);
      expect(right.x).toBeLessThan(305);
    }
  });

  it('only a convex underside (flat side up) rocks noticeably', () => {
    expect(planToss('flat', 'flat', 1, () => 0.5).rock).toBeGreaterThan(0.3);
    expect(planToss('round', 'flat', 1, () => 0.5).rock).toBeLessThan(0.1);
    expect(planToss('flat', 'flat', 1, () => 0.99).rock).toBeLessThan(Math.PI / 2);
  });

  it('aligns a new toss with the pose the block shows now', () => {
    const plan = planToss('round', 'flat', 1, seededFloat(5));
    const now = { spin: plan.spinFrom + 720 + 4, flip: 6 * Math.PI };
    const aligned = alignPlan(plan, now);
    expect(Math.abs(aligned.spinFrom - now.spin)).toBeLessThanOrEqual(180);
    expect(aligned.spinTo - aligned.spinFrom).toBeCloseTo(plan.spinTo - plan.spinFrom, 9);
    expect(aligned.flipFrom).toBeCloseTo(now.flip, 9);
    expect(faceAtFlip(aligned.flipFrom)).toBe('flat');
    expect(faceAtFlip(poseAt(aligned, aligned.settle).flip)).toBe('round');
    expect(flipFor('round')).toBe(Math.PI);
  });

  it('shows the result after both blocks land and before the animation ends', () => {
    // Regression: two round sides up (陰筊) do not rock, so the animation ends soon after landing.
    for (let seed = 1; seed <= 100; seed++) {
      for (const [a, b] of [['round', 'round'], ['flat', 'flat'], ['flat', 'round']] as [Face, Face][]) {
        const plans = [planToss(a, 'flat', -1, seededFloat(seed)), planToss(b, 'round', 1, seededFloat(seed + 500))];
        const { reveal, end } = tossTimeline(plans, 200);
        const lastLanding = Math.max(...plans.map((p) => p.hops[2].end));
        expect(reveal).toBeGreaterThan(200 + lastLanding);
        expect(reveal).toBeLessThanOrEqual(end);
        expect(end).toBe(200 + Math.max(...plans.map((p) => p.settle)));
      }
    }
  });

  it('reports three impacts, loudest first', () => {
    const plan = planToss('flat', 'round', 1, () => 0.2);
    const impacts = impactsOf(plan);
    expect(impacts.map((i) => i.at)).toEqual(plan.hops.map((h) => h.end));
    expect(impacts[0].strength).toBeGreaterThan(impacts[1].strength);
    expect(impacts[1].strength).toBeGreaterThan(impacts[2].strength);
  });
});
