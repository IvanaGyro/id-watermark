// Moon phase astronomy after Jean Meeus, "Astronomical Algorithms" (2nd ed., 1998):
//   ch. 25 position of the Sun (low accuracy, ~0.01°)
//   ch. 47 position of the Moon (ELP-2000/82 truncated, ~10″ in longitude)
//   ch. 48 illuminated fraction of the Moon's disk
//   ch. 49 times of the phases (new, first quarter, full, last quarter; seconds to a minute)
// Pure functions. Instants are Unix milliseconds (UT); the formulas run in TT (JDE = JD + ΔT).

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const sin = (deg: number) => Math.sin(deg * RAD);
const cos = (deg: number) => Math.cos(deg * RAD);

/** Mean synodic month in days (new moon to new moon). */
export const SYNODIC_MONTH = 29.530588861;
/** Kilometres in one astronomical unit. */
const AU_KM = 149_597_870.7;

export function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Julian Day (UT) of a Unix millisecond instant. */
export function jdFromMs(ms: number): number {
  return ms / DAY_MS + 2440587.5;
}

export function msFromJd(jd: number): number {
  return (jd - 2440587.5) * DAY_MS;
}

/** Decimal Gregorian year of an instant (good enough for ΔT). */
function decimalYear(ms: number): number {
  return 1970 + ms / (365.2425 * DAY_MS);
}

/**
 * ΔT = TT − UT in seconds, from the polynomials of Espenak & Meeus (NASA Five Millennium Canon).
 * About a minute today; it only shifts results by that much, so the long-term parabola is fine outside 1600–2150.
 */
