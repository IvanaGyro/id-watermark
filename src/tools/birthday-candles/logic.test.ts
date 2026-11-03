import { describe, expect, it } from 'vitest';
import {
  BASS,
  CAKE,
  DEFAULT_TUNING,
  IDLE_BLOW,
  LIMITS,
  MELODY,
  THEME_IDS,
  blowOrder,
  blowSeconds,
  blowStrength,
  candlePlan,
  cleanText,
  decodeHash,
  encodeCard,
  flameCount,
  fromBase64Url,
  headline,
  hitCandle,
  layoutCandles,
  median,
  midiToHz,
  normalizeCard,
  ordinal,
  parseAge,
  rmsDb,
  schedule,
  shareUrl,
  spectrumFeatures,
  stepBlow,
  sweepCandles,
  toBase64Url,
  totalBeats,
  tuningFor,
  type BlowState,
  type Card,
  type Features,
} from './logic';

const card = (over: Partial<Card> = {}): Card => ({
  name: '小安',
  age: 30,
  message: '生日快樂！\n願你新的一歲平安健康。',
  from: '阿哲',
  theme: 'matcha',
  ...over,
});

const b64json = (value: unknown) => toBase64Url(new TextEncoder().encode(JSON.stringify(value)));

describe('cleanText', () => {
  it('trims and folds whitespace on one line', () => {
    expect(cleanText('  Alex \n  Smith\t ', 30)).toBe('Alex Smith');
    expect(cleanText(42, 30)).toBe('');
    expect(cleanText(null, 30)).toBe('');
  });

  it('removes control and bidi override characters', () => {
    const rlo = String.fromCharCode(0x202e);
    const zwnbsp = String.fromCharCode(0xfeff);
    expect(cleanText(`a${rlo}b\u0000c\u0007d${zwnbsp}`, 30)).toBe('abcd');
  });

  it('keeps line breaks in a message but limits blank lines and line count', () => {
    expect(cleanText('Hi\r\nthere\n\n\n\nfriend  \n', 300, true)).toBe('Hi\nthere\n\nfriend');
    const many = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n');
    const cleaned = cleanText(many, 300, true);
    expect(cleaned.split('\n')).toHaveLength(LIMITS.messageLines);
    expect(cleaned.endsWith('line 12 line 13 line 14 line 15 line 16 line 17 line 18 line 19 line 20')).toBe(true);
  });

  it('cuts by code points, never splitting a surrogate pair', () => {
    const rare = String.fromCodePoint(0x20bb7); // 𠮷, outside the BMP
    const text = rare.repeat(40);
    const cut = cleanText(text, 30);
    expect(Array.from(cut)).toHaveLength(30);
    expect(cut).toBe(rare.repeat(30));
  });
});

describe('parseAge', () => {
  it('accepts whole years from 1 to 120', () => {
    expect(parseAge(1)).toBe(1);
    expect(parseAge('30')).toBe(30);
    expect(parseAge(' 120 ')).toBe(120);
    expect(parseAge('２５')).toBe(25);
  });
  it('rejects everything else', () => {
    for (const bad of [0, -3, 121, 12.5, '12.5', '1e2', 'abc', '', null, undefined, {}, [], Number.NaN, Infinity]) {
      expect(parseAge(bad)).toBeNull();
    }
  });
});

describe('normalizeCard', () => {
  it('fills defaults and whitelists the theme', () => {
    expect(normalizeCard(null)).toEqual({ name: '', age: null, message: '', from: '', theme: 'strawberry' });
    expect(normalizeCard({ theme: 'url(javascript:alert(1))' }).theme).toBe('strawberry');
    expect(normalizeCard({ theme: '#ff0000' }).theme).toBe('strawberry');
    for (const theme of THEME_IDS) expect(normalizeCard({ theme }).theme).toBe(theme);
  });
  it('limits every field', () => {
    const c = normalizeCard({ name: 'n'.repeat(99), from: 'f'.repeat(99), message: 'm'.repeat(999), age: 300 });
    expect(c.name).toHaveLength(LIMITS.name);
    expect(c.from).toHaveLength(LIMITS.from);
    expect(c.message).toHaveLength(LIMITS.message);
    expect(c.age).toBeNull();
  });
});

