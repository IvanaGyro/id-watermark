import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  centerFontSize,
  centerLineLength,
  cleanField,
  colorIdOf,
  composeText,
  encoderQuality,
  fillTemplate,
  fitWithin,
  fontSizePx,
  formatIsoDate,
  fromRotatedFrame,
  isImageFile,
  isUsableRect,
  mosaicBlock,
  mosaicGrid,
  normalizeHex,
  normalizeSettings,
  opacityFromPercent,
  outlineColor,
  outputFilename,
  parseHexColor,
  rectFromPoints,
  rgbaString,
  rotatedExtent,
  scaleRect,
  splitLines,
  tileLayout,
  toImagePoint,
  toRotatedFrame,
  todayIso,
  uniqueNames,
  type TemplateVariants,
  type TileInput,
} from './logic';

const zhApply: TemplateVariants = {
  both: '僅供{org}申請{purpose}使用，他用無效',
  org: '僅供{org}使用，他用無效',
  purpose: '僅供申請{purpose}使用，他用無效',
  none: '僅供本次申請使用，他用無效',
};

describe('text templates', () => {
  it('fills both fields', () => {
    expect(fillTemplate(zhApply, { org: '幸福銀行', purpose: '開戶' })).toBe('僅供幸福銀行申請開戶使用，他用無效');
  });

  it('falls back to the variant for whatever was filled', () => {
    expect(fillTemplate(zhApply, { org: '幸福銀行', purpose: '  ' })).toBe('僅供幸福銀行使用，他用無效');
    expect(fillTemplate(zhApply, { org: '', purpose: '信用卡' })).toBe('僅供申請信用卡使用，他用無效');
    expect(fillTemplate(zhApply, { org: '', purpose: '' })).toBe('僅供本次申請使用，他用無效');
  });

  it('inserts user text literally, even with $ patterns or braces', () => {
    const en: TemplateVariants = { both: 'For {purpose} with {org} only', org: '', purpose: '', none: '' };
    expect(fillTemplate(en, { org: "$& {org} $'", purpose: 'a $1 lease' })).toBe("For a $1 lease with $& {org} $' only");
  });

  it('cleans fields to one short line', () => {
    expect(cleanField('  幸福\n銀行\t 台北分行 ')).toBe('幸福 銀行 台北分行');
    expect(cleanField('x'.repeat(100))).toHaveLength(40);
    expect(cleanField(42)).toBe('');
  });

  it('formats dates per locale pattern and rejects impossible dates', () => {
    expect(formatIsoDate('2026-11-04', '{y}/{mm}/{dd}')).toBe('2026/11/04');
    expect(formatIsoDate('2026-11-04', '{mon} {d}, {y}')).toBe('Nov 4, 2026');
    expect(formatIsoDate('2026-01-09', '{y}年{m}月{d}日')).toBe('2026年1月9日');
    expect(formatIsoDate('2026-02-30', '{y}')).toBeNull();
    expect(formatIsoDate('2026-13-01', '{y}')).toBeNull();
    expect(formatIsoDate('', '{y}')).toBeNull();
    expect(formatIsoDate('11/04/2026', '{y}')).toBeNull();
  });

  it('builds today in local time', () => {
    expect(todayIso(new Date(2026, 10, 4, 23, 59))).toBe('2026-11-04');
    expect(todayIso(new Date(2027, 0, 1, 0, 1))).toBe('2027-01-01');
  });

  it('composes sentence and date with the locale joiner', () => {
    expect(composeText('僅供本次申請使用', '2026/11/04', '{text}\n{date}')).toBe('僅供本次申請使用\n2026/11/04');
    expect(composeText('For rental only', 'Nov 4, 2026', '{text} – {date}')).toBe('For rental only – Nov 4, 2026');
    expect(composeText('For rental only', '', '{text} – {date}')).toBe('For rental only');
    expect(composeText('  ', 'Nov 4, 2026', '{text} – {date}')).toBe('Nov 4, 2026');
  });

  it('splits free text into clean lines', () => {
    expect(splitLines('  第一行  \r\n\n第二行\t\t尾巴\n   \n')).toEqual(['第一行', '第二行 尾巴']);
    expect(splitLines('a\nb\nc\nd', 2)).toEqual(['a', 'b']);
    expect(splitLines('本人確認専用　他の目的での使用禁止')).toEqual(['本人確認専用　他の目的での使用禁止']);
    expect(splitLines('x'.repeat(200))[0]).toHaveLength(80);
    expect(splitLines('')).toEqual([]);
  });
});

