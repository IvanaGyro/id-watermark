// Browser-only: a short burst of paper confetti on a canvas, fired from both lower corners.
// The caller skips it when the visitor prefers reduced motion.

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  tilt: number;
  color: string;
  shape: number;
  delay: number;
}

/** Start the burst; returns a function that stops it and clears the canvas. */
export function confetti(canvas: HTMLCanvasElement, colors: string[], durationMs = 4800): () => void {
  const g = canvas.getContext('2d');
  if (!g) return () => {};
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(rect.width * dpr));
  canvas.height = Math.max(1, Math.round(rect.height * dpr));
  const w = canvas.width;
  const h = canvas.height;
  const scale = Math.max(0.7, Math.min(1.4, rect.width / 500)) * dpr;

  const pieces: Piece[] = Array.from({ length: 170 }, (_, i) => {
    const left = i % 2 === 0;
    return {
      x: left ? w * 0.04 : w * 0.96,
      y: h * 0.78,
      vx: (left ? 1 : -1) * (2.5 + Math.random() * 8) * scale,
      vy: -(9 + Math.random() * 10) * scale,
      size: (5 + Math.random() * 6) * scale,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      tilt: Math.random() * Math.PI * 2,
      color: colors[i % colors.length],
      shape: i % 3,
      delay: Math.random() * 350,
    };
  });

  const start = performance.now();
  let last = start;
  let raf = 0;
  const gravity = 0.3 * scale;

  function frame(now: number) {
    const step = Math.min(3, (now - last) / 16.7);
    last = now;
    const elapsed = now - start;
    g!.clearRect(0, 0, w, h);
    g!.globalAlpha = elapsed > durationMs - 900 ? Math.max(0, (durationMs - elapsed) / 900) : 1;
    for (const p of pieces) {
      if (elapsed < p.delay) continue;
      p.vy = Math.min(p.vy + gravity * step, 3.2 * scale);
      p.vx *= 0.985 ** step;
      p.x += p.vx * step + Math.sin(elapsed / 260 + p.tilt) * 0.7 * scale;
      p.y += p.vy * step;
      p.angle += p.spin * step;
      if (p.y > h + 20) continue;
      // Paper turning over: squash one axis with a cosine.
      const flip = Math.abs(Math.cos(elapsed / 180 + p.tilt));
      g!.save();
      g!.translate(p.x, p.y);
      g!.rotate(p.angle);
      g!.fillStyle = p.color;
      if (p.shape === 0) g!.fillRect(-p.size / 2, (-p.size * flip) / 2, p.size, p.size * flip);
      else if (p.shape === 1) {
        g!.beginPath();
        g!.ellipse(0, 0, p.size * 0.45, p.size * 0.45 * flip + 0.5, 0, 0, Math.PI * 2);
        g!.fill();
      } else g!.fillRect(-p.size * 0.9, (-p.size * 0.22 * flip) - 0.5, p.size * 1.8, p.size * 0.44 * flip + 1);
      g!.restore();
    }
    if (elapsed < durationMs) raf = requestAnimationFrame(frame);
    else g!.clearRect(0, 0, w, h);
  }
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    g.clearRect(0, 0, w, h);
  };
}
