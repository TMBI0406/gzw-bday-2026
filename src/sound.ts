/* Alle Klänge werden live im Browser erzeugt (Web Audio) – keine Audiodateien nötig.
   - Spieluhr-"Happy Birthday" als Hintergrundmusik (Melodie ist gemeinfrei)
   - Jubel (Applaus + Tröten), Plopp und Glitzern als Effekte */

const MUTE_KEY = "gazwan-muted";

let ctx: AudioContext | null = null;
let master: GainNode;
let musicBus: GainNode;
let fxBus: GainNode;
let reverb: ConvolverNode;
let musicTimer = 0;
let musicOn = false;
let muted = readMuted();
const listeners = new Set<(muted: boolean) => void>();

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function setup() {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(ctx.destination);

  // Kleiner Hall aus abklingendem Rauschen
  reverb = ctx.createConvolver();
  const len = Math.floor(ctx.sampleRate * 2.2);
  const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  reverb.buffer = impulse;
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  reverb.connect(wet).connect(master);

  musicBus = ctx.createGain();
  musicBus.gain.value = 0.22;
  musicBus.connect(master);
  musicBus.connect(reverb);

  fxBus = ctx.createGain();
  fxBus.gain.value = 0.55;
  fxBus.connect(master);
  fxBus.connect(reverb);
  return ctx;
}

/** Muss in einem Klick/Tipp aufgerufen werden (iOS gibt Audio nur nach einer Geste frei) */
export function unlockAudio() {
  const c = setup();
  if (!c) return;
  if (c.state !== "running") void c.resume();
  // Stiller Puffer: schaltet Audio auf älteren iPhones frei
  const src = c.createBufferSource();
  src.buffer = c.createBuffer(1, 1, 22050);
  src.connect(c.destination);
  src.start(0);
}

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    /* privater Modus – egal */
  }
  if (ctx) master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.05);
  listeners.forEach((fn) => fn(value));
}

export function onMutedChange(fn: (muted: boolean) => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}

/** Musik leiser drehen, z.B. während ein Video läuft */
export function duckMusic(duck: boolean) {
  if (!ctx) return;
  musicBus.gain.setTargetAtTime(duck ? 0 : 0.22, ctx.currentTime, 0.3);
}

// ---------- Hintergrundmusik ----------------------------------------------

const BEAT = 0.62;
const n = (name: string) => {
  const notes: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const octave = Number(name.slice(-1));
  return 440 * Math.pow(2, (notes[name[0]] + (octave - 4) * 12 - 9) / 12);
};

// [Note, Dauer in Schlägen]
const MELODY: [string, number][] = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
];
// Basstöne zu Beginn jeder Phrase: [Schlag, Note]
const BASS: [number, string][] = [
  [1, "C3"], [4, "G2"], [7, "G2"], [10, "C3"], [13, "C3"], [16, "F2"], [20, "C3"], [22, "G2"], [24, "C3"],
];

