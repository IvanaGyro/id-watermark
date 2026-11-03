import { describe, expect, it } from 'vitest';
import {
  BG_SWATCHES,
  DEFAULTS,
  FILL,
  LIMITS,
  MIN_CONTRAST,
  TEXT_SWATCHES,
  cleanText,
  contrastRatio,
  decodeShare,
  dotPitch,
  encodeShare,
  fitFont,
  fontSizeFor,
  normalizeColor,
  normalizeSettings,
  preferWrapAnywhere,
  rotationFor,
  scrollX,
  speedPx,
  type Settings,
} from './logic';

const base: Settings = { ...DEFAULTS, text: '歡迎回家' };

describe('normalizeColor', () => {
  it('accepts 3- and 6-digit hex with or without #', () => {
    expect(normalizeColor('#FF2A2A')).toBe('#ff2a2a');
    expect(normalizeColor('ff2a2a')).toBe('#ff2a2a');
    expect(normalizeColor('#0f8')).toBe('#00ff88');
    expect(normalizeColor(' 000 ')).toBe('#000000');
  });

  it('rejects anything that is not a plain hex color', () => {
    for (const bad of ['red', '#12345', '#1234567', 'url(x)', '#ff0000;background:url(x)', 'rgb(0,0,0)', '', null, 7]) {
      expect(normalizeColor(bad)).toBeNull();
    }
  });

  it('keeps every preset valid', () => {
    for (const { hex } of [...TEXT_SWATCHES, ...BG_SWATCHES]) expect(normalizeColor(hex)).toBe(hex);
  });
});

describe('cleanText', () => {
  it('turns line breaks into spaces and drops control and bidi override characters', () => {
    expect(cleanText('加油\n再來一首\t安可')).toBe('加油 再來一首 安可');
    expect(cleanText('A\u0000B‮C⁦D\u007f')).toBe('ABCD');
  });

  it('limits the length by code points without splitting surrogate pairs', () => {
    expect(Array.from(cleanText('字'.repeat(300)))).toHaveLength(LIMITS.textLength);
    expect(cleanText('𠮷𠮷𠮷', 2)).toBe('𠮷𠮷');
  });

  it('keeps inner and outer spaces and ignores non-strings', () => {
    expect(cleanText('  A  B ')).toBe('  A  B ');
    expect(cleanText(42)).toBe('');
  });
});

describe('normalizeSettings', () => {
  it('falls back to the defaults for missing or broken input', () => {
    expect(normalizeSettings(null, base)).toEqual(base);
    expect(normalizeSettings('nope', base)).toEqual(base);
    expect(
      normalizeSettings({ fg: 'javascript:alert(1)', bg: 'blue', dir: 'up', speed: 'fast', size: null, blink: 'yes' }, base),
    ).toEqual(base);
  });

  it('clamps numbers into range and rounds them', () => {
    const s = normalizeSettings({ speed: 99, size: -3 }, base);
    expect(s.speed).toBe(LIMITS.speed[1]);
    expect(s.size).toBe(LIMITS.size[0]);
    expect(normalizeSettings({ speed: '3.6', size: '72.4' }, base)).toMatchObject({ speed: 4, size: 72 });
  });

  it('reads booleans written as 0/1 or true/false', () => {
    expect(normalizeSettings({ blink: '1', dots: 0, mirror: 'true' }, base)).toMatchObject({
      blink: true,
      dots: false,
      mirror: true,
    });
  });

  it('keeps an empty text the user cleared on purpose', () => {
    expect(normalizeSettings({ text: '' }, base).text).toBe('');
  });
});

describe('share links', () => {
  const sign: Settings = {
    text: '接機：Ms. Lin & 小明 #1 = 100% 開心 + 𠮷',
    fg: '#22e4ff',
    bg: '#0b1a4a',
    dir: 'right',
    speed: 8,
    size: 65,
    blink: true,
    dots: false,
    mirror: true,
  };

  it('round-trips every setting, including symbols and CJK text', () => {
    const hash = `#${encodeShare(sign)}`;
    expect(decodeShare(hash, base)).toEqual(sign);
    expect(decodeShare(encodeShare(sign), base)).toEqual(sign);
  });

  it('writes colors without # so the fragment stays readable', () => {
    const params = new URLSearchParams(encodeShare(sign));
    expect(params.get('fg')).toBe('22e4ff');
    expect(params.get('dir')).toBe('right');
  });

  it('returns null when the hash holds no sign', () => {
    expect(decodeShare('', base)).toBeNull();
    expect(decodeShare('#', base)).toBeNull();
    expect(decodeShare('#section-2', base)).toBeNull();
    expect(decodeShare('#utm=x', base)).toBeNull();
  });

  it('parses tampered links defensively', () => {
    const s = decodeShare('#t=%3Cimg%20src%3Dx%3E&fg=red;x&bg=fff&dir=up&speed=1e9&size=abc&blink=2', base)!;
    expect(s.text).toBe('<img src=x>'); // shown with textContent, so this stays plain text
    expect(s.fg).toBe(base.fg);
    expect(s.bg).toBe('#ffffff');
    expect(s.dir).toBe(base.dir);
    expect(s.speed).toBe(LIMITS.speed[1]);
    expect(s.size).toBe(base.size);
    expect(s.blink).toBe(base.blink);
  });

  it('uses the default text when a shared link has none', () => {
    expect(decodeShare('#t=%20%20&fg=00ff00', base)).toMatchObject({ text: base.text, fg: '#00ff00' });
    expect(decodeShare('#dir=static', base)).toMatchObject({ text: base.text, dir: 'static' });
  });

  it('caps very long shared text', () => {
    const s = decodeShare(`#t=${encodeURIComponent('A'.repeat(1000))}`, base)!;
    expect(s.text).toHaveLength(LIMITS.textLength);
  });
});

