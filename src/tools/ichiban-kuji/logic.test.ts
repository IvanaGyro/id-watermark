import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  MAX_TICKETS,
  atLeastOne,
  commitmentText,
  createBoard,
  cryptoInt,
  drawRandom,
  drawTicket,
  expectedDraws,
  guaranteedDraws,
  normalizeSetup,
  presetsFor,
  remainingByTier,
  remainingTickets,
  restoreBoard,
  sha256Hex,
  shuffle,
  summarizePlayers,
  tierColor,
  tierLabel,
  totalTickets,
  undoDraw,
  validateSetup,
  type Setup,
} from './logic';

/** Deterministic RNG for tests (mulberry32). */
function seeded(seed: number) {
  let a = seed >>> 0;
  return (n: number) => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return Math.floor(r * n);
  };
}

const setup = (counts: number[], last = false): Setup => ({
  title: 'T',
  tiers: counts.map((count, i) => ({ label: tierLabel(i, 'zh-TW'), name: `P${i}`, count })),
  last: { enabled: last, name: last ? 'Last' : '' },
  price: 350,
});

describe('tierLabel', () => {
  it('uses the local tier code', () => {
    expect(tierLabel(0, 'zh-TW')).toBe('A賞');
    expect(tierLabel(2, 'ja')).toBe('C賞');
    expect(tierLabel(1, 'en')).toBe('Prize B');
  });
});