describe('share link encoding', () => {
  it('base64url round-trips bytes without padding or unsafe characters', () => {
    const bytes = Uint8Array.from({ length: 256 }, (_, i) => i);
    const text = toBase64Url(bytes);
    expect(text).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(Array.from(fromBase64Url(text)!)).toEqual(Array.from(bytes));
    expect(fromBase64Url('a')).toBeNull();
    expect(fromBase64Url('ab+c')).toBeNull();
  });

  it('round-trips a card with Chinese, Japanese and line breaks', () => {
    for (const c of [
      card(),
      card({ name: 'さくら', message: 'お誕生日おめでとう！\nすてきな一年に。', from: 'ゆうき', theme: 'blueberry', age: 7 }),
      card({ name: '', age: null, message: '', from: '', theme: 'vanilla' }),
      card({ name: 'Alex "Al" O\'Neil', message: 'Line 1\nLine 2 \\ backslash', theme: 'chocolate', age: 101 }),
    ]) {
      const encoded = encodeCard(c);
      expect(encoded.startsWith('c=')).toBe(true);
      expect(decodeHash(`#${encoded}`)).toEqual({ status: 'ok', card: c });
      expect(decodeHash(encoded)).toEqual({ status: 'ok', card: c });
    }
  });

  it('keeps the largest card well under the decode limit', () => {
    const rare = String.fromCodePoint(0x20bb7);
    const big = card({ name: rare.repeat(30), from: rare.repeat(30), message: '"'.repeat(LIMITS.message), age: 120 });
    const encoded = encodeCard(big);
    expect(encoded.length - 2).toBeLessThan(LIMITS.hash);
    expect(decodeHash(encoded)).toEqual({ status: 'ok', card: normalizeCard(big) });
  });

  it('leaves out empty fields to keep links short', () => {
    const encoded = encodeCard(card({ name: '', age: null, message: '', from: '' }));
    const json = new TextDecoder().decode(fromBase64Url(encoded.slice(2))!);
    expect(JSON.parse(json)).toEqual({ v: 1, t: 'matcha' });
  });

  it('builds the share URL from the page URL, dropping any old fragment', () => {
    const url = shareUrl('https://tool.6yuwei.com/birthday-candles/#c=old', card());
    expect(url.startsWith('https://tool.6yuwei.com/birthday-candles/#c=')).toBe(true);
    expect(url.split('#')).toHaveLength(2);
    expect(decodeHash(new URL(url).hash)).toEqual({ status: 'ok', card: card() });
  });
});

describe('decodeHash', () => {
  it('ignores fragments that are not cards', () => {
    expect(decodeHash('')).toEqual({ status: 'none' });
    expect(decodeHash('#')).toEqual({ status: 'none' });
    expect(decodeHash('#faq')).toEqual({ status: 'none' });
  });

  it('flags broken card links as invalid', () => {
    const invalid = { status: 'invalid' };
    expect(decodeHash('#c=')).toEqual(invalid);
    expect(decodeHash('#c=***')).toEqual(invalid);
    expect(decodeHash('#c=a')).toEqual(invalid);
    expect(decodeHash(`#c=${toBase64Url(new TextEncoder().encode('not json'))}`)).toEqual(invalid);
    expect(decodeHash(`#c=${b64json([1, 2, 3])}`)).toEqual(invalid);
    expect(decodeHash(`#c=${b64json(null)}`)).toEqual(invalid);
    expect(decodeHash(`#c=${b64json({ v: 2, n: 'future' })}`)).toEqual(invalid);
    expect(decodeHash(`#c=${b64json({ n: 'no version' })}`)).toEqual(invalid);
    // Invalid UTF-8 (a lone continuation byte) is rejected, not turned into replacement characters.
    expect(decodeHash(`#c=${toBase64Url(Uint8Array.from([0x7b, 0x80, 0x7d]))}`)).toEqual(invalid);
    // A cut-off link: valid base64url but truncated JSON.
    const cut = encodeCard(card());
    expect(decodeHash(`#${cut.slice(0, cut.length - 12)}`)).toEqual(invalid);
  });

  it('refuses oversized fragments before decoding them', () => {
    expect(decodeHash(`#c=${'A'.repeat(LIMITS.hash + 4)}`)).toEqual({ status: 'invalid' });
  });

  it('cleans and whitelists decoded fields', () => {
    const rlo = String.fromCharCode(0x202e);
    const result = decodeHash(
      `#c=${b64json({ v: 1, n: `<img src=x onerror=alert(1)>${rlo}`, a: '30', m: 123, f: ['x'], t: 'neon', extra: 'ignored' })}`,
    );
    expect(result).toEqual({
      status: 'ok',
      // Markup stays plain text (the page renders it with textContent); the age must be a JSON number.
      card: { name: '<img src=x onerror=alert(1)>', age: null, message: '', from: '', theme: 'strawberry' },
    });
  });

  it('tolerates percent-encoding and punctuation glued to the end of the link', () => {
    const encoded = encodeCard(card());
    expect(decodeHash(`#${encoded.replace('=', '%3D')}`)).toEqual({ status: 'ok', card: card() });
    expect(decodeHash(`#${encoded}).`)).toEqual({ status: 'ok', card: card() });
  });
});

