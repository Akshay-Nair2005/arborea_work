'use client';

/**
 * Procedural Web Audio spatial soundscape engine.
 * Generates organic wind through leaves, deep forest ambience, and subtle
 * wooden/harmonic resonance when approaching hanging branch cards.
 * Muted by default; user-controllable at any time.
 */
class SpatialAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private isEnabled = false;
  private lastChimeBranch = -1;

  public toggle(): boolean {
    if (!this.isEnabled) {
      this.enable();
    } else {
      this.disable();
    }
    return this.isEnabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public enable(): void {
    if (typeof window === 'undefined') return;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.001;
      this.masterGain.connect(this.ctx.destination);

      // 1. Organic pink-noise wind & leaf rustle generator
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.025;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.frequency.value = 320;
      this.windFilter.Q.value = 2.4;

      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0.18;

      noiseSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.masterGain);
      noiseSource.start();

      // 2. Subtle warm botanical drone (D2 + A2 + F#3)
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.value = 0.04;

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 260;

      const freqs = [73.42, 110.0, 185.0];
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.value = f;
        const oscGain = this.ctx.createGain();
        oscGain.gain.value = idx === 0 ? 0.5 : 0.2;
        osc.connect(oscGain);
        oscGain.connect(droneFilter);
        osc.start();
      });

      droneFilter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    this.masterGain?.gain.setTargetAtTime(0.35, now, 0.6);
    this.isEnabled = true;
  }

  public disable(): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(0.0001, now, 0.3);
    this.isEnabled = false;
  }

  public updateFromTimeline(
    scrollProgress: number,
    scrollVelocity: number,
    activeBranchIndex: number
  ): void {
    if (!this.isEnabled || !this.ctx || !this.windFilter || !this.windGain || !this.droneGain) {
      return;
    }

    const now = this.ctx.currentTime;
    const speed = Math.min(1, Math.abs(scrollVelocity) * 2.5);
    const targetFreq = 260 + scrollProgress * 280 + speed * 420;
    const targetWindGain = 0.14 + scrollProgress * 0.12 + speed * 0.22;

    this.windFilter.frequency.setTargetAtTime(targetFreq, now, 0.12);
    this.windGain.gain.setTargetAtTime(targetWindGain, now, 0.12);

    // Trigger a delicate harmonic resonance when entering a new branch story
    if (activeBranchIndex !== -1 && activeBranchIndex !== this.lastChimeBranch) {
      this.lastChimeBranch = activeBranchIndex;
      this.triggerBranchHarmonic(activeBranchIndex);
    } else if (activeBranchIndex === -1) {
      this.lastChimeBranch = -1;
    }
  }

  private triggerBranchHarmonic(branchIndex: number): void {
    if (!this.ctx || !this.masterGain || !this.isEnabled) return;
    const notes = [293.66, 329.63, 369.99, 440.0, 587.33]; // D4, E4, F#4, A4, D5
    const freq = notes[branchIndex % notes.length];

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.045, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 2.5);
  }
}

export const audioEngine = new SpatialAudioEngine();
