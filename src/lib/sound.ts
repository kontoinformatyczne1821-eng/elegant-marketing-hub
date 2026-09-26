/* Dźwięki interfejsu QRAFT.
   Wszystko syntezowane w Web Audio — zero plików, zero zależności.
   Kontekst audio powstaje dopiero przy pierwszym geście użytkownika
   (wymóg przeglądarek: autoplay działa tylko po interakcji). */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let muted = false;
let ready = false;

const VOLUME = 0.16;

function build(): boolean {
  if (typeof window === "undefined") return false;
  if (ready && ctx) return true;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return false;
  ctx = new Ctor();

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 6;
  comp.attack.value = 0.003;
  comp.release.value = 0.18;

  master = ctx.createGain();
  master.gain.value = muted ? 0 : VOLUME;
  master.connect(comp);
  comp.connect(ctx.destination);

  // szum dla „whoosha” i subtelnych trzasków
  const len = Math.floor(ctx.sampleRate * 1.2);
  noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  ready = true;
  return true;
}

/** Wywołaj przy pierwszym geście — odblokowuje kontekst audio. */
export function unlockAudio(): void {
  if (!build() || !ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
  if (master && ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(next ? 0 : VOLUME, ctx.currentTime, 0.05);
  }
}

type ToneOpts = {
  freq: number;
  to?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  delay?: number;
};

function tone({ freq, to, dur = 0.18, gain = 0.5, type = "sine", delay = 0 }: ToneOpts): void {
  if (!build() || !ctx || !master) return;
  const t0 = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + dur);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur * 0.2));
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(env);
  env.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

type NoiseOpts = {
  dur?: number;
  gain?: number;
  from?: number;
  to?: number;
  q?: number;
  delay?: number;
};

function noise({ dur = 0.25, gain = 0.3, from = 400, to = 2600, q = 1.1, delay = 0 }: NoiseOpts): void {
  if (!build() || !ctx || !master || !noiseBuffer) return;
  const t0 = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur);
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + dur * 0.35);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(env);
  env.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/* ------------------------------------------------------------- głosy UI */

/** delikatny trzask: kafel, kafelek, drobny element */
export function sfxTap(): void {
  noise({ dur: 0.06, gain: 0.16, from: 1800, to: 3200, q: 2.2 });
  tone({ freq: 880, to: 660, dur: 0.07, gain: 0.12, type: "triangle" });
}

/** potwierdzenie wyboru: miękki akord w górę */
export function sfxConfirm(): void {
  tone({ freq: 523.25, dur: 0.24, gain: 0.16, type: "sine" });
  tone({ freq: 783.99, dur: 0.26, gain: 0.11, type: "sine", delay: 0.045 });
  tone({ freq: 1046.5, dur: 0.3, gain: 0.07, type: "sine", delay: 0.09 });
  noise({ dur: 0.2, gain: 0.05, from: 600, to: 3200, delay: 0.02 });
}

/** „pop” przy przełączeniu paska (termin / poziom) */
export function sfxPop(): void {
  tone({ freq: 420, to: 1040, dur: 0.13, gain: 0.15, type: "sine" });
  noise({ dur: 0.09, gain: 0.07, from: 1200, to: 3400, q: 1.6 });
}

/** rozsuwane przejście: otwarcie w górę, zamknięcie w dół */
export function sfxWhoosh(open = true): void {
  if (open) {
    noise({ dur: 0.3, gain: 0.16, from: 300, to: 2800, q: 0.9 });
    tone({ freq: 160, to: 420, dur: 0.26, gain: 0.09, type: "sine" });
  } else {
    noise({ dur: 0.26, gain: 0.13, from: 2400, to: 320, q: 0.9 });
    tone({ freq: 380, to: 140, dur: 0.22, gain: 0.07, type: "sine" });
  }
}

/** subtelny sygnał przy najechaniu na główną akcję */
export function sfxHover(): void {
  noise({ dur: 0.035, gain: 0.05, from: 2600, to: 4200, q: 2.6 });
}