describe('colors and opacity', () => {
  it('parses short and long hex, with or without #', () => {
    expect(parseHexColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHexColor('1D4ED8')).toEqual({ r: 29, g: 78, b: 216 });
    expect(parseHexColor('#12345')).toBeNull();
    expect(parseHexColor('red')).toBeNull();
    expect(parseHexColor(undefined)).toBeNull();
    expect(normalizeHex(' #ABC ')).toBe('#aabbcc');
  });

  it('builds rgba strings with clamped alpha', () => {
    expect(rgbaString('#dc2626', 0.4)).toBe('rgba(220, 38, 38, 0.4)');
    expect(rgbaString('#000', 2)).toBe('rgba(0, 0, 0, 1)');
    expect(rgbaString('nope', 0.5)).toBe('rgba(0, 0, 0, 0.5)');
  });

  it('picks a contrasting outline', () => {
    expect(outlineColor('#111111')).toBe('#ffffff');
    expect(outlineColor('#dc2626')).toBe('#ffffff');
    expect(outlineColor('#ffffff')).toBe('#111111');
    expect(outlineColor('#ffeb3b')).toBe('#111111');
  });

  it('maps opacity percent to alpha within 5–100%', () => {
    expect(opacityFromPercent(40)).toBe(0.4);
    expect(opacityFromPercent(0)).toBe(0.05);
    expect(opacityFromPercent(150)).toBe(1);
    expect(opacityFromPercent(Number.NaN)).toBe(0.4);
  });

  it('recognizes preset swatches', () => {
    expect(colorIdOf('#DC2626')).toBe('red');
    expect(colorIdOf('#fff')).toBe('white');
    expect(colorIdOf('#123456')).toBeNull();
  });
});

describe('font size', () => {
  it('scales with the short side of the image', () => {
    expect(fontSizePx(1000, 630, 4.5)).toBe(28);
    expect(fontSizePx(4032, 3024, 4.5)).toBe(136);
    expect(fontSizePx(3024, 4032, 4.5)).toBe(136);
    // Same relative size at any resolution.
    expect(fontSizePx(2000, 1260, 4.5) / fontSizePx(1000, 630, 4.5)).toBeCloseTo(2, 1);
  });

  it('clamps silly input', () => {
    expect(fontSizePx(100, 80, 1)).toBe(6);
    expect(fontSizePx(0, 500, 5)).toBe(0);
    expect(fontSizePx(1000, 1000, Number.NaN)).toBe(45);
  });

  it('fits the centered line inside the image', () => {
    expect(centerLineLength(1000, 600, 0)).toBeCloseTo(1000);
    expect(centerLineLength(1000, 600, 90)).toBeCloseTo(600);
    expect(centerLineLength(1000, 600, -30)).toBeCloseTo(1000 / Math.cos(Math.PI / 6));
    expect(centerLineLength(1000, 600, 45)).toBeCloseTo(600 / Math.sin(Math.PI / 4));
    // Text 1000px wide at 100px font on a 1000×600 image, horizontal: width-bound at 86%.
    expect(centerFontSize(1000, 1, 1000, 600, 0)).toBe(86);
    // Short text is capped by the image height instead of growing huge.
    expect(centerFontSize(100, 1, 1000, 600, 0)).toBe(150);
    expect(centerFontSize(100, 3, 1000, 600, 0)).toBe(92);
    expect(centerFontSize(0, 1, 1000, 600, 0)).toBe(0);
  });
});

