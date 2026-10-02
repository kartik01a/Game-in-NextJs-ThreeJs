import { describe, expect, it } from "vitest";
import { clampDelta } from "@/lib/math";
import { wishVector, facingVector } from "@/lib/math";
import { accelerateSpeed, stepVertical } from "@/game/player/PlayerMotor";
import { playerConfig } from "@/game/core/GameConfig";
import {
  approach,
  doorPanelSpread,
  doorShouldOpen,
  pickInteractable,
  playerInZone,
} from "./logic";

describe("level logic", () => {
  it("opens a door only when every linked signal is on", () => {
    expect(doorShouldOpen([true, true])).toBe(true);
    expect(doorShouldOpen([true, false])).toBe(false);
    expect(doorShouldOpen([])).toBe(false);
  });

  it("moves a door panel between closed and open spreads", () => {
    expect(doorPanelSpread(0, 0.48, 1.42)).toBeCloseTo(0.48);
    expect(doorPanelSpread(1, 0.48, 1.42)).toBeCloseTo(1.42);
    expect(doorPanelSpread(0.5, 0.48, 1.42)).toBeCloseTo(0.95);
  });

  it("approaches a target without overshooting", () => {
    expect(approach(0, 1, 1.5, 0.2)).toBeCloseTo(0.3);
    expect(approach(0.9, 1, 1.5, 0.2)).toBeCloseTo(1);
  });

  it("detects the exit volume", () => {
    expect(playerInZone([0, 1, 6.6], [0, 1.1, 6.65], [1.15, 1.3, 0.95])).toBe(true);
    expect(playerInZone([0, 1, 2], [0, 1.1, 6.65], [1.15, 1.3, 0.95])).toBe(false);
  });

  it("picks the switch near the view ray and ignores distant ones", () => {
    const picked = pickInteractable(
      [0, 1, 0],
      [0, 2, -4],
      [0, -1, 4],
      [
        { id: "far", position: [0, 1, 8], prompt: "FAR", enabled: true },
        { id: "switch", position: [0.2, 1, 1.5], prompt: "ARM GATE", enabled: true },
      ],
      2.6,
      0.8,
    );
    expect(picked?.id).toBe("switch");
  });
});

describe("movement and time step", () => {
  it("clamps a suspended tab to the maximum simulation step", () => {
    expect(clampDelta(10)).toBeCloseTo(0.05);
    expect(clampDelta(-1)).toBe(0);
    expect(clampDelta(Number.NaN)).toBe(0);
  });

  it("maps camera-relative input into the facing direction", () => {
    expect(facingVector(0).z).toBeCloseTo(-1);
    expect(wishVector(0, 1, 0).z).toBeCloseTo(-1);
    expect(wishVector(1, 0, 0).x).toBeCloseTo(1);
    expect(wishVector(0, 1, Math.PI).z).toBeCloseTo(1);
    expect(wishVector(1, 0, Math.PI).x).toBeCloseTo(-1);
  });

  it("reaches walk speed quickly and stops without reversing", () => {
    let speed = 0;
    for (let i = 0; i < 8; i += 1) speed = accelerateSpeed(speed, playerConfig.walkSpeed, 1 / 60);
    expect(speed).toBeGreaterThan(3);
    for (let i = 0; i < 20; i += 1) speed = accelerateSpeed(speed, 0, 1 / 60);
    expect(speed).toBeCloseTo(0);
  });

  it("jumps from the ground and then falls", () => {
    const jumped = stepVertical({ vy: 0, coyote: 0, grounded: true }, true, 1 / 60);
    expect(jumped.jumped).toBe(true);
    expect(jumped.vy).toBeGreaterThan(5);
    const falling = stepVertical({ vy: jumped.vy, coyote: 0, grounded: false }, false, 0.2);
    expect(falling.vy).toBeLessThan(jumped.vy);
  });
});