describe('headline and ordinal', () => {
  const zh = { plain: '生日快樂！', name: '{name}，生日快樂！', age: '{age} 歲生日快樂！', nameAge: '{name}，{age} 歲生日快樂！' };
  const en = { plain: 'Happy birthday!', name: 'Happy birthday, {name}!', age: 'Happy {age} birthday!', nameAge: 'Happy {age} birthday, {name}!' };
  const enOrdinal = { one: '{n}st', two: '{n}nd', few: '{n}rd', other: '{n}th' };

  it('writes English ordinals', () => {
    const cases: [number, string][] = [
      [1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'], [11, '11th'], [12, '12th'], [13, '13th'],
      [21, '21st'], [22, '22nd'], [23, '23rd'], [101, '101st'], [111, '111th'], [112, '112th'],
    ];
    for (const [n, text] of cases) expect(ordinal(n, enOrdinal, 'en-US')).toBe(text);
    expect(ordinal(30, { other: '{n}' }, 'zh-TW')).toBe('30');
  });

  it('picks the template from the fields that are filled in', () => {
    const plain = (n: number) => String(n);
    expect(headline({ name: '小安', age: 30 }, zh, plain)).toBe('小安，30 歲生日快樂！');
    expect(headline({ name: '小安', age: null }, zh, plain)).toBe('小安，生日快樂！');
    expect(headline({ name: '', age: 8 }, zh, plain)).toBe('8 歲生日快樂！');
    expect(headline({ name: '', age: null }, zh, plain)).toBe('生日快樂！');
    expect(headline({ name: 'Sam', age: 21 }, en, (n) => ordinal(n, enOrdinal, 'en-US'))).toBe('Happy 21st birthday, Sam!');
  });

  it('does not expand placeholders typed into a name', () => {
    expect(headline({ name: '{age}', age: 5 }, zh, String)).toBe('{age}，5 歲生日快樂！');
  });
});

describe('candles', () => {
  it('uses one candle per year up to 10, number candles after that, 5 without an age', () => {
    expect(candlePlan(null)).toEqual({ kind: 'classic', count: 5 });
    expect(candlePlan(1)).toEqual({ kind: 'classic', count: 1 });
    expect(candlePlan(10)).toEqual({ kind: 'classic', count: 10 });
    expect(candlePlan(11)).toEqual({ kind: 'digits', digits: [1, 1] });
    expect(candlePlan(30)).toEqual({ kind: 'digits', digits: [3, 0] });
    expect(candlePlan(100)).toEqual({ kind: 'digits', digits: [1, 0, 0] });
    expect(flameCount(candlePlan(7))).toBe(7);
    expect(flameCount(candlePlan(64))).toBe(2);
    expect(flameCount(candlePlan(120))).toBe(3);
  });

  it('lays every candle out on the cake, back to front, with the flame inside the picture', () => {
    for (const age of [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 30, 99, 100, 120]) {
      const plan = candlePlan(age);
      const spots = layoutCandles(plan);
      expect(spots).toHaveLength(flameCount(plan));
      expect(spots.map((s) => s.index).sort((a, b) => a - b)).toEqual(spots.map((_, i) => i));
      for (let i = 1; i < spots.length; i++) expect(spots[i].base).toBeGreaterThanOrEqual(spots[i - 1].base);
      for (const s of spots) {
        expect(s.x).toBeGreaterThan(CAKE.cx - CAKE.rx);
        expect(s.x).toBeLessThan(CAKE.cx + CAKE.rx);
        expect(s.top - 34).toBeGreaterThan(CAKE.viewTop); // flame tip (30 units, a bit larger for digits)
        expect(s.base).toBeLessThanOrEqual(CAKE.topY + CAKE.ry);
      }
    }
  });

  it('gives every candle its own column, so no flame hides behind another', () => {
    for (const age of [null, 2, 4, 5, 6, 7, 8, 9, 10, 64, 100]) {
      const xs = layoutCandles(candlePlan(age))
        .map((s) => s.x)
        .sort((a, b) => a - b);
      for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(18);
    }
  });

  it('numbers flames left to right', () => {
    const spots = layoutCandles(candlePlan(8));
    const byIndex = [...spots].sort((a, b) => a.index - b.index);
    for (let i = 1; i < byIndex.length; i++) expect(byIndex[i].x).toBeGreaterThanOrEqual(byIndex[i - 1].x);
  });

  it('blows the middle of the front row out first and the far ends last', () => {
    const row = layoutCandles(candlePlan(3));
    expect(blowOrder(row)[0]).toBe(1);
    const rows = layoutCandles(candlePlan(9));
    const order = blowOrder(rows);
    expect([...order].sort((a, b) => a - b)).toEqual(rows.map((_, i) => i));
    const spot = (i: number) => rows.find((s) => s.index === i)!;
    expect(order[0]).toBe(4);
    expect(spot(order[0]).base).toBe(Math.max(...rows.map((s) => s.base)));
    expect([0, 8]).toContain(order[order.length - 1]);
    // Further from the blower never goes before nearer.
    const dist = (i: number) => Math.hypot(spot(i).x - CAKE.cx, spot(i).base - CAKE.topY - 80);
    for (let k = 1; k < order.length; k++) expect(dist(order[k])).toBeGreaterThanOrEqual(dist(order[k - 1]));
  });

  it('finds the candle under a tap and every candle a swipe crosses', () => {
    const spots = layoutCandles(candlePlan(4));
    const byIndex = [...spots].sort((a, b) => a.index - b.index);
    const first = byIndex[0];
    expect(hitCandle(spots, { x: first.x, y: (first.top + first.base) / 2 })).toBe(first.index);
    expect(hitCandle(spots, { x: first.x, y: first.top - 20 })).toBe(first.index); // on the flame
    expect(hitCandle(spots, { x: CAKE.cx, y: CAKE.viewBottom - 5 })).toBe(-1); // the plate
    const y = (first.top + first.base) / 2;
    expect(sweepCandles(spots, { x: 40, y }, { x: 320, y })).toEqual([0, 1, 2, 3]);
    expect(sweepCandles(spots, { x: 320, y }, { x: 40, y })).toEqual([3, 2, 1, 0]);
    expect(sweepCandles(spots, { x: 40, y: 280 }, { x: 320, y: 280 })).toEqual([]);
  });
});

/* ---------- Blow detection ---------- */

/** Deterministic noise for synthetic spectra. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}
const BIN_HZ = 48000 / 4096;
const BINS = 2048;
const toDb = (power: number[]) => power.map((p) => 10 * Math.log10(p));

/** Breath on a microphone: random (exponential) power per bin with a steep low-frequency tilt. */
function breathSpectrum(seed = 1) {
  const r = rng(seed);
  return toDb(Array.from({ length: BINS }, (_, k) => (-Math.log(1 - r() * 0.999) * 1e-4) / (1 + (k * BIN_HZ) / 300) ** 2));
}
/** A voiced sound: narrow harmonic peaks with a falling envelope over a faint noise floor. */
function harmonicSpectrum(f0: number, seed = 2) {
  const r = rng(seed);
  return toDb(
    Array.from({ length: BINS }, (_, k) => {
      const f = k * BIN_HZ;
      let p = 1e-10 * (0.5 + r());
      for (let h = 1; h * f0 < 5000; h++) p += (1e-4 / h ** 1.5) * Math.exp(-(((f - h * f0) / 14) ** 2));
      return p;
    }),
  );
}
/** "sss" or hiss: noise only above 4 kHz. */
function hissSpectrum(seed = 3) {
  const r = rng(seed);
  return toDb(Array.from({ length: BINS }, (_, k) => (k * BIN_HZ > 4000 ? -Math.log(1 - r() * 0.999) * 1e-4 : 1e-12)));
}

describe('levels and spectra', () => {
  it('measures RMS in dBFS', () => {
    const sine = Array.from({ length: 4800 }, (_, i) => Math.sin((2 * Math.PI * 1000 * i) / 48000));
    expect(rmsDb(sine)).toBeCloseTo(-3.01, 1);
    expect(rmsDb(new Float32Array(1024))).toBe(-160);
    expect(rmsDb([])).toBe(-160);
  });

  it('scores breath noise as flat and bass-heavy', () => {
    const f = spectrumFeatures(breathSpectrum(), BIN_HZ);
    expect(f.flatness).toBeGreaterThan(DEFAULT_TUNING.minFlatness);
    expect(f.lowShare).toBeGreaterThan(0.6);
  });

  it('scores voiced sounds as peaky at any pitch', () => {
    for (const f0 of [95, 140, 220, 330]) {
      expect(spectrumFeatures(harmonicSpectrum(f0), BIN_HZ).flatness).toBeLessThan(0.25);
    }
  });

  it('scores hiss as not bass-heavy', () => {
    expect(spectrumFeatures(hissSpectrum(), BIN_HZ).lowShare).toBeLessThan(0.05);
  });

  it('copes with silent bins (-Infinity) from the analyser', () => {
    const f = spectrumFeatures(new Float32Array(BINS).fill(-Infinity), BIN_HZ);
    expect(Number.isFinite(f.flatness)).toBe(true);
    expect(Number.isFinite(f.lowShare)).toBe(true);
  });
});

describe('blow detector', () => {
  const FRAME = 1000 / 60;
  const breath = (levelDb = -14): Features => ({ levelDb, flatness: 0.7, lowShare: 0.95 });
  const voice = (levelDb = -14): Features => ({ levelDb, flatness: 0.15, lowShare: 0.97 });
  const quiet: Features = { levelDb: -60, flatness: 0.8, lowShare: 0.5 };

  function run(frames: Features[], total = 10, start: BlowState = IDLE_BLOW, dt = FRAME) {
    let state = start;
    const trace: BlowState[] = [];
    for (const f of frames) {
      state = stepBlow(state, f, dt, total);
      trace.push(state);
    }
    return { state, trace };
  }
  const repeat = (f: Features, ms: number) => Array.from({ length: Math.round(ms / FRAME) }, () => f);
  const outAt = (trace: BlowState[]) => trace.findIndex((s) => s.progress >= 1);

  it('needs a breath-like sound that is loud enough', () => {
    expect(blowStrength(breath(), DEFAULT_TUNING)).toBe(1);
    expect(blowStrength(breath(-30), DEFAULT_TUNING)).toBeGreaterThan(0);
    expect(blowStrength(breath(-40), DEFAULT_TUNING)).toBe(0);
    expect(blowStrength(voice(), DEFAULT_TUNING)).toBe(0);
    expect(blowStrength({ levelDb: -10, flatness: 0.8, lowShare: 0.02 }, DEFAULT_TUNING)).toBe(0);
  });

  it('puts out ten candles with about two seconds of strong blowing', () => {
    const { state, trace } = run(repeat(breath(), 2200));
    expect(state.progress).toBe(10);
    const allOut = trace.findIndex((s) => s.progress >= 10) * FRAME;
    expect(allOut).toBeGreaterThan(1500);
    expect(allOut).toBeLessThan(2200);
    expect(blowSeconds(10)).toBeCloseTo(1.8);
  });

  it('puts candles out one at a time, faster with a harder blow', () => {
    const hard = run(repeat(breath(-14), 1500)).trace;
    const soft = run(repeat(breath(-28), 1500)).trace;
    expect(outAt(hard)).toBeGreaterThan(0);
    expect(outAt(soft)).toBeGreaterThan(outAt(hard));
    expect(hard[hard.length - 1].progress).toBeGreaterThan(soft[soft.length - 1].progress);
    // Monotonic while blowing: candles never come back on their own.
    for (let i = 1; i < hard.length; i++) expect(hard[i].progress).toBeGreaterThanOrEqual(hard[i - 1].progress);
  });

  it('ignores loud talking but notices it', () => {
    // Syllables: 180 ms of voice, 70 ms pause, for three seconds.
    const talk: Features[] = [];
    for (let t = 0; t < 3000; t += 250) talk.push(...repeat(voice(-12), 180), ...repeat(quiet, 70));
    const { state } = run(talk);
    expect(state.progress).toBe(0);
    expect(state.talkMs).toBeGreaterThan(1500);
  });

  it('ignores short bursts such as a clap or a cough', () => {
    const frames = [...repeat(breath(-6), 120), ...repeat(quiet, 300), ...repeat(breath(-6), 120), ...repeat(quiet, 300)];
    expect(run(frames).state.progress).toBe(0);
  });

  it('ignores quiet breathing and hiss', () => {
    expect(run(repeat(breath(-45), 3000)).state.progress).toBe(0);
    expect(run(repeat({ levelDb: -10, flatness: 0.8, lowShare: 0.02 }, 3000)).state.progress).toBe(0);
  });

  it('rides over brief dropouts but restarts after a real pause', () => {
    const choppy: Features[] = [];
    for (let i = 0; i < 90; i++) choppy.push(i % 6 === 5 ? quiet : breath());
    expect(run(choppy).state.progress).toBeGreaterThan(3);
    const paused: Features[] = [];
    for (let i = 0; i < 8; i++) paused.push(...repeat(breath(), 150), ...repeat(quiet, 200));
    expect(run(paused).state.progress).toBe(0);
  });

  it('lets a half-blown flame recover when the breath stops', () => {
    const blown = run(repeat(breath(), 600)).state;
    expect(blown.progress % 1).toBeGreaterThan(0.1);
    const rested = run(repeat(quiet, 3000), 10, blown).state;
    expect(rested.progress).toBe(Math.floor(blown.progress));
  });

  it('leans the flames while blowing and lets them settle afterwards', () => {
    const blowing = run(repeat(breath(), 500)).state;
    expect(blowing.lean).toBeGreaterThan(0.8);
    expect(blowing.strength).toBe(1);
    const after = run(repeat(quiet, 1500), 10, blowing).state;
    expect(after.lean).toBeLessThan(0.05);
    expect(after.strength).toBe(0);
    // Talking only makes them sway a little.
    expect(run(repeat(voice(-14), 1000)).state.lean).toBeLessThan(0.3);
  });

  it('does not count a long stalled frame as a long blow', () => {
    const started = run(repeat(breath(), 300)).state;
    const stalled = stepBlow(started, breath(), 5000, 10);
    expect(stalled.progress - started.progress).toBeLessThan(1);
  });

  it('never goes past the number of candles', () => {
    expect(run(repeat(breath(), 4000), 3).state.progress).toBe(3);
  });

  it('sets thresholds from the room noise, within limits', () => {
    expect(tuningFor(-70).minDb).toBe(-34);
    expect(tuningFor(-55).minDb).toBe(-31);
    expect(tuningFor(-20).minDb).toBe(-24);
    expect(tuningFor(Number.NaN).minDb).toBe(-34);
    const t = tuningFor(-55);
    expect(t.fullDb - t.minDb).toBe(16);
    expect(t.minFlatness).toBe(DEFAULT_TUNING.minFlatness);
  });

  it('takes a median', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNaN();
  });
});