export function deltaT(year: number): number {
  const y = year;
  if (y < 1600 || y >= 2150) {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u;
  }
  if (y < 1700) {
    const t = y - 1600;
    return 120 - 0.9808 * t - 0.01532 * t ** 2 + t ** 3 / 7129;
  }
  if (y < 1800) {
    const t = y - 1700;
    return 8.83 + 0.1603 * t - 0.0059285 * t ** 2 + 0.00013336 * t ** 3 - t ** 4 / 1_174_000;
  }
  if (y < 1860) {
    const t = y - 1800;
    return (
      13.72 -
      0.332447 * t +
      0.0068612 * t ** 2 +
      0.0041116 * t ** 3 -
      0.00037436 * t ** 4 +
      0.0000121272 * t ** 5 -
      0.0000001699 * t ** 6 +
      0.000000000875 * t ** 7
    );
  }
  if (y < 1900) {
    const t = y - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t ** 2 + 0.01680668 * t ** 3 - 0.0004473624 * t ** 4 + t ** 5 / 233_174;
  }
  if (y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
  }
  if (y < 1941) {
    const t = y - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3;
  }
  if (y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547;
  }
  if (y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718;
  }
  if (y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  if (y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t ** 2;
  }
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u - 0.5628 * (2150 - y);
}

/** JDE (TT) of a UT instant. */
export function jdeFromMs(ms: number): number {
  return jdFromMs(ms) + deltaT(decimalYear(ms)) / 86_400;
}

/** UT instant of a JDE (TT). */
export function msFromJde(jde: number): number {
  const approx = msFromJd(jde);
  return approx - deltaT(decimalYear(approx)) * 1000;
}

/* ---------- ch. 25: the Sun ---------- */

export interface SunPosition {
  /** Apparent geocentric longitude (with nutation and aberration), degrees. */
  lon: number;
  /** Distance from Earth, km. */
  distanceKm: number;
}

export function sunPosition(jde: number): SunPosition {
  const T = (jde - 2451545) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
  const trueLon = L0 + C;
  const v = M + C;
  const R = (1.000001018 * (1 - e * e)) / (1 + e * cos(v));
  const omega = 125.04 - 1934.136 * T;
  return { lon: norm360(trueLon - 0.00569 - 0.00478 * sin(omega)), distanceKm: R * AU_KM };
}

/* ---------- ch. 47: the Moon ---------- */

// Table 47.A: multiples of D, M, M', F; coefficients of Σl (1e-6 degree) and Σr (1e-3 km).
// prettier-ignore
const LR: readonly (readonly [number, number, number, number, number, number])[] = [
  [0, 0, 1, 0, 6288774, -20905355], [2, 0, -1, 0, 1274027, -3699111], [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925], [0, 1, 0, 0, -185116, 48888], [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158], [2, -1, -1, 0, 57066, -152138], [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586], [0, 1, -1, 0, -40923, -129620], [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755], [2, 0, 0, -2, 15327, 10321], [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661], [4, 0, -1, 0, 10675, -34782], [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636], [2, 1, -1, 0, -7888, 24208], [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379], [1, 1, 0, 0, 4987, -16675], [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445], [4, 0, 0, 0, 3861, -11650], [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003], [2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 10056],
  [1, 0, 1, 0, -2348, 6322], [2, -2, 0, 0, 2236, -9884], [0, 1, 2, 0, -2120, 5751],
  [0, 2, 0, 0, -2069, 0], [2, -2, -1, 0, 2048, -4950], [2, 0, 1, -2, -1773, 4130],
  [2, 0, 0, 2, -1595, 0], [4, -1, -1, 0, 1215, -3958], [0, 0, 2, 2, -1110, 0],
  [3, 0, -1, 0, -892, 3258], [2, 1, 1, 0, -810, 2616], [4, -1, -2, 0, 759, -1897],
  [0, 2, -1, 0, -713, -2117], [2, 2, -1, 0, -700, 2354], [2, 1, -2, 0, 691, 0],
  [2, -1, 0, -2, 596, 0], [4, 0, 1, 0, 549, -1423], [0, 0, 4, 0, 537, -1117],
  [4, -1, 0, 0, 520, -1571], [1, 0, -2, 0, -487, -1739], [2, 1, 0, -2, -399, 0],
  [0, 0, 2, -2, -381, -4421], [1, 1, 1, 0, 351, 0], [3, 0, -2, 0, -340, 0],
  [4, 0, -3, 0, 330, 0], [2, -1, 2, 0, 327, 0], [0, 2, 1, 0, -323, 1165],
  [1, 1, -1, 0, 299, 0], [2, 0, 3, 0, 294, 0], [2, 0, -1, -2, 0, 8752],
];

// Table 47.B: multiples of D, M, M', F; coefficient of Σb (1e-6 degree).
// prettier-ignore
const B: readonly (readonly [number, number, number, number, number])[] = [
  [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271], [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266], [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359], [2, -1, -1, 1, 2463], [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870], [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749], [0, 1, -1, 1, -1565], [1, 0, 0, 1, -1491], [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410], [0, 1, 0, -1, -1344], [1, 0, 0, -1, -1335], [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021], [4, 0, -1, 1, 833], [0, 0, 1, -3, 777], [4, 0, -2, 1, 671],
  [2, 0, 0, -3, 607], [2, 0, 2, -1, 596], [2, -1, 1, -1, 491], [2, 0, -2, 1, -451],
  [0, 0, 3, -1, 439], [2, 0, 2, 1, 422], [2, 0, -3, -1, 421], [2, 1, -1, 1, -366],
  [2, 1, 0, 1, -351], [4, 0, 0, 1, 331], [2, -1, 1, 1, 315], [2, -2, 0, -1, 302],
  [0, 0, 1, 3, -283], [2, 1, 1, -1, -229], [1, 1, 0, -1, 223], [1, 1, 0, 1, 223],
  [0, 1, -2, -1, -220], [2, 1, -1, -1, -220], [1, 0, 1, 1, -185], [2, -1, -2, -1, 181],
  [0, 1, 2, 1, -177], [4, 0, -2, -1, 176], [4, -1, -1, -1, 166], [1, 0, 1, -1, -164],
  [4, 0, 1, -1, 132], [1, 0, -1, -1, -119], [4, -1, 0, -1, 115], [2, -2, 0, 1, 107],
];

export interface MoonPosition {
  /** Geocentric ecliptic longitude, mean equinox of date (no nutation), degrees. */
  lon: number;
  /** Geocentric ecliptic latitude, degrees. */
  lat: number;
  /** Distance between the centres of Earth and Moon, km. */
  distanceKm: number;
  /** The sums Σl, Σb, Σr of ch. 47 (exposed for tests against the book's worked example). */
  sums: { l: number; b: number; r: number };
}

export function moonPosition(jde: number): MoonPosition {
  const T = (jde - 2451545) / 36525;
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T ** 2 + T ** 3 / 538_841 - T ** 4 / 65_194_000);
  const D = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T ** 2 + T ** 3 / 545_868 - T ** 4 / 113_065_000);
  const M = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T ** 2 + T ** 3 / 24_490_000);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T ** 2 + T ** 3 / 69_699 - T ** 4 / 14_712_000);
  const F = norm360(93.272095 + 483202.0175233 * T - 0.0036539 * T ** 2 - T ** 3 / 3_526_000 + T ** 4 / 863_310_000);
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.29 * T;
  const A3 = 313.45 + 481266.484 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T ** 2;
  const eFactor = (m: number) => (m === 0 ? 1 : Math.abs(m) === 1 ? E : E * E);

  let l = 0;
  let r = 0;
  for (const [d, m, mp, f, cl, cr] of LR) {
    const arg = d * D + m * M + mp * Mp + f * F;
    const k = eFactor(m);
    l += cl * k * sin(arg);
    r += cr * k * cos(arg);
  }
  let b = 0;
  for (const [d, m, mp, f, cb] of B) b += cb * eFactor(m) * sin(d * D + m * M + mp * Mp + f * F);

  l += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
  b += -2235 * sin(Lp) + 382 * sin(A3) + 175 * sin(A1 - F) + 175 * sin(A1 + F) + 127 * sin(Lp - Mp) - 115 * sin(Lp + Mp);

  return { lon: norm360(Lp + l / 1e6), lat: b / 1e6, distanceKm: 385000.56 + r / 1000, sums: { l, b, r } };
}

