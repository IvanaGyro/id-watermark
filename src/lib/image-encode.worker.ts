import encodeAvif from '@jsquash/avif/encode';
import optimisePng from '@jsquash/oxipng/optimise';

type Request = {
  width: number;
  height: number;
  pixels: ArrayBuffer;
  format: 'png' | 'avif';
  quality: number;
  pngLevel: number;
};

self.addEventListener('message', async (event: MessageEvent<Request>) => {
  try {
    const { width, height, pixels, format, quality, pngLevel } = event.data;
    const image = new ImageData(new Uint8ClampedArray(pixels), width, height);
    const result = format === 'png'
      ? await optimisePng(image, { level: pngLevel, interlace: false, optimiseAlpha: false })
      : await encodeAvif(image, {
          quality: Math.min(99, Math.max(1, Math.round(quality))),
          // libaom is kept as the high-efficiency encoder. Speed 0 is impractically
          // slow in browser Wasm (over 4 minutes for a 1024px image in Firefox).
          // Speed 4 balances compression efficiency and usable runtime.
          speed: 4,
          subsample: 1,
          lossless: false,
          bitDepth: 8,
        });
    const bytes = result.slice(0);
    self.postMessage({ ok: true, buffer: bytes }, { transfer: [bytes] });
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});
