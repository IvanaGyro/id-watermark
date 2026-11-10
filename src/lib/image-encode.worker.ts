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
          speed: 0,
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
