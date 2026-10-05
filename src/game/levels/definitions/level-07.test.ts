import { describe, expect, it } from "vitest";
import { gameConfig, playerConfig } from "@/game/core/GameConfig";
import { clearWindow } from "../motion";
import { doorOpenSeconds, fault07 } from "./level-07";

describe("temporal failure timing", () => {
  const sprint = playerConfig.walkSpeed * playerConfig.sprintMultiplier;
  const travel = (fault07.ferryNorth - fault07.ferrySouth) / fault07.speed;
  const killSouth = fault07.beamZ - fault07.beam[2] / 2 - playerConfig.capsuleRadius;
  const firstClear = Math.asin(fault07.reach / fault07.amplitude) / fault07.omega;
  const turnX = -3.3;
  const turnZ = fault07.wallNorth + 0.35;
  const alongAlcove = Math.hypot(turnX - fault07.switchAt[0], turnZ - fault07.switchAt[2]);
  const walkIn = Math.max(0, alongAlcove - gameConfig.interactionDistance);
  const outbound = Math.hypot(turnX, turnZ - fault07.spawnZ) + walkIn;
  const inbound = walkIn + Math.hypot(turnX, fault07.ferrySouth - turnZ);
  const switchTrip = (outbound + inbound) / sprint;

  it("cannot sprint through the beam during one clear gap", () => {
    const crossing = (fault07.beam[2] + playerConfig.capsuleRadius * 2) / sprint;
    expect(clearWindow(fault07.amplitude, fault07.omega, fault07.reach)).toBeLessThan(crossing);
  });

  it("boards the first ferry after a freeze, and misses it after arming the switch", () => {
    const board = firstClear + Math.abs(fault07.ferrySouth - killSouth) / sprint;
    expect(board).toBeLessThan(fault07.dwell - 0.6);
    expect(switchTrip).toBeGreaterThan(fault07.dwell + 1);
  });

  it("misses the lamp at normal speed and reaches it when only the crossing is hasted", () => {
    const slow = fault07.dwell + travel;
    const hasted = fault07.dwell + travel / gameConfig.fastForwardScale;
    expect(slow).toBeGreaterThan(fault07.closeAt);
    expect(hasted).toBeGreaterThan(fault07.openAt + doorOpenSeconds);
    expect(hasted).toBeLessThan(fault07.closeAt - 1);
  });

  it("still misses the lamp if the ferry is hasted for the whole first cycle", () => {
    const cycle = (travel + fault07.dwell) * 2;
    const secondArrival = cycle / gameConfig.fastForwardScale + travel / gameConfig.fastForwardScale;
    expect(secondArrival).toBeGreaterThan(fault07.closeAt);
  });

  it("keeps the pit wider than a sprint jump", () => {
    expect(fault07.lipNorth - fault07.lipSouth).toBeGreaterThan(5.6);
  });
});
