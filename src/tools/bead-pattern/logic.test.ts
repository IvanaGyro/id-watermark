import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  PALETTE,
  PALETTE_IDS,
  SYMBOLS,
  averageCells,
  boardCount,
  cellFromPoint,
  cellsOnLine,
  composeGrid,
  deltaE2000,
  downscaleSize,
  exportFilename,
  finishedSizeCm,
  hexToRgb,
  isNearWhite,
  labelStep,
  layoutGrid,
  legend,
  nearestIndex,
  normalizeSettings,
  paintCell,
  paletteIndices,
  prepareCells,
  quantize,
  revertChanges,
  rgbToHex,
  rgbToLab,
  samplingFactor,
  tally,
  textColorFor,
  totalBeads,
  type Cells,
  type Lab,
  type Rgb,
} from './logic';

const idx = (id: string) => PALETTE.findIndex((c) => c.id === id);

/** Build Cells straight from a list of colors (null = transparent). */
function cellsOf(cols: number, rows: number, colors: (Rgb | null)[]): Cells {
  const rgb = new Uint8ClampedArray(cols * rows * 3).fill(255);
  const alpha = new Uint8ClampedArray(cols * rows);
  colors.forEach((c, i) => {
    if (!c) return;
    rgb.set(c, i * 3);
    alpha[i] = 255;
  });
  return { cols, rows, rgb, alpha };
}

const RED: Rgb = hexToRgb(PALETTE[idx('red')].hex);
const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];
const R = RED;
const W = WHITE;

describe('hex and rgb', () => {
  it('round-trips and rejects bad input', () => {
    expect(hexToRgb('#d3272c')).toEqual([211, 39, 44]);
    expect(hexToRgb('FFFFFF')).toEqual([255, 255, 255]);
    expect(rgbToHex([211, 39, 44])).toBe('#d3272c');
    expect(rgbToHex([300, -4, 12.6])).toBe('#ff000d');
    expect(() => hexToRgb('#fff')).toThrow();
  });
});

describe('rgbToLab', () => {
  it('matches reference CIELAB values (D65)', () => {
    const near = (a: Lab, b: Lab) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 1));
    near(rgbToLab(255, 255, 255), [100, 0, 0]);
    near(rgbToLab(0, 0, 0), [0, 0, 0]);
    near(rgbToLab(255, 0, 0), [53.24, 80.09, 67.2]);
    near(rgbToLab(0, 255, 0), [87.73, -86.18, 83.18]);
    near(rgbToLab(0, 0, 255), [32.3, 79.19, -107.86]);
    near(rgbToLab(128, 128, 128), [53.59, 0, 0]);
  });
});

describe('deltaE2000', () => {
  // Test pairs from Sharma, Wu & Dalal (2005), including the hue wrap-around cases.
  const pairs: [Lab, Lab, number][] = [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
    [[50, -1.3802, -84.2814], [50, 0, -82.7485], 1.0],
    [[50, 0, 0], [50, -1, 2], 2.3669],
    [[50, 2.49, -0.001], [50, -2.49, 0.0009], 7.1792],
    [[50, 2.49, -0.001], [50, -2.49, 0.0011], 7.2195],
    [[50, -0.001, 2.49], [50, 0.0009, -2.49], 4.8045],
    [[50, -0.001, 2.49], [50, 0.0011, -2.49], 4.7461],
    [[50, 2.5, 0], [50, 0, -2.5], 4.3065],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[50, 2.5, 0], [61, -5, 29], 22.8977],
    [[50, 2.5, 0], [56, -27, -3], 31.903],
    [[50, 2.5, 0], [58, 24, 15], 19.4535],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
    [[63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.263],
  ];
  it.each(pairs)('%j vs %j = %d', (a, b, expected) => {
    expect(deltaE2000(a, b)).toBeCloseTo(expected, 4);
    expect(deltaE2000(b, a)).toBeCloseTo(expected, 4);
  });

  it('is zero for identical colors', () => {
    expect(deltaE2000([42, 10, -20], [42, 10, -20])).toBe(0);
  });
});

describe('textColorFor', () => {
  it('picks the readable text color', () => {
    expect(textColorFor(WHITE)).toBe('#000000');
    expect(textColorFor(hexToRgb('#f6d11f'))).toBe('#000000');
    expect(textColorFor(BLACK)).toBe('#ffffff');
    expect(textColorFor(hexToRgb('#1e2c69'))).toBe('#ffffff');
  });
});