describe('tile layout', () => {
  /** Every sampled image point must sit in some tile's pitch cell (block + gap). */
  function expectCovered(input: TileInput) {
    const tiles = tileLayout(input);
    expect(tiles.length).toBeGreaterThan(0);
    const pitchX = input.cellW + input.gapX;
    const pitchY = input.cellH + input.gapY;
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const x = (i / steps - 0.5) * input.width;
        const y = (j / steps - 0.5) * input.height;
        const { u, v } = toRotatedFrame(x, y, input.angleDeg);
        const hit = tiles.some((t) => Math.abs(u - t.x) <= pitchX / 2 + 1e-6 && Math.abs(v - t.y) <= pitchY / 2 + 1e-6);
        expect(hit, `(${x}, ${y}) at ${input.angleDeg}°`).toBe(true);
      }
    }
    return tiles;
  }

  const base = { cellW: 300, cellH: 40, gapX: 120, gapY: 60 };

  it.each([0, -30, 30, 45, -60, 90, -90, 17])('covers a landscape card at %s°', (angleDeg) => {
    expectCovered({ ...base, width: 1000, height: 630, angleDeg });
  });

  it.each([-30, 75])('covers a tall portrait photo at %s°', (angleDeg) => {
    expectCovered({ ...base, width: 3024, height: 4032, angleDeg });
  });

  it('covers without stagger and with zero gaps', () => {
    expectCovered({ width: 800, height: 500, angleDeg: -30, cellW: 260, cellH: 30, gapX: 0, gapY: 0, stagger: false });
  });

  it('covers when one block is wider than the whole image', () => {
    expectCovered({ width: 400, height: 250, angleDeg: -30, cellW: 900, cellH: 50, gapX: 100, gapY: 40 });
  });

  it('staggers alternate rows by half a step', () => {
    const tiles = tileLayout({ ...base, width: 1000, height: 630, angleDeg: 0 });
    const row0 = tiles.filter((t) => t.y === 0).map((t) => t.x);
    const row1 = tiles.filter((t) => t.y === 100).map((t) => t.x);
    expect(row0).toContain(0);
    expect(row1).toContain(210);
    expect(row1).not.toContain(0);
  });

  it('skips tiles that cannot reach the image', () => {
    const input = { ...base, width: 1000, height: 630, angleDeg: -30 };
    const reach = Math.hypot(base.cellW + base.gapX, base.cellH + base.gapY) / 2;
    for (const t of tileLayout(input)) {
      const p = fromRotatedFrame(t.x, t.y, input.angleDeg);
      expect(Math.abs(p.x)).toBeLessThanOrEqual(500 + reach + 1e-6);
      expect(Math.abs(p.y)).toBeLessThanOrEqual(315 + reach + 1e-6);
    }
  });

  it('returns nothing for empty input and respects the tile cap', () => {
    expect(tileLayout({ ...base, width: 0, height: 630, angleDeg: 0 })).toEqual([]);
    expect(tileLayout({ ...base, cellW: 0, width: 1000, height: 630, angleDeg: 0 })).toEqual([]);
    expect(tileLayout({ width: 4000, height: 3000, angleDeg: -30, cellW: 10, cellH: 10, gapX: 0, gapY: 0, maxTiles: 100 })).toHaveLength(100);
  });

  it('rotated frame round-trips and has the right extent', () => {
    const { u, v } = toRotatedFrame(120, -45, -30);
    const back = fromRotatedFrame(u, v, -30);
    expect(back.x).toBeCloseTo(120);
    expect(back.y).toBeCloseTo(-45);
    expect(rotatedExtent(1000, 600, 0)).toEqual({ u: 500, v: 300 });
    const e90 = rotatedExtent(1000, 600, 90);
    expect(e90.u).toBeCloseTo(300);
    expect(e90.v).toBeCloseTo(500);
  });
});

