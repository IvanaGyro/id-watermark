// SVG drawing of the Moon for a given illuminated fraction. Pure string builders, shared by the
// page (inline SVG) and the downloadable card (the same SVG drawn onto a canvas).

/** Radius of the disk in the drawing's coordinates (viewBox is −120…120). */
export const MOON_R = 96;

const num = (n: number) => String(Math.round(n * 100) / 100);

/**
 * Path of the sunlit part of a disk of radius r centred on (0, 0), lit on the right (a waxing moon
 * seen from the northern hemisphere). The terminator is half an ellipse whose semi-axis is r·|1 − 2k|;
 * it bulges toward the lit limb for a crescent (k < ½) and away from it for a gibbous moon.
 */
export function litPath(fraction: number, r = MOON_R): string {
  const k = Math.min(1, Math.max(0, fraction));
  const rx = r * Math.abs(1 - 2 * k);
  const sweep = k < 0.5 ? 0 : 1;
  return `M0 ${num(-r)}A${num(r)} ${num(r)} 0 0 1 0 ${num(r)}A${num(rx)} ${num(r)} 0 0 ${sweep} 0 ${num(-r)}Z`;
}

/**
 * Which limb is lit for an observer. From the northern hemisphere a waxing moon is lit on the right;
 * a waning moon on the left. The southern hemisphere sees the whole Moon turned by 180°, so both swap.
 */
export function litOnRight(waxing: boolean, south: boolean): boolean {
  return waxing !== south;
}

// Dark plains (maria) as seen from the northern hemisphere, north up, in units of the radius.
// Each mare is a cluster of soft blobs placed at the orthographic projection of its selenographic
// position, so the outlines come out irregular like the real ones. [x, y, rx, ry, opacity]
// prettier-ignore
const MARIA: readonly (readonly [number, number, number, number, number])[] = [
  // Oceanus Procellarum
  [-0.55, -0.35, 0.17, 0.17, 0.42], [-0.68, -0.18, 0.16, 0.16, 0.42], [-0.72, 0.02, 0.15, 0.15, 0.42],
  [-0.66, 0.2, 0.12, 0.12, 0.38], [-0.5, -0.05, 0.12, 0.12, 0.36], [-0.79, -0.33, 0.1, 0.12, 0.38],
  [-0.46, 0.14, 0.1, 0.1, 0.3],
  // Mare Imbrium and Sinus Iridum
  [-0.28, -0.52, 0.2, 0.17, 0.55], [-0.12, -0.48, 0.13, 0.11, 0.5], [-0.38, -0.42, 0.14, 0.12, 0.45],
  [-0.22, -0.63, 0.13, 0.09, 0.45], [-0.42, -0.65, 0.07, 0.05, 0.4],
  // Mare Serenitatis
  [0.25, -0.45, 0.15, 0.14, 0.62],
  // Mare Tranquillitatis
  [0.43, -0.15, 0.14, 0.13, 0.55], [0.55, -0.07, 0.11, 0.1, 0.5], [0.37, -0.02, 0.1, 0.09, 0.45],
  [0.5, -0.26, 0.09, 0.08, 0.45],
  // Mare Crisium
  [0.8, -0.3, 0.085, 0.12, 0.72],
  // Mare Fecunditatis, Nectaris
  [0.72, 0.08, 0.09, 0.1, 0.5], [0.75, 0.22, 0.07, 0.09, 0.45], [0.53, 0.28, 0.08, 0.08, 0.5],
  // Mare Nubium, Humorum, Cognitum and Insularum
  [-0.25, 0.33, 0.13, 0.11, 0.42], [-0.14, 0.42, 0.09, 0.07, 0.36], [-0.36, 0.25, 0.09, 0.08, 0.36],
  [-0.56, 0.4, 0.085, 0.085, 0.55], [-0.4, -0.05, 0.1, 0.09, 0.32], [-0.3, 0.1, 0.08, 0.07, 0.3],
  // Mare Vaporum, Sinus Medii
  [0.07, -0.22, 0.07, 0.06, 0.45], [0, -0.02, 0.05, 0.04, 0.3],
  // Mare Frigoris
  [-0.24, -0.8, 0.13, 0.05, 0.26], [-0.04, -0.83, 0.13, 0.05, 0.26], [0.16, -0.82, 0.12, 0.05, 0.24],
  [0.34, -0.77, 0.1, 0.045, 0.22],
  // Grimaldi, Plato (small dark craters)
  [-0.93, 0.09, 0.025, 0.045, 0.6], [-0.1, -0.78, 0.035, 0.022, 0.6],
];

// Bright young craters: Tycho, Copernicus, Kepler, Aristarchus. [x, y, r]
const BRIGHT: readonly (readonly [number, number, number])[] = [
  [-0.14, 0.69, 0.03],
  [-0.34, -0.17, 0.024],
  [-0.62, -0.13, 0.016],
  [-0.67, -0.39, 0.016],
];