describe('palette', () => {
  it('has unique ids, colors and symbols, and names in every locale', () => {
    expect(new Set(PALETTE.map((c) => c.id)).size).toBe(PALETTE.length);
    expect(new Set(PALETTE.map((c) => c.hex)).size).toBe(PALETTE.length);
    expect(SYMBOLS.length).toBeGreaterThanOrEqual(PALETTE.length);
    expect(new Set(PALETTE.map((c) => c.symbol)).size).toBe(PALETTE.length);
    for (const c of PALETTE) {
      expect(c.names['zh-TW'], c.id).toBeTruthy();
      expect(c.names.en, c.id).toBeTruthy();
      expect(c.names.ja, c.id).toBeTruthy();
    }
  });

  it('keeps sub-palettes inside the full palette', () => {
    expect(paletteIndices('full')).toHaveLength(PALETTE.length);
    for (const id of PALETTE_IDS) {
      const list = paletteIndices(id);
      expect(new Set(list).size).toBe(list.length);
      expect(list.every((i) => i >= 0 && i < PALETTE.length)).toBe(true);
    }
    expect(paletteIndices('gray').map((i) => PALETTE[i].id)).toEqual(['white', 'lightGray', 'gray', 'darkGray', 'black']);
  });

  it('keeps palette colors far enough apart to tell beads apart', () => {
    for (let i = 0; i < PALETTE.length; i++) {
      for (let j = i + 1; j < PALETTE.length; j++) {
        expect(deltaE2000(PALETTE[i].lab, PALETTE[j].lab), `${PALETTE[i].id} / ${PALETTE[j].id}`).toBeGreaterThan(5);
      }
    }
  });
});

describe('nearestIndex', () => {
  const labs = PALETTE.map((c) => c.lab);
  it('maps colors to the perceptually closest bead', () => {
    expect(PALETTE[nearestIndex(rgbToLab(255, 0, 0), labs)].id).toBe('red');
    expect(PALETTE[nearestIndex(rgbToLab(255, 255, 255), labs)].id).toBe('white');
    expect(PALETTE[nearestIndex(rgbToLab(5, 5, 5), labs)].id).toBe('black');
    expect(PALETTE[nearestIndex(rgbToLab(0, 40, 120), labs)].id).toBe('navy');
    for (const c of PALETTE) expect(nearestIndex(c.lab, labs)).toBe(c.index);
  });

  it('skips colors that are switched off', () => {
    const use = PALETTE.map((c) => c.id !== 'red');
    expect(PALETTE[nearestIndex(rgbToLab(255, 0, 0), labs, use)].id).not.toBe('red');
    expect(nearestIndex([50, 0, 0], labs, PALETTE.map(() => false))).toBe(-1);
  });
});

describe('normalizeSettings', () => {
  it('returns defaults for junk', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings('x')).toEqual(DEFAULT_SETTINGS);
  });

  it('clamps numbers and rejects unknown options', () => {
    const s = normalizeSettings({
      width: '58',
      maxColors: 999,
      board: 2,
      frame: 'stretch',
      palette: 'gray',
      shape: 'square',
      dither: 'yes',
      removeBg: false,
      symbols: true,
    });
    expect(s).toEqual({
      ...DEFAULT_SETTINGS,
      width: 58,
      maxColors: PALETTE.length,
      board: 5,
      palette: 'gray',
      shape: 'square',
      removeBg: false,
      symbols: true,
    });
    expect(normalizeSettings({ width: 1000 }).width).toBe(200);
    expect(normalizeSettings({ width: 2.6 }).width).toBe(5);
    expect(normalizeSettings({ width: 'abc' }).width).toBe(DEFAULT_SETTINGS.width);
    expect(normalizeSettings({ width: 40.4 }).width).toBe(40);
  });
});

describe('layoutGrid', () => {
  it('keeps the aspect ratio by default', () => {
    const g = layoutGrid(400, 300, 58, 'original');
    expect([g.cols, g.rows]).toEqual([58, 44]);
    expect(g.src).toEqual({ x: 0, y: 0, w: 400, h: 300 });
    expect(g.dest).toEqual({ x: 0, y: 0, w: 58, h: 44 });
    expect(layoutGrid(1000, 10, 29, 'original').rows).toBe(1);
  });

  it('crops the center square', () => {
    const g = layoutGrid(400, 300, 29, 'squareCrop');
    expect([g.cols, g.rows]).toEqual([29, 29]);
    expect(g.src).toEqual({ x: 50, y: 0, w: 300, h: 300 });
  });

  it('fits the whole image inside a square', () => {
    const g = layoutGrid(400, 200, 40, 'squareFit');
    expect([g.cols, g.rows]).toEqual([40, 40]);
    expect(g.dest).toEqual({ x: 0, y: 10, w: 40, h: 20 });
  });

  it('never goes past the maximum side', () => {
    const g = layoutGrid(100, 1000, 87, 'original');
    expect(g.rows).toBe(200);
    expect(g.cols).toBe(20);
    expect(layoutGrid(100, 100, 500, 'squareCrop').cols).toBe(200);
  });
});

