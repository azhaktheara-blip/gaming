/**
 * Realm Clash Audio Synthesizer
 * High-impact procedural sound engine for medieval tactical combat, artillery blasts, and coin chimes.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.volume = 0.5;

    try {
      const savedMute = localStorage.getItem('clash_muted');
      if (savedMute !== null) this.isMuted = JSON.parse(savedMute);
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
      localStorage.setItem('clash_muted', JSON.stringify(this.isMuted));
    } catch (e) {}
    return this.isMuted;
  }

  // High-pitched coin collection chime
  playClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(this.volume * 0.25, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.14);
    });
  }

  // Heavy placement thud
  playSwitch() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Troop step / deployment whoosh
  playStep() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Major Victory Trumpet Fanfare
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const fanfare = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6

    fanfare.forEach((freq, idx) => {
      const startTime = now + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      const dur = idx === fanfare.length - 1 ? 1.0 : 0.28;
      gain.gain.setValueAtTime(this.volume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur + 0.05);
    });
  }
}

export const soundManager = new SoundEngine();
