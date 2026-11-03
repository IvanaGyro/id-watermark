// Browser-only: paints a scratch-off layer on a canvas and lets mouse, pen or finger rub it away.
// The math (how much is scratched, when to reveal) lives in logic.ts.
import { scratchedRatio, shouldReveal, type CoverId } from './logic';

interface CoverLook {
  /** Diagonal gradient stops. */
  stops: string[];
  /** Colour of the "scratch here" label and its sparkles. */
  ink: string;
  /** Small shapes scattered over the layer. */
  pattern?: { shape: 'heart' | 'star'; colors: string[] };
}

const LOOKS: Record<CoverId, CoverLook> = {
  silver: { stops: ['#b9bdc6', '#eceef2', '#a9aeb8', '#dfe2e7', '#9da2ad'], ink: '#5d626e' },
  gold: { stops: ['#c9952c', '#f6d988', '#b98323', '#efca6b', '#a9741b'], ink: '#6e4a0c' },
  rose: { stops: ['#e98aa6', '#ffc9d7', '#e07899', '#f9b4c7', '#d9668a'], ink: '#7d2443' },
  mint: { stops: ['#6fc4a0', '#c2eedb', '#5db892', '#a9e4cb', '#4fa983'], ink: '#174d38' },
  hearts: {
    stops: ['#f07fa0', '#f9a9bf', '#ea6f93', '#f6a0b8', '#e4628a'],
    ink: '#ffffff',
    pattern: { shape: 'heart', colors: ['rgb(255 255 255 / 0.32)', 'rgb(255 255 255 / 0.18)', 'rgb(176 30 78 / 0.18)'] },
  },
  stars: {
    stops: ['#262b57', '#3a4080', '#232850', '#353b75', '#1e2246'],
    ink: '#f7d27a',
    pattern: { shape: 'star', colors: ['rgb(247 210 122 / 0.75)', 'rgb(255 255 255 / 0.55)', 'rgb(247 210 122 / 0.35)'] },
  },
};

export interface ScratchOptions {
  canvas: HTMLCanvasElement;
  /** Text drawn in the middle of the layer, e.g. 「刮開這裡」. */
  label: string;
  /** Called once when the layer reaches the threshold (or revealAll() runs). */
  onReveal: () => void;
}

/** Small, fast copy of the layer used to measure how much has been scratched. */
const SAMPLE_W = 80;
const SAMPLE_H = 60;
const SAMPLE_EVERY_MS = 120;

