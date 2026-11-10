import { describe, expect, it } from 'vitest';
import { createZip, createZipBlob } from './zip';

describe('streaming ZIP assembly', () => {
  const now = new Date(2026, 10, 10, 9, 30, 4);
  const bytes = (value: string) => new TextEncoder().encode(value);

  it('is byte-identical to the upstream ZIP writer, including CRC and central directory', async () => {
    const entries = [
      { name: '證件-watermark.avif', data: bytes('pretend AVIF data with contents') },
      { name: '證件-watermark.avif', data: bytes('another file with the same filename') },
      { name: 'JPEG sample.jpg', data: new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 0xff, 0xd9]) },
    ];
    const reference = createZip(entries, now);
    const result = await createZipBlob(entries.map(({ name, data }) => ({
      name,
      blob: new Blob([data]),
    })), now);
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(reference);
  });

  it('produces the same valid empty ZIP', async () => {
    const result = await createZipBlob([], now);
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(createZip([], now));
  });
});
