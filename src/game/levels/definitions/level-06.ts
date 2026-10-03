import type { LevelDefinition } from "../types";

/**
 * The ferry is the only hasted mechanism. The gate lamp runs at normal speed
 * and opens once. A normal crossing arrives after the lamp has gone dark.
 */
export const ride06 = {
  south: -1.35,
  north: 5.25,
  speed: 1.25,
  dwell: 2.2,
  size: [1.7, 0.18, 1.7] as [number, number, number],
  openAt: 0.85,
  closeAt: 5.4,
  doorZ: 6.35,
};

/** Seconds for the linked door to finish opening. Matches DoorView's authored speed. */
export const doorOpenSeconds = 1 / 1.35;

export const level06: LevelDefinition = {
  id: "level-06",
  number: 6,
  name: "Accelerate",
  description: "Speed up one mechanism and leave another alone.",
  objective: "Board the ferry, hold C to haste it, and cross while the lamp is lit.",
  hints: [
    "C speeds only the ferry. The lamp, the gate, and you stay at normal speed.",
    "Step onto the ferry first. Hold C while it crosses. Let go and it crawls.",
    "The lamp lights once. If it goes dark before you arrive, hold Q and ride again.",
  ],
  spawn: [0, 0.86, -4.8],
  spawnYaw: Math.PI,
  rewindPlayer: true,
  requiredAbilities: ["rewind", "fast-forward"],
  requiredEntities: ["player", "ferry-01", "timer-01", "door-01"],
  playable: true,
  nextLevelId: "level-07",
  entities: [
    {
      id: "ferry-01",
      type: "shuttle",
      position: [0, -0.09, ride06.south],
      size: ride06.size,
      south: ride06.south,
      north: ride06.north,
      speed: ride06.speed,
      dwell: ride06.dwell,
      fast: true,
    },
    {
      id: "timer-01",
      type: "timed-signal",
      position: [0, 2.62, ride06.doorZ - 0.55],
      openAt: ride06.openAt,
      closeAt: ride06.closeAt,
    },
    {
      id: "door-01",
      type: "door",
      position: [0, 0, ride06.doorZ],
      linkedTo: ["timer-01"],
    },
    {
      id: "exit-01",
      type: "exit-zone",
      position: [0, 1.1, 7.45],
      halfExtents: [1.2, 1.3, 0.55],
    },
  ],
};
