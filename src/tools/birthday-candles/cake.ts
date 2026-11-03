// Browser-only: draws the cake as SVG with DOM APIs (never innerHTML) and drives the flames,
// smoke and embers. Geometry comes from logic.ts, colours from themes.ts.
import { CAKE, layoutCandles, type CandlePlan, type CandleSpot, type Point, type ThemeId } from './logic';
import { PALETTES } from './themes';

const NS = 'http://www.w3.org/2000/svg';
type Attrs = Record<string, string | number>;

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, children: SVGElement[] = []): SVGElementTagNameMap[K] {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  node.append(...children);
  return node;
}

function gradient(
  kind: 'linearGradient' | 'radialGradient',
  id: string,
  attrs: Attrs,
  stops: [offset: number, color: string, opacity?: number][],
): SVGElement {
  return el(
    kind,
    { id, ...attrs },
    stops.map(([offset, color, opacity = 1]) => el('stop', { offset, 'stop-color': color, 'stop-opacity': opacity })),
  );
}

export interface Flame {
  index: number;
  spot: CandleSpot;
  /** Positioned at the wick tip; fades out when the flame is blown out. */
  root: SVGGElement;
  /** Its transform attribute is set every frame while someone blows. */
  bend: SVGGElement;
  lit: boolean;
  /** Which way the flame leans when blown: away from the middle of the cake. */
  side: number;
  phase: number;
}

export interface CakeView {
  svg: SVGSVGElement;
  spots: CandleSpot[];
  /** By flame index. */
  flames: Flame[];
  smoke: SVGGElement;
  leaning: boolean;
}

// Teardrop with its base at (0, 0) and the tip 30 units up.
const FLAME_PATH = 'M0,-30 C3,-22 9,-14 9,-7 C9,-1 5,3 0,3 C-5,3 -9,-1 -9,-7 C-9,-14 -3,-22 0,-30 Z';
// Positions (0–1 across the front edge) and lengths of the frosting drips.
const DRIPS: [number, number][] = [
  [0.06, 8], [0.17, 20], [0.28, 12], [0.4, 25], [0.52, 14], [0.63, 22], [0.75, 11], [0.86, 18], [0.95, 8],
];

let uidCounter = 0;