describe('mask rectangles', () => {
  const W = 1000;
  const H = 630;

  it('normalizes forward and reversed drags to the same rect', () => {
    const forward = rectFromPoints({ x: 100, y: 50 }, { x: 300, y: 120 }, W, H);
    const reversed = rectFromPoints({ x: 300, y: 120 }, { x: 100, y: 50 }, W, H);
    const diagonal = rectFromPoints({ x: 300, y: 50 }, { x: 100, y: 120 }, W, H);
    expect(forward).toEqual({ x: 100, y: 50, w: 200, h: 70 });
    expect(reversed).toEqual(forward);
    expect(diagonal).toEqual(forward);
  });

  it('snaps fractional points outward to whole pixels', () => {
    expect(rectFromPoints({ x: 10.7, y: 20.2 }, { x: 30.1, y: 40.9 }, W, H)).toEqual({ x: 10, y: 20, w: 21, h: 21 });
  });

  it('clamps drags that leave the image', () => {
    expect(rectFromPoints({ x: -50, y: -20 }, { x: 80, y: 40 }, W, H)).toEqual({ x: 0, y: 0, w: 80, h: 40 });
    expect(rectFromPoints({ x: 900, y: 600 }, { x: 1400, y: 900 }, W, H)).toEqual({ x: 900, y: 600, w: 100, h: 30 });
    expect(rectFromPoints({ x: 1200, y: 10 }, { x: 1300, y: 20 }, W, H)).toEqual({ x: 1000, y: 10, w: 0, h: 10 });
  });

  it('ignores taps and slivers', () => {
    expect(isUsableRect(rectFromPoints({ x: 5, y: 5 }, { x: 6, y: 6 }, W, H), 4)).toBe(false);
    expect(isUsableRect({ x: 0, y: 0, w: 100, h: 3 }, 4)).toBe(false);
    expect(isUsableRect({ x: 0, y: 0, w: 100, h: 30 }, 4)).toBe(true);
  });

  it('maps pointer positions on a scaled preview to image pixels', () => {
    const box = { left: 20, top: 100, width: 500, height: 315 };
    expect(toImagePoint(20, 100, box, W, H)).toEqual({ x: 0, y: 0 });
    expect(toImagePoint(270, 257.5, box, W, H)).toEqual({ x: 500, y: 315 });
    expect(toImagePoint(900, 0, box, W, H)).toEqual({ x: W, y: 0 });
    expect(toImagePoint(5, 5, { left: 0, top: 0, width: 0, height: 0 }, W, H)).toEqual({ x: 0, y: 0 });
  });

  it('scales masks to the export size without leaving gaps', () => {
    expect(scaleRect({ x: 100, y: 50, w: 200, h: 70 }, 0.5)).toEqual({ x: 50, y: 25, w: 100, h: 35 });
    const r = scaleRect({ x: 101, y: 51, w: 33, h: 33 }, 1 / 3);
    expect(r.x).toBe(33);
    expect(r.x + r.w).toBeGreaterThanOrEqual((101 + 33) / 3);
    expect(r.y + r.h).toBeGreaterThanOrEqual((51 + 33) / 3);
  });

  it('sizes mosaic cells relative to the image', () => {
    expect(mosaicBlock(1000, 630)).toBe(23);
    expect(mosaicBlock(4032, 3024)).toBe(108);
    expect(mosaicBlock(60, 60)).toBe(4);
    expect(mosaicGrid({ x: 0, y: 0, w: 100, h: 30 }, 23)).toEqual({ cols: 5, rows: 2 });
    expect(mosaicGrid({ x: 0, y: 0, w: 5, h: 5 }, 23)).toEqual({ cols: 1, rows: 1 });
  });
});

