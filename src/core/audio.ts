/**
 * Audio Engine
 * * A singleton wrapper around the Web Audio API to handle playing
 * accurate tones for timer notifications.
 */

// ============================================================================
// CONTEXT MANAGEMENT
// ============================================================================

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    // Standardize AudioContext across browsers (mainly for Safari support)
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// ============================================================================
// PLAYBACK LOGIC
// ============================================================================

export const playTone = (freq: number, volumePercent: number) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freq;

    // Safety Cap: Max gain of 0.25 to prevent ear damage
    const maxGain = 0.25;
    const effectiveGain = (Math.max(0, Math.min(100, volumePercent)) / 100) * maxGain;

    const now = ctx.currentTime;

    // Envelope: Instant attack, short exponential decay (0.15s)
    gain.gain.setValueAtTime(effectiveGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.warn("Audio playback failed", e);
  }
};