import { describe, expect, it } from "vitest";
import { EntityRegistry } from "@/game/entities/EntityRegistry";
import type { SimEntity } from "@/game/entities/RewindableEntity";
import { makeEntityState, type EntityState } from "./types";
import { TimeController } from "./TimeController";

class Slider implements SimEntity {
  readonly kind = "slider";
  rewindable = true;
  x = 0;
  active = true;

  constructor(readonly id: string) {}

  captureState(): EntityState {
    return makeEntityState([this.x, 0, 0], { active: this.active });
  }

  restoreState(state: EntityState): void {
    this.x = state.position[0];
    this.active = state.custom.active !== false;
  }

  reset(): void {
    this.x = 0;
    this.active = true;
  }

  setActive(active: boolean): void {
    this.active = active;
  }

  getPosition(): [number, number, number] {
    return [this.x, 0, 0];
  }
}

describe("TimeController", () => {
  it("spends energy only for time that actually rewinds", () => {
    const time = new TimeController({
      capacity: 32,
      maxEnergy: 100,
      drainPerSecond: 8,
      playbackRate: 1,
    });
    time.reset({ simulationTime: 0, entities: {} });
    time.record({ simulationTime: 2, entities: {} });
    time.beginRewind();
    time.rewind(0.5);
    expect(time.playbackTime).toBeCloseTo(1.5);
    expect(time.energy).toBeCloseTo(96);
    time.rewind(10);
    expect(time.playbackTime).toBeCloseTo(0);
    expect(time.energy).toBeCloseTo(100 - 16);
    const before = time.energy;
    time.rewind(1);
    expect(time.energy).toBeCloseTo(before);
  });

  it("restores entities and discards the old future after a branch", () => {
    const registry = new EntityRegistry();
    const box = new Slider("box");
    const door = new Slider("door");
    registry.register(box);
    registry.register(door);
    const time = new TimeController({ capacity: 16, drainPerSecond: 8, playbackRate: 1 });

    time.reset(registry.capture(0));
    box.x = 1;
    door.x = 0.25;
    time.record(registry.capture(1));
    box.x = 2;
    door.x = 0.5;
    time.record(registry.capture(2));
    box.x = 3;
    door.x = 1;
    time.record(registry.capture(3));

    time.beginRewind();
    time.rewind(1.5);
    const sample = time.sample();
    expect(sample).not.toBeNull();
    registry.restore(sample!.entities, true);
    expect(box.x).toBeCloseTo(1.5);
    expect(door.x).toBeCloseTo(0.375);

    const branchedAt = time.commitBranch();
    expect(branchedAt).toBeCloseTo(1.5);
    expect(time.store.times().some((value) => value > 1.5 + 1e-4)).toBe(false);

    box.x = 8;
    door.x = 0;
    time.record(registry.capture(1.7));
    expect(time.store.times()).not.toContain(3);
    expect(time.store.sample(1.7)?.entities.box?.position[0]).toBeCloseTo(8);
  });

  it("does not restore an entity that opts out of rewind", () => {
    const registry = new EntityRegistry();
    const player = new Slider("player");
    player.rewindable = false;
    registry.register(player);
    const time = new TimeController({ capacity: 8 });
    time.reset(registry.capture(0));
    player.x = 4;
    time.record(registry.capture(1));
    player.x = 9;
    time.beginRewind();
    time.rewind(1);
    registry.restore(time.sample()!.entities, true);
    expect(player.x).toBe(9);
  });
});