export class ScratchLayer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D | null;
  private readonly sample = document.createElement('canvas');
  private readonly sampleCtx: CanvasRenderingContext2D | null;
  private readonly opts: ScratchOptions;
  private cover: CoverId = 'silver';
  private threshold = 50;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private painted = false;
  private started = false;
  private revealed = false;
  private sampleTimer = 0;
  private readonly strokes = new Map<number, { x: number; y: number }>();

  constructor(opts: ScratchOptions) {
    this.opts = opts;
    this.canvas = opts.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.sample.width = SAMPLE_W;
    this.sample.height = SAMPLE_H;
    this.sampleCtx = this.sample.getContext('2d', { willReadFrequently: true });

    const c = this.canvas;
    c.addEventListener('pointerdown', this.onDown);
    c.addEventListener('pointermove', this.onMove);
    c.addEventListener('pointerup', this.onUp);
    c.addEventListener('pointercancel', this.onUp);
    c.addEventListener('lostpointercapture', this.onUp);
    c.addEventListener('contextmenu', (e) => e.preventDefault());
    new ResizeObserver(() => this.resize()).observe(c);
  }

  get isRevealed(): boolean {
    return this.revealed;
  }

  /** Paints a fresh layer (any scratching is undone). */
  reset(cover: CoverId = this.cover, threshold: number = this.threshold): void {
    this.cover = cover;
    this.threshold = threshold;
    this.revealed = false;
    this.started = false;
    this.strokes.clear();
    window.clearTimeout(this.sampleTimer);
    this.sampleTimer = 0;
    this.canvas.classList.remove('is-gone');
    this.painted = false;
    delete this.canvas.dataset.painted;
    this.resize(true);
  }

  setThreshold(threshold: number): void {
    this.threshold = threshold;
  }

  revealAll(): void {
    if (this.revealed) return;
    this.finish();
  }

  /* ---------- Painting ---------- */

  private resize(force = false): void {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w === 0 || h === 0) return; // hidden; paint when it shows up
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!force && this.painted && w === this.width && h === this.height && dpr === this.dpr) return;

    // Keep what was scratched when the card changes size (rotating a phone): scale the old layer.
    let previous: HTMLCanvasElement | null = null;
    if (this.painted && !force && this.started && this.canvas.width > 0) {
      previous = document.createElement('canvas');
      previous.width = this.canvas.width;
      previous.height = this.canvas.height;
      previous.getContext('2d')?.drawImage(this.canvas, 0, 0);
    }
    this.width = w;
    this.height = h;
    this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (previous) {
      ctx.drawImage(previous, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.paint(ctx);
    }
    this.painted = true;
    // CSS keeps the hidden face invisible until this is set.
    this.canvas.dataset.painted = '';
  }

  private paint(ctx: CanvasRenderingContext2D): void {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const look = LOOKS[this.cover];
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, W, H);
    look.stops.forEach((color, i) => grad.addColorStop(i / (look.stops.length - 1), color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Soft diagonal sheen bands, like foil catching the light.
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#ffffff';
    for (const [offset, band] of [
      [0.18, 0.08],
      [0.46, 0.04],
      [0.7, 0.1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(W * offset, 0);
      ctx.lineTo(W * (offset + band), 0);
      ctx.lineTo(W * (offset + band) - H * 0.6, H);
      ctx.lineTo(W * offset - H * 0.6, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    if (look.pattern) this.paintPattern(ctx, look.pattern, W, H);

    // Fine grain so the layer reads as a printed coating rather than flat colour.
    const noise = this.noisePattern(ctx);
    if (noise) {
      ctx.save();
      ctx.fillStyle = noise;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // Inner frame.
    const inset = Math.min(W, H) * 0.05;
    ctx.save();
    ctx.strokeStyle = look.ink;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = Math.max(1, this.dpr * 1.25);
    ctx.setLineDash([this.dpr * 6, this.dpr * 5]);
    roundRect(ctx, inset, inset, W - inset * 2, H - inset * 2, inset * 0.8);
    ctx.stroke();
    ctx.restore();

    // Label with a sparkle on each side.
    const font = getComputedStyle(this.canvas).fontFamily || 'sans-serif';
    const size = Math.max(14 * this.dpr, Math.min(W * 0.075, H * 0.11));
    ctx.save();
    ctx.font = `800 ${size}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = look.ink;
    ctx.globalAlpha = 0.9;
    const textW = Math.min(ctx.measureText(this.opts.label).width, W * 0.7);
    ctx.fillText(this.opts.label, W / 2, H / 2, W * 0.7);
    for (const side of [-1, 1]) sparkle(ctx, W / 2 + side * (textW / 2 + size * 0.9), H / 2, size * 0.42);
    ctx.restore();
  }

  private paintPattern(ctx: CanvasRenderingContext2D, pattern: NonNullable<CoverLook['pattern']>, W: number, H: number): void {
    const cell = Math.max(W, H) / 9;
    // Fixed jitter table so the pattern looks hand-placed but is identical on every repaint.
    const jitter = [0.12, -0.2, 0.31, -0.06, 0.24, -0.28, 0.05, 0.18, -0.14, 0.27, -0.22, 0.09];
    let k = 0;
    ctx.save();
    for (let row = 0; row * cell < H + cell; row++) {
      for (let col = 0; col * cell < W + cell; col++) {
        const j = jitter[k++ % jitter.length];
        const x = (col + (row % 2 ? 0.5 : 0) + j) * cell;
        const y = (row + 0.5 - j * 0.7) * cell;
        const r = cell * (0.22 + Math.abs(j) * 0.35);
        ctx.fillStyle = pattern.colors[k % pattern.colors.length];
        if (pattern.shape === 'heart') heart(ctx, x, y, r, j * 0.9);
        else sparkle(ctx, x, y, r * 0.8);
      }
    }
    ctx.restore();
  }

  private noisePattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 96;
    const tctx = tile.getContext('2d');
    if (!tctx) return null;
    const img = tctx.createImageData(96, 96);
    for (let i = 0; i < img.data.length; i += 4) {
      const light = Math.random() < 0.5;
      const v = light ? 255 : 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = Math.random() < 0.55 ? Math.round(Math.random() * (light ? 34 : 22)) : 0;
    }
    tctx.putImageData(img, 0, 0);
    return ctx.createPattern(tile, 'repeat');
  }

  /* ---------- Scratching ---------- */

  private point(e: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (this.canvas.width / rect.width), y: (e.clientY - rect.top) * (this.canvas.height / rect.height) };
  }

  private brush(): number {
    // Radius in canvas pixels: about a fingertip on a phone, a bit wider on a large card.
    return Math.max(14, Math.min(this.width * 0.065, 30)) * this.dpr;
  }

  private onDown = (e: PointerEvent): void => {
    if (this.revealed || !this.ctx) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    this.canvas.setPointerCapture?.(e.pointerId);
    const p = this.point(e);
    this.strokes.set(e.pointerId, p);
    this.started = true;
    this.scratch(p, p);
  };

  private onMove = (e: PointerEvent): void => {
    const last = this.strokes.get(e.pointerId);
    if (!last || this.revealed) return;
    e.preventDefault();
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    let from = last;
    for (const ev of events.length ? events : [e]) {
      const p = this.point(ev);
      this.scratch(from, p);
      from = p;
    }
    this.strokes.set(e.pointerId, from);
    this.scheduleSample();
  };

  private onUp = (e: PointerEvent): void => {
    if (!this.strokes.delete(e.pointerId)) return;
    this.measure();
  };

  private scratch(from: { x: number; y: number }, to: { x: number; y: number }): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const r = this.brush();
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = r * 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    // A few loose flecks along the edge, so the scratch looks rubbed off rather than drawn.
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = r * (0.85 + Math.random() * 0.35);
      ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      ctx.beginPath();
      ctx.arc(to.x + Math.cos(a) * d, to.y + Math.sin(a) * d, r * (0.08 + Math.random() * 0.14), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private scheduleSample(): void {
    if (this.sampleTimer) return;
    this.sampleTimer = window.setTimeout(() => {
      this.sampleTimer = 0;
      this.measure();
    }, SAMPLE_EVERY_MS);
  }

  /** Downscales the layer to 80 × 60 and counts transparent pixels: cheap enough to run while scratching. */
  private measure(): void {
    if (this.revealed || !this.sampleCtx || this.canvas.width === 0) return;
    const s = this.sampleCtx;
    s.clearRect(0, 0, SAMPLE_W, SAMPLE_H);
    s.drawImage(this.canvas, 0, 0, SAMPLE_W, SAMPLE_H);
    const ratio = scratchedRatio(s.getImageData(0, 0, SAMPLE_W, SAMPLE_H).data);
    if (shouldReveal(ratio, this.threshold)) this.finish();
  }

  private finish(): void {
    this.revealed = true;
    this.strokes.clear();
    window.clearTimeout(this.sampleTimer);
    this.sampleTimer = 0;
    this.canvas.classList.add('is-gone');
    this.opts.onReveal();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.rect(x, y, w, h);
}

/** Four-pointed sparkle. */
function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  const k = r * 0.28;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + k, y - k, x + r, y);
  ctx.quadraticCurveTo(x + k, y + k, x, y + r);
  ctx.quadraticCurveTo(x - k, y + k, x - r, y);
  ctx.quadraticCurveTo(x - k, y - k, x, y - r);
  ctx.fill();
}

function heart(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, tilt: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt * 0.6);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.95);
  ctx.bezierCurveTo(-r * 1.25, r * 0.05, -r * 0.75, -r * 1.05, 0, -r * 0.35);
  ctx.bezierCurveTo(r * 0.75, -r * 1.05, r * 1.25, r * 0.05, 0, r * 0.95);
  ctx.fill();
  ctx.restore();
}