describe('geometry', () => {
  it('sizes text from the box height', () => {
    expect(fontSizeFor(390, 100)).toBeCloseTo(390 * FILL);
    expect(fontSizeFor(390, 50)).toBeCloseTo(390 * FILL * 0.5);
    expect(fontSizeFor(390, 500)).toBeCloseTo(390 * FILL); // clamped
  });

  it('keeps the largest font that fits', () => {
    expect(fitFont(300, () => true)).toBe(300);
    const fitted = fitFont(300, (f) => f * 10 <= 1000); // ten 1-em glyphs in 1000 px
    expect(fitted).toBeLessThanOrEqual(100);
    expect(fitted).toBeGreaterThan(99);
    expect(fitFont(300, () => false)).toBe(6);
    expect(fitFont(4, () => false)).toBe(4);
  });

  it('lets a two-word sign grow onto two lines', () => {
    // A box 844 x 390 and the words 王小明 / 歡迎回台灣 (3 and 5 one-em glyphs) that wrap at the space.
    const maxW = 844 * 0.92;
    const maxH = 390 * 0.92;
    const fits = (f: number) => {
      const oneLine = 9 * f <= maxW;
      const lines = oneLine ? 1 : 2;
      const width = oneLine ? 9 * f : 5 * f;
      return width <= maxW && lines * 1.08 * f <= maxH;
    };
    const font = fitFont(fontSizeFor(390, 100), fits);
    expect(font).toBeGreaterThan(maxW / 9); // bigger than squeezing everything onto one line
    expect(font).toBeLessThanOrEqual(maxW / 5);
  });

  it('scales speed with the box height and clamps the level', () => {
    expect(speedPx(5, 390)).toBeCloseTo(780);
    expect(speedPx(10, 100)).toBeCloseTo(400);
    expect(speedPx(0, 100)).toBeCloseTo(speedPx(1, 100));
  });

  it('scrolls left: enters at the right edge, leaves past the left edge, then repeats', () => {
    const w = 800;
    const tw = 1200;
    expect(scrollX(0, w, tw, 'left')).toBe(800);
    expect(scrollX(800, w, tw, 'left')).toBe(0);
    expect(scrollX(1999, w, tw, 'left')).toBe(-1199);
    expect(scrollX(2000, w, tw, 'left')).toBe(800);
    expect(scrollX(2000 * 7 + 100, w, tw, 'left')).toBe(700);
  });

  it('scrolls right: enters at the left edge and leaves past the right edge', () => {
    expect(scrollX(0, 800, 400, 'right')).toBe(-400);
    expect(scrollX(400, 800, 400, 'right')).toBe(0);
    expect(scrollX(1199, 800, 400, 'right')).toBe(799);
    expect(scrollX(-100, 800, 400, 'right')).toBe(700);
  });

  it('centers static text', () => {
    expect(scrollX(12345, 800, 300, 'static')).toBe(250);
    expect(scrollX(0, 0, 0, 'left')).toBe(0);
  });

  it('breaks CJK text anywhere only when wrapping at spaces leaves it much smaller', () => {
    expect(preferWrapAnywhere(155, 155)).toBe(false);
    expect(preferWrapAnywhere(155, 180)).toBe(false);
    expect(preferWrapAnywhere(52, 111)).toBe(true);
  });

  it('spaces LED dots by the text size with a minimum', () => {
    expect(dotPitch(240)).toBe(10);
    expect(dotPitch(10)).toBe(2);
  });

  it('turns the sign to the long side on a portrait screen in full screen only', () => {
    expect(rotationFor(390, 844, false, false)).toBe(0);
    expect(rotationFor(390, 844, true, false)).toBe(90);
    expect(rotationFor(390, 844, true, true)).toBe(270);
    expect(rotationFor(844, 390, true, false)).toBe(0);
    expect(rotationFor(844, 390, true, true)).toBe(180);
    expect(rotationFor(844, 390, false, true)).toBe(0);
  });
});

describe('contrastRatio', () => {
  it('matches the WCAG extremes', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
    expect(contrastRatio('#ff2a2a', '#ff2a2a')).toBeCloseTo(1);
  });

  it('flags close colors and passes the default sign', () => {
    expect(contrastRatio(DEFAULTS.fg, DEFAULTS.bg)).toBeGreaterThan(MIN_CONTRAST);
    expect(contrastRatio('#ffe100', '#ffd400')).toBeLessThan(MIN_CONTRAST);
    expect(contrastRatio('nope', '#000')).toBe(1);
  });
});
