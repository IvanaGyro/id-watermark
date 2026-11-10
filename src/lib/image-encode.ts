/** Reusable local image encoder. One Worker / one Wasm runtime per export batch.
 * Release it before making the ZIP so the libaom heap is no longer resident.
 */
export class ImageEncoderSession {
  private worker: Worker | null = null;
  private pending: { resolve: (blob: Blob) => void; reject: (error: Error) => void } | null = null;
  private closed = false;

  async encode(
    canvas: HTMLCanvasElement,
    format: 'png' | 'avif',
    quality: number,
    pngLevel: number,
  ): Promise<Blob> {
    if (this.closed) throw new Error('Image encoder session is closed');
    if (this.pending) throw new Error('Image encoder is already processing an image');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas 2D unavailable');
    const { width, height } = canvas;
    const pixels = context.getImageData(0, 0, width, height).data.buffer as ArrayBuffer;

    if (!this.worker) {
      this.worker = new Worker(new URL('./image-encode.worker.ts', import.meta.url), { type: 'module' });
      this.worker.onmessage = (event: MessageEvent<{ ok: boolean; buffer?: ArrayBuffer; error?: string }>) => {
        const job = this.pending;
        this.pending = null;
        if (!job) return;
        if (!event.data.ok || !event.data.buffer) {
          job.reject(new Error(event.data.error ?? 'Image encoder returned no output'));
        } else {
          job.resolve(new Blob([event.data.buffer], { type: format === 'png' ? 'image/png' : 'image/avif' }));
        }
      };
      this.worker.onerror = (error) => {
        const job = this.pending;
        this.pending = null;
        job?.reject(new Error(`Image encoder worker failed: ${error.message}`));
        this.close();
      };
      this.worker.onmessageerror = () => {
        const job = this.pending;
        this.pending = null;
        job?.reject(new Error('Image encoder worker sent an unreadable response'));
        this.close();
      };
    }

    return new Promise<Blob>((resolve, reject) => {
      this.pending = { resolve, reject };
      try {
        this.worker!.postMessage({ width, height, pixels, format, quality, pngLevel }, [pixels]);
      } catch (error) {
        this.pending = null;
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.worker?.terminate();
    this.worker = null;
    if (this.pending) {
      this.pending.reject(new Error('Image encoding was cancelled'));
      this.pending = null;
    }
  }
}
