import type { LevelDefinition } from "../types";

/** Shared geometry for the first chamber so the room and the puzzle agree. */
export const chamber01 = {
  minX: -6,
  maxX: 6,
  minZ: -6,
  maxZ: 8,
  wallHeight: 3.5,
  doorZ: 5.15,
  doorHalfGap: 1.05,
} as const;

/**
 * First Loop teaches rewind.
 * The gate is powered by a switch and held open by a crate on the plate.
 * Pushing the crate off closes the gate. Rewind restores the crate, the
 * switch, the plate, and the door, then discards the future where it rolled off.
 */
export const level01: LevelDefinition = {
  id: "level-01",
  number: 1,
  name: "First Loop",
  description: "Learn to manipulate the recent past.",
  objective: "Arm the gate, weigh the plate with the crate, then reach the exit.",
  hints: [
    "The wall switch powers the gate. Power alone does not open it.",
    "The gate stays open only while the plate is weighed down.",
    "If the setup falls apart, hold Q. The recorded past returns, and the old future is discarded.",
  ],
  spawn: [0, 0.86, -1.2],
  spawnYaw: Math.PI,
  rewindPlayer: true,
  requiredAbilities: ["rewind"],
  requiredEntities: ["player", "box-01", "switch-01", "plate-01", "door-01"],
  playable: true,
  nextLevelId: "level-02",
  entities: [
    {
      id: "box-01",
      type: "pushable-box",
      position: [2.15, 0.45, -0.55],
      size: 0.9,
    },
    {
      id: "switch-01",
      type: "switch",
      position: [-3.15, 0, -1.05],
    },
    {
      id: "plate-01",
      type: "pressure-plate",
      position: [2.15, 0, 2.05],
      size: [1.75, 1.75],
    },
    {
      id: "door-01",
      type: "door",
      position: [0, 0, chamber01.doorZ],
      linkedTo: ["switch-01", "plate-01"],
    },
    {
      id: "exit-01",
      type: "exit-zone",
      position: [0, 1.1, 6.65],
      halfExtents: [1.15, 1.3, 0.95],
    },
  ],
};
