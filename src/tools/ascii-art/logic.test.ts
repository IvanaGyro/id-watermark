import { describe, expect, it } from 'vitest';
import {
  BRAILLE,
  BRAILLE_BLANK,
  DEFAULT_SETTINGS,
  MAX_COLUMNS,
  MIN_COLUMNS,
  NARROW,
  PRESET_CHARS,
  WIDE,
  WIDE_BLANK,
  adjustTone,
  artText,
  artToHtml,
  brailleChar,
  brailleLines,
  buildRamp,
  cellColors,
  charsetSpec,
  colorRuns,
  contrastFactor,
  convert,
  escapeHtml,
  inkCoverage,
  inkMap,
  isWideChar,
  layoutGrid,
  levelsRange,
  luminance,
  nearestIndex,
  normalizeSettings,
  outputName,
  parseCustomChars,
  quantize,
  rampLines,
  sobel,
  toHex,
  type ToneOptions,
} from './logic';

/** RGBA buffer of w × h pixels from a per-pixel [r, g, b, a?] function. */
function image(w: number, h: number, px: (x: number, y: number) => number[]): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b, a = 255] = px(x, y);
      out.set([r, g, b, a], (y * w + x) * 4);
    }
  }
  return out;
}

const grey = (v: number) => [v, v, v];
const tone: ToneOptions = { background: 'light', invert: false, brightness: 0, contrast: 0, autoLevels: false, edges: false };

describe('luminance', () => {
  it('uses Rec. 709 weights on 0–255 values', () => {
    expect(luminance(0, 0, 0)).toBe(0);
    expect(luminance(255, 255, 255)).toBeCloseTo(1, 10);
    expect(luminance(255, 0, 0)).toBeCloseTo(0.2126, 4);
    expect(luminance(0, 255, 0)).toBeCloseTo(0.7152, 4);
    expect(luminance(0, 0, 255)).toBeCloseTo(0.0722, 4);
  });
  it('ranks green brighter than red brighter than blue', () => {
    expect(luminance(0, 200, 0)).toBeGreaterThan(luminance(200, 0, 0));
    expect(luminance(200, 0, 0)).toBeGreaterThan(luminance(0, 0, 200));
  });
});

describe('brightness and contrast', () => {
  it('contrast slider maps to a multiplier', () => {
    expect(contrastFactor(0)).toBe(1);
    expect(contrastFactor(100)).toBe(4);
    expect(contrastFactor(-100)).toBe(0);
    expect(contrastFactor(-50)).toBe(0.5);
    expect(contrastFactor(500)).toBe(4);
  });
  it('pivots on mid-grey and clamps to 0…1', () => {
    expect(adjustTone(0.5, 0, 100)).toBeCloseTo(0.5);
    expect(adjustTone(0.6, 0, 100)).toBeCloseTo(0.9);
    expect(adjustTone(0.9, 0, 100)).toBe(1);
    expect(adjustTone(0.2, 0, -100)).toBeCloseTo(0.5);
    expect(adjustTone(0.5, 100, 0)).toBe(1);
    expect(adjustTone(0.5, -50, 0)).toBeCloseTo(0.25);
  });
});

describe('levelsRange', () => {
  it('finds the darkest and brightest tones', () => {
    const tones = Array.from({ length: 100 }, (_, i) => 0.2 + (i / 99) * 0.5);
    const [lo, hi] = levelsRange(tones, 0);
    expect(lo).toBeCloseTo(0.2, 2);
    expect(hi).toBeCloseTo(0.7, 2);
  });
  it('ignores a few outliers', () => {
    const tones = [...Array(98).fill(0.5), 0, 1];
    expect(levelsRange(tones, 0.02)).toEqual([0, 1]); // a flat image falls back to the full range
    const spread = [...Array.from({ length: 196 }, (_, i) => 0.3 + (i % 2) * 0.3), 0, 0, 1, 1];
    const [lo, hi] = levelsRange(spread, 0.01);
    expect(lo).toBeCloseTo(0.3, 2);
    expect(hi).toBeCloseTo(0.6, 2);
  });
});

