// Synthesized pleasant Web Audio feedback for gamified learning
class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8; // 0 to 1

  private getContext(): AudioContext | null {
    if (this.isMuted || this.volume <= 0) return null;
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtxClass();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.36);
    });
  }

  playHintChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37]; // A4, C#5 soft chime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.12, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.45);
    });
  }

  playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playLevelUp() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6 fanfare

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.55);
    });
  }

  playFireIgnite() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Crackling warm fire whoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.35);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  }

  playSparkleShimmer() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const sparkleNotes = [1046.5, 1318.51, 1567.98, 2093.0]; // High gentle twinkle

    sparkleNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0.08, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.28);
    });
  }

  // Playful cartoon bouncy pop sound for buttons
  playBoingPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frequency sweeps up then down playfully
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Playful, bright "Tinh - Tong" two-tone chime for Ant Universe buttons
  playTinhTong() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tone 1: "Tinh" (bright crystal high chime G5 784Hz)
    const osc1 = ctx.createOscillator();
    const osc1Harmonic = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain1Harmonic = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);

    osc1Harmonic.type = 'triangle';
    osc1Harmonic.frequency.setValueAtTime(1567.98, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.24, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    gain1Harmonic.gain.setValueAtTime(0, now);
    gain1Harmonic.gain.linearRampToValueAtTime(0.08, now + 0.015);
    gain1Harmonic.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1Harmonic.connect(gain1Harmonic);
    gain1Harmonic.connect(ctx.destination);

    osc1.start(now);
    osc1Harmonic.start(now);
    osc1.stop(now + 0.36);
    osc1Harmonic.stop(now + 0.22);

    // Tone 2: "Tong" (cheerful resonant finish C6 1046.5Hz)
    const tongTime = now + 0.13;
    const osc2 = ctx.createOscillator();
    const osc2Harmonic = ctx.createOscillator();
    const gain2 = ctx.createGain();
    const gain2Harmonic = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, tongTime);

    osc2Harmonic.type = 'triangle';
    osc2Harmonic.frequency.setValueAtTime(2093.0, tongTime);

    gain2.gain.setValueAtTime(0, tongTime);
    gain2.gain.linearRampToValueAtTime(0.26, tongTime + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, tongTime + 0.45);

    gain2Harmonic.gain.setValueAtTime(0, tongTime);
    gain2Harmonic.gain.linearRampToValueAtTime(0.09, tongTime + 0.015);
    gain2Harmonic.gain.exponentialRampToValueAtTime(0.001, tongTime + 0.25);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2Harmonic.connect(gain2Harmonic);
    gain2Harmonic.connect(ctx.destination);

    osc2.start(tongTime);
    osc2Harmonic.start(tongTime);
    osc2.stop(tongTime + 0.46);
    osc2Harmonic.stop(tongTime + 0.26);
  }

  // Triumphant victory fanfare jingle for correct answers
  playFanfareJingle() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // C5, E5, G5, G5, C6 triumphant victory progression
    const melody = [
      { f: 523.25, d: 0.1, t: 0 },
      { f: 659.25, d: 0.1, t: 0.11 },
      { f: 783.99, d: 0.12, t: 0.22 },
      { f: 783.99, d: 0.08, t: 0.36 },
      { f: 1046.5, d: 0.38, t: 0.46 }, // Long triumphant high C6
    ];

    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0, now + note.t);
      gain.gain.linearRampToValueAtTime(0.22, now + note.t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.02);
    });
  }

  // Synthesized joyful crowd applause sound
  playApplauseSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    // Generate rhythmic claps using filtered white noise bursts
    const numClaps = 14;
    const now = ctx.currentTime;

    for (let i = 0; i < numClaps; i++) {
      const clapTime = now + (i * 0.08) + (Math.random() * 0.03);
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000 + Math.random() * 600;
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12 + Math.random() * 0.06, clapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.04);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(clapTime);
      noise.stop(clapTime + 0.05);
    }
  }

  // Grand combo celebration: Fanfare + Applause + Sparkles!
  playCelebrationBurst() {
    this.playFanfareJingle();
    setTimeout(() => {
      this.playApplauseSound();
      this.playSparkleShimmer();
    }, 180);
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setVolume(percent: number) {
    this.volume = Math.max(0, Math.min(1, percent / 100));
  }

  getVolume(): number {
    return Math.round(this.volume * 100);
  }

  playTestSound() {
    this.playSuccess();
  }

  playAmbientChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now); // 528Hz calming tone
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.25);
  }
}

export const audioService = new AudioService();