/** Replace the SVG's content with a cake for this plan and theme. */
export function drawCake(svg: SVGSVGElement, plan: CandlePlan, theme: ThemeId): CakeView {
  const p = PALETTES[theme];
  const C = CAKE;
  const uid = `bc${++uidCounter}`;
  const url = (name: string) => `url(#${uid}-${name})`;
  const spots = layoutCandles(plan);
  const isDigits = plan.kind === 'digits';

  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 ${C.viewTop} ${C.width} ${C.viewBottom - C.viewTop}`);

  svg.append(
    el('defs', {}, [
      gradient('linearGradient', `${uid}-body`, { x1: 0, x2: 1, y1: 0, y2: 0 }, [
        [0, p.spongeShade],
        [0.2, p.sponge],
        [0.7, p.sponge],
        [1, p.spongeShade],
      ]),
      gradient('linearGradient', `${uid}-top`, { x1: 0, x2: 0, y1: 0, y2: 1 }, [
        [0, p.frostingShade],
        [0.55, p.frosting],
        [1, p.frosting],
      ]),
      gradient('linearGradient', `${uid}-cyl`, { x1: 0, x2: 1, y1: 0, y2: 0 }, [
        [0, '#000000', 0.16],
        [0.35, '#ffffff', 0.25],
        [0.6, '#ffffff', 0],
        [1, '#000000', 0.18],
      ]),
      gradient('radialGradient', `${uid}-flame`, { cx: 0.5, cy: 0.78, r: 0.7 }, [
        [0, '#fffbe6'],
        [0.35, '#ffe27a'],
        [0.72, '#ffa63a'],
        [1, '#ff6a1a', 0.85],
      ]),
      gradient('radialGradient', `${uid}-core`, { cx: 0.5, cy: 0.7, r: 0.6 }, [
        [0, '#ffffff'],
        [1, '#fff1a8'],
      ]),
      gradient('radialGradient', `${uid}-glow`, {}, [
        [0, '#ffc46b', 0.55],
        [0.5, '#ffb347', 0.18],
        [1, '#ffa040', 0],
      ]),
      gradient('radialGradient', `${uid}-plate`, { cx: 0.5, cy: 0.4, r: 0.6 }, [
        [0, '#ffffff'],
        [1, '#e3e6ee'],
      ]),
      el('pattern', { id: `${uid}-stripes`, width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(-38)' }, [
        el('rect', { width: 3.6, height: 9, fill: p.stripe }),
      ]),
    ]),
  );

  // Plate
  const plateY = C.topY + C.bodyHeight + 6;
  svg.append(
    el('ellipse', { cx: C.cx, cy: plateY + 9, rx: 160, ry: 39, fill: '#000000', opacity: 0.22 }),
    el('ellipse', { cx: C.cx, cy: plateY + 4, rx: 158, ry: 38, fill: '#c7ccd8' }),
    el('ellipse', { cx: C.cx, cy: plateY, rx: 158, ry: 38, fill: url('plate') }),
    el('ellipse', { cx: C.cx, cy: plateY, rx: 134, ry: 31, fill: 'none', stroke: '#d7dbe4', 'stroke-width': 1.5 }),
  );

  // Body, filling stripe and a soft shadow line at the base
  const left = C.cx - C.rx;
  const right = C.cx + C.rx;
  const bottom = C.topY + C.bodyHeight;
  svg.append(
    el('path', { d: `M${left},${C.topY} L${left},${bottom} A${C.rx},${C.ry} 0 0 0 ${right},${bottom} L${right},${C.topY} Z`, fill: url('body') }),
  );
  const band = C.topY + C.bodyHeight * 0.52;
  svg.append(
    el('path', {
      d: `M${left},${band} A${C.rx},${C.ry} 0 0 0 ${right},${band} L${right},${band + 9} A${C.rx},${C.ry} 0 0 1 ${left},${band + 9} Z`,
      fill: p.drip,
      opacity: 0.85,
    }),
  );
  if (theme === 'vanilla') svg.append(...sideSprinkles(p.deco.slice(1)));

  // Top and the drips over its front edge
  svg.append(el('ellipse', { cx: C.cx, cy: C.topY, rx: C.rx, ry: C.ry, fill: url('top') }));
  svg.append(el('path', { d: dripPath(), fill: p.drip }));
  svg.append(el('ellipse', { cx: C.cx, cy: C.topY - 4, rx: C.rx * 0.8, ry: C.ry * 0.6, fill: '#ffffff', opacity: 0.16 }));
  if (theme === 'vanilla') svg.append(...topSprinkles(p.deco.slice(1)));

  // Dollops around the rim and the candles, drawn back to front.
  const items: { y: number; node: SVGElement }[] = [];
  const dollops = 14;
  for (let i = 0; i < dollops; i++) {
    const a = (2 * Math.PI * i) / dollops + 0.12;
    const x = C.cx + C.rx * 0.88 * Math.cos(a);
    const y = C.topY + C.ry * 0.78 * Math.sin(a);
    const depth = 0.85 + 0.15 * ((y - (C.topY - C.ry)) / (2 * C.ry));
    items.push({ y, node: dollop(x, y, depth, p.deco[i % 2 === 0 ? 0 : 1] ?? p.deco[0], theme) });
  }
  for (const spot of spots) {
    items.push({ y: spot.base, node: isDigits ? digitCandle(spot, p.candle, p.stripe, url('stripes')) : candle(spot, p.candle, url('stripes'), url('cyl')) });
  }
  items.sort((a, b) => a.y - b.y);
  svg.append(...items.map((item) => item.node));

  // Flames on top of everything, then the smoke layer.
  const flameLayer = el('g', { class: 'bc-flames' });
  const flames: Flame[] = [];
  for (const spot of [...spots].sort((a, b) => a.index - b.index)) {
    const size = isDigits ? 1.2 : spot.scale;
    const bend = el('g', {}, [
      el('g', { class: 'bc-flicker' }, [
        el('path', { d: FLAME_PATH, fill: url('flame') }),
        el('path', { d: FLAME_PATH, fill: url('core'), transform: 'translate(0 1) scale(0.5 0.55)' }),
        el('ellipse', { cx: 0, cy: -1, rx: 2.2, ry: 3.2, fill: '#6b8cff', opacity: 0.5 }),
      ]),
    ]);
    const root = el('g', { class: 'bc-flame', transform: `translate(${spot.x.toFixed(1)} ${spot.top.toFixed(1)}) scale(${size.toFixed(3)})` }, [
      el('ellipse', { class: 'bc-glow', cx: 0, cy: -12, rx: 30, ry: 34, fill: url('glow') }),
      bend,
    ]);
    const flicker = bend.firstElementChild as SVGGElement;
    flicker.style.animationDelay = `${(-Math.random() * 1.5).toFixed(2)}s`;
    flicker.style.animationDuration = `${(1.1 + Math.random() * 0.6).toFixed(2)}s`;
    flameLayer.append(root);
    const offset = spot.x - C.cx;
    flames.push({
      index: spot.index,
      spot,
      root,
      bend,
      lit: true,
      side: Math.abs(offset) > 4 ? Math.sign(offset) : spot.index % 2 ? 1 : -1,
      phase: Math.random() * Math.PI * 2,
    });
  }
  const smoke = el('g', { class: 'bc-smoke' });
  svg.append(flameLayer, smoke);
  return { svg, spots, flames, smoke, leaning: false };
}

function dripPath(): string {
  const C = CAKE;
  const upper: string[] = [];
  const lower: string[] = [];
  for (let x = C.cx - C.rx; x <= C.cx + C.rx + 0.01; x += 3) {
    const u = (x - (C.cx - C.rx)) / (2 * C.rx);
    const edge = Math.sqrt(Math.max(0, 1 - ((x - C.cx) / C.rx) ** 2));
    const y = C.topY + C.ry * edge;
    let depth = 5;
    for (const [at, len] of DRIPS) depth += len * Math.exp(-(((u - at) / 0.03) ** 2));
    upper.push(`${x.toFixed(1)},${(y - 1.5).toFixed(1)}`);
    lower.push(`${x.toFixed(1)},${(y + depth * (0.45 + 0.55 * edge)).toFixed(1)}`);
  }
  return `M${upper.join(' L')} L${lower.reverse().join(' L')} Z`;
}

function dollop(x: number, y: number, depth: number, color: string, theme: ThemeId): SVGElement {
  const r = 7.5 * depth;
  if (theme === 'strawberry' && color !== '#ffffff') {
    // A small strawberry: red body, lighter highlight, a few seeds.
    return el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, [
      el('path', { d: `M0,${r} C${-r * 1.2},${r * 0.2} ${-r},${-r} 0,${-r * 0.8} C${r},${-r} ${r * 1.2},${r * 0.2} 0,${r} Z`, fill: color }),
      el('ellipse', { cx: -r * 0.3, cy: -r * 0.2, rx: r * 0.25, ry: r * 0.35, fill: '#ffffff', opacity: 0.35 }),
      el('path', { d: `M${-r * 0.5},${-r * 0.8} L0,${-r * 0.4} L${r * 0.5},${-r * 0.8}`, stroke: '#3f9b4b', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }),
    ]);
  }
  return el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, [
    el('ellipse', { cx: 0, cy: r * 0.35, rx: r * 1.1, ry: r * 0.55, fill: '#000000', opacity: 0.08 }),
    el('circle', { cx: 0, cy: 0, r, fill: color }),
    el('ellipse', { cx: -r * 0.3, cy: -r * 0.35, rx: r * 0.35, ry: r * 0.25, fill: '#ffffff', opacity: 0.45 }),
  ]);
}

function candle(spot: CandleSpot, color: string, stripes: string, cylinder: string): SVGElement {
  const w = spot.width;
  const h = spot.height;
  const wickTop = spot.top - spot.base;
  return el('g', { transform: `translate(${spot.x.toFixed(1)} ${spot.base.toFixed(1)})` }, [
    el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 2.5, fill: color }),
    el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 2.5, fill: stripes, opacity: 0.9 }),
    el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 2.5, fill: cylinder }),
    el('ellipse', { cx: 0, cy: -h, rx: w / 2, ry: 1.8, fill: '#ffffff', opacity: 0.7 }),
    el('path', { d: `M0,${-h} q1,${(wickTop + h) / 2} -0.5,${wickTop + h}`, stroke: '#3b2a20', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }),
  ]);
}

function digitCandle(spot: CandleSpot, color: string, outline: string, stripes: string): SVGElement {
  const font = String(CAKE.digitSize);
  const text = (attrs: Attrs) => {
    const node = el('text', {
      x: 0,
      y: 0,
      'text-anchor': 'middle',
      'font-size': font,
      'font-weight': 800,
      'font-family': 'ui-rounded, "SF Pro Rounded", -apple-system, "Segoe UI", Roboto, sans-serif',
      ...attrs,
    });
    node.textContent = String(spot.digit ?? 0);
    return node;
  };
  const wickBottom = -spot.height;
  const wickTop = spot.top - spot.base;
  return el('g', { transform: `translate(${spot.x.toFixed(1)} ${spot.base.toFixed(1)})` }, [
    text({ fill: color, stroke: outline, 'stroke-width': 5, 'stroke-linejoin': 'round', 'paint-order': 'stroke' }),
    text({ fill: stripes, opacity: 0.55 }),
    el('path', { d: `M0,${wickBottom} L0,${wickTop}`, stroke: '#3b2a20', 'stroke-width': 1.8, 'stroke-linecap': 'round' }),
  ]);
}

/** Deterministic pseudo-random numbers, so a cake looks the same every time it is drawn. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32;
}

function sprinkle(x: number, y: number, angle: number, color: string): SVGElement {
  return el('rect', { x: -3, y: -1.1, width: 6, height: 2.2, rx: 1.1, fill: color, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(0)})` });
}

