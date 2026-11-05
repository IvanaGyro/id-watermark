// Pure logic for the ichiban kuji (一番賞) board: prize tiers, shuffling, drawing without replacement,
// odds, the fairness commitment text and safe restore of a saved board. No DOM here.
import type { Locale } from '../../i18n/locales';

export const MAX_TIERS = 26;
export const MAX_TICKETS = 500;
export const MAX_LABEL = 12;
export const MAX_NAME = 40;
export const MAX_TITLE = 40;
export const MAX_PLAYER = 20;

export interface Tier {
  /** Short code shown on the ticket, e.g. 「A賞」. */
  label: string;
  /** Prize description, e.g. 「大型公仔」. Optional. */
  name: string;
  count: number;
}

export interface Setup {
  title: string;
  tiers: Tier[];
  /** Last One prize: goes to whoever draws the final ticket. */
  last: { enabled: boolean; name: string };
  /** Price per draw in the locale currency; 0 = not tracked. */
  price: number;
}

export interface Draw {
  /** 1-based ticket number on the board. */
  ticket: number;
  /** Index into setup.tiers. */
  tier: number;
  player: string;
  /** Epoch milliseconds. */
  at: number;
  /** True on the draw that emptied the board when the Last One prize is on. */
  last?: boolean;
}

export interface Board {
  setup: Setup;
  /** tickets[i] = tier index of ticket number i + 1. */
  tickets: number[];
  /** Random hex string mixed into the commitment so the layout can't be guessed from the hash. */
  salt: string;
  /** Draws in order. */
  draws: Draw[];
  /** True once the remaining layout has been made public. */
  revealed: boolean;
}

/** Uniform integer in [0, n). */
export type RandomInt = (n: number) => number;

// ---------- Random ----------

/** Unbiased crypto-backed integer in [0, n) (rejection sampling). */
export function cryptoInt(n: number): number {
  if (!Number.isInteger(n) || n <= 0) throw new RangeError('n must be a positive integer');
  if (n === 1) return 0;
  const limit = Math.floor(0x1_0000_0000 / n) * n;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % n;
  }
}

export function randomSalt(bytes = 8): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Fisher–Yates shuffle into a new array. */
export function shuffle<T>(items: readonly T[], rand: RandomInt): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------- Setup ----------

/** Tier code for position i in the locale: A賞, B賞… / Prize A… */
export function tierLabel(i: number, locale: Locale): string {
  const letter = String.fromCharCode(65 + (i % 26));
  return locale === 'en' ? `Prize ${letter}` : `${letter}賞`;
}

export function clampInt(value: unknown, min: number, max: number, fallback = min): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max) : '';
}

/** Trim strings, clamp counts and drop tiers beyond the limit. Keeps zero-count tiers (they are skipped on shuffle). */
export function normalizeSetup(raw: Partial<Setup> | null | undefined, locale: Locale): Setup {
  const tiers = Array.isArray(raw?.tiers) ? raw.tiers.slice(0, MAX_TIERS) : [];
  return {
    title: cleanText(raw?.title, MAX_TITLE),
    tiers: tiers.map((t, i) => ({
      label: cleanText(t?.label, MAX_LABEL) || tierLabel(i, locale),
      name: cleanText(t?.name, MAX_NAME),
      count: clampInt(t?.count, 0, MAX_TICKETS, 0),
    })),
    last: { enabled: Boolean(raw?.last?.enabled), name: cleanText(raw?.last?.name, MAX_NAME) },
    price: Math.min(1_000_000, Math.max(0, Number.isFinite(Number(raw?.price)) ? Number(raw?.price) : 0)),
  };
}

export function totalTickets(setup: Setup): number {
  return setup.tiers.reduce((sum, t) => sum + t.count, 0);
}

export type SetupError = 'empty' | 'tooMany' | null;

export function validateSetup(setup: Setup): SetupError {
  const total = totalTickets(setup);
  if (total < 1) return 'empty';
  if (total > MAX_TICKETS) return 'tooMany';
  return null;
}

// ---------- Board ----------

export function createBoard(setup: Setup, rand: RandomInt, salt: string): Board {
  const pool: number[] = [];
  setup.tiers.forEach((t, i) => {
    for (let k = 0; k < t.count; k++) pool.push(i);
  });
  return { setup, tickets: shuffle(pool, rand), salt, draws: [], revealed: false };
}

export function openedSet(board: Board): Set<number> {
  return new Set(board.draws.map((d) => d.ticket));
}