function musicBoxNote(freq: number, at: number, volume = 1, decay = 1.6) {
  const c = ctx!;
  const out = c.createGain();
  out.gain.setValueAtTime(0, at);
  out.gain.linearRampToValueAtTime(0.5 * volume, at + 0.005);
  out.gain.exponentialRampToValueAtTime(0.001, at + decay);
  out.connect(musicBus);
  // Grundton + leise Obertöne = Spieluhr-Klang
  for (const [mult, gain] of [
    [1, 1],
    [2, 0.25],
    [4.2, 0.08],
  ]) {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.frequency.value = freq * mult;
    g.gain.value = gain;
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
}

function scheduleSong(start: number) {
  let t = start;
  for (const [note, beats] of MELODY) {
    musicBoxNote(n(note), t);
    t += beats * BEAT;
  }
  for (const [beat, note] of BASS) musicBoxNote(n(note), start + beat * BEAT, 0.55, 2.4);
  return t; // Ende des Liedes
}

/** Startet die Spieluhr in Dauerschleife (mit Pause zwischen den Durchläufen) */
export function startMusic() {
  const c = setup();
  if (!c || musicOn) return;
  musicOn = true;
  const loop = (start: number) => {
    const end = scheduleSong(start);
    const next = end + 5;
    musicTimer = window.setTimeout(() => loop(next), (next - c.currentTime - 1) * 1000);
  };
  loop(c.currentTime + 0.6);
}

export function stopMusic() {
  musicOn = false;
  window.clearTimeout(musicTimer);
}

// ---------- Effekte -------------------------------------------------------

function noiseBuffer(seconds: number) {
  const c = ctx!;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

/** Applaus: hunderte kurze, gefilterte Rauschimpulse */
function applause(at: number, duration: number) {
  const c = ctx!;
  const noise = noiseBuffer(0.05);
  const claps = Math.floor(duration * 90);
  for (let i = 0; i < claps; i++) {
    const t = at + Math.random() * duration;
    // leiser werdend zum Ende hin
    const fade = 1 - Math.max(0, (t - at) / duration - 0.6) / 0.4;
    const src = c.createBufferSource();
    src.buffer = noise;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 900 + Math.random() * 1600;
    bp.Q.value = 1.2;
    const g = c.createGain();
    g.gain.setValueAtTime(0.5 * fade * (0.4 + Math.random() * 0.6), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    src.connect(bp).connect(g).connect(fxBus);
    src.start(t);
    src.stop(t + 0.05);
  }
}

/** Partytröte: schnarrender Sägezahn mit Tonhöhen-Schwung */
function partyHorn(at: number, base: number) {
  const c = ctx!;
  const g = c.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(0.16, at + 0.04);
  g.gain.setValueAtTime(0.16, at + 0.5);
  g.gain.exponentialRampToValueAtTime(0.001, at + 0.75);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2400;
  lp.connect(g).connect(fxBus);
  for (const detune of [0, 9]) {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(base, at);
    osc.frequency.linearRampToValueAtTime(base * 1.5, at + 0.12);
    osc.frequency.setValueAtTime(base * 1.5, at + 0.55);
    osc.frequency.linearRampToValueAtTime(base * 1.3, at + 0.75);
    // Flattern
    const lfo = c.createOscillator();
    const depth = c.createGain();
    lfo.frequency.value = 28;
    depth.gain.value = 10;
    lfo.connect(depth).connect(osc.frequency);
    osc.connect(lp);
    osc.start(at);
    osc.stop(at + 0.8);
    lfo.start(at);
    lfo.stop(at + 0.8);
  }
}

/** Jubel der Klasse */
export function playCheer() {
  const c = setup();
  if (!c) return;
  const t = c.currentTime + 0.05;
  applause(t, 3.2);
  partyHorn(t + 0.1, 330);
  partyHorn(t + 0.45, 392);
  partyHorn(t + 1.1, 349);
}

/** Plopp, z.B. beim Öffnen des Geschenks */
export function playPop() {
  const c = setup();
  if (!c) return;
  const t = c.currentTime + 0.02;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.frequency.setValueAtTime(420, t);
  osc.frequency.exponentialRampToValueAtTime(90, t + 0.15);
  g.gain.setValueAtTime(0.6, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  osc.connect(g).connect(fxBus);
  osc.start(t);
  osc.stop(t + 0.22);
  applause(t + 0.1, 0.01); // kurzes Knistern
}

/** Glitzer-Arpeggio */
export function playChime() {
  const c = setup();
  if (!c) return;
  const t = c.currentTime + 0.02;
  ["C6", "E6", "G6", "C7", "E7"].forEach((note, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "triangle";
    osc.frequency.value = n(note);
    const at = t + i * 0.07;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.12, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.9);
    osc.connect(g).connect(fxBus);
    osc.start(at);
    osc.stop(at + 1);
  });
}
