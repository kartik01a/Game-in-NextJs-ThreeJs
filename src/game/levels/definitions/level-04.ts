import type { LevelDefinition } from "../types";

/**
 * The beam sweeps across the platform's path. Its clear window is shorter
 * than the crossing, so the player freezes the beam while it is aside.
 */
export const laser04 = {
  gateZ: 1.95,
  amplitude: 2.2,
  omega: 1.7,
  /** Half the beam plus half the rider. Inside this, the beam sends you back. */
  reach: 1.95,
  beam: [2.1, 2.3, 0.42] as [number, number, number],
};

export const ferry04 = {
  south: -1.25,
  north: 5.15,
  speed: 2.4,
  dwell: 1.4,
  size: [1.7, 0.18, 1.7] as [number, number, number],
};

/**
 * Frozen Moment.
 * A ferry crosses the pit. A beam covers that path for most of its swing.
 * F freezes only the beam. The ferry keeps moving, so the player boards
 * during a clear moment and rides through before the freeze ends.
 */
export const level04: LevelDefinition = {
  id: "level-04",
  number: 4,
  name: "Frozen Moment",
  description: "Pause a hazard without freezing yourself.",
  objective: "Freeze the beam while it is aside, then ride the ferry to the gate.",
  hints: [
    "The beam only stops when you press F. You, and the ferry, keep moving.",
    "Wait on the amber mark until the beam swings out of the ferry's path, then press F and step aboard.",
    "Freezing the beam while it covers the path holds it there. Let it swing clear and try again.",
  ],
  spawn: [0, 0.86, -5.4],
  spawnYaw: Math.PI,
  rewindPlayer: true,
  requiredAbilities: ["rewind", "local-pause"],
  requiredEntities: ["player", "laser-01", "ferry-01", "plate-01", "door-01"],
  playable: true,
  nextLevelId: "level-05",
  entities: [
    {
      id: "laser-01",
      type: "laser-gate",
      position: [0, 1.2, laser04.gateZ],
      size: laser04.beam,
      amplitude: laser04.amplitude,
      omega: laser04.omega,
      reach: laser04.reach,
    },
    {
      id: "ferry-01",
      type: "shuttle",
      position: [0, -0.09, ferry04.south],
      size: ferry04.size,
      south: ferry04.south,
      north: ferry04.north,
      speed: ferry04.speed,
      dwell: ferry04.dwell,
    },
    {
      id: "plate-01",
      type: "pressure-plate",
      position: [0, 0, 6.25],
      size: [1.4, 1.4],
      detect: "player",
      latch: true,
    },
    {
      id: "door-01",
      type: "door",
      position: [0, 0, 6.95],
      linkedTo: ["plate-01"],
    },
    {
      id: "exit-01",
      type: "exit-zone",
      position: [0, 1.1, 7.85],
      halfExtents: [1.4, 1.3, 0.7],
    },
  ],
};