/** Surface detail (maria, small craters, Tycho's rays) for a disk of radius r. Deterministic. */
function surface(id: string, r: number): string {
  const p = (v: number) => num(v * r);
  // Blobs are drawn a little larger than listed so their soft edges merge into one plain.
  let out = MARIA.map(
    ([x, y, rx, ry, o]) =>
      `<ellipse cx="${p(x)}" cy="${p(y)}" rx="${p(rx * 1.3)}" ry="${p(ry * 1.3)}" fill="url(#${id}-mare)" opacity="${num(Math.min(1, o * 1.25))}"/>`,
  ).join('');
  // A sprinkling of small craters in the southern highlands.
  const rand = seededRandom('craters');
  for (let i = 0; i < 40; i++) {
    const x = rand() * 1.6 - 0.6;
    const y = rand() * 0.8 + 0.15;
    const s = 0.008 + rand() ** 2 * 0.025;
    if (x * x + y * y > 0.85) continue;
    out += `<circle cx="${p(x)}" cy="${p(y)}" r="${p(s)}" fill="#6f6a5f" opacity="0.1"/>`;
    out += `<circle cx="${p(x - s * 0.25)}" cy="${p(y - s * 0.25)}" r="${p(s * 0.7)}" fill="#fffdf6" opacity="0.14"/>`;
  }
  // Tycho's ray system.
  const [tx, ty] = BRIGHT[0];
  const rays = seededRandom('tycho');
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + rays() * 0.3;
    const len = 0.25 + rays() * 0.6;
    out +=
      `<line x1="${p(tx)}" y1="${p(ty)}" x2="${p(tx + Math.cos(a) * len)}" y2="${p(ty + Math.sin(a) * len)}"` +
      ` stroke="#fffdf4" stroke-opacity="${num(0.06 + rays() * 0.1)}" stroke-width="${num(0.5 + rays() * 0.8)}" stroke-linecap="round"/>`;
  }
  out += BRIGHT.map(([x, y, b]) => `<circle cx="${p(x)}" cy="${p(y)}" r="${p(b)}" fill="url(#${id}-ray)"/>`).join('');
  return out;
}

export interface MoonArt {
  fraction: number;
  waxing: boolean;
  /** Southern hemisphere view (rotated 180°). */
  south: boolean;
  /** Unique prefix for gradient / mask ids on the page. */
  id: string;
  /** Rendered width and height in px. */
  size: number;
  /** Full drawing with maria, soft terminator and glow; false draws a small flat icon. */
  detail?: boolean;
  /** Accessible label. */
  label?: string;
}

/** A complete standalone <svg> element as a string. */
export function moonSvg(art: MoonArt): string {
  const { id, size, detail = true } = art;
  const r = MOON_R;
  const lit = litPath(art.fraction, r);
  const flip = litOnRight(art.waxing, art.south) ? '' : ' transform="scale(-1 1)"';
  const turn = art.south ? ' transform="rotate(180)"' : '';
  const a11y = art.label ? ` role="img" aria-label="${escapeAttr(art.label)}"` : ' aria-hidden="true"';
  const open = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-120 -120 240 240" width="${size}" height="${size}"${a11y}>`;

  if (!detail) {
    return (
      `${open}<circle r="${r}" fill="#2a3150"/>` +
      `<path d="${lit}"${flip} fill="#f1ead8"/>` +
      `<circle r="${r}" fill="none" stroke="#7f88a8" stroke-opacity="0.45" stroke-width="5"/></svg>`
    );
  }

  const glow = 0.1 + 0.32 * art.fraction;
  return (
    open +
    '<defs>' +
    `<radialGradient id="${id}-halo"><stop offset="0.72" stop-color="#fff3d6" stop-opacity="${num(glow)}"/>` +
    '<stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>' +
    `<radialGradient id="${id}-lit" cx="0" cy="0" r="${r}" fx="-18" fy="-22" gradientUnits="userSpaceOnUse">` +
    '<stop offset="0" stop-color="#fbf8f0"/><stop offset="0.72" stop-color="#ece6d6"/><stop offset="1" stop-color="#d2c9b4"/></radialGradient>' +
    `<radialGradient id="${id}-dark" cx="0" cy="0" r="${r}" gradientUnits="userSpaceOnUse">` +
    '<stop offset="0" stop-color="#2b3352"/><stop offset="1" stop-color="#1b2138"/></radialGradient>' +
    `<radialGradient id="${id}-mare"><stop offset="0" stop-color="#7d776b"/><stop offset="0.4" stop-color="#837d71" stop-opacity="0.85"/>` +
    '<stop offset="0.75" stop-color="#8d877b" stop-opacity="0.4"/><stop offset="1" stop-color="#948e82" stop-opacity="0"/></radialGradient>' +
    `<radialGradient id="${id}-ray"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="0.7"/>` +
    '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>' +
    `<filter id="${id}-soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.4"/></filter>` +
    `<mask id="${id}-mask" maskUnits="userSpaceOnUse" x="-120" y="-120" width="240" height="240">` +
    `<path d="${lit}"${flip} fill="#fff" filter="url(#${id}-soft)"/></mask>` +
    `<clipPath id="${id}-disk"><circle r="${r}"/></clipPath>` +
    `<g id="${id}-face"><circle r="${r}" fill="url(#${id}-lit)"/>${surface(id, r)}</g>` +
    '</defs>' +
    `<circle r="120" fill="url(#${id}-halo)"/>` +
    `<g clip-path="url(#${id}-disk)">` +
    `<circle r="${r}" fill="url(#${id}-dark)"/>` +
    // Earthshine: sunlight reflected by Earth leaves a faint image of the face on the night side.
    `<use href="#${id}-face"${turn} opacity="0.08"/>` +
    `<g mask="url(#${id}-mask)"><use href="#${id}-face"${turn}/></g>` +
    '</g>' +
    `<circle r="${r - 0.5}" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1"/>` +
    '</svg>'
  );
}

function escapeAttr(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

/** A tile of faint stars (SVG string) for the night-sky background. */
export function starField(seed: string, width = 480, height = 480, count = 70): string {
  const rand = seededRandom(seed);
  let dots = '';
  for (let i = 0; i < count; i++) {
    const r = rand() < 0.12 ? 1.3 : 0.5 + rand() * 0.6;
    dots += `<circle cx="${num(rand() * width)}" cy="${num(rand() * height)}" r="${num(r)}" fill="#fff" opacity="${num(0.25 + rand() * 0.6)}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${dots}</svg>`;
}

/** Small deterministic PRNG (mulberry32), so a date always gets the same star field on its card. */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