describe('inkMap', () => {
  const ramp = image(3, 1, (x) => grey([0, 128, 255][x]));

  it('gives dark pixels the most ink on a light background', () => {
    const ink = inkMap(ramp, 3, 1, tone);
    expect(ink[0]).toBeCloseTo(1);
    expect(ink[1]).toBeCloseTo(0.5, 1);
    expect(ink[2]).toBeCloseTo(0);
  });
  it('flips for a dark background, and invert flips again', () => {
    const dark = inkMap(ramp, 3, 1, { ...tone, background: 'dark' });
    expect(dark[0]).toBeCloseTo(0);
    expect(dark[2]).toBeCloseTo(1);
    const inverted = inkMap(ramp, 3, 1, { ...tone, invert: true });
    expect(inverted[0]).toBeCloseTo(0);
    expect(inverted[2]).toBeCloseTo(1);
    const both = inkMap(ramp, 3, 1, { ...tone, background: 'dark', invert: true });
    expect(both[0]).toBeCloseTo(1);
  });
  it('keeps transparent pixels blank on either background', () => {
    const clear = image(1, 1, () => [0, 0, 0, 0]);
    expect(inkMap(clear, 1, 1, tone)[0]).toBe(0);
    expect(inkMap(clear, 1, 1, { ...tone, background: 'dark' })[0]).toBe(0);
  });
  it('auto levels stretches a low-contrast picture to the full range', () => {
    const dull = image(10, 1, (x) => grey(100 + x * 5));
    const ink = inkMap(dull, 10, 1, { ...tone, autoLevels: true });
    expect(Math.max(...ink)).toBeCloseTo(1, 2);
    expect(Math.min(...ink)).toBeCloseTo(0, 2);
  });
  it('edge emphasis adds ink along a boundary but not in flat areas', () => {
    const step = image(6, 3, (x) => grey(x < 3 ? 200 : 255));
    const plain = inkMap(step, 6, 3, tone);
    const edged = inkMap(step, 6, 3, { ...tone, edges: true });
    expect(edged[2]).toBeGreaterThan(plain[2] + 0.2);
    expect(edged[0]).toBeCloseTo(plain[0]);
    expect(edged[5]).toBeCloseTo(plain[5]);
    for (const v of edged) expect(v).toBeLessThanOrEqual(1);
  });
});

describe('sobel', () => {
  it('is zero on flat areas and 1 on a black-to-white step', () => {
    const flat = sobel(new Float32Array(9).fill(0.4), 3, 3);
    expect(Array.from(flat).every((v) => v === 0)).toBe(true);
    const step = sobel([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1], 4, 3);
    expect(step[1]).toBe(1);
    expect(step[2]).toBe(1);
    expect(step[0]).toBe(0);
  });
});

describe('ramps', () => {
  it('measures glyph coverage as mean alpha', () => {
    expect(inkCoverage(new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 0]))).toBe(0.5);
    expect(inkCoverage(new Uint8ClampedArray(0))).toBe(0);
  });
  it('keeps the given order evenly spaced without measurements', () => {
    expect(buildRamp([' ', '.', ':', '#'])).toEqual({ chars: [' ', '.', ':', '#'], weights: [0, 1 / 3, 2 / 3, 1] });
  });
  it('sorts by measured ink and weights by coverage', () => {
    const r = buildRamp(['#', ' ', '.', 'o'], [0.4, 0, 0.1, 0.2]);
    expect(r.chars).toEqual([' ', '.', 'o', '#']);
    expect(r.weights).toEqual([0, 0.25, 0.5, 1]);
  });
  it('drops duplicate characters and handles tiny sets', () => {
    expect(buildRamp(['a', 'b', 'a']).chars).toEqual(['a', 'b']);
    expect(buildRamp(['x'])).toEqual({ chars: ['x'], weights: [0] });
    expect(buildRamp([])).toEqual({ chars: [' '], weights: [0] });
  });
  it('falls back to even spacing when all glyphs measure the same', () => {
    expect(buildRamp(['a', 'b', 'c'], [0.1, 0.1, 0.1]).weights).toEqual([0, 0.5, 1]);
  });
  it('picks the nearest level', () => {
    const w = [0, 0.25, 0.5, 1];
    expect(nearestIndex(w, -1)).toBe(0);
    expect(nearestIndex(w, 0.1)).toBe(0);
    expect(nearestIndex(w, 0.2)).toBe(1);
    expect(nearestIndex(w, 0.74)).toBe(2);
    expect(nearestIndex(w, 0.76)).toBe(3);
    expect(nearestIndex(w, 2)).toBe(3);
    expect(nearestIndex([0], 0.7)).toBe(0);
  });
  it('maps a gradient onto the ramp from blank to densest', () => {
    const levels = quantize([0, 0.33, 0.67, 1], 4, 1, [0, 1 / 3, 2 / 3, 1], false);
    expect(rampLines(levels, 4, 1, [' ', '.', ':', '#'])).toEqual([' .:#']);
  });
  it('presets start with a blank and the CJK set is full-width', () => {
    expect(PRESET_CHARS.classic[0]).toBe(' ');
    expect(PRESET_CHARS.simple).toBe(' .:-=+*#%@');
    expect(Array.from(PRESET_CHARS.blocks)).toEqual([' ', '░', '▒', '▓', '█']);
    expect(PRESET_CHARS.cjk[0]).toBe(WIDE_BLANK);
    expect(Array.from(PRESET_CHARS.cjk).every(isWideChar)).toBe(true);
    expect(new Set(PRESET_CHARS.classic).size).toBe(PRESET_CHARS.classic.length);
  });
});

