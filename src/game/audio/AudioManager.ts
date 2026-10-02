"use client";

import type { SettingsData } from "@/game/save/SaveSchema";
import type { AudioSink, SoundId } from "./AudioSink";

interface Tone {
  frequency: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  slide?: number;
}

const tones: Record<SoundId, Tone> = {
  ui: { frequency: 520, duration: 0.08, type: "triangle", gain: 0.08 },
  jump: { frequency: 220, duration: 0.12, type: "square", gain: 0.05, slide: 360 },
  land: { frequency: 90, duration: 0.09, type: "sine", gain: 0.07 },
  step: { frequency: 140, duration: 0.04, type: "triangle", gain: 0.035 },
  switch: { frequency: 660, duration: 0.09, type: "square", gain: 0.06, slide: 880 },
  door: { frequency: 180, duration: 0.28, type: "sawtooth", gain: 0.04, slide: 90 },
  plate: { frequency: 240, duration: 0.1, type: "triangle", gain: 0.06 },
  "rewind-start": { frequency: 420, duration: 0.18, type: "sawtooth", gain: 0.05, slide: 180 },
  "rewind-stop": { frequency: 180, duration: 0.14, type: "triangle", gain: 0.06, slide: 440 },
  success: { frequency: 523, duration: 0.35, type: "triangle", gain: 0.07, slide: 784 },
};

/**
 * Procedural Web Audio bank. Gameplay calls sound ids; the tones can be
 * replaced later without touching simulation code.
 */
export class AudioManager implements AudioSink {
  private context: AudioContext | null = null;
  private rewindGain: GainNode | null = null;
  private rewindOsc: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private musicOscs: OscillatorNode[] = [];

  constructor(private readonly readSettings: () => SettingsData) {}

  resume(): void {
    const context = this.ensure();
    if (context?.state === "suspended") void context.resume();
  }

  play(id: SoundId): void {
    const context = this.ensure();
    if (!context) return;
    this.resume();
    const tone = tones[id];
    const volume = this.sfxVolume() * tone.gain;
    if (volume <= 0.001) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, context.currentTime);
    if (tone.slide) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(40, tone.slide),
        context.currentTime + tone.duration,
      );
    }
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + tone.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + tone.duration + 0.02);
  }

  setRewindActive(active: boolean): void {
    const context = this.ensure();
    if (!context) return;
    if (!active) {
      this.rewindGain?.gain.setTargetAtTime(0.0001, context.currentTime, 0.05);
      const osc = this.rewindOsc;
      const gain = this.rewindGain;
      window.setTimeout(() => {
        osc?.stop();
        osc?.disconnect();
        gain?.disconnect();
      }, 180);
      this.rewindOsc = null;
      this.rewindGain = null;
      return;
    }
    if (this.rewindOsc) return;
    this.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = 92;
    gain.gain.value = this.sfxVolume() * 0.03;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 480;
    filter.Q.value = 0.7;
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    this.rewindOsc = oscillator;
    this.rewindGain = gain;
  }

  startMusic(): void {
    const context = this.ensure();
    if (!context || this.musicOscs.length > 0) return;
    this.resume();
    const gain = context.createGain();
    gain.gain.value = this.musicVolume() * 0.045;
    gain.connect(context.destination);
    for (const frequency of [110, 164.8]) {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      this.musicOscs.push(oscillator);
    }
    this.musicGain = gain;
  }

  stopMusic(): void {
    for (const oscillator of this.musicOscs) {
      oscillator.stop();
      oscillator.disconnect();
    }
    this.musicOscs = [];
    this.musicGain?.disconnect();
    this.musicGain = null;
    this.setRewindActive(false);
  }

  private sfxVolume(): number {
    const settings = this.readSettings();
    return settings.masterVolume * settings.sfxVolume;
  }

  private musicVolume(): number {
    const settings = this.readSettings();
    return settings.masterVolume * settings.musicVolume;
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.context) {
      const Context = window.AudioContext;
      this.context = new Context();
    }
    return this.context;
  }
}
