import encodeAvif from '@jsquash/avif/encode';
import optimisePng from '@jsquash/oxipng/optimise';

type Request = {
  width: number;
  height: number;
  pixels: ArrayBuffer;
  format: 'png' | 'avif';
  quality: number;
  pngLevel: number;
  avifLevel: number;
};

self.addEventListener('message', async (event: MessageEvent<Request>) => {
  try {
    const { width, height, pixels, format, quality, pngLevel, avifLevel } = event.data;
    const image = new ImageData(new Uint8ClampedArray(pixels), width, height);
    const result = format === 'png'
      ? await optimisePng(image, { level: pngLevel, interlace: false, optimiseAlpha: false })
      : await encodeAvif(image, {
          // At 100, jSquash/libavif enables quantizer-zero, YUV444 and identity
          // RGB matrix coefficients for a genuinely lossless 8-bit encode.
          quality: Math.min(100, Math.max(1, Math.round(quality))),
          lossless: quality >= 100,
          subsample: quality >= 100 ? 3 : 1,
          // User-facing compression level increases effort (opposite to libaom speed).
          // Level 6 preserves the previous libaom speed=4 default.
          speed: 10 - Math.min(10, Math.max(0, Math.round(avifLevel))),
          bitDepth: 8,
        });
    const bytes = result.slice(0);
    self.postMessage({ ok: true, buffer: bytes }, { transfer: [bytes] });
  } catch (error) {
    self.postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});
