import { describe, expect, it } from 'vitest';
import { fromBase64Url } from '../scratch-card/logic';
import {
  activePairs,
  checkNames,
  cleanDate,
  decodeInvite,
  drawTargets,
  duplicateNames,
  EMPTY_DETAILS,
  encodeInvite,
  finishTurn,
  fitBoard,
  FRAGMENT_KEY,
  inviteUrl,
  isFinished,
  LIMITS,
  markSent,
  normalizeDetails,
  normalizeDraft,
  normalizeSession,
  parseNames,
  resultRows,
  sessionInvite,
  shuffled,
  skipTurn,
  startSession,
  type RandomSource,
  type Session,
} from './logic';

/** Repeatable generator (mulberry32) so statistical tests cannot flake. */
function seeded(seed: number): RandomSource {
  let state = seed >>> 0;
  return (array) => {
    for (let i = 0; i < array.length; i++) {
      state = (state + 0x6d2b79f5) >>> 0;
      let z = state;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      array[i] = (z ^ (z >>> 14)) >>> 0;
    }
    return array;
  };
}

const NAMES = ['小明', '小美', '阿傑', '雅婷', '志豪', '怡君'];

describe('fitBoard', () => {
  it('lays a few boxes out in one row when the area is wide', () => {
    expect(fitBoard(5, 900, 350, 13)).toEqual({ columns: 5, size: 169 });
  });

  it('prefers one row when its boxes are nearly as large as two rows would allow', () => {
    expect(fitBoard(5, 1728, 698, 26)).toEqual({ columns: 5, size: 324 });
  });

  it('uses two rows when one row would make the boxes much smaller', () => {
    expect(fitBoard(8, 1728, 698, 26).columns).toBe(4);
  });

  it('keeps rows even when a smaller column count gives the same box', () => {
    expect(fitBoard(7, 900, 350, 13)).toEqual({ columns: 4, size: 168 });
  });

  it('stacks boxes when the area is tall', () => {
    expect(fitBoard(4, 300, 1000, 10).columns).toBe(1);
  });

  it('never makes a box larger than the cap', () => {
    expect(fitBoard(3, 1800, 900, 20, 400)).toEqual({ columns: 3, size: 400 });
  });

  it('always fits inside the area, from the smallest draw to the largest', () => {
    for (const [width, height] of [[900, 350], [1700, 800], [3400, 800], [600, 800]]) {
      for (let count = LIMITS.minNames; count <= LIMITS.maxNames; count++) {
        const { columns, size } = fitBoard(count, width, height, 12);
        const rows = Math.ceil(count / columns);
        expect(size).toBeGreaterThan(0);
        expect(columns * size + (columns - 1) * 12).toBeLessThanOrEqual(width);
        expect(rows * size + (rows - 1) * 12).toBeLessThanOrEqual(height);
      }
    }
  });
});

describe('parseNames', () => {
  it('splits on lines and list punctuation, keeps spaces inside a name', () => {
    expect(parseNames('小明\n小美、阿傑,雅婷，志豪;怡君；Mary Jane')).toEqual([...NAMES, 'Mary Jane']);
  });

  it('drops blanks and control characters, trims and cuts long names', () => {
    expect(parseNames('  小明  \r\n\r\n\n‮小美\n')).toEqual(['小明', '小美']);
    expect(parseNames('長'.repeat(30))[0]).toHaveLength(LIMITS.name);
  });
});

describe('checkNames and duplicateNames', () => {
  it('needs enough people and no more than the limit', () => {
    expect(checkNames(['a', 'b'])).toBe('few');
    expect(checkNames(['a', 'b', 'c'])).toBeNull();
    expect(checkNames(Array.from({ length: LIMITS.maxNames + 1 }, (_, i) => `p${i}`))).toBe('many');
  });

  it('treats case and full-width forms as the same name', () => {
    expect(duplicateNames(['Amy', 'amy', 'Bob', 'Ｂｏｂ', 'Cat'])).toEqual(['amy', 'Ｂｏｂ']);
    expect(checkNames(['Amy', 'amy', 'Bob'])).toBe('duplicate');
  });
});

describe('activePairs', () => {
  it('ignores unknown names, self pairs and repeats in either order', () => {
    const pairs: [string, string][] = [
      ['小明', '小美'],
      ['小美', '小明'],
      ['小明', '小明'],
      ['小明', '路人'],
    ];
    expect(activePairs(NAMES, pairs)).toEqual([[0, 1]]);
  });
});

