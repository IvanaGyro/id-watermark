// Colours for each cake style. Pure data: used by the swatches in Tool.astro and by cake.ts.
import type { ThemeId } from './logic';

export interface Palette {
  frosting: string;
  frostingShade: string;
  sponge: string;
  spongeShade: string;
  /** The drip over the top edge and the filling stripe. */
  drip: string;
  /** Dollops / berries on top, then sprinkles. */
  deco: string[];
  candle: string;
  stripe: string;
  /** Room colours while the candles are lit (top and bottom of the gradient). */
  night: [string, string];
  /** Room colours once the lights are back on. */
  day: [string, string];
  /** Highlights on the stage (the blow meter). */
  accent: string;
  /** No white: the pieces fall on a light background. */
  confetti: string[];
}

export const PALETTES: Record<ThemeId, Palette> = {
  strawberry: {
    frosting: '#ffd3e0',
    frostingShade: '#f7a9c1',
    sponge: '#fff3e8',
    spongeShade: '#f1d6c1',
    drip: '#ef6f96',
    deco: ['#e8364f', '#ffffff'],
    candle: '#ffffff',
    stripe: '#ff7fa6',
    night: ['#3a1c3d', '#150a18'],
    day: ['#fff6f8', '#ffe3ec'],
    accent: '#e2557f',
    confetti: ['#ff7fa6', '#ffd166', '#e8364f', '#8fd3ff', '#b388ff'],
  },
  chocolate: {
    frosting: '#7a4a33',
    frostingShade: '#5e3624',
    sponge: '#9a6544',
    spongeShade: '#7b4c31',
    drip: '#3f2318',
    deco: ['#fff1dc', '#d94b5c'],
    candle: '#fff6e5',
    stripe: '#d9534f',
    night: ['#2e1d14', '#110a06'],
    day: ['#fbf4ec', '#f2e2d0'],
    accent: '#a0522d',
    confetti: ['#f6c177', '#d94b5c', '#c08457', '#ffd166', '#8fd3ff'],
  },
  matcha: {
    frosting: '#d5e8bd',
    frostingShade: '#b3d08f',
    sponge: '#fdf8ec',
    spongeShade: '#eadfc4',
    drip: '#7aa457',
    deco: ['#ffffff', '#f2b8c6'],
    candle: '#ffffff',
    stripe: '#7aa457',
    night: ['#17291c', '#08120b'],
    day: ['#f6fbef', '#e6f2d8'],
    accent: '#5f8f3e',
    confetti: ['#a8d17f', '#f2b8c6', '#ffd166', '#7aa457', '#8fd3ff'],
  },
  vanilla: {
    frosting: '#fff8e4',
    frostingShade: '#f2e3b8',
    sponge: '#ffe2a6',
    spongeShade: '#f2c97a',
    drip: '#ffffff',
    deco: ['#ffffff', '#ff6b8b', '#4cc3ff', '#ffd23f', '#7ed957', '#b388ff'],
    candle: '#ffffff',
    stripe: '#4cc3ff',
    night: ['#1f1d36', '#0c0b19'],
    day: ['#fffbf0', '#fff0cc'],
    accent: '#d9822b',
    confetti: ['#ff6b8b', '#4cc3ff', '#ffd23f', '#7ed957', '#b388ff'],
  },
  blueberry: {
    frosting: '#d9d3f5',
    frostingShade: '#b6aae8',
    sponge: '#f7f3ff',
    spongeShade: '#e0d8f6',
    drip: '#6c5bd4',
    deco: ['#3d348b', '#ffffff'],
    candle: '#ffffff',
    stripe: '#7b6cf0',
    night: ['#1b1838', '#0a0919'],
    day: ['#f8f6ff', '#ebe7ff'],
    accent: '#6c5bd4',
    confetti: ['#7b6cf0', '#b6aae8', '#ffd166', '#3d348b', '#ff7fa6'],
  },
};
