// Browser-only: plays "Happy Birthday to You" (the melody is in the public domain) with Web Audio,
// a soft music-box tone over bass notes. Only called after a user gesture has unlocked the AudioContext.
import { BASS, MELODY, midiToHz, schedule, totalBeats } from './logic';

export interface SongHandle {
  stop(): void;
  /** AudioContext time when the last note has faded. */
  endsAt: number;
}

function tone(ctx: AudioContext, out: AudioNode, hz: number, at: number, duration: number, peak: number, type: OscillatorType): void {
  const env = ctx.createGain();
  const hold = Math.min(duration, 0.35);
  const end = at + Math.max(0.12, duration * 0.95);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(peak, at + 0.015);
  env.gain.exponentialRampToValueAtTime(peak * 0.35, at + hold);
  env.gain.exponentialRampToValueAtTime(0.0001, end + 0.25);
  env.connect(out);

  const base = ctx.createOscillator();
  base.type = type;
  base.frequency.value = hz;
  base.connect(env);
  // A quiet octave on top gives the bell-like shimmer of a music box.
  const shimmer = ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = hz * 2;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.18;
  shimmer.connect(shimmerGain).connect(env);

  base.start(at);
  shimmer.start(at);
  base.stop(end + 0.3);
  shimmer.stop(end + 0.3);
  base.onended = () => env.disconnect();
}

export function playSong(ctx: AudioContext, { bpm = 112, volume = 0.5 } = {}): SongHandle {
  const master = ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  const t0 = ctx.currentTime + 0.08;
  const beat = 60 / bpm;
  for (const note of schedule(MELODY, bpm)) tone(ctx, master, note.hz, t0 + note.start, note.duration, 0.32, 'triangle');
  for (const note of BASS) tone(ctx, master, midiToHz(note.midi), t0 + note.at * beat, note.beats * beat, 0.16, 'sine');
  let stopped = false;
  return {
    endsAt: t0 + totalBeats(MELODY) * beat + 0.6,
    stop() {
      if (stopped) return;
      stopped = true;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.08);
      window.setTimeout(() => master.disconnect(), 150);
    },
  };
}