describe('drawTargets', () => {
  it('never lets anyone draw themselves, and everyone is drawn exactly once', () => {
    const random = seeded(1);
    for (const count of [3, 4, 5, 8, 30, 100]) {
      for (let run = 0; run < 50; run++) {
        const targets = drawTargets(count, [], random)!;
        expect(new Set(targets).size).toBe(count);
        expect(targets.every((target, person) => target !== person)).toBe(true);
      }
    }
  });

  it('keeps blocked pairs apart in both directions', () => {
    const random = seeded(2);
    for (let run = 0; run < 500; run++) {
      const targets = drawTargets(6, [[0, 1], [2, 3]], random)!;
      expect(targets[0]).not.toBe(1);
      expect(targets[1]).not.toBe(0);
      expect(targets[2]).not.toBe(3);
      expect(targets[3]).not.toBe(2);
    }
  });

  it('returns null when the pairs leave someone with nobody', () => {
    expect(drawTargets(3, [[0, 1], [0, 2]])).toBeNull();
  });

  it('still answers when only one arrangement family is left', () => {
    // Couples 0-1, 2-3: possible, but far from every shuffle works.
    const targets = drawTargets(4, [[0, 1], [2, 3]], seeded(3))!;
    expect([2, 3]).toContain(targets[0]);
    expect([0, 1]).toContain(targets[2]);
  });

  it('gives every valid result the same chance', () => {
    // Four people have 9 ways for nobody to draw themselves.
    const random = seeded(4);
    const counts = new Map<string, number>();
    const runs = 18000;
    for (let run = 0; run < runs; run++) {
      const key = drawTargets(4, [], random)!.join();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(9);
    for (const value of counts.values()) {
      expect(value).toBeGreaterThan((runs / 9) * 0.9);
      expect(value).toBeLessThan((runs / 9) * 1.1);
    }
  });
});

describe('shuffled', () => {
  it('keeps every item and leaves the input alone', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffled(input, seeded(5));
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('sessions', () => {
  const live = () => startSession('pass', NAMES, [], EMPTY_DETAILS, seeded(6))!;

  it('puts everyone in the queue for live modes and nobody for links', () => {
    expect([...live().queue].sort()).toEqual([0, 1, 2, 3, 4, 5]);
    expect(startSession('link', NAMES, [], EMPTY_DETAILS, seeded(6))!.queue).toEqual([]);
  });

  it('applies the pairs by name', () => {
    for (let seed = 0; seed < 100; seed++) {
      const session = startSession('link', NAMES, [['小美', '小明']], EMPTY_DETAILS, seeded(seed))!;
      expect(session.targets[0]).not.toBe(1);
      expect(session.targets[1]).not.toBe(0);
    }
  });

  it('returns null when the draw is impossible', () => {
    expect(startSession('pass', ['a', 'b', 'c'], [['a', 'b'], ['a', 'c']], EMPTY_DETAILS)).toBeNull();
  });

  it('walks the queue to the end', () => {
    let session = live();
    const first = session.queue[0];
    session = finishTurn(session);
    expect(session.drawn).toEqual([first]);
    expect(session.queue).toHaveLength(5);
    for (let i = 0; i < 5; i++) session = finishTurn(session);
    expect(isFinished(session)).toBe(true);
    expect(finishTurn(session)).toBe(session);
  });

  it('skip moves the person to the back, unless they are the last one', () => {
    let session = live();
    const [first, second] = session.queue;
    session = skipTurn(session);
    expect(session.queue[0]).toBe(second);
    expect(session.queue.at(-1)).toBe(first);
    for (let i = 0; i < 5; i++) session = finishTurn(session);
    expect(session.queue).toHaveLength(1);
    expect(skipTurn(session)).toBe(session);
  });

  it('a link session is never finished, and marks each person once', () => {
    let session = startSession('link', NAMES, [], EMPTY_DETAILS, seeded(7))!;
    expect(isFinished(session)).toBe(false);
    session = markSent(markSent(session, 2), 2);
    expect(session.sent).toEqual([2]);
  });

  it('lists results in the order people drew', () => {
    const session = finishTurn(live());
    const rows = resultRows(session);
    expect(rows).toHaveLength(6);
    expect(rows[0].from).toBe(NAMES[session.drawn[0]]);
    expect(rows.every((row) => row.from !== row.to)).toBe(true);
  });
});

describe('normalizeSession', () => {
  const good = (): Session => startSession('pass', NAMES, [], EMPTY_DETAILS, seeded(8))!;

  it('keeps a valid session', () => {
    const session = finishTurn(good());
    expect(normalizeSession(JSON.parse(JSON.stringify(session)))).toEqual(session);
  });

  it('rejects anything inconsistent', () => {
    const session = good();
    const self = session.targets.map((_, i) => i);
    const repeated = session.targets.map(() => session.targets[0]);
    expect(normalizeSession(null)).toBeNull();
    expect(normalizeSession('x')).toBeNull();
    expect(normalizeSession({ ...session, mode: 'nope' })).toBeNull();
    expect(normalizeSession({ ...session, targets: self })).toBeNull();
    expect(normalizeSession({ ...session, targets: repeated })).toBeNull();
    expect(normalizeSession({ ...session, targets: session.targets.slice(1) })).toBeNull();
    expect(normalizeSession({ ...session, queue: session.queue.slice(1) })).toBeNull();
    expect(normalizeSession({ ...session, names: ['a', 'a', 'b', 'c', 'd', 'e'] })).toBeNull();
  });
});

describe('details and drafts', () => {
  it('accepts only real calendar dates', () => {
    expect(cleanDate('2026-12-24')).toBe('2026-12-24');
    expect(cleanDate('2026-02-30')).toBe('');
    expect(cleanDate('12/24')).toBe('');
    expect(cleanDate(5)).toBe('');
  });

  it('cleans each field', () => {
    expect(normalizeDetails({ title: ' 聖誕\n派對 ', budget: 500, date: 'x', note: '帶'.repeat(200) })).toEqual({
      title: '聖誕 派對',
      budget: '',
      date: '',
      note: '帶'.repeat(LIMITS.note),
    });
    expect(normalizeDetails(undefined)).toEqual(EMPTY_DETAILS);
  });

  it('falls back to safe values for a broken draft', () => {
    expect(normalizeDraft({ mode: 'x', pairs: [['a'], ['b', 'c'], 3], namesText: 5 })).toEqual({
      namesText: '',
      mode: 'link',
      pairs: [['b', 'c']],
      details: EMPTY_DETAILS,
    });
  });
});

describe('personal links', () => {
  const invite = { name: '小明', target: '小美', details: { title: '聖誕交換禮物', budget: '500 元以內', date: '2026-12-24', note: '當天帶來' } };

  it('survives a round trip with CJK text', () => {
    expect(decodeInvite(`#${encodeInvite(invite)}`)).toEqual({ status: 'ok', invite });
    expect(decodeInvite(encodeInvite(invite))).toEqual({ status: 'ok', invite });
  });

  it('holds only one result, in a URL-safe form', () => {
    const session = startSession('link', NAMES, [], EMPTY_DETAILS, seeded(9))!;
    const fragment = encodeInvite(sessionInvite(session, 0));
    const bytes = fromBase64Url(fragment.slice(FRAGMENT_KEY.length))!;
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    expect(Object.keys(decoded).sort()).toEqual(['n', 'r', 'v']);
    expect(fragment.slice(FRAGMENT_KEY.length)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('builds a link on the page URL, replacing any old fragment', () => {
    const url = inviteUrl('https://tool.6yuwei.com/gift-exchange/#faq', invite);
    expect(url.startsWith('https://tool.6yuwei.com/gift-exchange/#gift=')).toBe(true);
    expect(url.match(/#/g)).toHaveLength(1);
  });

  it('ignores other anchors', () => {
    expect(decodeInvite('')).toEqual({ status: 'none' });
    expect(decodeInvite('#main')).toEqual({ status: 'none' });
  });

  it('calls anything malformed invalid', () => {
    const encode = (value: unknown) => `#${FRAGMENT_KEY}${btoa(JSON.stringify(value)).replace(/=+$/, '')}`;
    expect(decodeInvite(`#${FRAGMENT_KEY}`).status).toBe('invalid');
    expect(decodeInvite(`#${FRAGMENT_KEY}***`).status).toBe('invalid');
    expect(decodeInvite(`#${FRAGMENT_KEY}${'A'.repeat(LIMITS.fragment)}`).status).toBe('invalid');
    expect(decodeInvite(encode({ v: 2, n: 'a', r: 'b' })).status).toBe('invalid');
    expect(decodeInvite(encode({ v: 1, n: 'a' })).status).toBe('invalid');
    expect(decodeInvite(encode({ v: 1, n: 'a', r: 'A' })).status).toBe('invalid');
    expect(decodeInvite(encode([1, 2])).status).toBe('invalid');
  });

  it('drops a bad date instead of rejecting the link', () => {
    const encoded = `#${FRAGMENT_KEY}${btoa(JSON.stringify({ v: 1, n: 'a', r: 'b', d: 'soon' })).replace(/=+$/, '')}`;
    const result = decodeInvite(encoded);
    expect(result.status === 'ok' && result.invite.details.date).toBe('');
  });
});
