import { describe, expect, it } from 'vitest';
import {
  cardFromDraft,
  charCount,
  clampThreshold,
  cleanLine,
  cleanMessage,
  COVERS,
  decodeCard,
  encodeCard,
  fitFontSize,
  FRAGMENT_KEY,
  hiddenText,
  LIMITS,
  normalizeDraft,
  overflowPrizes,
  parsePrizes,
  PRESET_IDS,
  PRESET_STYLE,
  randomIndex,
  scratchedRatio,
  shareUrl,
  shouldReveal,
  textWidth,
  THEMES,
  type Card,
  type Draft,
  type RandomSource,
} from './logic';

const card = (overrides: Partial<Card> = {}): Card => ({
  message: '生日快樂！\n今晚的大餐我請客',
  title: '給你的驚喜',
  from: '小明',
  cover: 'gold',
  theme: 'cream',
  threshold: 50,
  prizes: [],
  ...overrides,
});

const draft = (overrides: Partial<Draft> = {}): Draft => ({
  mode: 'message',
  message: 'Hi',
  prizesText: '',
  title: '',
  from: '',
  cover: 'silver',
  theme: 'cream',
  threshold: 50,
  ...overrides,
});

/** Builds a #card= fragment from any JSON value, bypassing encodeCard's own validation. */
function fragmentOf(value: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return `#${FRAGMENT_KEY}${btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
}

const wire = (overrides: Record<string, unknown> = {}) => ({ v: 1, m: 'hello', c: 'silver', b: 'cream', r: 50, ...overrides });

/** Random source that returns the given 32-bit words in turn. */
const sequence =
  (...values: number[]): RandomSource =>
  (a) => {
    for (let i = 0; i < a.length; i++) a[i] = values.shift() ?? 0;
    return a;
  };

describe('encodeCard / decodeCard', () => {
  it('round-trips CJK text, line breaks and every field', () => {
    const original = card({ message: '我喜歡你很久了，\n可以跟我交往嗎？', title: '有句話想跟你說', from: '阿哲' });
    const fragment = encodeCard(original);
    expect(fragment.startsWith(FRAGMENT_KEY)).toBe(true);
    expect(fragment).toMatch(/^card=[A-Za-z0-9_-]+$/); // URL-safe, no padding
    expect(decodeCard(`#${fragment}`)).toEqual({ status: 'ok', card: original });
    expect(decodeCard(fragment)).toEqual({ status: 'ok', card: original }); // leading # optional
  });

  it('round-trips Japanese, emoji-free symbols and Latin text', () => {
    for (const message of ['ずっと好きでした。\n付き合ってください。', "It's a girl!", 'A&B <b>bold</b> "quoted" 100%']) {
      const result = decodeCard(encodeCard(card({ message })));
      expect(result).toEqual({ status: 'ok', card: card({ message }) });
    }
  });

  it('keeps characters outside the BMP intact', () => {
    const message = '𠮷野家で会おう'; // U+20BB7 is a surrogate pair in UTF-16
    expect(decodeCard(encodeCard(card({ message })))).toMatchObject({ status: 'ok', card: { message } });
  });

  it('round-trips a prize card and drops the message', () => {
    const prizes = ['頭獎：禮券 1,000 元', '銘謝惠顧', '銘謝惠顧'];
    const result = decodeCard(encodeCard(card({ prizes })));
    expect(result).toEqual({ status: 'ok', card: card({ prizes, message: '' }) });
  });

  it('leaves empty optional fields out of the link', () => {
    const short = encodeCard(card({ title: '', from: '' }));
    const long = encodeCard(card());
    expect(short.length).toBeLessThan(long.length);
    expect(decodeCard(short)).toMatchObject({ status: 'ok', card: { title: '', from: '' } });
  });

  it('builds a share URL that replaces any existing fragment', () => {
    const url = shareUrl('https://tool.6yuwei.com/scratch-card/#card=old', card());
    expect(url.startsWith('https://tool.6yuwei.com/scratch-card/#card=')).toBe(true);
    expect(url).not.toContain('old');
    expect(decodeCard(new URL(url).hash)).toMatchObject({ status: 'ok' });
  });

  it('a maximal card stays well inside the decoder limit', () => {
    const big = card({
      title: '題'.repeat(LIMITS.title),
      from: '名'.repeat(LIMITS.from),
      prizes: Array.from({ length: LIMITS.prizes }, () => '獎'.repeat(LIMITS.prize)),
    });
    const fragment = encodeCard(big);
    expect(fragment.length).toBeLessThan(LIMITS.fragment);
    expect(decodeCard(fragment)).toMatchObject({ status: 'ok' });
  });
});

