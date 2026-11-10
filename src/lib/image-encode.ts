/** Strictly local encoders. No server uploads or remote service fallback. */
export function encodeAdvanced(
  canvas: HTMLCanvasElement,
  format: 'png' | 'avif',
  quality: number,
  pngLevel: number,
): Promise<Blob> {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return Promise.reject(new Error('Canvas 2D unavailable'));
  const { width, height } = canvas;
  const data = context.getImageData(0, 0, width, height);
  const pixels = data.data.buffer as ArrayBuffer;
  return new Promise<Blob>((resolve, reject) => {
    const worker = new Worker(new URL('./image-encode.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<{ ok: boolean; buffer?: ArrayBuffer; error?: string }>) => {
      worker.terminate();
      if (!event.data.ok || !event.data.buffer) {
        reject(new Error(event.data.error ?? 'Image encoder returned no output'));
        return;
      }
      resolve(new Blob([event.data.buffer], { type: format === 'png' ? 'image/png' : 'image/avif' }));
    };
    worker.onerror = (error) => {
      worker.terminate();
      reject(new Error(`Image encoder worker failed: ${error.message}`));
    };
    try {
      worker.postMessage({ width, height, pixels, format, quality, pngLevel }, [pixels]);
    } catch (error) {
      worker.terminate();
      reject(error);
    }
  });
}
