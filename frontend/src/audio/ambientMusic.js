// Global ambient music singleton (manual start only)                 

const PIANO_CHART = [
  { bass: 110.00, chord: [220.00, 261.63, 329.63] }, 
  { bass: 110.00, chord: [220.00, 261.63, 329.63] }, 
  { bass: 87.31,  chord: [174.61, 220.00, 261.63] }, 
  { bass: 87.31,  chord: [174.61, 220.00, 261.63] }, 
  { bass: 130.81, chord: [261.63, 329.63, 392.00] }, 
  { bass: 130.81, chord: [261.63, 329.63, 392.00] }, 
  { bass: 98.00,  chord: [196.00, 246.94, 293.66] }, 
  { bass: 98.00,  chord: [196.00, 246.94, 293.66] }, 
];

const PIANO_MELODY = [
  [659.25, 587.33, 523.25, 587.33],
  [659.25, 783.99, 659.25, 523.25],
  [587.33, 523.25, 440.00, 523.25],
  [587.33, 659.25, 587.33, 440.00],
  [783.99, 659.25, 523.25, 659.25],
  [783.99, 880.00, 783.99, 659.25],
  [659.25, 587.33, 493.88, 587.33],
  [659.25, 523.25, 440.00, 523.25],
];

const PIANO_BAR_SECONDS = 3.0;
const PIANO_LOOP_SECONDS = PIANO_BAR_SECONDS * PIANO_CHART.length; 

let state = {
  enabled: false, // music off by default — user must click the toggle
};

const listeners = new Set();

let ctx = null;
let masterNode = null;
let loopTimeoutId = null;
let cleanupScheduled = false;

function emit() {
  listeners.forEach((fn) => fn(state));
}

function setState(patch) {
  state = { ...state, ...patch };
  emit();
}

  // Audio graph                                                       

function playPianoNote(destination, startTime, freq, velocity = 0.07, duration = 1.8) {
  const now = startTime;

  const osc1 = ctx.createOscillator();
  osc1.type = "triangle";
  osc1.frequency.value = freq;

  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.value = freq * 2;

  const g1 = ctx.createGain();
  g1.gain.value = 1.0;
  const g2 = ctx.createGain();
  g2.gain.value = 0.25;

  osc1.connect(g1);
  osc2.connect(g2);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(velocity, now + 0.015);
  env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  g1.connect(env);
  g2.connect(env);
  env.connect(destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration + 0.05);
  osc2.stop(now + duration + 0.05);
}

function schedulePianoLoop(destination, startTime) {
  if (!ctx || ctx.state === "closed") return;

  PIANO_CHART.forEach((bar, barIndex) => {
    const barStart = startTime + barIndex * PIANO_BAR_SECONDS;

    playPianoNote(destination, barStart, bar.bass, 0.075, PIANO_BAR_SECONDS * 0.95);

    bar.chord.forEach((freq, i) => {
      const offset = 0.03 * i;
      playPianoNote(
        destination,
        barStart + offset,
        freq,
        0.045,
        PIANO_BAR_SECONDS * 0.9
      );
    });

    const beat = PIANO_BAR_SECONDS / 4;
    PIANO_MELODY[barIndex].forEach((freq, i) => {
      const t = barStart + i * beat;
      const jitter = (Math.random() - 0.5) * 0.03;
      playPianoNote(destination, t + jitter, freq, 0.06, beat * 1.05);
    });
  });

  loopTimeoutId = setTimeout(() => {
    if (ctx && ctx.state === "running") {
      schedulePianoLoop(destination, startTime + PIANO_LOOP_SECONDS);
    }
  }, (PIANO_LOOP_SECONDS - 0.5) * 1000);
}

function buildGraph() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;

  ctx = new AC();

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  const master = ctx.createGain();
  master.gain.value = 0.0001;
  compressor.connect(master);
  master.connect(ctx.destination);
  masterNode = master;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 2600;
  filter.Q.value = 0.3;
  filter.connect(compressor);

  const delay = ctx.createDelay(0.8);
  delay.delayTime.value = 0.32;
  const delayFeedback = ctx.createGain();
  delayFeedback.gain.value = 0.22;
  const delayWet = ctx.createGain();
  delayWet.gain.value = 0.22;
  delay.connect(delayFeedback);
  delayFeedback.connect(delay);
  delay.connect(delayWet);
  delayWet.connect(filter);

  const dry = ctx.createGain();
  dry.gain.value = 1.0;
  dry.connect(filter);

  const startTime = ctx.currentTime + 0.1;
  schedulePianoLoop(dry, startTime);

  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.linearRampToValueAtTime(0.35, now + 2.0);
}

function fadeOutAndClose() {
  if (!ctx || !masterNode || cleanupScheduled) return;
  cleanupScheduled = true;

  if (loopTimeoutId) {
    clearTimeout(loopTimeoutId);
    loopTimeoutId = null;
  }

  const localCtx = ctx;
  const localMaster = masterNode;

  const stopTime = localCtx.currentTime + 0.6;
  try { localMaster.gain.cancelScheduledValues(localCtx.currentTime); } catch { /* ignore */ }
  try {
    localMaster.gain.setValueAtTime(localMaster.gain.value, localCtx.currentTime);
    localMaster.gain.linearRampToValueAtTime(0.0001, stopTime);
  } catch { /* ignore */ }

  setTimeout(() => {
    try { localCtx.close(); } catch { /* ignore */ }
    if (ctx === localCtx) {
      ctx = null;
      masterNode = null;
      cleanupScheduled = false;
    }
  }, 800);
}

//  Public API                                                        

export function startMusic() {
  buildGraph();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => { /* ignore */ });
  }
}

export function stopMusic() {
  fadeOutAndClose();
}

export function toggleMusic() {
  if (state.enabled) {
    stopMusic();
    setState({ enabled: false });
  } else {
    startMusic();
    setState({ enabled: true });
  }
}

export function getSnapshot() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}