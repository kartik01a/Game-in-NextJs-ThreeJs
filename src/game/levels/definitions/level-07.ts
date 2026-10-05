import type { LevelDefinition } from "../types";

/**
 * Temporal Failure.
 * The amber switch is not rewound. The lamp, the beam, and the ferry are.
 * Arming the switch spends the lamp's only window, so the player rewinds,
 * freezes the beam aside, and hastes the ferry through the restored gate.
 */
export const fault07 = {
  spawnZ: -7.2,
  wallX: -1.7,
  wallSouth: -21,
  wallNorth: -6.2,
  switchAt: [-4.15, 0, -20.2] as [number, number, number],
  beamZ: -2.85,
  beam: [2.2, 2.5, 3.4] as [number, number, number],
  amplitude: 1.7,
  omega: 2.2,
  reach: 1.52,
  ferrySouth: 0.55,
  ferryNorth: 6.7,
  speed: 1.42,
  dwell: 3,
  ferrySize: [1.7, 0.18, 1.7] as [number, number, number],
  openAt: 0.45,
  closeAt: 5.75,
  doorZ: 7.85,
  exitZ: 8.85,
  lipSouth: -0.2,
  lipNorth: 6,
};

/** Seconds for the linked door to finish opening. Matches DoorView's authored speed. */
export const doorOpenSeconds = 1 / 1.35;

export const level07: LevelDefinition = {
  id: "level-07",
  number: 7,
  name: "Temporal Failure",
  description: "Order every ability against a failing chamber.",
  objective: "Arm the alcove switch, rewind, freeze the beam, then haste the ferry while the lamp is lit.",
  hints: [
    "The amber switch keeps its state when you rewind. The lamp, the beam, and the ferry do not.",
    "Press F while the beam has swung aside. Only the beam stops.",
    "Step onto the ferry before you hold C. Let go at the far dock and walk through before the lamp dies.",
  ],
  spawn: [0, 0.86, fault07.spawnZ],
  spawnYaw: Math.PI,
  rewindPlayer: true,
  requiredAbilities: ["rewind", "local-pause", "fast-forward"],
  requiredEntities: ["player", "switch-01", "laser-01", "ferry-01", "timer-01", "door-01"],
  playable: true,
  nextLevelId: "level-08",
  entities: [
    {
      id: "switch-01",
      type: "switch",
      position: fault07.switchAt,
      rewindable: false,
    },
    {
      id: "laser-01",
      type: "laser-gate",
      position: [0, 1.25, fault07.beamZ],
      size: fault07.beam,
      amplitude: fault07.amplitude,
      omega: fault07.omega,
      reach: fault07.reach,
    },
    {
      id: "ferry-01",
      type: "shuttle",
      position: [0, -0.09, fault07.ferrySouth],
      size: fault07.ferrySize,
      south: fault07.ferrySouth,
      north: fault07.ferryNorth,
      speed: fault07.speed,
      dwell: fault07.dwell,
      fast: true,
    },
    {
      id: "timer-01",
      type: "timed-signal",
      position: [0, 2.62, fault07.doorZ - 0.55],
      openAt: fault07.openAt,
      closeAt: fault07.closeAt,
    },
    {
      id: "door-01",
      type: "door",
      position: [0, 0, fault07.doorZ],
      linkedTo: ["switch-01", "timer-01"],
    },
    {
      id: "exit-01",
      type: "exit-zone",
      position: [0, 1.1, fault07.exitZ],
      halfExtents: [1.2, 1.3, 0.55],
    },
  ],
};
