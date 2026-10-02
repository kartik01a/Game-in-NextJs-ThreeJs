import type { LevelDefinition } from "../types";

/** Shaft the key falls through. The player starts beside it, not in it. */
export const shaft02 = {
  x: 0,
  z: -1.55,
  half: 0.62,
  floorY: -2.2,
} as const;

/**
 * The Falling Key.
 * A shelf lets an amber key drop into the shaft. The plate at the bottom
 * holds the exit open only while the key is down there. Standing in the
 * shaft knocks the key aside. Rewind puts the key back on the shelf so the
 * player can step into the marked bay and let it fall cleanly.
 */
export const level02: LevelDefinition = {
  id: "level-02",
  number: 2,
  name: "The Falling Key",
  description: "Let an object fall, then rewind and be somewhere else.",
  objective: "Let the key fall into the shaft, then reach the exit while it holds the gate.",
  hints: [
    "The key drops from the shelf into the shaft. The gate opens only while the key is down there.",
    "If you are standing in the shaft, you knock the key away and the gate stays shut.",
    "Hold Q to put the key back on the shelf, step into the amber bay, and let it fall again.",
  ],
  spawn: [0, 0.86, -3.15],
  spawnYaw: Math.PI,
  rewindPlayer: true,
  requiredAbilities: ["rewind"],
  requiredEntities: ["player", "key-01", "shelf-01", "plate-01", "door-01"],
  playable: true,
  nextLevelId: "level-03",
  entities: [
    {
      id: "shelf-01",
      type: "drop-shelf",
      position: [shaft02.x, 3.02, shaft02.z],
      size: [1.2, 0.14, 1.2],
      releaseAt: 2.2,
      slide: 1.85,
    },
    {
      id: "key-01",
      type: "pushable-box",
      appearance: "key",
      position: [shaft02.x, 3.31, shaft02.z],
      size: 0.4,
    },
    {
      id: "plate-01",
      type: "pressure-plate",
      position: [shaft02.x, -2.22, shaft02.z],
      size: [1.05, 1.05],
    },
    {
      id: "door-01",
      type: "door",
      position: [0, 0, 4.7],
      linkedTo: ["plate-01"],
    },
    {
      id: "exit-01",
      type: "exit-zone",
      position: [0, 1.1, 6.35],
      halfExtents: [1.2, 1.3, 0.85],
    },
  ],
};