describe('decodeCard rejects malformed input', () => {
  it('ignores fragments that are not card data', () => {
    expect(decodeCard('')).toEqual({ status: 'none' });
    expect(decodeCard('#')).toEqual({ status: 'none' });
    expect(decodeCard('#faq')).toEqual({ status: 'none' });
    expect(decodeCard('#related-title')).toEqual({ status: 'none' });
  });

  it.each([
    ['empty payload', '#card='],
    ['bad base64 characters', '#card=abc$%^'],
    ['impossible base64 length', '#card=abcde'],
    ['not JSON', `#card=${btoa('not json').replace(/=+$/, '')}`],
    ['invalid UTF-8', `#card=${btoa('\xff\xfe\xfd').replace(/=+$/, '')}`],
    ['too long', `#card=${'A'.repeat(LIMITS.fragment)}`],
  ])('%s', (_, hash) => {
    expect(decodeCard(hash)).toEqual({ status: 'invalid' });
  });

  it.each([
    ['a JSON array', [1, 2, 3]],
    ['a JSON string', 'hello'],
    ['null', null],
    ['a future version', wire({ v: 2 })],
    ['no version', wire({ v: undefined })],
    ['an unknown cover', wire({ c: 'url(javascript:alert(1))' })],
    ['a raw color instead of a theme id', wire({ b: '#ff0000' })],
    ['a threshold below the range', wire({ r: 5 })],
    ['a threshold above the range', wire({ r: 100 })],
    ['a threshold that is not a number', wire({ r: '50' })],
    ['a message that is not a string', wire({ m: { toString: 'x' } })],
    ['an empty message without prizes', wire({ m: '' })],
    ['a message over the limit', wire({ m: 'あ'.repeat(LIMITS.message + 1) })],
    ['too many lines', wire({ m: Array.from({ length: LIMITS.messageLines + 1 }, () => 'a').join('\n') })],
    ['a title over the limit', wire({ t: 'x'.repeat(LIMITS.title + 1) })],
    ['a sender over the limit', wire({ f: 'x'.repeat(LIMITS.from + 1) })],
    ['prizes that are not an array', wire({ p: 'a,b' })],
    ['a single prize', wire({ p: ['only one'] })],
    ['too many prizes', wire({ p: Array.from({ length: LIMITS.prizes + 1 }, (_, i) => `p${i}`) })],
    ['a blank prize', wire({ p: ['a', '   '] })],
    ['a prize that is not a string', wire({ p: ['a', 42] })],
    ['a prize over the limit', wire({ p: ['a', 'b'.repeat(LIMITS.prize + 1)] })],
  ])('%s', (_, value) => {
    expect(decodeCard(fragmentOf(value))).toEqual({ status: 'invalid' });
  });

  it('accepts the limits exactly', () => {
    const value = wire({ m: 'あ'.repeat(LIMITS.message), t: 'x'.repeat(LIMITS.title), f: 'y'.repeat(LIMITS.from), r: 90 });
    expect(decodeCard(fragmentOf(value))).toMatchObject({ status: 'ok', card: { threshold: 90 } });
  });

  it('strips control and bidi-override characters from decoded text', () => {
    const result = decodeCard(fragmentOf(wire({ m: 'a\u0007b\u202Ec', t: 'x\ny' })));
    expect(result).toMatchObject({ status: 'ok', card: { message: 'abc', title: 'x y' } });
  });

  it('keeps markup as plain text (it is rendered with textContent)', () => {
    const m = '<img src=x onerror=alert(1)>';
    expect(decodeCard(fragmentOf(wire({ m })))).toMatchObject({ status: 'ok', card: { message: m } });
  });

  it('snaps an in-range threshold to the 5% step', () => {
    expect(decodeCard(fragmentOf(wire({ r: 63 })))).toMatchObject({ status: 'ok', card: { threshold: 65 } });
  });

  it('ignores a stray message on a prize card', () => {
    expect(decodeCard(fragmentOf(wire({ m: 'secret', p: ['a', 'b'] })))).toMatchObject({
      status: 'ok',
      card: { message: '', prizes: ['a', 'b'] },
    });
  });
});

