import { describe, expect, it } from "vitest";
import { gameConfig, playerConfig } from "@/game/core/GameConfig";
import { clearWindow } from "../motion";
import { core08, doorOpenSeconds } from "./level-08";

describe("meridian core timing", () => {
  const sprint = playerConfig.walkSpeed * playerConfig.sprintMultiplier;
  const travel = (core08.ferryNorth - core08.ferrySouth) / core08.speed;
  const armZ = (core08.armZone[0] + core08.armZone[1]) / 2;
  const oneWay = Math.abs(core08.deckStandZ - armZ) / sprint;
  const killSouth = core08.beamZ - core08.beam[2] / 2 - playerConfig.capsuleRadius;
  const firstClear = Math.asin(core08.reach / core08.amplitude) / core08.omega;

  it("lets a sprint reach the conduit and not the trip back", () => {
    expect(Math.abs(core08.switchAt[2] - core08.deckStandZ)).toBeLessThan(gameConfig.interactionDistance);
    expect(oneWay).toBeLessThan(core08.collapseAt - 0.35);
    expect(oneWay * 2).toBeGreaterThan(core08.collapseAt + 0.1);
    expect(core08.armZone[1]).toBeLessThan(core08.spawnZ - 2);
  });

  it("cannot sprint through the beam during one clear gap", () => {
    const crossing = (core08.beam[2] + playerConfig.capsuleRadius * 2) / sprint;
    expect(clearWindow(core08.amplitude, core08.omega, core08.reach)).toBeLessThan(crossing);
  });

  it("boards after a rewind and misses the lamp without haste", () => {
    const board = firstClear + Math.abs(core08.ferrySouth - killSouth) / sprint;
    const slow = core08.dwell + travel;
    const hasted = core08.dwell + travel / gameConfig.fastForwardScale;
    expect(board).toBeLessThan(core08.dwell - 0.6);
    expect(slow).toBeGreaterThan(core08.closeAt);
    expect(hasted).toBeGreaterThan(core08.openAt + doorOpenSeconds);
    expect(hasted).toBeLessThan(core08.closeAt - 1);
  });

  it("still misses the lamp if the ferry is hasted for a full cycle", () => {
    const cycle = (travel + core08.dwell) * 2;
    const secondArrival = cycle / gameConfig.fastForwardScale + travel / gameConfig.fastForwardScale;
    expect(secondArrival).toBeGreaterThan(core08.closeAt);
  });

  it("keeps the core pit wider than a sprint jump", () => {
    expect(core08.lipNorth - core08.lipSouth).toBeGreaterThan(5.6);
    const bridgeSpan = core08.bridgeSize[2];
    expect(bridgeSpan).toBeGreaterThan(5.6);
  });
});