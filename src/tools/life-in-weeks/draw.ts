// Canvas drawing for the life grid and the downloadable poster. Browser-only (CanvasRenderingContext2D),
// but no DOM lookups: the page passes in everything to draw.
import { colX, gridLayout, rowY, stageOf, WEEKS_PER_ROW, type GridLayout, type Stage } from './logic';

export interface GridModel {
  rows: number;
  lifespan: number;
  /** Index of this week's cell (row × 52 + col); cells before it are lived. -1 draws nothing as lived. */
  cell: number;
  /** Stage bounds when stages are shown. */
  stages: [number, number, number] | null;
  /** Cell to outline (hover), or -1. */
  hover?: number;
}

interface Pair {
  lived: string;
  ahead: string;
}

/** Stage hues validated as an adjacent categorical set (CVD-safe in this order); "ahead" is a light tint. */
export const COLORS = {
  ink: '#18191c',
  text2: '#4a4d55',
  muted: '#80838c',
  border: '#e6e7ea',
  accent: '#f0522e',
  plain: { lived: '#2c303b', ahead: '#e3e5ea' } as Pair,
  bonus: { lived: '#12936a', ahead: '#c4e6da' } as Pair,
  stages: {
    child: { lived: '#eda100', ahead: '#fae7bf' },
    school: { lived: '#2a78d6', ahead: '#cadef5' },
    work: { lived: '#1baf7a', ahead: '#c6ebdd' },
    retired: { lived: '#6250d6', ahead: '#d8d3f5' },
  } as Record<Stage, Pair>,
};

/** Color of a swatch in the legend. */
export function swatchColor(key: string): string {
  if (key === 'lived') return COLORS.plain.lived;
  if (key === 'ahead') return COLORS.plain.ahead;
  if (key === 'current') return COLORS.accent;
  if (key === 'bonus') return COLORS.bonus.lived;
  return (COLORS.stages as Record<string, Pair>)[key]?.lived ?? COLORS.plain.lived;
}

function pairFor(row: number, m: GridModel): Pair {
  if (row >= m.lifespan) return COLORS.bonus;
  return m.stages ? COLORS.stages[stageOf(row, m.stages)] : COLORS.plain;
}

function addCell(path: Path2D, x: number, y: number, size: number, radius: number) {
  if (radius > 0 && path.roundRect) path.roundRect(x, y, size, size, radius);
  else path.rect(x, y, size, size);
}

export interface GridStyle {
  font: string;
  /** Label font size in the canvas' own pixels. */
  labelSize: number;
  /** Ring width around this week, in canvas pixels. */
  ring: number;
  weekLabels?: boolean;
}

/** Draws the grid at the layout's origin (translate the context to place it). */
export function drawGrid(ctx: CanvasRenderingContext2D, l: GridLayout, m: GridModel, style: GridStyle): void {
  const radius = l.cell >= 6 ? Math.round(l.cell * 0.22) : 0;
  const paths = new Map<string, Path2D>();
  const path = (color: string) => {
    let p = paths.get(color);
    if (!p) paths.set(color, (p = new Path2D()));
    return p;
  };

  for (let row = 0; row < l.rows; row++) {
    const pair = pairFor(row, m);
    const y = rowY(l, row);
    for (let col = 0; col < WEEKS_PER_ROW; col++) {
      const i = row * WEEKS_PER_ROW + col;
      const color = i === m.cell ? COLORS.accent : i < m.cell ? pair.lived : pair.ahead;
      addCell(path(color), colX(l, col), y, l.cell, radius);
    }
  }
  for (const [color, p] of paths) {
    ctx.fillStyle = color;
    ctx.fill(p);
  }

  const ringAround = (i: number, color: string, width: number) => {
    if (i < 0 || i >= l.rows * WEEKS_PER_ROW) return;
    const row = Math.floor(i / WEEKS_PER_ROW);
    const col = i % WEEKS_PER_ROW;
    const pad = Math.max(width, l.gap * 0.5) + width / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    const size = l.cell + pad * 2;
    if (ctx.roundRect) ctx.roundRect(colX(l, col) - pad, rowY(l, row) - pad, size, size, radius + pad);
    else ctx.rect(colX(l, col) - pad, rowY(l, row) - pad, size, size);
    ctx.stroke();
  };
  ringAround(m.cell, COLORS.accent, style.ring);
  if (m.hover !== undefined && m.hover !== m.cell) ringAround(m.hover, COLORS.ink, Math.max(1, style.ring * 0.75));

  // Age labels every 10 years, week labels on top.
  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 ${style.labelSize}px ${style.font}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  for (let row = 0; row < l.rows; row += 10) {
    ctx.fillText(String(row), l.gutter - Math.max(4, l.gap * 2), rowY(l, row) + l.cell / 2);
  }
  if (style.weekLabels !== false) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const y = l.top - Math.max(4, l.gap * 1.5);
    for (const week of [1, 10, 20, 30, 40]) ctx.fillText(String(week), colX(l, week - 1) + l.cell / 2, y);
    ctx.textAlign = 'right'; // the last label ends flush with the grid instead of overflowing it
    ctx.fillText(String(WEEKS_PER_ROW), colX(l, WEEKS_PER_ROW - 1) + l.cell, y);
  }
}