function topSprinkles(colors: string[]): SVGElement[] {
  const C = CAKE;
  const rand = seeded(7);
  const out: SVGElement[] = [];
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * 0.8;
    out.push(sprinkle(C.cx + C.rx * r * Math.cos(a), C.topY + C.ry * r * Math.sin(a), rand() * 180, colors[i % colors.length]));
  }
  return out;
}

function sideSprinkles(colors: string[]): SVGElement[] {
  const C = CAKE;
  const rand = seeded(11);
  const out: SVGElement[] = [];
  for (let i = 0; i < 34; i++) {
    const u = rand() * 2 - 1;
    const x = C.cx + C.rx * 0.95 * u;
    const edge = Math.sqrt(1 - u * u);
    const y = C.topY + 34 + rand() * (C.bodyHeight - 40) + C.ry * edge;
    out.push(sprinkle(x, y, rand() * 180, colors[i % colors.length]));
  }
  return out;
}

/** Lean the lit flames: `lean` 0–1; the flame next in line also shrinks by `nextFraction`. */
export function leanFlames(view: CakeView, lean: number, now: number, next: number, nextFraction: number): void {
  if (lean < 0.002 && nextFraction < 0.002) {
    if (view.leaning) {
      for (const f of view.flames) f.bend.removeAttribute('transform');
      view.leaning = false;
    }
    return;
  }
  view.leaning = true;
  for (const f of view.flames) {
    if (!f.lit) continue;
    const wobble = 0.25 * Math.sin(now / 90 + f.phase) + 0.12 * Math.sin(now / 37 + f.phase * 2);
    const amount = lean * (1 + wobble);
    let sx = 1 + 0.1 * amount;
    let sy = 1 - 0.4 * amount;
    if (f.index === next) {
      sx *= 1 - 0.3 * nextFraction;
      sy *= 1 - 0.55 * nextFraction;
    }
    f.bend.setAttribute('transform', `rotate(${(f.side * amount * 38).toFixed(1)}) scale(${sx.toFixed(3)} ${Math.max(0.15, sy).toFixed(3)})`);
  }
}

