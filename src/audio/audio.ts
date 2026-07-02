// Procedural audio: all SFX and the background music are synthesized with the
// Web Audio API, so the site ships zero audio assets and works offline.
// The AudioContext is created lazily on the first user gesture (autoplay policy).

export type SfxName = 'select' | 'place' | 'error' | 'erase' | 'note' | 'hint' | 'undo' | 'win' | 'click';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private sfxEnabled = true;
  private sfxVolume = 0.7;
  private musicEnabled = true;
  private musicVolume = 0.35;

  private musicTimer: number | null = null;
  private nextNoteTime = 0;
  private melodyStep = 0;

  /** Call from any user gesture; safe to call repeatedly. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.musicEnabled && this.musicTimer === null) this.startMusic();
  }

  configure(opts: { sfxEnabled: boolean; sfxVolume: number; musicEnabled: boolean; musicVolume: number }): void {
    this.sfxEnabled = opts.sfxEnabled;
    this.sfxVolume = opts.sfxVolume;
    this.musicEnabled = opts.musicEnabled;
    this.musicVolume = opts.musicVolume;
    this.applyVolumes();
    if (this.ctx) {
      if (this.musicEnabled && this.musicTimer === null) this.startMusic();
      if (!this.musicEnabled && this.musicTimer !== null) this.stopMusic();
    }
  }

  private applyVolumes(): void {
    if (!this.ctx) return;
    this.sfxGain!.gain.value = this.sfxEnabled ? this.sfxVolume : 0;
    this.musicGain!.gain.value = this.musicEnabled ? this.musicVolume : 0;
  }

  // ---------------------------------------------------------------- SFX ----

  play(name: SfxName): void {
    if (!this.ctx || !this.sfxEnabled) return;
    const t = this.ctx.currentTime;
    switch (name) {
      case 'select':
        this.blip(660, t, 0.04, 0.12, 'triangle');
        break;
      case 'click':
        this.blip(440, t, 0.05, 0.15, 'triangle');
        break;
      case 'place':
        this.blip(520, t, 0.07, 0.3, 'sine');
        this.blip(780, t + 0.05, 0.08, 0.22, 'sine');
        break;
      case 'note':
        this.blip(880, t, 0.04, 0.12, 'sine');
        break;
      case 'erase':
        this.sweep(500, 200, t, 0.12, 0.2, 'sawtooth');
        break;
      case 'undo':
        this.sweep(300, 500, t, 0.1, 0.15, 'triangle');
        break;
      case 'error':
        this.blip(180, t, 0.12, 0.3, 'square');
        this.blip(150, t + 0.1, 0.14, 0.25, 'square');
        break;
      case 'hint':
        [880, 1108, 1318, 1760].forEach((f, i) => this.blip(f, t + i * 0.07, 0.09, 0.18, 'sine'));
        break;
      case 'win':
        [523, 659, 784, 1046, 1318, 1568].forEach((f, i) =>
          this.blip(f, t + i * 0.11, 0.25, 0.25, 'triangle'),
        );
        break;
    }
  }

  private blip(freq: number, when: number, dur: number, vol: number, type: OscillatorType): void {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  private sweep(from: number, to: number, when: number, dur: number, vol: number, type: OscillatorType): void {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), when + dur);
    gain.gain.setValueAtTime(vol, when);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(gain).connect(this.sfxGain);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  // -------------------------------------------------------------- music ----

  // Gentle generative loop: a C-major pentatonic melody over a two-note bass,
  // scheduled with the classic lookahead pattern.
  private static SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
  private static BASS = [130.81, 98.0, 110.0, 98.0]; // C G A G
  private static STEP = 0.28; // seconds per melody step

  private startMusic(): void {
    if (!this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    const schedule = (): void => {
      if (!this.ctx) return;
      while (this.nextNoteTime < this.ctx.currentTime + 0.4) {
        this.scheduleMusicStep(this.nextNoteTime, this.melodyStep);
        this.nextNoteTime += AudioEngine.STEP;
        this.melodyStep++;
      }
    };
    schedule();
    this.musicTimer = window.setInterval(schedule, 120);
  }

  private stopMusic(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusicStep(when: number, step: number): void {
    if (!this.ctx || !this.musicGain) return;
    const scale = AudioEngine.SCALE;

    // Bass on every 4th step.
    if (step % 4 === 0) {
      const bass = AudioEngine.BASS[(step / 4) % AudioEngine.BASS.length];
      this.musicNote(bass, when, AudioEngine.STEP * 3.6, 0.16, 'sine');
    }

    // Melody: mostly stepwise random walk on the scale, with rests.
    if (Math.random() < 0.72) {
      const drift = Math.floor(Math.random() * 5) - 2;
      this.melodyIndex = Math.min(scale.length - 1, Math.max(0, this.melodyIndex + drift));
      this.musicNote(scale[this.melodyIndex], when, AudioEngine.STEP * 0.9, 0.09, 'triangle');
      // occasional sparkle an octave up
      if (Math.random() < 0.12) {
        this.musicNote(scale[this.melodyIndex] * 2, when + AudioEngine.STEP * 0.5, AudioEngine.STEP * 0.5, 0.04, 'sine');
      }
    }
  }

  private melodyIndex = 3;

  private musicNote(freq: number, when: number, dur: number, vol: number, type: OscillatorType): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol, when + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(gain).connect(this.musicGain);
    osc.start(when);
    osc.stop(when + dur + 0.1);
  }
}

export const audio = new AudioEngine();