/** 1-based numbers of the tickets still in the box. */
export function remainingTickets(board: Board): number[] {
  const opened = openedSet(board);
  const out: number[] = [];
  for (let n = 1; n <= board.tickets.length; n++) if (!opened.has(n)) out.push(n);
  return out;
}

/** Remaining count per tier. */
export function remainingByTier(board: Board): number[] {
  const left = board.setup.tiers.map((t) => t.count);
  for (const d of board.draws) left[d.tier] = Math.max(0, (left[d.tier] ?? 0) - 1);
  return left;
}

/** Open one ticket. Returns the new draw, or null when the number is invalid or already opened. Mutates board. */
export function drawTicket(board: Board, ticket: number, player: string, at: number): Draw | null {
  if (!Number.isInteger(ticket) || ticket < 1 || ticket > board.tickets.length) return null;
  if (board.draws.some((d) => d.ticket === ticket)) return null;
  const draw: Draw = { ticket, tier: board.tickets[ticket - 1], player: cleanText(player, MAX_PLAYER), at };
  board.draws.push(draw);
  if (board.setup.last.enabled && board.draws.length === board.tickets.length) draw.last = true;
  return draw;
}

/** Draw up to n random tickets from what is left. Mutates board. */
export function drawRandom(board: Board, n: number, player: string, rand: RandomInt, now: () => number): Draw[] {
  const out: Draw[] = [];
  const left = remainingTickets(board);
  const count = Math.min(Math.max(0, Math.floor(n)), left.length);
  for (let i = 0; i < count; i++) {
    const j = rand(left.length);
    const [ticket] = left.splice(j, 1);
    const d = drawTicket(board, ticket, player, now());
    if (d) out.push(d);
  }
  return out;
}

/** Remove the most recent draw (e.g. a mis-tap). Returns it, or null when nothing was drawn. Mutates board. */
export function undoDraw(board: Board): Draw | null {
  return board.draws.pop() ?? null;
}

// ---------- Odds ----------

/** P(at least one of the k wanted tickets in n draws from r left), drawing without replacement. */
export function atLeastOne(r: number, k: number, n: number): number {
  if (k <= 0 || n <= 0 || r <= 0) return 0;
  if (n > r - k) return 1;
  let miss = 1;
  for (let i = 0; i < n; i++) miss *= (r - k - i) / (r - i);
  return 1 - miss;
}

/** Expected number of draws until the first wanted ticket: (r + 1) / (k + 1). */
export function expectedDraws(r: number, k: number): number {
  return k > 0 ? (r + 1) / (k + 1) : Infinity;
}

/** Draws that guarantee at least one wanted ticket in the worst case. */
export function guaranteedDraws(r: number, k: number): number {
  return k > 0 ? r - k + 1 : Infinity;
}

// ---------- Fairness commitment ----------

/**
 * The plain text that is hashed before the first draw. Publishing its SHA-256 up front and the text itself afterwards
 * lets anyone check the layout was fixed in advance (paste the text into any SHA-256 tool).
 */