/** Blow one flame out: it snuffs, the wick glows for a moment and smoke curls up. */
export function putOut(view: CakeView, index: number): void {
  const flame = view.flames[index];
  if (!flame || !flame.lit) return;
  flame.lit = false;
  flame.root.classList.add('is-out');
  const { x, top } = flame.spot;
  const size = flame.spot.digit === undefined ? flame.spot.scale : 1.2;
  const puff = el('g', { transform: `translate(${x.toFixed(1)} ${top.toFixed(1)}) scale(${size.toFixed(3)})` }, [
    el('circle', { class: 'bc-ember', cx: 0, cy: 0.5, r: 2 }),
    el('path', { class: 'bc-wisp', d: 'M0,-2 C-6,-12 6,-22 0,-32 C-6,-42 6,-52 0,-62' }),
    el('path', { class: 'bc-wisp bc-wisp-2', d: 'M1,-2 C7,-10 -5,-20 2,-30 C8,-40 -4,-50 2,-58' }),
  ]);
  view.smoke.append(puff);
  window.setTimeout(() => puff.remove(), 3200);
}

export function relightAll(view: CakeView): void {
  view.smoke.replaceChildren();
  for (const f of view.flames) {
    f.lit = true;
    f.root.classList.remove('is-out');
    f.bend.removeAttribute('transform');
  }
  view.leaning = false;
}

/** A pointer position in the cake's own coordinates. */
export function toCakePoint(svg: SVGSVGElement, clientX: number, clientY: number): Point | null {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const pt = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return { x: pt.x, y: pt.y };
}