/** Nutation in longitude Δψ, degrees (ch. 22 low-accuracy series, ~0.5″). */
export function nutationLon(jde: number): number {
  const T = (jde - 2451545) / 36525;
  const omega = 125.04452 - 1934.136261 * T;
  const L = 280.4665 + 36000.7698 * T;
  const Lp = 218.3165 + 481267.8813 * T;
  return (-17.2 * sin(omega) - 1.32 * sin(2 * L) - 0.23 * sin(2 * Lp) + 0.21 * sin(2 * omega)) / 3600;
}

/* ---------- ch. 48: illuminated fraction ---------- */

export interface MoonIllumination {
  /** Apparent longitude of the Moon minus that of the Sun, 0–360°. 0 new, 90 first quarter, 180 full, 270 last quarter. */
  elongation: number;
  /** Phase angle Sun–Moon–Earth, 0–180°. */
  phaseAngle: number;
  /** Illuminated fraction of the disk, 0–1. */
  fraction: number;
  /** True from new moon to full moon. */
  waxing: boolean;
  distanceKm: number;
}

export function illuminationAtJde(jde: number): MoonIllumination {
  const moon = moonPosition(jde);
  const sun = sunPosition(jde);
  const moonLon = moon.lon + nutationLon(jde);
  const dLon = norm360(moonLon - sun.lon);
  // Geocentric elongation ψ and phase angle i (48.2, 48.3); 48.1 gives k.
  const psi = Math.acos(cos(moon.lat) * cos(dLon)) / RAD;
  const i = Math.atan2(sun.distanceKm * sin(psi), moon.distanceKm - sun.distanceKm * cos(psi)) / RAD;
  return {
    elongation: dLon,
    phaseAngle: i,
    fraction: (1 + cos(i)) / 2,
    waxing: dLon < 180,
    distanceKm: moon.distanceKm,
  };
}

export function illuminationAt(ms: number): MoonIllumination {
  return illuminationAtJde(jdeFromMs(ms));
}

/* ---------- ch. 49: phases ---------- */

/** 0 new moon, 1 first quarter, 2 full moon, 3 last quarter. */
export type PhaseIndex = 0 | 1 | 2 | 3;

/**
 * JDE (TT) of a principal phase. `k` counts lunations from the new moon of 2000-01-06:
 * an integer for a new moon, +0.25 first quarter, +0.5 full moon, +0.75 last quarter.
 */