describe('dithering', () => {
  it('keeps every level index inside the ramp', () => {
    const w = 37;
    const h = 23;
    const ink = Array.from({ length: w * h }, (_, i) => ((i * 7919) % 1000) / 1000);
    const weights = [0, 0.1, 0.45, 0.5, 1];
    const levels = quantize(ink, w, h, weights, true);
    expect(levels.length).toBe(w * h);
    expect(Math.max(...levels)).toBeLessThan(weights.length);
  });
  it('preserves the average tone with only two levels', () => {
    const w = 40;
    const h = 40;
    for (const v of [0.1, 0.25, 0.5, 0.8]) {
      const levels = quantize(new Float32Array(w * h).fill(v), w, h, [0, 1], true);
      const mean = levels.reduce((s, l) => s + l, 0) / levels.length;
      expect(mean).toBeGreaterThan(v - 0.03);
      expect(mean).toBeLessThan(v + 0.03);
    }
  });
  it('leaves exact levels untouched and stays stable at the extremes', () => {
    expect(Array.from(quantize([0, 1, 0, 1], 2, 2, [0, 1], true))).toEqual([0, 1, 0, 1]);
    expect(Array.from(quantize(new Float32Array(16).fill(1), 4, 4, [0, 0.5, 1], true)).every((l) => l === 2)).toBe(true);
    expect(Array.from(quantize(new Float32Array(16), 4, 4, [0, 0.5, 1], true)).every((l) => l === 0)).toBe(true);
  });
  it('without dithering a flat mid-grey picks a single level', () => {
    const levels = quantize(new Float32Array(10).fill(0.4), 10, 1, [0, 1], false);
    expect(new Set(levels).size).toBe(1);
  });
});

describe('braille', () => {
  it('maps each of the 8 dots to its Unicode bit', () => {
    const one = (i: number) => brailleChar(Array.from({ length: 8 }, (_, k) => (k === i ? 1 : 0)));
    expect(one(0)).toBe('⠁'); // dot 1, top left
    expect(one(1)).toBe('⠈'); // dot 4, top right
    expect(one(2)).toBe('⠂'); // dot 2
    expect(one(3)).toBe('⠐'); // dot 5
    expect(one(4)).toBe('⠄'); // dot 3
    expect(one(5)).toBe('⠠'); // dot 6
    expect(one(6)).toBe('⡀'); // dot 7, bottom left
    expect(one(7)).toBe('⢀'); // dot 8, bottom right
    expect(brailleChar(new Array(8).fill(1))).toBe('⣿');
    expect(brailleChar(new Array(8).fill(0))).toBe(BRAILLE_BLANK);
  });
  it('turns a dot grid into lines of 2 × 4 cells', () => {
    // 4 × 4 dots → 2 braille characters: left column of the first cell, full second cell.
    const dots = [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1];
    expect(brailleLines(dots, 4, 4)).toEqual(['⡇⣿']);
    expect(brailleLines(new Array(16).fill(0), 4, 4)).toEqual(['⠀⠀']);
  });
});