describe('whitelists', () => {
  it('every cover and theme round-trips', () => {
    for (const cover of COVERS) {
      for (const theme of THEMES) {
        expect(decodeCard(encodeCard(card({ cover, theme })))).toMatchObject({ status: 'ok', card: { cover, theme } });
      }
    }
  });

  it('presets only use whitelisted styles', () => {
    for (const id of PRESET_IDS) {
      expect(COVERS).toContain(PRESET_STYLE[id].cover);
      expect(THEMES).toContain(PRESET_STYLE[id].theme);
    }
  });
});

describe('text cleaning', () => {
  it('counts code points, not UTF-16 units', () => {
    expect(charCount('愛')).toBe(1);
    expect(charCount('𠮷')).toBe(1);
    expect('𠮷'.length).toBe(2);
  });

  it('cleanLine flattens line breaks, collapses spaces and cuts to the limit', () => {
    expect(cleanLine('  a\n b\t\tc  ', 30)).toBe('a b c');
    expect(cleanLine('一二三四五', 3)).toBe('一二三');
  });

  it('cleanMessage keeps line breaks but no more than one blank line in a row', () => {
    expect(cleanMessage('\n\nline 1\r\n\r\n\r\nline 2  \n\n')).toBe('line 1\n\nline 2');
  });

  it('cleanMessage merges lines beyond the line limit into the last one', () => {
    const text = Array.from({ length: 12 }, (_, i) => `L${i + 1}`).join('\n');
    const out = cleanMessage(text);
    expect(out.split('\n')).toHaveLength(LIMITS.messageLines);
    expect(out.endsWith('L10 L11 L12')).toBe(true);
  });

  it('cleanMessage cuts to the character limit', () => {
    expect(charCount(cleanMessage('字'.repeat(500)))).toBe(LIMITS.message);
  });

  it('parsePrizes reads one prize per line and caps the count', () => {
    expect(parsePrizes('頭獎\n\n  二獎  \n銘謝惠顧\n銘謝惠顧')).toEqual(['頭獎', '二獎', '銘謝惠顧', '銘謝惠顧']);
    const many = Array.from({ length: 14 }, (_, i) => `p${i}`).join('\n');
    expect(parsePrizes(many)).toHaveLength(LIMITS.prizes);
    expect(overflowPrizes(many)).toBe(4);
    expect(overflowPrizes('a\nb')).toBe(0);
  });
});

describe('drafts', () => {
  it('cardFromDraft reports what is missing', () => {
    expect(cardFromDraft(draft({ message: '  \n ' })).error).toBe('empty');
    expect(cardFromDraft(draft({ mode: 'prize', prizesText: 'one' })).error).toBe('prizes');
    expect(cardFromDraft(draft({ mode: 'prize', prizesText: 'one\ntwo' })).error).toBeNull();
  });

  it('cardFromDraft keeps only the active mode', () => {
    const { card: message } = cardFromDraft(draft({ message: 'Hi', prizesText: 'a\nb' }));
    expect(message.prizes).toEqual([]);
    const { card: prize } = cardFromDraft(draft({ mode: 'prize', message: 'Hi', prizesText: 'a\nb' }));
    expect(prize).toMatchObject({ message: '', prizes: ['a', 'b'] });
  });

  it('normalizeDraft repairs stored values field by field', () => {
    const fallback = draft({ title: 'fallback' });
    expect(normalizeDraft(null, fallback)).toEqual(fallback);
    expect(normalizeDraft('junk', fallback)).toEqual(fallback);
    const repaired = normalizeDraft({ mode: 'x', message: 'kept', cover: 'plaid', theme: 'night', threshold: 1000, title: 7 }, fallback);
    expect(repaired).toEqual({ ...fallback, message: 'kept', theme: 'night', threshold: 90 });
  });

  it('clampThreshold keeps 30–90 in 5% steps', () => {
    expect(clampThreshold(10)).toBe(30);
    expect(clampThreshold(99)).toBe(90);
    expect(clampThreshold(52)).toBe(50);
    expect(clampThreshold('70')).toBe(70);
    expect(clampThreshold(Number.NaN)).toBe(50);
  });
});

