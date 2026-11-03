// Browser-only helpers for the ASCII art tool: decoding, canvas sampling, glyph measuring,
// the built-in sample picture and rendering (preview DOM and PNG). Pure maths lives in logic.ts.
import { prepareImage } from '../../lib/heic';
import { BRAILLE_DOT_BITS, colorRuns, inkCoverage, isBlank, type Art, type Geometry, type OutputMode } from './logic';

/** A decoded picture, kept as a working canvas no larger than WORK_MAX on its long side. */
export interface Source {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  name: string;
}

const WORK_MAX = 1600;

function canvas(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(width));
  c.height = Math.max(1, Math.round(height));
  return c;
}

function ctx2d(c: HTMLCanvasElement, read = false): CanvasRenderingContext2D {
  const ctx = c.getContext('2d', read ? { willReadFrequently: true } : undefined);
  if (!ctx) throw new Error('canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  return ctx;
}

/** Draws `src` at (w, h), halving in steps first so large reductions average every pixel. */
function downscale(src: CanvasImageSource, sw: number, sh: number, w: number, h: number, read = false): HTMLCanvasElement {
  let cur: CanvasImageSource = src;
  let cw = sw;
  let ch = sh;
  while (cw / 2 >= w && ch / 2 >= h && cw > 2 && ch > 2) {
    const next = canvas(Math.ceil(cw / 2), Math.ceil(ch / 2));
    ctx2d(next).drawImage(cur, 0, 0, cw, ch, 0, 0, next.width, next.height);
    cur = next;
    cw = next.width;
    ch = next.height;
  }
  const out = canvas(w, h);
  ctx2d(out, read).drawImage(cur, 0, 0, cw, ch, 0, 0, out.width, out.height);
  return out;
}

export async function loadFile(file: File): Promise<Source> {
  const src = await prepareImage(file);
  let image: CanvasImageSource;
  let width: number;
  let height: number;
  let close = () => {};
  try {
    const bmp = await createImageBitmap(src, { imageOrientation: 'from-image' });
    image = bmp;
    width = bmp.width;
    height = bmp.height;
    close = () => bmp.close();
  } catch {
    const url = URL.createObjectURL(src);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      image = img;
      width = img.naturalWidth;
      height = img.naturalHeight;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  try {
    if (!width || !height) throw new Error('empty');
    const scale = Math.min(1, WORK_MAX / Math.max(width, height));
    const work = downscale(image, width, height, width * scale, height * scale);
    return { canvas: work, width, height, name: file.name };
  } finally {
    close();
  }
}

/** RGBA pixels of the picture at exactly w × h. */
export function samplePixels(source: Source, w: number, h: number): Uint8ClampedArray {
  const c = downscale(source.canvas, source.canvas.width, source.canvas.height, w, h, true);
  return ctx2d(c, true).getImageData(0, 0, w, h).data;
}

/** The built-in sample: shaded spheres on a warm floor, drawn procedurally (no image file). */
export function sampleSource(name: string): Source {
  const W = 960;
  const H = 720;
  const c = canvas(W, H);
  const ctx = ctx2d(c);

  const wall = ctx.createLinearGradient(0, 0, 0, H * 0.68);
  wall.addColorStop(0, '#ffffff');
  wall.addColorStop(1, '#fbf7f1');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);
  const floor = ctx.createLinearGradient(0, H * 0.68, 0, H);
  floor.addColorStop(0, '#eadbc6');
  floor.addColorStop(1, '#fbf6ef');
  ctx.fillStyle = floor;
  ctx.fillRect(0, H * 0.68, W, H * 0.32);

  const shadow = (x: number, y: number, rx: number, ry: number, alpha: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(70, 38, 16, ${alpha})`);
    g.addColorStop(1, 'rgba(70, 38, 16, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  const sphere = (x: number, y: number, r: number, stops: [number, string][]) => {
    const g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.04, x, y, r);
    for (const [at, color] of stops) g.addColorStop(at, color);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  shadow(430, 600, 270, 46, 0.55);
  shadow(770, 612, 120, 24, 0.5);
  shadow(150, 618, 80, 16, 0.45);
  sphere(400, 360, 230, [
    [0, '#fff7ec'],
    [0.16, '#ffb38c'],
    [0.5, '#f0522e'],
    [0.85, '#8e2a12'],
    [1, '#4f1608'],
  ]);
  sphere(770, 520, 96, [
    [0, '#f2f7ff'],
    [0.2, '#8db8ff'],
    [0.6, '#2f68d8'],
    [1, '#122a66'],
  ]);
  sphere(150, 566, 56, [
    [0, '#f4fff6'],
    [0.25, '#7fdcaa'],
    [0.65, '#12936a'],
    [1, '#073d2b'],
  ]);
  return { canvas: c, width: W, height: H, name };
}

/** Ink coverage of each glyph in `font`, drawn centred on a transparent square. */
export function measureCoverage(chars: string[], font: string): number[] | undefined {
  try {
    const size = 64;
    const c = canvas(size, size);
    const ctx = ctx2d(c, true);
    ctx.font = `40px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000';
    return chars.map((ch) => {
      ctx.clearRect(0, 0, size, size);
      ctx.fillText(ch, size / 2, size / 2);
      return inkCoverage(ctx.getImageData(0, 0, size, size).data);
    });
  } catch {
    return undefined;
  }
}

/** Ink height of the full block █ in `font`, in em, or undefined when it cannot be measured. */
export function blockGlyphEm(font: string): number | undefined {
  try {
    const ctx = ctx2d(canvas(8, 8));
    ctx.font = `100px ${font}`;
    const m = ctx.measureText('█');
    const em = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 100;
    return em > 0.6 && em < 1.6 ? em : undefined;
  } catch {
    return undefined;
  }
}

/** A character representative of the set's cell width. */
function probeChar(geo: Geometry): string {
  if (geo.wide) return '田';
  return geo.dotsX > 1 ? '⣿' : 'M';
}

/* ---------- Preview ---------- */

/** Writes the art into the <pre>: plain text, or coloured spans built with DOM APIs. */
export function fillPreview(pre: HTMLElement, art: Art, mode: OutputMode): void {
  if (mode === 'plain') {
    pre.textContent = art.lines.join('\n');
    return;
  }
  const frag = document.createDocumentFragment();
  art.lines.forEach((line, y) => {
    if (y > 0) frag.append('\n');
    for (const run of colorRuns(line, art.colors, y * art.cols)) {
      if (!run.color) {
        frag.append(run.text);
        continue;
      }
      const span = document.createElement('span');
      span.style.color = run.color;
      span.textContent = run.text;
      frag.append(span);
    }
  });
  pre.replaceChildren(frag);
}

export interface Fit {
  /** Advance of one character of the font, in em (measured, without the block overlap). */
  advanceEm: number;
}

/** Horizontal overlap of block glyphs in the preview, em. */
const BLOCK_OVERLAP = 0.08;

/**
 * Gives the <pre> cells the geometry's proportions, then scales it to fit the stage width
 * (and at most `maxHeight`), centred. With `blockEm` (block characters), glyphs are packed
 * slightly tighter than their ink in both directions and the line is stretched back
 * vertically, so solid areas show no seams while the cells keep their proportions.
 */
export function fitPreview(stage: HTMLElement, pre: HTMLElement, art: Art, maxHeight: number, blockEm?: number): Fit {
  const fontSize = parseFloat(getComputedStyle(pre).fontSize) || 12;
  pre.style.letterSpacing = blockEm ? `${-BLOCK_OVERLAP}em` : '';
  const naturalW = pre.offsetWidth;
  const advance = naturalW / Math.max(1, art.cols);
  const cellH = advance * art.geometry.cellRatio;
  const lineHeight = blockEm ? blockEm * fontSize * 0.9 : cellH;
  const stretch = cellH / lineHeight;
  pre.style.lineHeight = `${lineHeight}px`;
  const naturalH = cellH * art.rows;
  const styles = getComputedStyle(stage);
  const padX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const padY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
  const availW = Math.max(1, stage.clientWidth - padX);
  const scale = Math.min(availW / Math.max(1, naturalW), Math.max(80, maxHeight - padY) / Math.max(1, naturalH));
  pre.style.transform = `translateX(${Math.max(0, (availW - naturalW * scale) / 2)}px) scale(${scale}, ${scale * stretch})`;
  stage.style.height = `${Math.ceil(naturalH * scale + padY)}px`;
  return { advanceEm: advance / fontSize + (blockEm ? BLOCK_OVERLAP : 0) };
}

/* ---------- PNG ---------- */

export interface PaintOptions {
  font: string;
  mode: OutputMode;
  background: string;
  color: string;
}

const PNG_WIDTH = 2400;
const PNG_HEIGHT = 4800;
/** Block characters are painted as shaded cells, so rows join without seams. */
const SHADES: Record<string, number> = { '░': 0.25, '▒': 0.5, '▓': 0.75, '█': 1 };

/** Draws the art cell by cell, so columns line up whatever the glyph widths. */
export function paintArt(art: Art, o: PaintOptions): HTMLCanvasElement {
  const probe = canvas(8, 8);
  const pctx = ctx2d(probe);
  pctx.font = `100px ${o.font}`;
  const advEm = Math.max(0.3, pctx.measureText(probeChar(art.geometry)).width / 100);
  const ratio = art.geometry.cellRatio;
  const fontSize = Math.max(
    6,
    Math.min(48, PNG_WIDTH / (art.cols * advEm), PNG_HEIGHT / (art.rows * advEm * ratio)),
  );
  const cellW = advEm * fontSize;
  const cellH = cellW * ratio;
  const pad = Math.round(cellW * 2);
  const c = canvas(art.cols * cellW + pad * 2, art.rows * cellH + pad * 2);
  const ctx = ctx2d(c);
  ctx.fillStyle = o.background;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.font = `${fontSize}px ${o.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = o.color;
  const braille = art.geometry.dotsX > 1;
  // Braille is drawn as round dots: fallback braille fonts often draw them small and faint.
  const dotW = cellW / 2;
  const dotH = cellH / 4;
  const radius = Math.min(dotW, dotH) * 0.34;
  let current = o.color;
  ctx.beginPath();
  art.lines.forEach((line, y) => {
    const top = pad + y * cellH;
    let x = 0;
    for (const ch of line) {
      if (!isBlank(ch)) {
        if (o.mode === 'color') {
          const i = (y * art.cols + x) * 3;
          const fill = `rgb(${art.colors[i]} ${art.colors[i + 1]} ${art.colors[i + 2]})`;
          if (fill !== current) {
            if (braille) ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = current = fill;
          }
        }
        const left = pad + x * cellW;
        if (braille) {
          const code = ch.charCodeAt(0) - 0x2800;
          for (let r = 0; r < 4; r++) {
            for (let col = 0; col < 2; col++) {
              if (!(code & BRAILLE_DOT_BITS[r][col])) continue;
              const cx = left + (col + 0.5) * dotW;
              const cy = top + (r + 0.5) * dotH;
              ctx.moveTo(cx + radius, cy);
              ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            }
          }
        } else if (SHADES[ch]) {
          const x0 = Math.round(left);
          const y0 = Math.round(top);
          ctx.globalAlpha = SHADES[ch];
          ctx.fillRect(x0, y0, Math.round(left + cellW) - x0, Math.round(top + cellH) - y0);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillText(ch, left + cellW / 2, top + cellH / 2);
        }
      }
      x++;
    }
  });
  if (braille) ctx.fill();
  return c;
}

export function canvasBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/png'));
}