describe('resize math', () => {
  it('samples a few pixels per bead within the budget', () => {
    expect(samplingFactor(29, 29)).toBe(8);
    expect(samplingFactor(58, 58)).toBe(8);
    expect(samplingFactor(87, 60)).toBe(5);
    expect(samplingFactor(200, 200)).toBe(2);
    expect(samplingFactor(600, 10)).toBe(1);
  });

  it('downscales big photos once and leaves small ones alone', () => {
    expect(downscaleSize(4032, 3024)).toEqual({ width: 1024, height: 768 });
    expect(downscaleSize(3000, 6000)).toEqual({ width: 512, height: 1024 });
    expect(downscaleSize(300, 200)).toEqual({ width: 300, height: 200 });
  });
});

describe('averageCells', () => {
  /** w×h pixels from a list of RGBA quads, row by row. */
  const pixels = (quads: number[][]) => Uint8ClampedArray.from(quads.flat());

  it('averages mixed pixels, weighted by alpha', () => {
    // 2×1 beads, k = 2 → 4×2 pixels.
    const px = pixels([
      // Left bead: four different colors, no majority → plain average.
      [255, 0, 0, 255], [0, 0, 255, 255], /* right bead: */ [0, 200, 0, 255], [255, 255, 255, 0],
      [0, 255, 0, 255], [255, 255, 0, 255], /* right bead: */ [255, 0, 0, 0], [255, 0, 0, 0],
    ]);
    const cells = averageCells(px, 2, 1, 2);
    expect(Array.from(cells.rgb.slice(0, 3))).toEqual([128, 128, 64]);
    expect(cells.alpha[0]).toBe(255);
    // One opaque green pixel and three transparent ones: their color must not leak in.
    expect(Array.from(cells.rgb.slice(3, 6))).toEqual([0, 200, 0]);
    expect(cells.alpha[1]).toBe(64);
  });

  it('takes the dominant color so outlines stay crisp', () => {
    // 1 bead, k = 2: three dark brown pixels (with slight noise) and one white one.
    const px = pixels([
      [70, 42, 26, 255], [72, 42, 26, 255],
      [71, 42, 26, 255], [255, 255, 255, 255],
    ]);
    const cells = averageCells(px, 1, 1, 2);
    expect(Array.from(cells.rgb)).toEqual([71, 42, 26]);
    // Plain averaging (share above 1) would give a muddy brown-white mix instead.
    expect(Array.from(averageCells(px, 1, 1, 2, 1.01).rgb)).toEqual([117, 95, 83]);
  });

  it('keeps coverage from every pixel when a color dominates', () => {
    const px = pixels([
      [200, 0, 0, 255], [200, 0, 0, 255],
      [200, 0, 0, 255], [0, 0, 0, 0],
    ]);
    const cells = averageCells(px, 1, 1, 2);
    expect(Array.from(cells.rgb)).toEqual([200, 0, 0]);
    expect(cells.alpha[0]).toBe(191);
  });

  it('turns fully transparent beads white with zero alpha', () => {
    const cells = averageCells(new Uint8ClampedArray(4), 1, 1, 1);
    expect(Array.from(cells.rgb)).toEqual([255, 255, 255]);
    expect(cells.alpha[0]).toBe(0);
  });
});

