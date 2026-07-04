// Space audio engine.
// SFX: real interface-bleep samples (BLEEOOP library, bundled at build time),
// decoded once into AudioBuffers, with random per-action variation.
// Music: generative ambient deep-space soundtrack synthesized live — the game
// still ships no music files and works fully offline.

export type SfxName = 'place' | 'error' | 'erase' | 'note' | 'hint' | 'undo' | 'win' | 'click';

// Vite inlines this glob into hashed asset URLs at build time.
const SFX_URLS = import.meta.glob('../assets/sfx/*.wav', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

function urlFor(stem: string): string | undefined {
  const key = Object.keys(SFX_URLS).find((k) => k.endsWith(`/${stem}.wav`));
  return key ? SFX_URLS[key] : undefined;
}

/** Sample pools per action; one is picked at random each play for variety. */
const SFX_VARIANTS: Record<SfxName, string[]> = {
  click: ['Click_01', 'Click_02', 'Click_03', 'Click_04'],
  place: ['Confirm_01', 'Confirm_02', 'Confirm_03', 'Confirm_04'],
  note: ['Data_Point_01', 'Data_Point_02', 'Data_Point_04'],
  erase: ['Data_Point_05'],
  undo: ['Bleep_06', 'Bleep_07'],
  error: ['Denied_01', 'Denied_02', 'Denied_03'],
  hint: ['Sequence_04', 'Sequence_07'],
  win: ['Complete_02'],
};

/** Per-action playback tweaks: pitch (rate) and gain trim. */
const SFX_TUNING: Partial<Record<SfxName, { rate?: number; gain?: number }>> = {
  erase: { rate: 0.8, gain: 0.9 }, // pitched-down data point reads as "vaporize"
  note: { gain: 0.7 },
  error: { gain: 0.9 },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private buffers = new Map<string, AudioBuffer>();
  private loading = false;

  private sfxEnabled = true;
  private sfxVolume = 0.7;
  private musicEnabled = true;
  private musicVolume = 0.35;

  private musicTimer: number | null = null;
  private nextNoteTime = 0;
  private musicStep = 0;

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
      void this.loadSamples();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.musicEnabled && this.musicTimer === null) this.startMusic();
  }

  private async loadSamples(): Promise<void> {
    if (this.loading || !this.ctx) return;
    this.loading = true;
    const stems = new Set(Object.values(SFX_VARIANTS).flat());
    await Promise.all(
      [...stems].map(async (stem) => {
        const url = urlFor(stem);
        if (!url) return;
        try {
          const res = await fetch(url);
          const data = await res.arrayBuffer();
          const buffer = await this.ctx!.decodeAudioData(data);
          this.buffers.set(stem, buffer);
        } catch {
          // sample stays silent; the game keeps working
        }
      }),
    );
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
    if (!this.ctx || !this.sfxGain || !this.sfxEnabled) return;
    const pool = SFX_VARIANTS[name];
    const stem = pool[Math.floor(Math.random() * pool.length)];
    const buffer = this.buffers.get(stem);
    if (!buffer) return; // still loading
    const tuning = SFX_TUNING[name] ?? {};

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    // Slight random detune keeps repeated actions from sounding robotic.
    src.playbackRate.value = (tuning.rate ?? 1) * (0.97 + Math.random() * 0.06);
    const gain = this.ctx.createGain();
    gain.gain.value = tuning.gain ?? 1;
    src.connect(gain).connect(this.sfxGain);
    src.start();

    if (name === 'win') this.playWinTail();
  }

  /** Extra flourish after the win sample: a rising synth arpeggio + pad. */
  private playWinTail(): void {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime + 0.45;
    [440, 554, 659, 880].forEach((f, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const when = t + i * 0.13;
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(0.16, when + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, when + 0.5);
      osc.connect(gain).connect(this.sfxGain!);
      osc.start(when);
      osc.stop(when + 0.6);
    });
  }

  // -------------------------------------------------------------- music ----
  // Ambient deep-space soundtrack: a slow bass drone, drifting pad chords,
  // and a sparse A-minor-pentatonic melody. Scheduled with lookahead.

  private static SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
  private static DRONES = [55.0, 41.2, 49.0, 41.2]; // A1 E1 G1 E1
  private static CHORDS: number[][] = [
    [220.0, 261.63, 329.63], // Am
    [174.61, 220.0, 261.63], // F
    [196.0, 246.94, 293.66], // G
    [164.81, 196.0, 246.94], // Em
  ];
  private static STEP = 0.55; // seconds per step; 8 steps per chord

  private startMusic(): void {
    if (!this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    const schedule = (): void => {
      if (!this.ctx) return;
      while (this.nextNoteTime < this.ctx.currentTime + 0.6) {
        this.scheduleMusicStep(this.nextNoteTime, this.musicStep);
        this.nextNoteTime += AudioEngine.STEP;
        this.musicStep++;
      }
    };
    schedule();
    this.musicTimer = window.setInterval(schedule, 180);
  }

  private stopMusic(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private melodyIndex = 3;

  private scheduleMusicStep(when: number, step: number): void {
    if (!this.ctx || !this.musicGain) return;
    const bar = Math.floor(step / 8);

    // New chord + drone every 8 steps (~4.4 s).
    if (step % 8 === 0) {
      const drone = AudioEngine.DRONES[bar % AudioEngine.DRONES.length];
      this.musicNote(drone, when, AudioEngine.STEP * 8, 0.14, 'sine');
      this.musicNote(drone * 2, when, AudioEngine.STEP * 8, 0.05, 'sine');
      this.pad(AudioEngine.CHORDS[bar % AudioEngine.CHORDS.length], when, AudioEngine.STEP * 8.2, 0.05);
    }

    // Sparse drifting melody.
    if (Math.random() < 0.4) {
      const scale = AudioEngine.SCALE;
      const drift = Math.floor(Math.random() * 5) - 2;
      this.melodyIndex = Math.min(scale.length - 1, Math.max(0, this.melodyIndex + drift));
      this.musicNote(scale[this.melodyIndex], when, AudioEngine.STEP * 1.8, 0.07, 'triangle');
      // occasional starlight sparkle two octaves up
      if (Math.random() < 0.15) {
        this.musicNote(scale[this.melodyIndex] * 4, when + AudioEngine.STEP * 0.5, AudioEngine.STEP, 0.02, 'sine');
      }
    }
  }

  /** Soft detuned chord pad through a lowpass. */
  private pad(freqs: number[], when: number, dur: number, vol: number): void {
    if (!this.ctx || !this.musicGain) return;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol, when + dur * 0.3);
    gain.gain.linearRampToValueAtTime(0, when + dur);
    filter.connect(gain).connect(this.musicGain);
    for (const f of freqs) {
      for (const detune of [-6, 6]) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(when);
        osc.stop(when + dur + 0.1);
      }
    }
  }

  private musicNote(freq: number, when: number, dur: number, vol: number, type: OscillatorType): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(vol, when + dur * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(gain).connect(this.musicGain);
    osc.start(when);
    osc.stop(when + dur + 0.1);
  }
}

export const audio = new AudioEngine();