describe('layoutGrid (aspect correction)', () => {
  it('halves the rows for half-width cells', () => {
    expect(layoutGrid(800, 600, 100, NARROW)).toEqual({ cols: 100, rows: 38, pxW: 100, pxH: 38 });
    expect(layoutGrid(1000, 1000, 120, NARROW)).toEqual({ cols: 120, rows: 60, pxW: 120, pxH: 60 });
  });
  it('full-width characters are square and count as two columns', () => {
    expect(layoutGrid(800, 600, 100, WIDE)).toEqual({ cols: 50, rows: 38, pxW: 50, pxH: 38 });
  });
  it('braille samples 2 × 4 pixels per character', () => {
    expect(layoutGrid(800, 600, 100, BRAILLE)).toEqual({ cols: 100, rows: 38, pxW: 200, pxH: 152 });
    // Square dots: the pixel grid keeps the picture's proportions.
    const g = layoutGrid(1200, 900, 160, BRAILLE);
    expect(g.pxH / g.pxW).toBeCloseTo(900 / 1200, 2);
  });
  it('clamps the width and caps very tall pictures', () => {
    expect(layoutGrid(100, 100, 5, NARROW).cols).toBe(MIN_COLUMNS);
    expect(layoutGrid(100, 100, 9999, NARROW).cols).toBe(MAX_COLUMNS);
    const tall = layoutGrid(100, 2000, 200, NARROW, 300);
    expect(tall.rows).toBe(300);
    expect(tall.cols).toBe(30);
    expect(layoutGrid(0, 0, 80, NARROW).rows).toBe(40);
    expect(layoutGrid(1000, 1, 40, NARROW).rows).toBe(1);
  });
});

