import { cloneSnapshot, type InterpolatedWorld, type WorldSnapshot } from "./types";
import { interpolateEntityMap } from "./interpolate";

/**
 * Fixed-capacity chronological buffer.
 * Recording past the capacity drops the oldest snapshot.
 * Branching deletes every snapshot newer than the restored time.
 */
export class SnapshotStore {
  private readonly slots: Array<WorldSnapshot | null>;
  private start = 0;
  private count = 0;

  constructor(private readonly capacity: number) {
    if (capacity < 2) throw new Error("Snapshot capacity must be at least 2");
    this.slots = Array.from({ length: capacity }, () => null);
  }

  get length(): number {
    return this.count;
  }

  clear(): void {
    this.slots.fill(null);
    this.start = 0;
    this.count = 0;
  }

  private physical(logical: number): number {
    return (this.start + logical) % this.capacity;
  }

  private at(logical: number): WorldSnapshot {
    const snapshot = this.slots[this.physical(logical)];
    if (!snapshot) throw new Error(`Missing snapshot at logical index ${logical}`);
    return snapshot;
  }

  times(): number[] {
    const values: number[] = [];
    for (let i = 0; i < this.count; i += 1) values.push(this.at(i).simulationTime);
    return values;
  }

  oldestTime(): number {
    return this.count === 0 ? 0 : this.at(0).simulationTime;
  }

  newestTime(): number {
    return this.count === 0 ? 0 : this.at(this.count - 1).simulationTime;
  }

  canMoveBefore(time: number): boolean {
    return this.count > 0 && time > this.oldestTime() + 1e-4;
  }

  record(snapshot: WorldSnapshot): void {
    const stored = cloneSnapshot(snapshot);
    if (this.count > 0) {
      const newest = this.at(this.count - 1).simulationTime;
      if (stored.simulationTime <= newest + 1e-4) {
        if (stored.simulationTime >= newest - 1e-4) {
          this.slots[this.physical(this.count - 1)] = stored;
        }
        return;
      }
    }

    if (this.count === this.capacity) {
      this.slots[this.start] = null;
      this.start = (this.start + 1) % this.capacity;
      this.count -= 1;
    }

    this.slots[this.physical(this.count)] = stored;
    this.count += 1;
  }

  /** Drops the future after a rewind so the next records form a new branch. */
  truncateAfter(time: number): void {
    while (this.count > 0 && this.at(this.count - 1).simulationTime > time + 1e-4) {
      this.slots[this.physical(this.count - 1)] = null;
      this.count -= 1;
    }
  }

  sample(time: number): InterpolatedWorld | null {
    if (this.count === 0) return null;
    const oldest = this.at(0);
    if (this.count === 1 || time <= oldest.simulationTime) {
      return { time: oldest.simulationTime, entities: oldest.entities, atOldest: true };
    }

    const newest = this.at(this.count - 1);
    if (time >= newest.simulationTime) {
      return { time: newest.simulationTime, entities: newest.entities, atOldest: false };
    }

    let hi = 1;
    while (hi < this.count - 1 && this.at(hi).simulationTime < time) hi += 1;
    const newer = this.at(hi);
    const older = this.at(hi - 1);
    const span = newer.simulationTime - older.simulationTime;
    const alpha = span <= 1e-6 ? 0 : (time - older.simulationTime) / span;
    return {
      time,
      entities: interpolateEntityMap(older.entities, newer.entities, alpha),
      atOldest: false,
    };
  }
}