describe('output', () => {
  it('fits the long edge without enlarging', () => {
    expect(fitWithin(4032, 3024, 2400)).toEqual({ width: 2400, height: 1800, scale: 2400 / 4032 });
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600, scale: 1600 / 4032 });
    expect(fitWithin(1000, 630, 2400)).toEqual({ width: 1000, height: 630, scale: 1 });
    expect(fitWithin(4032, 3024, 0)).toEqual({ width: 4032, height: 3024, scale: 1 });
  });

  it('builds output file names', () => {
    expect(outputFilename('IMG_1234.HEIC', 'jpeg')).toBe('IMG_1234-watermark.jpg');
    expect(outputFilename('身分證正面.png', 'png')).toBe('身分證正面-watermark.png');
    expect(outputFilename('scan.final.jpeg', 'jpeg')).toBe('scan.final-watermark.jpg');
    expect(outputFilename('.hidden', 'png')).toBe('.hidden-watermark.png');
    expect(outputFilename('a/b:c*?.jpg', 'jpeg')).toBe('a_b_c_-watermark.jpg');
    expect(outputFilename('', 'jpeg')).toBe('image-watermark.jpg');
  });

  it('deduplicates names for the ZIP', () => {
    expect(uniqueNames(['a.jpg', 'b.jpg', 'a.jpg', 'A.jpg', 'a (2).jpg'])).toEqual([
      'a.jpg',
      'b.jpg',
      'a (2).jpg',
      'A (3).jpg',
      'a (2) (2).jpg',
    ]);
  });

  it('maps quality only for JPG', () => {
    expect(encoderQuality('jpeg', 85)).toBe(0.85);
    expect(encoderQuality('jpeg', 0)).toBe(0.1);
    expect(encoderQuality('jpeg', Number.NaN)).toBe(0.85);
    expect(encoderQuality('png', 85)).toBeUndefined();
  });

  it('accepts images by type or extension', () => {
    expect(isImageFile('image/jpeg', 'x.jpg')).toBe(true);
    expect(isImageFile('', 'IMG_0001.HEIC')).toBe(true);
    expect(isImageFile('application/pdf', 'scan.pdf')).toBe(false);
    expect(isImageFile('', 'notes.txt')).toBe(false);
  });
});

describe('normalizeSettings', () => {
  it('returns defaults for junk', () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings('nope')).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid values and clamps or replaces the rest', () => {
    const s = normalizeSettings({
      layout: 'both',
      color: '#1D4ED8',
      size: 50,
      angle: '-45',
      spacing: -1,
      opacity: 'abc',
      outline: true,
      template: 'custom',
      org: ' 幸福銀行\n',
      purpose: 3,
      dateOn: 'yes',
      custom: '第一行\n第二行',
      format: 'webp',
      quality: 92.4,
      maxSide: '1600',
    });
    expect(s).toEqual({
      ...DEFAULT_SETTINGS,
      layout: 'both',
      color: '#1d4ed8',
      size: 12,
      angle: -45,
      spacing: 0.5,
      outline: true,
      template: 'custom',
      org: '幸福銀行',
      custom: '第一行\n第二行',
      quality: 92,
      maxSide: 1600,
    });
  });

  it('rejects unknown enum values', () => {
    const s = normalizeSettings({ layout: 'spiral', template: 'nope', maxSide: 999, color: 'red' });
    expect(s.layout).toBe(DEFAULT_SETTINGS.layout);
    expect(s.template).toBe(DEFAULT_SETTINGS.template);
    expect(s.maxSide).toBe(DEFAULT_SETTINGS.maxSide);
    expect(s.color).toBe(DEFAULT_SETTINGS.color);
  });
});

describe('AVIF and PNG compression settings', () => {
  it('accepts AVIF and derives its filename', () => {
    expect(outputFilename('sample.png', 'avif')).toBe('sample-watermark.avif');
    expect(normalizeSettings({ format: 'avif' }).format).toBe('avif');
  });
  it('persists the PNG compression level within supported bounds', () => {
    expect(normalizeSettings(null).pngLevel).toBe(3);
    expect(normalizeSettings({ pngLevel: 10 }).pngLevel).toBe(6);
    expect(normalizeSettings({ pngLevel: 0 }).pngLevel).toBe(1);
  });
});
