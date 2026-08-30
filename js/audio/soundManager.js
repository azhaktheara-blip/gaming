/**
 * SYNAPSE Audio Engine - Ultra High-Fidelity Procedural Web Audio Synth
 * Produces dynamic sci-fi soundscapes, synthwave chords, laser zaps, crystal clicks, and victory fanfares.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicMuted = false;
    this.sfxVolume = 0.5;
    this.musicVolume = 0.25;

    // Music synth state
    this.musicInterval = null;
    this.musicStep = 0;
    this.scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C major pentatonic / cyber scale

    try {
      const savedMute = localStorage.getItem('synapse_muted');
      if (savedMute !== null) this.isMuted = JSON.parse(savedMute);
      const savedMusic = localStorage.getItem('synapse_music_muted');
      if (savedMusic !== null) this.isMusicMuted = JSON.parse(savedMusic);
    } catch (e) {}
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('synapse_muted', JSON.stringify(this.isMuted));
    } catch (e) {}
    if (this.isMuted) {
      this.stopMusic();
    } else if (!this.isMusicMuted) {
      this.startMusic();
    }
    return this.isMuted;
  }

  toggleMusic() {
    this.isMusicMuted = !this.isMusicMuted;
    try {
      localStorage.setItem('synapse_music_muted', JSON.stringify(this.isMusicMuted));
    } catch (e) {}
    if (this.isMusicMuted) {
      this.stopMusic();
    } else if (!this.isMuted) {
      this.startMusic();
    }
    return !this.isMusicMuted;
  }

  // --- SOUND EFFECTS ---

  // High-tech snappy UI click
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.035);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Crystal piece rotation click (crystalline acoustic resonance)
  playRotate() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [1600, 2400].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.015);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + i * 0.015 + 0.06);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, now + i * 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.015 + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.015);
      osc.stop(now + i * 0.015 + 0.07);
    });
  }

  // Laser beam connection snap
  playLaserHit(noteIndex = 0) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major pentatonic
    const freq = notes[noteIndex % notes.length];

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Target Core Powered Chord (Bright harmonic pulse)
  playReceptorActive(color = 'cyan') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreq = color === 'magenta' ? 523.25 : color === 'yellow' ? 659.25 : 587.33;
    const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(this.sfxVolume * 0.2, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.42);
    });
  }

  // Time-Loop Paradox Rewind Effect (tape warp frequency descent)
  playRewind() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.55);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.55);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.56);
  }

  // Step movement in Chrono mode
  playStep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.05);

    gain.gain.setValueAtTime(this.sfxVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Pressure Plate Trigger
  playSwitch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.07);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Major Victory Shimmer Fanfare
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5 to G6

    arpeggio.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      const dur = idx === arpeggio.length - 1 ? 1.2 : 0.35;
      gain.gain.setValueAtTime(this.sfxVolume * 0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });
  }

  // --- PROCEDURAL SYNTHWAVE / AMBIENT MUSIC ENGINE ---
  startMusic() {
    if (this.isMuted || this.isMusicMuted || this.musicInterval) return;
    this.init();
    if (!this.ctx) return;

    // Generative Cyber Arpeggiator Loop
    const bassNotes = [130.81, 146.83, 164.81, 174.61]; // C3, D3, E3, F3
    const leadNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

    this.musicInterval = setInterval(() => {
      if (this.isMuted || this.isMusicMuted || !this.ctx) return;

      const now = this.ctx.currentTime;
      const step = this.musicStep % 16;
      this.musicStep++;

      // Bass drone on 1st and 9th beats
      if (step === 0 || step === 8) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFilter = this.ctx.createBiquadFilter();

        const bassFreq = bassNotes[Math.floor(this.musicStep / 16) % bassNotes.length];
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(350, now);

        bassGain.gain.setValueAtTime(this.musicVolume * 0.3, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 1.3);
      }

      // Arpeggio Lead pulse every 2 steps
      if (step % 2 === 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();

        const leadFreq = leadNotes[(this.musicStep * 3) % leadNotes.length];
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(this.musicVolume * 0.15, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);

        leadOsc.start(now);
        leadOsc.stop(now + 0.25);
      }
    }, 180); // ~133 BPM
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundEngine();
