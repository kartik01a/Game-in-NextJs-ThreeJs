import { describe, expect, it } from "vitest";
import { EventBus } from "./EventBus";

describe("EventBus", () => {
  it("delivers a payload and stops after unsubscribe", () => {
    const bus = new EventBus();
    const seen: number[] = [];
    const off = bus.on("REWIND_ENDED", (payload) => seen.push(payload.time));
    bus.emit("REWIND_ENDED", { time: 3 });
    off();
    bus.emit("REWIND_ENDED", { time: 9 });
    expect(seen).toEqual([3]);
  });
});