export function phaseJde(k: number): number {
  const frac = Math.round((k - Math.floor(k)) * 4) % 4;
  const T = k / 1236.85;
  let jde = 2451550.09766 + SYNODIC_MONTH * k + 0.00015437 * T ** 2 - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T ** 2;
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T ** 2 - 0.00000011 * T ** 3;
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3 - 0.000000058 * T ** 4;
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3 + 0.000000011 * T ** 4;
  const O = 124.7746 - 1.56375588 * k + 0.0020672 * T ** 2 + 0.00000215 * T ** 3;

  let c: number;
  if (frac === 0 || frac === 2) {
    const full = frac === 2;
    c =
      (full ? -0.40614 : -0.4072) * sin(Mp) +
      (full ? 0.17302 : 0.17241) * E * sin(M) +
      (full ? 0.01614 : 0.01608) * sin(2 * Mp) +
      (full ? 0.01043 : 0.01039) * sin(2 * F) +
      (full ? 0.00734 : 0.00739) * E * sin(Mp - M) +
      (full ? -0.00515 : -0.00514) * E * sin(Mp + M) +
      (full ? 0.00209 : 0.00208) * E * E * sin(2 * M) -
      0.00111 * sin(Mp - 2 * F) -
      0.00057 * sin(Mp + 2 * F) +
      0.00056 * E * sin(2 * Mp + M) -
      0.00042 * sin(3 * Mp) +
      0.00042 * E * sin(M + 2 * F) +
      0.00038 * E * sin(M - 2 * F) -
      0.00024 * E * sin(2 * Mp - M) -
      0.00017 * sin(O) -
      0.00007 * sin(Mp + 2 * M) +
      0.00004 * sin(2 * Mp - 2 * F) +
      0.00004 * sin(3 * M) +
      0.00003 * sin(Mp + M - 2 * F) +
      0.00003 * sin(2 * Mp + 2 * F) -
      0.00003 * sin(Mp + M + 2 * F) +
      0.00003 * sin(Mp - M + 2 * F) -
      0.00002 * sin(Mp - M - 2 * F) -
      0.00002 * sin(3 * Mp + M) +
      0.00002 * sin(4 * Mp);
  } else {
    c =
      -0.62801 * sin(Mp) +
      0.17172 * E * sin(M) -
      0.01183 * E * sin(Mp + M) +
      0.00862 * sin(2 * Mp) +
      0.00804 * sin(2 * F) +
      0.00454 * E * sin(Mp - M) +
      0.00204 * E * E * sin(2 * M) -
      0.0018 * sin(Mp - 2 * F) -
      0.0007 * sin(Mp + 2 * F) -
      0.0004 * sin(3 * Mp) -
      0.00034 * E * sin(2 * Mp - M) +
      0.00032 * E * sin(M + 2 * F) +
      0.00032 * E * sin(M - 2 * F) -
      0.00028 * E * E * sin(Mp + 2 * M) +
      0.00027 * E * sin(2 * Mp + M) -
      0.00017 * sin(O) -
      0.00005 * sin(Mp - M - 2 * F) +
      0.00004 * sin(2 * Mp + 2 * F) -
      0.00004 * sin(Mp + M + 2 * F) +
      0.00004 * sin(Mp - 2 * M) +
      0.00003 * sin(Mp + M - 2 * F) +
      0.00003 * sin(3 * M) +
      0.00002 * sin(2 * Mp - 2 * F) +
      0.00002 * sin(Mp - M + 2 * F) -
      0.00002 * sin(3 * Mp + M);
    const W =
      0.00306 -
      0.00038 * E * cos(M) +
      0.00026 * cos(Mp) -
      0.00002 * cos(Mp - M) +
      0.00002 * cos(Mp + M) +
      0.00002 * cos(2 * F);
    c += frac === 1 ? W : -W;
  }

  // Planetary arguments, common to all phases.
  const A = [
    [299.77 + 0.107408 * k - 0.009173 * T ** 2, 325],
    [251.88 + 0.016321 * k, 165],
    [251.83 + 26.651886 * k, 164],
    [349.42 + 36.412478 * k, 126],
    [84.66 + 18.206239 * k, 110],
    [141.74 + 53.303771 * k, 62],
    [207.14 + 2.453732 * k, 60],
    [154.84 + 7.30686 * k, 56],
    [34.52 + 27.261239 * k, 47],
    [207.19 + 0.121824 * k, 42],
    [291.34 + 1.844379 * k, 40],
    [161.72 + 24.198154 * k, 37],
    [239.56 + 25.513099 * k, 35],
    [331.55 + 3.592518 * k, 23],
  ];
  let extra = 0;
  for (const [arg, coef] of A) extra += coef * 1e-6 * sin(arg);

  jde += c + extra;
  return jde;
}

/** UT instant (ms) of the phase with lunation number `k`. */
export function phaseMs(k: number): number {
  return msFromJde(phaseJde(k));
}

/** Lunation number of the last new moon at or before an instant. */
export function lunationAt(ms: number): number {
  const jde = jdeFromMs(ms);
  let k = Math.floor((jde - 2451550.09766) / SYNODIC_MONTH);
  while (phaseJde(k) > jde) k--;
  while (phaseJde(k + 1) <= jde) k++;
  return k;
}
