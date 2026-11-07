/**
 * Web Audio API Sound Synthesizer for TaskFlow Pro
 * Generates crisp, modern, pleasant chimes for task completions and celebrations
 * with zero external audio file dependencies.
 */

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Satisfying, uplifting task completion chime (ascending chord with soft harmonic decay).
 * Frequency progression: E5 (659.25Hz) -> G#5 (830.61Hz) -> B5 (987.77Hz) -> E6 (1318.51Hz)
 */
export const playTaskCompletionSound = (enabled = true) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [
      { freq: 659.25, time: 0.0, duration: 0.18, gain: 0.22 }, // E5
      { freq: 830.61, time: 0.07, duration: 0.22, gain: 0.25 }, // G#5
      { freq: 987.77, time: 0.14, duration: 0.35, gain: 0.28 }, // B5
      { freq: 1318.51, time: 0.21, duration: 0.55, gain: 0.32 }, // E6
    ];

    const now = ctx.currentTime;

    notes.forEach(({ freq, time, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Soft envelope (instant attack, exponential decay)
      gainNode.gain.setValueAtTime(0.0001, now + time);
      gainNode.gain.linearRampToValueAtTime(gain, now + time + 0.015);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn('Audio playback not supported or blocked:', err);
  }
};

/**
 * Celebratory fanfare chime for Level Ups & Achievement Unlocks
 */
export const playAchievementSound = (enabled = true) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const chords = [
      { freq: 523.25, time: 0.0, duration: 0.2 }, // C5
      { freq: 659.25, time: 0.1, duration: 0.2 }, // E5
      { freq: 783.99, time: 0.2, duration: 0.25 }, // G5
      { freq: 1046.50, time: 0.3, duration: 0.6 }, // C6
    ];

    const now = ctx.currentTime;

    chords.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle'; // warmer celebratory harmonic
      osc.frequency.setValueAtTime(freq, now + time);

      gainNode.gain.setValueAtTime(0.0001, now + time);
      gainNode.gain.linearRampToValueAtTime(0.3, now + time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
};
