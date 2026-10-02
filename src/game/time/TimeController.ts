import { gameConfig } from "@/game/core/GameConfig";
import type { TimeMode } from "./TimeMode";
import { SnapshotStore } from "./SnapshotStore";
import type { InterpolatedWorld, WorldSnapshot } from "./types";

export interface TimeControllerOptions {
  capacity?: number;
  maxEnergy?: number;
  drainPerSecond?: number;
  playbackRate?: number;
}

/**
 * Owns temporal mode, rewind energy, and the snapshot buffer.
 * It does not know about Rapier or React.
 */
export class TimeController {
  readonly store: SnapshotStore;
  mode: TimeMode = "NORMAL";
  energy: number;
  playbackTime = 0;

  private readonly maxEnergy: number;
  private readonly drainPerSecond: number;
  private readonly playbackRate: number;

  constructor(options: TimeControllerOptions = {}) {
    this.store = new SnapshotStore(options.capacity ?? gameConfig.maxSnapshots);
    this.maxEnergy = options.maxEnergy ?? gameConfig.rewindEnergyMax;
    this.drainPerSecond = options.drainPerSecond ?? gameConfig.rewindEnergyDrainPerSecond;
    this.playbackRate = options.playbackRate ?? gameConfig.rewindPlaybackRate;
    this.energy = this.maxEnergy;
  }

  reset(initial: WorldSnapshot): void {
    this.store.clear();
    this.mode = "NORMAL";
    this.energy = this.maxEnergy;
    this.playbackTime = initial.simulationTime;
    this.store.record(initial);
  }

  record(snapshot: WorldSnapshot): void {
    this.store.record(snapshot);
    this.playbackTime = snapshot.simulationTime;
  }

  canRewind(): boolean {
    return this.mode === "NORMAL" && this.energy > 0 && this.store.canMoveBefore(this.playbackTime);
  }

  atOldest(): boolean {
    return !this.store.canMoveBefore(this.playbackTime);
  }

  beginRewind(): void {
    this.mode = "REWINDING";
  }

  /**
   * Moves playback backward and spends energy only for time that actually rewinds.
   * Holding the key at the oldest snapshot does not drain the meter.
   */
  rewind(dt: number): InterpolatedWorld | null {
    const oldest = this.store.oldestTime();
    const target = Math.max(oldest, this.playbackTime - dt * this.playbackRate);
    const moved = this.playbackTime - target;
    if (moved > 1e-6) {
      this.energy = Math.max(0, this.energy - (moved / this.playbackRate) * this.drainPerSecond);
      this.playbackTime = target;
    }
    return this.store.sample(this.playbackTime);
  }

  sample(): InterpolatedWorld | null {
    return this.store.sample(this.playbackTime);
  }

  sampleAt(time: number): InterpolatedWorld | null {
    return this.store.sample(time);
  }

  /** Invalidates the future and returns the simulation time to continue from. */
  commitBranch(): number {
    this.store.truncateAfter(this.playbackTime);
    this.mode = "NORMAL";
    return this.playbackTime;
  }

  refill(): void {
    this.energy = this.maxEnergy;
  }
}
