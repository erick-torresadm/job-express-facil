// Dopamine sound system — leve, sem dependências, Web Audio API
// Sons curtos sintetizados para feedback interativo

type SoundType = "click" | "hover" | "success" | "like" | "pop" | "swoosh" | "notify" | "error";

let ctx: AudioContext | null = null;
let muted = false;
let lastPlay = 0;

const STORAGE_KEY = "vagaja_sounds_muted";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.15, when = 0) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function slide(f1: number, f2: number, dur: number, type: OscillatorType = "sine", vol = 0.15) {
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(f1, t0);
  osc.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function isMuted() {
  return muted;
}

export function setMuted(v: boolean) {
  muted = v;
  if (typeof window !== "undefined") {
    try { localStorage.setItem(STORAGE_KEY, v ? "1" : "0"); } catch {}
  }
}

export function loadMuted() {
  if (typeof window === "undefined") return;
  try { muted = localStorage.getItem(STORAGE_KEY) === "1"; } catch {}
}

export function playSound(kind: SoundType) {
  if (muted) return;
  // throttle: no spam
  const now = Date.now();
  if (now - lastPlay < 30) return;
  lastPlay = now;

  switch (kind) {
    case "click":
      tone(660, 0.08, "triangle", 0.08);
      break;
    case "hover":
      tone(880, 0.04, "sine", 0.03);
      break;
    case "pop":
      slide(400, 900, 0.1, "sine", 0.1);
      break;
    case "success":
      tone(523.25, 0.1, "triangle", 0.12);
      tone(659.25, 0.1, "triangle", 0.12, 0.08);
      tone(783.99, 0.18, "triangle", 0.12, 0.16);
      break;
    case "like":
      slide(600, 1200, 0.15, "triangle", 0.12);
      tone(1500, 0.08, "sine", 0.06, 0.1);
      break;
    case "swoosh":
      slide(1200, 200, 0.2, "sawtooth", 0.05);
      break;
    case "notify":
      tone(880, 0.1, "sine", 0.1);
      tone(1320, 0.15, "sine", 0.1, 0.08);
      break;
    case "error":
      tone(220, 0.15, "square", 0.08);
      tone(180, 0.2, "square", 0.08, 0.1);
      break;
  }
}
