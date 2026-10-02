import { describe, expect, it } from "vitest";
import { beamBlocks, beamX, clearWindow, shutterY, shuttleZ } from "./motion";

describe("authored motion", () => {
  it("keeps the laser's safe window too short to walk, long enough to react", () => {
    const window = clearWindow(2.2, 1.7, 1.95);
    expect(window).toBeGreaterThan(0.4);
    expect(window).toBeLessThan(0.75);
    expect(beamBlocks(beamX(0, 2.2, 1.7), 1.95)).toBe(true);
  });

  it("holds a shutter up, then drops it after the release", () => {
    expect(shutterY(1.2, 1.7, 2.55, 0.85, 3.4)).toBeCloseTo(2.55);
    expect(shutterY(1.7, 1.7, 2.55, 0.85, 3.4)).toBeCloseTo(2.55);
    const mid = shutterY(1.7 + 0.85 / 3.4, 1.7, 2.55, 0.85, 3.4);
    expect(mid).toBeCloseTo((2.55 + 0.85) / 2);
    expect(shutterY(4, 1.7, 2.55, 0.85, 3.4)).toBeCloseTo(0.85);
  });

  it("parks the platform at each lip before it crosses", () => {
    expect(shuttleZ(0.2, -1.25, 5.15, 2.4, 1.4)).toBeCloseTo(-1.25);
    expect(shuttleZ(1.4, -1.25, 5.15, 2.4, 1.4)).toBeCloseTo(-1.25);
    const mid = shuttleZ(1.4 + 6.4 / 2.4 / 2, -1.25, 5.15, 2.4, 1.4);
    expect(mid).toBeGreaterThan(-1.25);
    expect(mid).toBeLessThan(5.15);
  });
});