describe('character sets', () => {
  it('detects full-width characters', () => {
    expect(isWideChar('田')).toBe(true);
    expect(isWideChar('あ')).toBe(true);
    expect(isWideChar('한')).toBe(true);
    expect(isWideChar('Ａ')).toBe(true);
    expect(isWideChar(WIDE_BLANK)).toBe(true);
    expect(isWideChar('A')).toBe(false);
    expect(isWideChar('█')).toBe(false);
    expect(isWideChar('⣿')).toBe(false);
  });
  it('parses custom sets', () => {
    expect(parseCustomChars('.oO@')).toEqual({ chars: ['.', 'o', 'O', '@'], wide: false, mixed: false });
    expect(parseCustomChars(' 一二田')).toEqual({ chars: [WIDE_BLANK, '一', '二', '田'], wide: true, mixed: false });
    expect(parseCustomChars('a\nb\tb')).toEqual({ chars: ['a', 'b'], wide: false, mixed: false });
    expect(parseCustomChars('.田').mixed).toBe(true);
    expect(parseCustomChars('').chars).toEqual([' ', '.', 'o', 'O', '@']);
    expect(parseCustomChars('x'.repeat(10) + 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?').chars.length).toBe(64);
  });
  it('gives each preset its geometry', () => {
    expect(charsetSpec('braille', '').geometry).toBe(BRAILLE);
    expect(charsetSpec('cjk', '').geometry).toBe(WIDE);
    expect(charsetSpec('classic', '').geometry).toBe(NARROW);
    expect(charsetSpec('custom', '口回').geometry).toBe(WIDE);
    expect(charsetSpec('custom', '01').chars).toEqual(['0', '1']);
  });
});

describe('colour', () => {
  it('averages each cell, weighted by alpha', () => {
    const px = image(2, 1, (x) => (x === 0 ? [255, 0, 0, 255] : [0, 0, 255, 0]));
    expect(Array.from(cellColors(px, 2, 1, 2, 1))).toEqual([255, 0, 0]);
    const mix = image(2, 1, (x) => (x === 0 ? [200, 0, 0] : [0, 100, 0]));
    expect(Array.from(cellColors(mix, 2, 1, 2, 1))).toEqual([100, 50, 0]);
    expect(Array.from(cellColors(image(1, 1, () => [9, 9, 9, 0]), 1, 1, 1, 1))).toEqual([128, 128, 128]);
  });
  it('formats hex colours', () => {
    expect(toHex(255, 82, 46)).toBe('#ff522e');
    expect(toHex(-4, 300, 7.6)).toBe('#00ff08');
  });
  it('merges same-coloured characters and lets blanks join runs', () => {
    const colors = [0, 0, 0, 255, 0, 0, 9, 9, 9, 250, 2, 3];
    expect(colorRuns(' a b', colors, 0)).toEqual([{ text: ' a b', color: '#ff0000' }]);
    expect(colorRuns('ab c', [0, 0, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0], 0)).toEqual([
      { text: 'a', color: '#0000ff' },
      { text: 'b ', color: '#ff0000' },
      { text: 'c', color: '#000000' },
    ]);
    // The offset selects the line's first cell in the colour array.
    expect(colorRuns('x', colors, 3)).toEqual([{ text: 'x', color: '#ff0000' }]);
    expect(colorRuns('  ', colors, 0)).toEqual([{ text: '  ', color: null }]);
  });
});

describe('convert', () => {
  const opts = { ...tone, dither: false };

  it('produces the expected number of lines and characters', () => {
    const px = image(40, 30, (x) => grey(Math.round((x / 39) * 255)));
    const layout = layoutGrid(40, 30, 40, NARROW);
    const art = convert(px, layout, NARROW, buildRamp([' ', '.', ':', '#']), opts);
    expect(art.lines.length).toBe(layout.rows);
    expect(art.lines.every((l) => Array.from(l).length === layout.cols)).toBe(true);
    expect(art.lines[0][0]).toBe('#'); // black on light paper
    expect(art.lines[0][39]).toBe(' ');
    expect(art.colors.length).toBe(layout.cols * layout.rows * 3);
    expect(artText(art).split('\n').length).toBe(layout.rows);
  });
  it('braille output has one character per 2 × 4 pixels', () => {
    const layout = layoutGrid(20, 20, 20, BRAILLE);
    const px = image(layout.pxW, layout.pxH, () => grey(0));
    const art = convert(px, layout, BRAILLE, buildRamp([]), opts);
    expect(art.lines.length).toBe(layout.rows);
    expect(art.lines[0]).toBe('⣿'.repeat(20));
    expect(art.colors.length).toBe(20 * layout.rows * 3);
  });
});

describe('export', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<b>&"'`)).toBe('&lt;b&gt;&amp;&quot;&#39;');
  });
  it('builds a styled <pre>, with spans in colour mode', () => {
    const art = convert(image(2, 2, (x) => (x ? [255, 255, 255] : [255, 0, 0])), layoutGrid(2, 2, 20, NARROW), NARROW, buildRamp([' ', '<']), {
      ...tone,
      dither: false,
    });
    const style = { font: "Menlo, 'DejaVu Sans Mono', monospace", fontSize: 10, lineHeight: 1.2041, background: '#ffffff', color: '#18191c' };
    const plain = artToHtml(art, 'plain', style);
    expect(plain.startsWith('<pre style="margin:0;padding:12px;white-space:pre;font-family:Menlo, &#39;DejaVu Sans Mono&#39;, monospace;')).toBe(true);
    expect(plain).toContain('line-height:1.204');
    expect(plain).toContain('&lt;');
    expect(plain).not.toContain('<span');
    const colored = artToHtml(art, 'color', style);
    expect(colored).toContain('<span style="color:#');
    expect(colored.endsWith('</pre>')).toBe(true);
  });
  it('names downloads after the picture', () => {
    expect(outputName('IMG_1234.HEIC', 'txt')).toBe('IMG_1234-ascii.txt');
    expect(outputName('my cat.photo.png', 'png')).toBe('my cat.photo-ascii.png');
    expect(outputName('a/b:c?.jpg', 'txt')).toBe('abc-ascii.txt');
    expect(outputName('', 'png')).toBe('ascii-art.png');
    expect(outputName('.jpg', 'txt')).toBe('.jpg-ascii.txt');
  });
});

describe('normalizeSettings', () => {
  it('fills defaults and clamps values', () => {
    const s = normalizeSettings({ columns: 9999, charset: 'nope', brightness: '-30', contrast: 'x', dither: 'yes', mode: 'color' });
    expect(s.columns).toBe(MAX_COLUMNS);
    expect(s.charset).toBe('classic');
    expect(s.brightness).toBe(-30);
    expect(s.contrast).toBe(0);
    expect(s.dither).toEqual(DEFAULT_SETTINGS.dither); // junk falls back to the defaults
    expect(DEFAULT_SETTINGS.dither.braille).toBe(true);
    expect(DEFAULT_SETTINGS.dither.classic).toBe(false);
    const own = normalizeSettings({ dither: { classic: true, braille: false, blocks: 'x' } }).dither;
    expect(own).toEqual({ ...DEFAULT_SETTINGS.dither, classic: true, braille: false });
    expect(s.mode).toBe('color');
    expect(s.background).toBe('light');
  });
  it('survives junk', () => {
    expect(normalizeSettings(null).columns).toBe(100);
    expect(normalizeSettings('oops').charset).toBe('classic');
    expect(normalizeSettings({ custom: 'ab'.repeat(100) }).custom.length).toBe(64);
  });
});
