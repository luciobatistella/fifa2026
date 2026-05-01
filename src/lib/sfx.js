/**
 * SFX engine — Web Audio API.
 * Zero dependências, zero assets: tudo sintetizado em runtime.
 * Sons curtos, ricos em harmônicos, com envelope ADSR pequeno.
 */

let ctx = null;
let muted = (() => {
  try { return localStorage.getItem('sfx-muted') === '1'; } catch (_) { return false; }
})();
let masterGain = null;

function ensure() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
  } catch (_) { ctx = null; }
  return ctx;
}

function envelope(node, t0, attack, decay, sustain, release, peak = 1) {
  const g = node.gain;
  g.cancelScheduledValues(t0);
  g.setValueAtTime(0.0001, t0);
  g.exponentialRampToValueAtTime(peak, t0 + attack);
  g.exponentialRampToValueAtTime(Math.max(0.0001, peak * sustain), t0 + attack + decay);
  g.exponentialRampToValueAtTime(0.0001, t0 + attack + decay + release);
}

function tone({ freq = 440, type = 'sine', dur = 0.18, peak = 0.6, attack = 0.005, decay = 0.05, sustain = 0.5, release = 0.12, slideTo = null, detune = 0 }) {
  const c = ensure();
  if (!c || muted) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (detune) osc.detune.value = detune;
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  osc.connect(gain).connect(masterGain);
  envelope(gain, t0, attack, decay, sustain, release, peak);
  osc.start(t0);
  osc.stop(t0 + attack + decay + release + 0.05);
}

function noiseBurst({ dur = 0.12, peak = 0.4, freq = 1500, q = 2 }) {
  const c = ensure();
  if (!c || muted) return;
  const t0 = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = c.createBufferSource(); src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass'; filter.frequency.value = freq; filter.Q.value = q;
  const gain = c.createGain();
  src.connect(filter).connect(gain).connect(masterGain);
  envelope(gain, t0, 0.002, 0.01, 0.6, dur, peak);
  src.start(t0); src.stop(t0 + dur + 0.05);
}

/* ===================== Presets ===================== */
export const sfx = {
  /** Click leve para hover/seleção */
  tick: () => tone({ freq: 880, type: 'triangle', dur: 0.05, peak: 0.25, decay: 0.02, sustain: 0.1, release: 0.04 }),
  /** Adicionar figurinha (pop ascendente) */
  pop: () => {
    tone({ freq: 520, type: 'sine', slideTo: 880, dur: 0.12, peak: 0.45, attack: 0.003, decay: 0.03, sustain: 0.4, release: 0.1 });
    noiseBurst({ dur: 0.06, peak: 0.12, freq: 4000, q: 1.2 });
  },
  /** Remover figurinha (slide descendente) */
  blop: () => tone({ freq: 480, type: 'sine', slideTo: 220, dur: 0.16, peak: 0.35, decay: 0.04, sustain: 0.4, release: 0.12 }),
  /** Repetida (cling metálico curto) */
  cling: () => {
    tone({ freq: 1320, type: 'triangle', dur: 0.18, peak: 0.3, decay: 0.05, sustain: 0.3, release: 0.15 });
    tone({ freq: 1980, type: 'sine',     dur: 0.18, peak: 0.18, decay: 0.05, sustain: 0.3, release: 0.15, detune: 8 });
  },
  /** Abrir modal */
  swoosh: () => {
    noiseBurst({ dur: 0.18, peak: 0.18, freq: 800, q: 0.7 });
    tone({ freq: 220, slideTo: 660, type: 'sine', dur: 0.18, peak: 0.18, decay: 0.05, sustain: 0.3, release: 0.12 });
  },
  /** Fechar modal */
  close: () => tone({ freq: 660, slideTo: 220, type: 'sine', dur: 0.14, peak: 0.2, decay: 0.05, sustain: 0.3, release: 0.1 }),
  /** Ka-ching ao abrir pacote */
  pack: () => {
    [0, 0.06, 0.12, 0.18, 0.24, 0.30, 0.36].forEach((d, i) => {
      setTimeout(() => {
        tone({ freq: 660 + i * 60, type: 'triangle', dur: 0.12, peak: 0.35, decay: 0.04, sustain: 0.3, release: 0.1 });
      }, d * 1000);
    });
  },
  /** Seleção 100% — fanfarra triádica */
  fanfare: () => {
    const seq = [
      [523.25, 0.00], // C5
      [659.25, 0.10], // E5
      [783.99, 0.20], // G5
      [1046.5, 0.30], // C6
      [1318.5, 0.50], // E6 — sustain
    ];
    seq.forEach(([f, d]) => setTimeout(() => {
      tone({ freq: f, type: 'sawtooth', dur: 0.5, peak: 0.32, attack: 0.01, decay: 0.08, sustain: 0.5, release: 0.4 });
      tone({ freq: f * 2, type: 'triangle', dur: 0.5, peak: 0.18, attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.4, detune: -6 });
    }, d * 1000));
    setTimeout(() => noiseBurst({ dur: 0.6, peak: 0.18, freq: 6000, q: 0.5 }), 480);
  },
  /** Conquista pequena (figurinha nova rara) */
  ding: () => {
    tone({ freq: 988, type: 'triangle', dur: 0.4, peak: 0.4, decay: 0.08, sustain: 0.5, release: 0.32 });
    tone({ freq: 1976, type: 'sine',    dur: 0.4, peak: 0.22, decay: 0.08, sustain: 0.4, release: 0.32, detune: 4 });
  },
  /** Erro / inválido */
  err: () => tone({ freq: 200, slideTo: 120, type: 'sawtooth', dur: 0.2, peak: 0.3, decay: 0.06, sustain: 0.4, release: 0.15 }),
};

export const sfxState = {
  isMuted: () => muted,
  toggle: () => {
    muted = !muted;
    try { localStorage.setItem('sfx-muted', muted ? '1' : '0'); } catch (_) {}
    if (!muted) sfx.tick();
    return muted;
  },
  /** Chame uma vez após primeira interação para destravar autoplay-blocked AudioContext. */
  unlock: () => { const c = ensure(); if (c && c.state === 'suspended') c.resume(); },
};