export function commitmentText(board: Board): string {
  const labels = board.setup.tiers.map((t) => t.label);
  const list = board.tickets.map((tier, i) => `${i + 1}=${labels[tier]}`).join(',');
  return `salt=${board.salt};${list}`;
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------- Players ----------

export interface PlayerSummary {
  player: string;
  draws: number;
  /** Count per tier index. */
  tiers: Map<number, number>;
  last: boolean;
}

/** Group draws by player name in order of first appearance. Unnamed draws group under ''. */
export function summarizePlayers(draws: readonly Draw[]): PlayerSummary[] {
  const map = new Map<string, PlayerSummary>();
  for (const d of draws) {
    let s = map.get(d.player);
    if (!s) {
      s = { player: d.player, draws: 0, tiers: new Map(), last: false };
      map.set(d.player, s);
    }
    s.draws++;
    s.tiers.set(d.tier, (s.tiers.get(d.tier) ?? 0) + 1);
    if (d.last) s.last = true;
  }
  return [...map.values()];
}

// ---------- Restore ----------

/** Validate a board read from storage; returns null when anything is inconsistent. */
export function restoreBoard(raw: unknown, locale: Locale): Board | null {
  if (!raw || typeof raw !== 'object') return null;
  const b = raw as Partial<Board>;
  const setup = normalizeSetup(b.setup, locale);
  if (validateSetup(setup)) return null;
  const total = totalTickets(setup);
  if (!Array.isArray(b.tickets) || b.tickets.length !== total) return null;
  const counts = setup.tiers.map(() => 0);
  for (const t of b.tickets) {
    if (!Number.isInteger(t) || t < 0 || t >= setup.tiers.length) return null;
    counts[t]++;
  }
  if (counts.some((c, i) => c !== setup.tiers[i].count)) return null;
  if (typeof b.salt !== 'string' || !/^[0-9a-f]{8,64}$/.test(b.salt)) return null;
  const board: Board = { setup, tickets: b.tickets.slice(), salt: b.salt, draws: [], revealed: Boolean(b.revealed) };
  if (!Array.isArray(b.draws) || b.draws.length > total) return null;
  for (const d of b.draws) {
    const at = Number(d?.at);
    const draw = drawTicket(board, Number(d?.ticket), typeof d?.player === 'string' ? d.player : '', Number.isFinite(at) ? at : 0);
    if (!draw || draw.tier !== d.tier) return null;
  }
  return board;
}

// ---------- Presets ----------

export type PresetId = 'standard' | 'party' | 'mini';

export interface Preset {
  id: PresetId;
  setup: Setup;
}

type PresetText = { title: string; names: string[]; last: string; price: number };

const PRESET_TEXT: Record<Locale, Record<PresetId, PresetText>> = {
  'zh-TW': {
    standard: {
      title: '一番賞 80 抽',
      names: ['大型公仔', '中型公仔', '迷你公仔', '壓克力立牌', '毛巾', '杯墊', '吊飾'],
      last: '特別色大型公仔',
      price: 350,
    },
    party: {
      title: '聚會自製一番賞',
      names: ['頭獎禮物', '貳獎禮物', '小禮物', '零食一包'],
      last: '神秘大禮',
      price: 0,
    },
    mini: { title: '10 抽小試身手', names: ['大獎', '中獎', '小獎'], last: '', price: 0 },
  },
  en: {
    standard: {
      title: 'Ichiban Kuji · 80 tickets',
      names: ['Large figure', 'Medium figure', 'Mini figure', 'Acrylic stand', 'Towel', 'Coaster', 'Keychain'],
      last: 'Special color large figure',
      price: 10,
    },
    party: {
      title: 'Party prize draw',
      names: ['Grand prize', 'Second prize', 'Small gift', 'Bag of snacks'],
      last: 'Mystery gift',
      price: 0,
    },
    mini: { title: '10-ticket mini draw', names: ['Big prize', 'Medium prize', 'Small prize'], last: '', price: 0 },
  },
  ja: {
    standard: {
      title: '一番くじ 80 枚',
      names: ['大型フィギュア', '中型フィギュア', 'ミニフィギュア', 'アクリルスタンド', 'タオル', 'コースター', 'キーホルダー'],
      last: 'ラストワン賞 特別カラーフィギュア',
      price: 790,
    },
    party: {
      title: 'パーティー手作りくじ',
      names: ['特賞のプレゼント', '2 等のプレゼント', 'プチギフト', 'お菓子'],
      last: 'ひみつの景品',
      price: 0,
    },
    mini: { title: '10 枚のミニくじ', names: ['大当たり', '中当たり', '小当たり'], last: '', price: 0 },
  },
};

const PRESET_COUNTS: Record<PresetId, number[]> = {
  standard: [1, 2, 3, 6, 12, 20, 36],
  party: [1, 2, 5, 22],
  mini: [1, 2, 7],
};

export const PRESET_IDS: PresetId[] = ['standard', 'party', 'mini'];

export function presetsFor(locale: Locale): Preset[] {
  return PRESET_IDS.map((id) => {
    const text = PRESET_TEXT[locale][id];
    return {
      id,
      setup: {
        title: text.title,
        tiers: PRESET_COUNTS[id].map((count, i) => ({ label: tierLabel(i, locale), name: text.names[i] ?? '', count })),
        last: { enabled: text.last !== '', name: text.last },
        price: text.price,
      },
    };
  });
}

// ---------- Presentation ----------

const TIER_HUES = [43, 356, 214, 150, 278, 24, 186, 330, 96, 250];

/** Stable tier color: gold for A, then red, blue, green… (hsl for older browsers). */
export function tierColor(i: number): { bg: string; fg: string } {
  if (i === 0) return { bg: 'hsl(43 92% 56%)', fg: '#3a2600' };
  const hue = TIER_HUES[i % TIER_HUES.length];
  const light = i >= TIER_HUES.length ? 36 : 46;
  return { bg: `hsl(${hue} 62% ${light}%)`, fg: '#ffffff' };
}
