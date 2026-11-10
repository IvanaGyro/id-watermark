// Minimal ZIP writer (STORE method, no compression). PDF / JPG / PNG output is
// already compressed, so deflating again would only cost time. Used to offer a
// single "download all" file instead of dozens of separate downloads, which
// browsers block or prompt for. Pure and DOM-free so it can be tested in node.

export interface ZipEntry {
  name: string;
  data: Uint8Array;
}

let crcTable: Uint32Array | null = null;

function table(): Uint32Array {
  if (crcTable) return crcTable;
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  crcTable = t;
  return t;
}

export function crc32(data: Uint8Array): number {
  const t = table();
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) crc = t[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** MS-DOS date/time fields used by ZIP headers (local time, 2-second resolution). */
export function dosDateTime(date: Date): { time: number; date: number } {
  const year = Math.min(Math.max(date.getFullYear(), 1980), 2107);
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

/** a.pdf, a.pdf → a.pdf, a (2).pdf — a ZIP with duplicate names extracts badly. */
export function uniqueNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    let candidate = name;
    const dot = name.lastIndexOf('.');
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : '';
    for (let i = 2; used.has(candidate.toLowerCase()); i++) candidate = `${base} (${i})${ext}`;
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

export function createZip(entries: ZipEntry[], now: Date = new Date()): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const { time, date } = dosDateTime(now);
  const names = uniqueNames(entries.map((e) => e.name)).map((n) => encoder.encode(n));
  const crcs = entries.map((e) => crc32(e.data));

  let localSize = 0;
  for (let i = 0; i < entries.length; i++) localSize += 30 + names[i].length + entries[i].data.length;
  let centralSize = 0;
  for (const n of names) centralSize += 46 + n.length;

  const out = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(out.buffer);
  const offsets: number[] = [];
  let p = 0;

  // Version 20, flag bit 11 = file names are UTF-8 (needed for Chinese names), method 0 = store.
  for (let i = 0; i < entries.length; i++) {
    const data = entries[i].data;
    offsets.push(p);
    view.setUint32(p, 0x04034b50, true);
    view.setUint16(p + 4, 20, true);
    view.setUint16(p + 6, 0x0800, true);
    view.setUint16(p + 8, 0, true);
    view.setUint16(p + 10, time, true);
    view.setUint16(p + 12, date, true);
    view.setUint32(p + 14, crcs[i], true);
    view.setUint32(p + 18, data.length, true);
    view.setUint32(p + 22, data.length, true);
    view.setUint16(p + 26, names[i].length, true);
    view.setUint16(p + 28, 0, true);
    out.set(names[i], p + 30);
    out.set(data, p + 30 + names[i].length);
    p += 30 + names[i].length + data.length;
  }

  const centralStart = p;
  for (let i = 0; i < entries.length; i++) {
    const size = entries[i].data.length;
    view.setUint32(p, 0x02014b50, true);
    view.setUint16(p + 4, 20, true);
    view.setUint16(p + 6, 20, true);
    view.setUint16(p + 8, 0x0800, true);
    view.setUint16(p + 10, 0, true);
    view.setUint16(p + 12, time, true);
    view.setUint16(p + 14, date, true);
    view.setUint32(p + 16, crcs[i], true);
    view.setUint32(p + 20, size, true);
    view.setUint32(p + 24, size, true);
    view.setUint16(p + 28, names[i].length, true);
    // extra length, comment length, disk number, internal attrs, external attrs: all 0
    view.setUint32(p + 42, offsets[i], true);
    out.set(names[i], p + 46);
    p += 46 + names[i].length;
  }

  view.setUint32(p, 0x06054b50, true);
  view.setUint16(p + 8, entries.length, true);
  view.setUint16(p + 10, entries.length, true);
  view.setUint32(p + 12, p - centralStart, true);
  view.setUint32(p + 16, centralStart, true);
  return out;
}