describe('prize draw', () => {
  it('randomIndex is unbiased (rejects the uneven top range)', () => {
    // For max 3 the accepted range is [0, 4294967295); the top value is rejected and drawn again.
    expect(randomIndex(3, sequence(0xffffffff, 4))).toBe(1);
    expect(randomIndex(3, sequence(5))).toBe(2);
    expect(() => randomIndex(0)).toThrow(RangeError);
  });

  it('hiddenText picks one of the prizes, and the message otherwise', () => {
    const prizes = ['a', 'b', 'c'];
    expect(hiddenText(card({ prizes }), sequence(0))).toBe('a');
    expect(hiddenText(card({ prizes }), sequence(2))).toBe('c');
    expect(hiddenText(card({ message: 'secret' }), sequence(2))).toBe('secret');
  });

  it('every prize can come up with real randomness', () => {
    const prizes = ['a', 'b', 'c', 'd'];
    const seen = new Set(Array.from({ length: 400 }, () => hiddenText(card({ prizes }))));
    expect([...seen].sort()).toEqual(prizes);
  });
});

describe('scratched percentage', () => {
  /** RGBA buffer where the first `cleared` of `total` pixels have alpha 0, the rest 255. */
  const alpha = (total: number, cleared: number) => {
    const data = new Uint8ClampedArray(total * 4);
    for (let i = 0; i < total; i++) data[i * 4 + 3] = i < cleared ? 0 : 255;
    return data;
  };

  it('counts pixels whose alpha fell below the cutoff', () => {
    expect(scratchedRatio(alpha(100, 0))).toBe(0);
    expect(scratchedRatio(alpha(100, 37))).toBeCloseTo(0.37);
    expect(scratchedRatio(alpha(100, 100))).toBe(1);
    expect(scratchedRatio([])).toBe(0);
  });

  it('only reads the alpha channel', () => {
    const data = new Uint8ClampedArray([0, 0, 0, 255, 255, 255, 255, 0]);
    expect(scratchedRatio(data)).toBe(0.5);
  });

  it('treats half-transparent pixels by the cutoff', () => {
    const data = [0, 0, 0, 127, 0, 0, 0, 128];
    expect(scratchedRatio(data)).toBe(0.5);
    expect(scratchedRatio(data, 200)).toBe(1);
  });

  it('shouldReveal compares against the threshold in percent', () => {
    expect(shouldReveal(0.49, 50)).toBe(false);
    expect(shouldReveal(0.5, 50)).toBe(true);
    expect(shouldReveal(scratchedRatio(alpha(64, 45)), 70)).toBe(true); // 70.3%
  });
});

describe('fitFontSize', () => {
  const box = { width: 84, height: 56 };

  it('gives a short reveal the biggest size', () => {
    expect(fitFontSize('是女生！', box)).toBe(16);
  });

  it('shrinks as the message gets longer', () => {
    const short = fitFontSize('生日快樂！', box);
    const medium = fitFontSize('生日快樂！\n今晚的大餐我請客', box);
    const long = fitFontSize('字'.repeat(LIMITS.message), box);
    expect(short).toBeGreaterThan(medium);
    expect(medium).toBeGreaterThan(long);
  });

  it('keeps short lines whole rather than wrapping them at a bigger size', () => {
    const size = fitFontSize('生日快樂！\n今晚的大餐我請客', box);
    expect(textWidth('今晚的大餐我請客') * 1.04).toBeLessThanOrEqual(box.width / size);
    expect(size).toBeGreaterThanOrEqual(8);
  });

  it('lets a long single line wrap instead of shrinking it to fit one row', () => {
    const line = '謝謝你一直以來的陪伴，不管發生什麼事都站在我這邊，今年也請多多指教';
    const size = fitFontSize(line, box);
    expect(size).toBeGreaterThan(box.width / (textWidth(line) * 1.04));
  });

  it('a full-length message still fits the box', () => {
    const text = '字'.repeat(LIMITS.message);
    const size = fitFontSize(text, box);
    const rows = Math.ceil((textWidth(text) * 1.04) / (box.width / size));
    expect(rows * size * 1.35).toBeLessThanOrEqual(box.height);
  });

  it('measures Latin text narrower than CJK', () => {
    expect(textWidth('abcd')).toBeLessThan(textWidth('漢字漢字'));
    expect(fitFontSize("It's a girl!", box)).toBeGreaterThanOrEqual(fitFontSize('Congratulations on your new job!', box));
  });

  it('avoids breaking a long word in half', () => {
    expect(fitFontSize('Supercalifragilistic', box)).toBeLessThan(16);
  });
});
