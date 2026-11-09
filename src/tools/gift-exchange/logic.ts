// Gift exchange draw. Pure, DOM-free: the name list, who may not draw whom, the draw itself,
// the state of a live draw and the personal link format. The scratch layer comes from scratch-card.
//
// Link format: <page URL>#gift=<base64url(UTF-8 JSON)>. A link holds only its owner's name and result,
// so opening one link never exposes anyone else's. Everything after # stays in the browser.
import { cleanLine, fromBase64Url, randomIndex, toBase64Url, type RandomSource } from '../scratch-card/logic';

export type { RandomSource };

const defaultRandom: RandomSource = (array) => {
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

export const FORMAT_VERSION = 1;
/** Only fragments that start with this are invites; other anchors (#faq …) are ignored. */
export const FRAGMENT_KEY = 'gift=';

/** Limits in code points (an emoji or a CJK character counts as one). */
export const LIMITS = {
  name: 20,
  minNames: 3,
  maxNames: 100,
  title: 30,
  budget: 20,
  note: 100,
  /** Longest fragment accepted when decoding (characters after #). A full legit invite is under 1,200. */
  fragment: 2048,
} as const;

export const MODES = ['link', 'pass', 'stage'] as const;
export type Mode = (typeof MODES)[number];
export const isMode = (v: unknown): v is Mode => typeof v === 'string' && (MODES as readonly string[]).includes(v);

/** Two people who must not draw each other, by name so the pair survives edits to the list. */
export type Pair = [string, string];

export interface Details {
  title: string;
  budget: string;
  /** YYYY-MM-DD or empty. */
  date: string;
  note: string;
}

export const EMPTY_DETAILS: Details = { title: '', budget: '', date: '', note: '' };

/* ---------- Names ---------- */

// Spaces are not separators: 'Mary Jane' is one person.
const NAME_SEPARATORS = /\r\n|\r|\n|[,，、;；]/;

export function parseNames(text: string): string[] {
  return text
    .split(NAME_SEPARATORS)
    .map((name) => cleanLine(name, LIMITS.name))
    .filter(Boolean);
}

/** Names count as the same when they differ only in case or full-width forms. */
const nameKey = (name: string) => name.normalize('NFKC').toLowerCase();

/** Each name that appears more than once, as first typed. */
export function duplicateNames(names: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Map<string, string>();
  for (const name of names) {
    const key = nameKey(name);
    if (seen.has(key) && !repeated.has(key)) repeated.set(key, name);
    seen.add(key);
  }
  return [...repeated.values()];
}

export type NamesError = 'few' | 'many' | 'duplicate' | null;

export function checkNames(names: string[]): NamesError {
  if (names.length < LIMITS.minNames) return 'few';
  if (names.length > LIMITS.maxNames) return 'many';
  return duplicateNames(names).length ? 'duplicate' : null;
}

/** Pairs whose two names are both on the list and different. Order and repeats are ignored. */
export function activePairs(names: string[], pairs: Pair[]): [number, number][] {
  const index = new Map(names.map((name, i) => [nameKey(name), i]));
  const seen = new Set<string>();
  const out: [number, number][] = [];
  for (const [a, b] of pairs) {
    const i = index.get(nameKey(a));
    const j = index.get(nameKey(b));
    if (i === undefined || j === undefined || i === j) continue;
    const id = i < j ? `${i}:${j}` : `${j}:${i}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push([i, j]);
  }
  return out;
}

/* ---------- The draw ---------- */

/** Fisher–Yates with an unbiased source: every order is equally likely. */
export function shuffled<T>(items: readonly T[], random: RandomSource = defaultRandom): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** blocked[i][j]: person i may not draw person j. Nobody may draw themselves. */
function blockedTable(count: number, pairs: [number, number][]): boolean[][] {
  const table = range(count).map((i) => range(count).map((j) => i === j));
  for (const [a, b] of pairs) {
    table[a][b] = true;
    table[b][a] = true;
  }
  return table;
}

/**
 * A valid assignment by augmenting paths (bipartite matching), or null when none exists.
 * With `random` it visits people in shuffled order, so the answer varies but is not perfectly uniform.
 */
function findAssignment(blocked: boolean[][], random?: RandomSource): number[] | null {
  const n = blocked.length;
  const order = () => (random ? shuffled(range(n), random) : range(n));
  const holder = new Array<number>(n).fill(-1);

  const place = (person: number, seen: boolean[]): boolean => {
    for (const target of order()) {
      if (blocked[person][target] || seen[target]) continue;
      seen[target] = true;
      if (holder[target] < 0 || place(holder[target], seen)) {
        holder[target] = person;
        return true;
      }
    }
    return false;
  };

  for (const person of order()) {
    if (!place(person, new Array<boolean>(n).fill(false))) return null;
  }
  const targets = new Array<number>(n);
  holder.forEach((person, target) => (targets[person] = target));
  return targets;
}

/** Plenty for normal lists: about 37% of random orders already leave nobody with themselves. */
const MAX_SHUFFLES = 5000;

/**
 * targets[i] is the person i draws, or null when the pairs leave no way to serve everyone.
 * Reshuffling until an order is valid makes every valid result equally likely. Only a list so
 * constrained that reshuffling keeps missing falls back to a randomized search.
 */
export function drawTargets(count: number, pairs: [number, number][] = [], random: RandomSource = defaultRandom): number[] | null {
  const blocked = blockedTable(count, pairs);
  if (!findAssignment(blocked)) return null;
  const people = range(count);
  for (let attempt = 0; attempt < MAX_SHUFFLES; attempt++) {
    const targets = shuffled(people, random);
    if (targets.every((target, person) => !blocked[person][target])) return targets;
  }
  return findAssignment(blocked, random);
}

/* ---------- A draw in progress ---------- */

export interface Session {
  mode: Mode;
  names: string[];
  /** targets[i] is the person i draws. */
  targets: number[];
  /** Live modes: who still has to draw, next person first. */
  queue: number[];
  /** Live modes: who has drawn, in order. */
  drawn: number[];
  /** Link mode: whose link has been copied or shared. */
  sent: number[];
  details: Details;
}

export function startSession(
  mode: Mode,
  names: string[],
  pairs: Pair[],
  details: Details,
  random: RandomSource = defaultRandom,
): Session | null {
  const targets = drawTargets(names.length, activePairs(names, pairs), random);
  if (!targets) return null;
  const queue = mode === 'link' ? [] : shuffled(range(names.length), random);
  return { mode, names: [...names], targets, queue, drawn: [], sent: [], details: normalizeDetails(details) };
}

/** The person at the front has seen their result. */
export function finishTurn(session: Session): Session {
  if (session.queue.length === 0) return session;
  const [person, ...queue] = session.queue;
  return { ...session, queue, drawn: [...session.drawn, person] };
}

/** The person at the front is away: move them to the back. */
export function skipTurn(session: Session): Session {
  if (session.queue.length < 2) return session;
  const [person, ...queue] = session.queue;
  return { ...session, queue: [...queue, person] };
}

export const isFinished = (session: Session): boolean => session.mode !== 'link' && session.queue.length === 0;

export function markSent(session: Session, person: number): Session {
  return session.sent.includes(person) ? session : { ...session, sent: [...session.sent, person] };
}

/** Everyone's result: those who drew first, in order, then anyone left. */
export function resultRows(session: Session): { from: string; to: string }[] {
  const left = session.names.map((_, i) => i).filter((i) => !session.drawn.includes(i));
  return [...session.drawn, ...left].map((i) => ({ from: session.names[i], to: session.names[session.targets[i]] }));
}

const isIntList = (v: unknown, n: number): v is number[] =>
  Array.isArray(v) && v.every((x) => Number.isInteger(x) && x >= 0 && x < n);

/** Validates a session read from localStorage; anything inconsistent is dropped rather than repaired. */
export function normalizeSession(raw: unknown): Session | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (!isMode(o.mode) || !Array.isArray(o.names)) return null;
  const names = o.names.filter((name): name is string => typeof name === 'string');
  if (names.length !== o.names.length || checkNames(names) !== null) return null;
  const n = names.length;
  if (!isIntList(o.targets, n) || o.targets.length !== n) return null;
  if (new Set(o.targets).size !== n || o.targets.some((target, person) => target === person)) return null;
  if (!isIntList(o.queue, n) || !isIntList(o.drawn, n)) return null;
  const turns = [...o.queue, ...o.drawn];
  if (new Set(turns).size !== turns.length || turns.length !== (o.mode === 'link' ? 0 : n)) return null;
  const sent = isIntList(o.sent, n) ? [...new Set(o.sent)] : [];
  return { mode: o.mode, names, targets: o.targets, queue: o.queue, drawn: o.drawn, sent, details: normalizeDetails(o.details) };
}

/* ---------- Details ---------- */

export function cleanDate(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) ? value : '';
}

export function normalizeDetails(raw: unknown): Details {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const line = (v: unknown, max: number) => (typeof v === 'string' ? cleanLine(v, max) : '');
  return {
    title: line(o.title, LIMITS.title),
    budget: line(o.budget, LIMITS.budget),
    date: cleanDate(o.date),
    note: line(o.note, LIMITS.note),
  };
}

/* ---------- Form draft ---------- */

export interface Draft {
  namesText: string;
  mode: Mode;
  pairs: Pair[];
  details: Details;
}

/** Validates a draft read from localStorage, keeping what the visitor typed as far as possible. */
export function normalizeDraft(raw: unknown): Draft {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const pairs = Array.isArray(o.pairs)
    ? o.pairs
        .filter((p): p is Pair => Array.isArray(p) && p.length === 2 && p.every((name) => typeof name === 'string'))
        .map(([a, b]): Pair => [cleanLine(a, LIMITS.name), cleanLine(b, LIMITS.name)])
    : [];
  return {
    namesText: typeof o.namesText === 'string' ? o.namesText.slice(0, 8000) : '',
    mode: isMode(o.mode) ? o.mode : 'link',
    pairs,
    details: normalizeDetails(o.details),
  };
}

/* ---------- Personal links ---------- */

export interface Invite {
  name: string;
  target: string;
  details: Details;
}

export function sessionInvite(session: Session, person: number): Invite {
  return { name: session.names[person], target: session.names[session.targets[person]], details: session.details };
}

/** The fragment for an invite, without the leading '#': 'gift=eyJ2Ijox…'. */
export function encodeInvite(invite: Invite): string {
  const wire: Record<string, string | number> = { v: FORMAT_VERSION, n: invite.name, r: invite.target };
  if (invite.details.title) wire.t = invite.details.title;
  if (invite.details.budget) wire.b = invite.details.budget;
  if (invite.details.date) wire.d = invite.details.date;
  if (invite.details.note) wire.m = invite.details.note;
  return FRAGMENT_KEY + toBase64Url(new TextEncoder().encode(JSON.stringify(wire)));
}

/** Page URL without any fragment + '#gift=…'. */
export function inviteUrl(pageUrl: string, invite: Invite): string {
  const cut = pageUrl.indexOf('#');
  return `${cut < 0 ? pageUrl : pageUrl.slice(0, cut)}#${encodeInvite(invite)}`;
}

export type DecodeResult = { status: 'none' } | { status: 'invalid' } | { status: 'ok'; invite: Invite };

const INVALID: DecodeResult = { status: 'invalid' };

/**
 * Reads an invite from a location hash. Never throws: anything that is not a well-formed v1 invite
 * is 'invalid'; a fragment that is not an invite is 'none'.
 */
export function decodeInvite(hash: string): DecodeResult {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw.startsWith(FRAGMENT_KEY)) return { status: 'none' };
  const payload = raw.slice(FRAGMENT_KEY.length);
  if (payload.length === 0 || raw.length > LIMITS.fragment) return INVALID;
  const bytes = fromBase64Url(payload);
  if (!bytes) return INVALID;

  let data: unknown;
  try {
    data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return INVALID;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return INVALID;
  const w = data as Record<string, unknown>;
  if (w.v !== FORMAT_VERSION || typeof w.n !== 'string' || typeof w.r !== 'string') return INVALID;

  const name = cleanLine(w.n, LIMITS.name);
  const target = cleanLine(w.r, LIMITS.name);
  if (!name || !target || nameKey(name) === nameKey(target)) return INVALID;
  return { status: 'ok', invite: { name, target, details: normalizeDetails({ title: w.t, budget: w.b, date: w.d, note: w.m }) } };
}