describe('background', () => {
  it('recognises paper white but not pale colors', () => {
    expect(isNearWhite(rgbToLab(255, 255, 255))).toBe(true);
    expect(isNearWhite(rgbToLab(240, 240, 236))).toBe(true);
    expect(isNearWhite(PALETTE[idx('cream')].lab)).toBe(false);
    expect(isNearWhite(PALETTE[idx('lightBlue')].lab)).toBe(false);
    expect(isNearWhite(PALETTE[idx('lightGray')].lab)).toBe(false);
  });

  // 5×5: white frame, red ring, white center (an "eye" that must survive).
  const ring = cellsOf(5, 5, [W, W, W, W, W, W, R, R, R, W, W, R, W, R, W, W, R, R, R, W, W, W, W, W, W]);

  it('empties white that touches the edge and keeps enclosed white', () => {
    const { empty } = prepareCells(ring, true);
    expect(Array.from(empty)).toEqual([1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
  });

  it('keeps every bead when background removal is off', () => {
    const { empty, rgb } = prepareCells(cellsOf(2, 1, [null, R]), false);
    expect(Array.from(empty)).toEqual([0, 0]);
    expect(Array.from(rgb.slice(0, 3))).toEqual([255, 255, 255]);
  });

  it('always empties transparent beads, even inside the picture', () => {
    const cells = cellsOf(3, 3, [R, R, R, R, null, R, R, R, R]);
    expect(Array.from(prepareCells(cells, true).empty)).toEqual([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  });

  it('flattens half-transparent beads onto white', () => {
    const cells = cellsOf(1, 1, [BLACK]);
    cells.alpha[0] = 191;
    const { rgb, empty } = prepareCells(cells, true);
    expect(empty[0]).toBe(0);
    expect(rgb[0]).toBe(64);
  });
});

describe('quantize', () => {
  const all = paletteIndices('full');
  const run = (cells: Cells, maxColors: number, opts: { removeBg?: boolean; dither?: boolean; allowed?: number[] } = {}) =>
    quantize(prepareCells(cells, opts.removeBg ?? false), cells.cols, cells.rows, {
      allowed: opts.allowed ?? all,
      maxColors,
      dither: opts.dither ?? false,
    });

  it('maps exact bead colors to themselves', () => {
    const colors = PALETTE.slice(0, 12).map((c) => hexToRgb(c.hex));
    const grid = run(cellsOf(12, 1, colors), PALETTE.length);
    expect(Array.from(grid)).toEqual(PALETTE.slice(0, 12).map((c) => c.index));
  });

  it('keeps the most used colors and moves the rest to the nearest kept one', () => {
    const burgundy = hexToRgb(PALETTE[idx('burgundy')].hex);
    const sky = hexToRgb(PALETTE[idx('skyBlue')].hex);
    // 6 red, 5 white, 2 burgundy, 1 sky blue.
    const colors: Rgb[] = [R, R, R, R, R, R, W, W, W, W, W, burgundy, burgundy, sky];
    const before = legend(run(cellsOf(14, 1, colors), 16));
    expect(before.map((r) => PALETTE[r.index].id)).toEqual(['red', 'white', 'burgundy', 'skyBlue']);

    const grid = run(cellsOf(14, 1, colors), 2);
    const rows = legend(grid);
    expect(rows.map((r) => PALETTE[r.index].id)).toEqual(['red', 'white']);
    expect(rows.map((r) => r.count)).toEqual([8, 6]);
    expect(grid[11]).toBe(idx('red')); // burgundy → red
    expect(grid[13]).toBe(idx('white')); // sky blue → closer to white than to red
  });

  it('only uses the allowed palette', () => {
    const gray = paletteIndices('gray');
    const grid = run(cellsOf(3, 1, [R, hexToRgb('#2d6bcf'), hexToRgb('#f6d11f')]), 5, { allowed: gray });
    expect(Array.from(grid).every((v) => gray.includes(v))).toBe(true);
  });

  it('leaves empty pegs empty', () => {
    const grid = run(cellsOf(3, 1, [null, R, null]), 16, { removeBg: true });
    expect(Array.from(grid)).toEqual([-1, idx('red'), -1]);
    expect(Array.from(run(cellsOf(2, 1, [null, null]), 16, { removeBg: true }))).toEqual([-1, -1]);
  });

  it('mixes the kept colors when dithering a gradient', () => {
    const mid: Rgb = [118, 118, 118];
    const cells = cellsOf(10, 10, Array(100).fill(mid));
    const bw = [idx('white'), idx('black')];
    const flat = legend(run(cells, 2, { allowed: bw }));
    expect(flat).toHaveLength(1);
    const dithered = legend(run(cells, 2, { allowed: bw, dither: true }));
    expect(dithered).toHaveLength(2);
    expect(Math.min(...dithered.map((r) => r.count))).toBeGreaterThan(20);
  });

  it('never dithers in a color that was reduced away', () => {
    const colors: Rgb[] = Array.from({ length: 64 }, (_, i) => [i * 4, 255 - i * 4, 128]);
    const grid = run(cellsOf(8, 8, colors), 3, { dither: true });
    expect(legend(grid).length).toBeLessThanOrEqual(3);
  });

  it('stays fast for a 58 × 58 photo with every bead a different color', () => {
    const colors: Rgb[] = Array.from({ length: 58 * 58 }, (_, i) => [(i * 37) % 256, (i * 91) % 256, (i * 13) % 256]);
    const cells = cellsOf(58, 58, colors);
    const start = performance.now();
    const grid = run(cells, 16, { dither: false });
    run(cells, 16, { dither: true });
    expect(performance.now() - start).toBeLessThan(1500);
    expect(legend(grid).length).toBeLessThanOrEqual(16);
  });
});

describe('counts', () => {
  const grid = Int16Array.from([0, 0, 5, -1, 5, 5, 2, -1]);
  it('tallies beads per color, most used first', () => {
    expect(tally(grid)[5]).toBe(3);
    expect(legend(grid)).toEqual([
      { index: 5, count: 3 },
      { index: 0, count: 2 },
      { index: 2, count: 1 },
    ]);
    expect(totalBeads(grid)).toBe(6);
    expect(legend(Int16Array.from([-1, -1]))).toEqual([]);
  });

  it('counts the pegboards a pattern covers', () => {
    expect(boardCount(29, 29, 29)).toEqual({ across: 1, down: 1, total: 1 });
    expect(boardCount(58, 41, 29)).toEqual({ across: 2, down: 2, total: 4 });
    expect(boardCount(30, 10, 29)).toEqual({ across: 2, down: 1, total: 2 });
    expect(boardCount(87, 87, 29).total).toBe(9);
  });

  it('works out the finished size from the bead pitch', () => {
    expect(finishedSizeCm(29, 29)).toEqual({ width: 14.5, height: 14.5 });
    expect(finishedSizeCm(58, 40, 2.6).width).toBeCloseTo(15.08, 5);
  });
});

describe('editing', () => {
  it('paints, repaints back to the original and undoes', () => {
    const base = Int16Array.from([1, 1, 2, -1]);
    const overrides = new Map<number, number>();
    const a = paintCell(base, overrides, 0, 7)!;
    expect(a).toEqual({ index: 0, prev: undefined, next: 7 });
    expect(Array.from(composeGrid(base, overrides))).toEqual([7, 1, 2, -1]);

    expect(paintCell(base, overrides, 0, 7)).toBeNull(); // same color: no-op
    const b = paintCell(base, overrides, 0, 1)!; // back to generated color
    expect(overrides.has(0)).toBe(false);
    const c = paintCell(base, overrides, 3, 4)!;
    const d = paintCell(base, overrides, 2, -1)!; // eraser
    expect(Array.from(composeGrid(base, overrides))).toEqual([1, 1, -1, 4]);

    revertChanges(overrides, [c, d]);
    expect(Array.from(composeGrid(base, overrides))).toEqual([1, 1, 2, -1]);
    revertChanges(overrides, [b]);
    expect(Array.from(composeGrid(base, overrides))).toEqual([7, 1, 2, -1]);
    revertChanges(overrides, [a]);
    expect(overrides.size).toBe(0);
    expect(paintCell(base, overrides, 9, 1)).toBeNull();
  });

  it('reverts a stroke that touched the same bead twice', () => {
    const base = Int16Array.from([0]);
    const overrides = new Map<number, number>();
    const stroke = [paintCell(base, overrides, 0, 3)!, paintCell(base, overrides, 0, 4)!];
    revertChanges(overrides, stroke);
    expect(overrides.size).toBe(0);
  });
});

describe('drawing geometry', () => {
  it('spaces coordinate labels so they never overlap', () => {
    expect(labelStep(20, 18)).toBe(1);
    expect(labelStep(12, 18)).toBe(2);
    expect(labelStep(5, 18)).toBe(5);
    expect(labelStep(3, 18)).toBe(10);
  });

  it('finds the bead under the pointer', () => {
    expect(cellFromPoint(30, 30, 20, 20, 10, 5, 4)).toBe(6);
    expect(cellFromPoint(19, 30, 20, 20, 10, 5, 4)).toBe(-1);
    expect(cellFromPoint(69.9, 59.9, 20, 20, 10, 5, 4)).toBe(19);
    expect(cellFromPoint(70, 60, 20, 20, 10, 5, 4)).toBe(-1);
  });

  it('fills the beads between two drag positions', () => {
    expect(cellsOnLine(0, 3, 10)).toEqual([0, 1, 2, 3]);
    expect(cellsOnLine(0, 22, 10)).toEqual([0, 11, 22]);
    expect(cellsOnLine(-1, 5, 10)).toEqual([5]);
    expect(cellsOnLine(5, -1, 10)).toEqual([]);
  });

  it('names the export after the pattern size', () => {
    expect(exportFilename(58, 41)).toBe('bead-pattern-58x41.png');
  });
});
