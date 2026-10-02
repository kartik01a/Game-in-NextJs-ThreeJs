import { describe, expect, it } from "vitest";
import { SnapshotStore } from "./SnapshotStore";
import { makeEntityState, type WorldSnapshot } from "./types";

function snap(time: number, x: number, activated = false): WorldSnapshot {
  return {
    simulationTime: time,
    entities: {
      box: makeEntityState([x, 0, 0]),
      door: makeEntityState([0, 0, 0], { progress: x, activated }),
    },
  };
}

describe("SnapshotStore", () => {
  it("drops the oldest snapshot when the ring is full", () => {
    const store = new SnapshotStore(4);
    for (let i = 0; i < 7; i += 1) store.record(snap(i, i));
    expect(store.length).toBe(4);
    expect(store.times()).toEqual([3, 4, 5, 6]);
    expect(store.oldestTime()).toBe(3);
    expect(store.newestTime()).toBe(6);
  });

  it("interpolates transforms and flips discrete state at the midpoint", () => {
    const store = new SnapshotStore(8);
    store.record(snap(0, 0, false));
    store.record(snap(1, 10, true));
    const early = store.sample(0.25);
    const late = store.sample(0.75);
    expect(early?.entities.box?.position[0]).toBeCloseTo(2.5);
    expect(early?.entities.door?.custom.activated).toBe(false);
    expect(late?.entities.box?.position[0]).toBeCloseTo(7.5);
    expect(late?.entities.door?.custom.activated).toBe(true);
    expect(early?.entities.door?.custom.progress).toBeCloseTo(2.5);
  });

  it("truncates the future and records a new branch", () => {
    const store = new SnapshotStore(8);
    for (let i = 0; i <= 4; i += 1) store.record(snap(i, i));
    store.truncateAfter(2);
    expect(store.times()).toEqual([0, 1, 2]);
    store.record(snap(2.5, 9));
    store.record(snap(3.5, 8));
    expect(store.times()).toEqual([0, 1, 2, 2.5, 3.5]);
    expect(store.sample(3.5)?.entities.box?.position[0]).toBeCloseTo(8);
  });

  it("truncates correctly after the ring has wrapped", () => {
    const store = new SnapshotStore(5);
    for (let i = 0; i < 8; i += 1) store.record(snap(i, i));
    expect(store.times()).toEqual([3, 4, 5, 6, 7]);
    store.truncateAfter(4.2);
    expect(store.times()).toEqual([3, 4]);
    store.record(snap(4.4, 20));
    expect(store.times()).toEqual([3, 4, 4.4]);
    expect(store.sample(4)?.entities.box?.position[0]).toBeCloseTo(4);
  });

  it("replaces a snapshot recorded at the same time", () => {
    const store = new SnapshotStore(4);
    store.record(snap(1, 1));
    store.record(snap(1, 4));
    expect(store.length).toBe(1);
    expect(store.sample(1)?.entities.box?.position[0]).toBeCloseTo(4);
  });

  it("reports the oldest sample when rewinding past the buffer", () => {
    const store = new SnapshotStore(4);
    store.record(snap(2, 2));
    store.record(snap(3, 3));
    const sample = store.sample(0);
    expect(sample?.atOldest).toBe(true);
    expect(sample?.entities.box?.position[0]).toBeCloseTo(2);
  });
});