describe('cryptoInt / shuffle', () => {
  it('stays in range', () => {
    for (let i = 0; i < 500; i++) {
      const v = cryptoInt(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
    expect(cryptoInt(1)).toBe(0);
    expect(() => cryptoInt(0)).toThrow();
  });
  it('shuffles into a permutation without touching the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input, seeded(1));
    expect(out.slice().sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('is roughly uniform', () => {
    const rand = seeded(42);
    const firsts = [0, 0, 0, 0];
    for (let i = 0; i < 8000; i++) firsts[shuffle([0, 1, 2, 3], rand)[0]]++;
    for (const c of firsts) expect(Math.abs(c - 2000)).toBeLessThan(200);
  });
});

describe('normalizeSetup / validateSetup', () => {
  it('trims, clamps and fills blank labels', () => {
    const s = normalizeSetup(
      {
        title: '  My  ',
        tiers: [
          { label: ' ', name: ' x\n', count: 2.6 },
          { label: 'SP', name: '', count: -4 },
        ],
        last: { enabled: true, name: ' L ' },
        price: -10,
      },
      'zh-TW',
    );
    expect(s.title).toBe('My');
    expect(s.tiers).toEqual([
      { label: 'A賞', name: 'x', count: 3 },
      { label: 'SP', name: '', count: 0 },
    ]);
    expect(s.last).toEqual({ enabled: true, name: 'L' });
    expect(s.price).toBe(0);
  });
  it('survives garbage', () => {
    const s = normalizeSetup(null, 'en');
    expect(s.tiers).toEqual([]);
    expect(validateSetup(s)).toBe('empty');
  });
  it('rejects too many tickets', () => {
    expect(validateSetup(setup([MAX_TICKETS, 1]))).toBe('tooMany');
    expect(validateSetup(setup([MAX_TICKETS]))).toBeNull();
  });
});

describe('board', () => {
  it('holds exactly the configured tickets', () => {
    const b = createBoard(setup([1, 2, 3]), seeded(3), 'abcdef0123');
    expect(b.tickets).toHaveLength(6);
    expect(b.tickets.filter((t) => t === 0)).toHaveLength(1);
    expect(b.tickets.filter((t) => t === 2)).toHaveLength(3);
  });
  it('skips zero-count tiers', () => {
    const b = createBoard(setup([1, 0, 2]), seeded(3), 'abcdef0123');
    expect(b.tickets).not.toContain(1);
    expect(remainingByTier(b)).toEqual([1, 0, 2]);
  });
  it('opens a ticket once', () => {
    const b = createBoard(setup([1, 2]), seeded(5), 'abcdef0123');
    const d = drawTicket(b, 2, ' Amy ', 100);
    expect(d).toEqual({ ticket: 2, tier: b.tickets[1], player: 'Amy', at: 100 });
    expect(drawTicket(b, 2, '', 101)).toBeNull();
    expect(drawTicket(b, 0, '', 101)).toBeNull();
    expect(drawTicket(b, 4, '', 101)).toBeNull();
    expect(drawTicket(b, 1.5, '', 101)).toBeNull();
    expect(remainingTickets(b)).toEqual([1, 3]);
  });
  it('counts remaining per tier', () => {
    const b = createBoard(setup([1, 2]), seeded(9), 'abcdef0123');
    const a = b.tickets.indexOf(0) + 1;
    drawTicket(b, a, '', 0);
    expect(remainingByTier(b)).toEqual([0, 2]);
  });
  it('awards the Last One prize to the final draw only', () => {
    const b = createBoard(setup([1, 2], true), seeded(7), 'abcdef0123');
    const draws = drawRandom(b, 10, 'Bo', seeded(8), () => 1);
    expect(draws).toHaveLength(3);
    expect(draws.map((d) => Boolean(d.last))).toEqual([false, false, true]);
    expect(remainingTickets(b)).toEqual([]);
    expect(drawRandom(b, 1, '', seeded(8), () => 1)).toEqual([]);
  });
  it('does not flag last when the prize is off', () => {
    const b = createBoard(setup([2]), seeded(7), 'abcdef0123');
    const draws = drawRandom(b, 2, '', seeded(8), () => 1);
    expect(draws.some((d) => d.last)).toBe(false);
  });
  it('random draws never repeat a ticket', () => {
    const b = createBoard(setup([5, 10, 25]), seeded(11), 'abcdef0123');
    const draws = drawRandom(b, 40, '', seeded(12), () => 0);
    expect(new Set(draws.map((d) => d.ticket)).size).toBe(40);
    expect(remainingByTier(b)).toEqual([0, 0, 0]);
  });
  it('undoes the last draw', () => {
    const b = createBoard(setup([1, 1], true), seeded(1), 'abcdef0123');
    drawRandom(b, 2, '', seeded(2), () => 0);
    const undone = undoDraw(b);
    expect(undone?.last).toBe(true);
    expect(remainingTickets(b)).toHaveLength(1);
    undoDraw(b);
    expect(undoDraw(b)).toBeNull();
  });
});

describe('odds', () => {
  it('matches the hypergeometric formula', () => {
    // 80 tickets, 1 A prize, 10 draws: 1 - C(79,10)/C(80,10) = 10/80.
    expect(atLeastOne(80, 1, 10)).toBeCloseTo(0.125, 10);
    // 10 left, 2 wanted, 3 draws: 1 - (8·7·6)/(10·9·8) = 1 - 336/720.
    expect(atLeastOne(10, 2, 3)).toBeCloseTo(1 - 336 / 720, 10);
    expect(atLeastOne(10, 2, 9)).toBe(1);
    expect(atLeastOne(10, 0, 5)).toBe(0);
    expect(atLeastOne(10, 3, 0)).toBe(0);
  });
  it('gives expected and worst-case draws', () => {
    expect(expectedDraws(80, 1)).toBeCloseTo(40.5);
    expect(expectedDraws(10, 0)).toBe(Infinity);
    expect(guaranteedDraws(80, 1)).toBe(80);
    expect(guaranteedDraws(10, 3)).toBe(8);
    expect(guaranteedDraws(10, 0)).toBe(Infinity);
  });
  it('expected draws agree with a simulation', () => {
    const rand = seeded(99);
    let sum = 0;
    const runs = 4000;
    for (let i = 0; i < runs; i++) sum += shuffle([0, 0, 0, 0, 0, 0, 0, 1, 1], rand).indexOf(1) + 1;
    expect(sum / runs).toBeCloseTo(expectedDraws(9, 2), 0);
  });
});

describe('commitment', () => {
  it('lists every ticket with its tier label', () => {
    const b = createBoard(setup([1, 1]), () => 0, '0011aabb');
    // shuffle with rand=0: [0,1] → swap(1,0) → [1,0]
    expect(commitmentText(b)).toBe('salt=0011aabb;1=B賞,2=A賞');
  });
  it('hashes like any other SHA-256 tool', async () => {
    const text = 'salt=0011aabb;1=B賞,2=A賞';
    expect(await sha256Hex(text)).toBe(createHash('sha256').update(text, 'utf8').digest('hex'));
  });
});

describe('summarizePlayers', () => {
  it('groups draws by player in order of appearance', () => {
    const list = summarizePlayers([
      { ticket: 1, tier: 2, player: 'Amy', at: 0 },
      { ticket: 2, tier: 0, player: '', at: 0 },
      { ticket: 3, tier: 2, player: 'Amy', at: 0, last: true },
    ]);
    expect(list.map((p) => [p.player, p.draws, p.last])).toEqual([
      ['Amy', 2, true],
      ['', 1, false],
    ]);
    expect(list[0].tiers.get(2)).toBe(2);
  });
});

describe('restoreBoard', () => {
  const fresh = () => {
    const b = createBoard(setup([1, 2, 3], true), seeded(4), 'abcdef0123');
    drawRandom(b, 2, 'Amy', seeded(5), () => 123);
    return JSON.parse(JSON.stringify(b));
  };
  it('round-trips a saved board', () => {
    const saved = fresh();
    const b = restoreBoard(saved, 'zh-TW');
    expect(b?.draws).toEqual(saved.draws);
    expect(b?.tickets).toEqual(saved.tickets);
  });
  it('rejects tampered or broken data', () => {
    expect(restoreBoard(null, 'zh-TW')).toBeNull();
    expect(restoreBoard('x', 'zh-TW')).toBeNull();
    const wrongCount = fresh();
    wrongCount.tickets[0] = wrongCount.tickets[0] === 0 ? 1 : 0;
    expect(restoreBoard(wrongCount, 'zh-TW')).toBeNull();
    const wrongTier = fresh();
    wrongTier.draws[0].tier = (wrongTier.draws[0].tier + 1) % 3;
    expect(restoreBoard(wrongTier, 'zh-TW')).toBeNull();
    const dup = fresh();
    dup.draws[1].ticket = dup.draws[0].ticket;
    expect(restoreBoard(dup, 'zh-TW')).toBeNull();
    const badSalt = fresh();
    badSalt.salt = '<script>';
    expect(restoreBoard(badSalt, 'zh-TW')).toBeNull();
    const short = fresh();
    short.tickets.pop();
    expect(restoreBoard(short, 'zh-TW')).toBeNull();
  });
});

describe('presets', () => {
  it('ship valid boards in every locale', () => {
    for (const locale of ['zh-TW', 'en', 'ja'] as const) {
      const presets = presetsFor(locale);
      expect(presets.map((p) => p.id)).toEqual(['standard', 'party', 'mini']);
      for (const p of presets) {
        expect(validateSetup(p.setup)).toBeNull();
        expect(p.setup.tiers.every((t) => t.name !== '')).toBe(true);
      }
      expect(totalTickets(presets[0].setup)).toBe(80);
      expect(totalTickets(presets[1].setup)).toBe(30);
      expect(totalTickets(presets[2].setup)).toBe(10);
    }
  });
});

describe('tierColor', () => {
  it('gives gold to A and distinct colors to the next tiers', () => {
    expect(tierColor(0).bg).toContain('43');
    const set = new Set(Array.from({ length: 10 }, (_, i) => tierColor(i).bg));
    expect(set.size).toBe(10);
  });
});