/* ---------- Poster ---------- */

export interface PosterText {
  title: string;
  subtitle: string;
  /** Percent text, e.g. 「45.42%」. */
  percent: string;
  percentLabel: string;
  lived: string;
  ahead: string;
  /** Extra line under the bar (birthday, bonus time), optional. */
  note?: string;
  legend: { label: string; color: string }[];
  /** Heading over the counts, e.g. 「活到 80 歲的話，你還有」. */
  countsTitle?: string;
  counts: { value: string; label: string }[];
  brand: string;
  url: string;
}

/** Vertical positions of the poster parts (baselines unless noted), in poster pixels. */
function posterLayout(text: PosterText, gridHeight: number, pad: number) {
  const title = pad + 46;
  const subtitle = title + 48;
  const percent = subtitle + 132;
  const bar = percent + 34; // top of the bar
  const lived = bar + 18 + 38;
  const note = text.note ? lived + 40 : lived;
  const grid = note + 24; // top of the grid
  const legend = grid + gridHeight + 56; // middle of the legend row
  let y = legend + 34;
  const counts = text.counts.length ? { divider: y + 30, title: y + 74, values: y + 136, labels: y + 170 } : null;
  if (counts) y = counts.labels;
  const footer = y + 72;
  return { title, subtitle, percent, bar, lived, note, grid, legend, counts, footer, height: Math.ceil(footer + pad * 0.7) };
}

/** A tall poster: title, percent, progress bar, the grid, legend, counts and the site address. */
export function drawPoster(m: GridModel, progress: number, text: PosterText, font: string, scale = 2): HTMLCanvasElement {
  const W = 1200;
  const pad = 84;
  const inner = W - pad * 2;
  const grid = gridLayout(inner, m.rows, { gutter: 46, top: 30 });
  const at = posterLayout(text, grid.height, pad);

  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = at.height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, at.height);
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(0, 0, W, 12);

  const write = (str: string, x: number, y: number, weight: number, size: number, color: string, align: CanvasTextAlign = 'left') => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    return ctx.measureText(str).width;
  };
  const pill = (x: number, y: number, w: number, h: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
    ctx.fill();
  };

  ctx.textBaseline = 'alphabetic';
  write(text.title, pad, at.title, 800, 54, COLORS.ink);
  write(text.subtitle, pad, at.subtitle, 500, 26, COLORS.muted);
  const pctWidth = write(text.percent, pad - 4, at.percent, 800, 112, COLORS.ink);
  write(text.percentLabel, pad + pctWidth + 18, at.percent - 8, 600, 30, COLORS.text2);

  const barH = 18;
  pill(pad, at.bar, inner, barH, barH / 2, '#fbe1d9');
  pill(pad, at.bar, Math.max(barH, inner * Math.min(1, Math.max(0, progress))), barH, barH / 2, COLORS.accent);
  write(text.lived, pad, at.lived, 600, 26, COLORS.text2);
  write(text.ahead, pad + inner, at.lived, 600, 26, COLORS.text2, 'right');
  if (text.note) write(text.note, pad, at.note, 600, 26, COLORS.bonus.lived);

  ctx.save();
  ctx.translate(pad + Math.floor((inner - grid.width) / 2), at.grid);
  drawGrid(ctx, grid, { ...m, hover: -1 }, { font, labelSize: 16, ring: 2.5 });
  ctx.restore();

  ctx.textBaseline = 'middle';
  let x = pad;
  for (const item of text.legend) {
    pill(x, at.legend - 10, 20, 20, 4, item.color);
    x += 30 + write(item.label, x + 30, at.legend + 1, 500, 22, COLORS.text2) + 34;
  }
  ctx.textBaseline = 'alphabetic';

  if (at.counts) {
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad, at.counts.divider);
    ctx.lineTo(pad + inner, at.counts.divider);
    ctx.stroke();
    if (text.countsTitle) write(text.countsTitle, pad, at.counts.title, 600, 24, COLORS.text2);
    const colW = inner / text.counts.length;
    text.counts.forEach((c, i) => {
      const cx = pad + colW * i;
      write(c.value, cx, at.counts!.values, 800, 44, COLORS.ink);
      write(c.label, cx, at.counts!.labels, 500, 21, COLORS.muted);
    });
  }

  write(text.brand, pad, at.footer, 800, 24, COLORS.ink);
  write(text.url, pad + inner, at.footer, 500, 22, COLORS.muted, 'right');
  return canvas;
}
