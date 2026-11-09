// Browser-only: short sound effects synthesised with Web Audio, so no licensed audio is involved.
// The context starts on the first tap, because browsers keep audio locked until a user gesture.

type Sound = (ctx: BaseAudioContext, out: AudioNode, at: number) => void;

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
}

/** One pitched note with a fast attack and an exponential fade. */
function tone(ctx: BaseAudioContext, out: AudioNode, hz: number, at: number, length: number, peak: number, type: OscillatorType = 'sine', glideTo = hz): void {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(peak, at + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  env.connect(out);
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(hz, at);
  if (glideTo !== hz) osc.frequency.exponentialRampToValueAtTime(glideTo, at + length);
  osc.connect(env);
  osc.start(at);
  osc.stop(at + length + 0.02);
  osc.onended = () => env.disconnect();
}

/** A burst of filtered noise; the filter can sweep from one frequency to another. */
function hiss(ctx: BaseAudioContext, out: AudioNode, at: number, length: number, peak: number, hz: number, sweepTo = hz, q = 1, attack = 0.006): void {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(peak, at + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  env.connect(out);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(hz, at);
  if (sweepTo !== hz) filter.frequency.exponentialRampToValueAtTime(sweepTo, at + length);
  filter.connect(env);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.connect(filter);
  source.start(at, Math.random() * 0.8, length + 0.02);
  source.onended = () => env.disconnect();
}

/** A sine note with a quiet inharmonic partial, which is what makes a tone read as a bell. */
function bell(ctx: BaseAudioContext, out: AudioNode, hz: number, at: number, length: number, peak: number): void {
  tone(ctx, out, hz, at, length, peak);
  tone(ctx, out, hz * 2.76, at, length * 0.45, peak * 0.22);
}

/** Times follow the box's shake in Tool.astro: 0.65s, swinging at 15%, 35%, 55% and 75%. */
const RATTLES = [0.1, 0.23, 0.36, 0.49];

export const SOUNDS = {
  /** Tapping a box on the board. */
  pick(ctx, out, at) {
    tone(ctx, out, 420, at, 0.11, 0.32, 'triangle', 680);
  },
  /** The box rattling in place, as if something were inside it. */
  shake(ctx, out, at) {
    for (const offset of RATTLES) {
      tone(ctx, out, 150, at + offset, 0.09, 0.3, 'sine', 95);
      hiss(ctx, out, at + offset, 0.06, 0.2, 1500, 1500, 0.8);
    }
  },
  /** The lid lifting off, with a little sparkle at the top. */
  open(ctx, out, at) {
    hiss(ctx, out, at, 0.36, 0.46, 450, 3200, 1.1, 0.14);
    bell(ctx, out, 1568, at + 0.24, 0.3, 0.18);
    bell(ctx, out, 2093, at + 0.32, 0.38, 0.18);
  },
  /** One stroke of a coin on the card; called repeatedly while scratching. */
  scratch(ctx, out, at) {
    hiss(ctx, out, at, 0.075, 0.24, 2800 + Math.random() * 1400, 2800 + Math.random() * 1400, 0.7, 0.004);
  },
  /** The result showing: a rising run of bells. */
  reveal(ctx, out, at) {
    [1047, 1319, 1568, 2093].forEach((hz, i) => bell(ctx, out, hz, at + i * 0.085, i === 3 ? 0.85 : 0.5, 0.2));
  },
  /** Everyone has drawn: a short fanfare ending on a held chord. */
  finish(ctx, out, at) {
    [784, 1047, 1319].forEach((hz, i) => tone(ctx, out, hz, at + i * 0.13, 0.26, 0.2, 'triangle'));
    for (const hz of [1047, 1319, 1568]) tone(ctx, out, hz, at + 0.39, 1.15, 0.15, 'triangle');
    tone(ctx, out, 523, at + 0.39, 1.15, 0.16);
    bell(ctx, out, 2093, at + 0.39, 1.1, 0.12);
  },
} satisfies Record<string, Sound>;

export type SoundName = keyof typeof SOUNDS;

const LEVEL = 1;

export class GiftSounds {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private on: boolean;

  constructor(on: boolean) {
    this.on = on;
  }

  get enabled(): boolean {
    return this.on;
  }

  /** Muting also silences anything still ringing. */
  setEnabled(on: boolean): void {
    this.on = on;
    if (this.master) this.master.gain.value = on ? LEVEL : 0;
  }

  play(name: SoundName): void {
    if (!this.on) return;
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = LEVEL;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      SOUNDS[name](this.ctx, this.master!, this.ctx.currentTime + 0.005);
    } catch {
      /* audio unavailable */
    }
  }
}