describe('Happy Birthday melody', () => {
  it('has the 25 notes of the tune in 3/4 with a one-beat pick-up', () => {
    expect(MELODY).toHaveLength(25);
    const beats = totalBeats(MELODY);
    expect(beats).toBe(25);
    expect((beats - 1) % 3).toBe(0);
  });

  it('starts on D4, peaks at D5 and ends on the tonic G4', () => {
    expect(midiToHz(69)).toBe(440);
    expect(midiToHz(MELODY[0].midi)).toBeCloseTo(293.66, 2);
    expect(midiToHz(MELODY[MELODY.length - 1].midi)).toBeCloseTo(392.0, 2);
    expect(Math.max(...MELODY.map((n) => n.midi))).toBe(74);
    expect(Math.min(...MELODY.map((n) => n.midi))).toBe(62);
    // Each phrase opens with the same short-long "Hap-py" pick-up.
    for (const at of [0, 6, 12]) expect(MELODY.slice(at, at + 2).map((n) => n.beats)).toEqual([0.75, 0.25]);
  });

  it('keeps the bass in step with the melody', () => {
    const last = BASS[BASS.length - 1];
    expect(last.at + last.beats).toBe(totalBeats(MELODY));
    for (let i = 1; i < BASS.length; i++) expect(BASS[i].at).toBe(BASS[i - 1].at + BASS[i - 1].beats);
  });

  it('schedules notes back to back at the tempo', () => {
    const notes = schedule(MELODY, 120);
    expect(notes[0].start).toBe(0);
    expect(notes[1].start).toBeCloseTo(0.375);
    for (let i = 1; i < notes.length; i++) expect(notes[i].start).toBeCloseTo(notes[i - 1].start + notes[i - 1].duration);
    const end = notes[notes.length - 1].start + notes[notes.length - 1].duration;
    expect(end).toBeCloseTo(12.5);
  });
});
