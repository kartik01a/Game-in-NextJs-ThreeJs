import type { LevelDefinition } from "../types";

/**
 * The Meridian Core.
 * The west span collapses once the player steps onto it. They can arm the
 * conduit and not get back, so they rewind: the span rebuilds, the switch
 * stays armed, and the lamp is young again. Then they freeze the beam and
 * haste the ferry into the core.
 */
export const core08 = {
  spawnZ: -5.4,
  bridgeX: -3.2,
  bridgeZ: -11.55,
  bridgeSize: [9, 0.18, 14.5] as [number, number, number],
  collapseAt: 1.9,
  drop: 3.2,
  armZone: [-10.4, -9.8] as [number, number],
  switchAt: [-1.2, 0, -18.55] as [number, number, number],
  /** Standing Z on the raised span, still close enough to arm the conduit. */
  deckStandZ: -18.05,
  beamZ: -2.35,
  beam: [2.2, 2.5, 2.8] as [number, number, number],
  amplitude: 1.7,
  omega: 2.2,
  reach: 1.52,
  ferrySouth: 1.15,
  ferryNorth: 7.55,
  speed: 1.48,
  dwell: 2.35,
  ferrySize: [1.8, 0.18, 1.8] as [number, number, number],
  openAt: 0.4,
  closeAt: 5.35,
  doorZ: 8.9,
  exitZ: 10.4,
  lipSouth: 0.4,
  lipNorth: 6.75,
};

/** Seconds for the linked door to finish opening. Matches DoorView's authored speed. */
export const doorOpenSeconds = 1 / 1.35;

export const level08: LevelDefinition = {
  id: "level-08",
  number: 8,
  name: "The Meridian Core",
  description: "Stabilize the facility's temporal core.",
  objective: "Arm the west conduit, rewind the fallen span, freeze the beam, and haste the ferry into the core.",
  hints: [
    "Sprint the west span and arm the conduit. It falls before you can return. Hold Q. The span rebuilds and the switch stays on.",
    "Press F while the beam has swung aside. Only the beam stops.",
    "Board the ferry, then hold C. Let go at the core dock and walk in while the lamp is lit.",
  ],
  spawn: [0, 1.06, core08.spawnZ],
  spawnYaw: Math.PI,
  rewindPlayer: true,
  requiredAbilities: ["rewind", "local-pause", "fast-forward"],
  requiredEntities: ["player", "bridge-01", "switch-01", "laser-01", "ferry-01", "timer-01", "door-01"],
  playable: true,
  entities: [
    {
      id: "bridge-01",
      type: "breakable-bridge",
      position: [core08.bridgeX, 0.11, core08.bridgeZ],
      size: core08.bridgeSize,
      collapseAt: core08.collapseAt,
      drop: core08.drop,
      armZone: core08.armZone,
      carry: true,
    },
    {
      id: "switch-01",
      type: "switch",
      position: core08.switchAt,
      rewindable: false,
    },
    {
      id: "laser-01",
      type: "laser-gate",
      position: [0, 1.25, core08.beamZ],
      size: core08.beam,
      amplitude: core08.amplitude,
      omega: core08.omega,
      reach: core08.reach,
    },
    {
      id: "ferry-01",
      type: "shuttle",
      position: [0, -0.09, core08.ferrySouth],
      size: core08.ferrySize,
      south: core08.ferrySouth,
      north: core08.ferryNorth,
      speed: core08.speed,
      dwell: core08.dwell,
      fast: true,
    },
    {
      id: "timer-01",
      type: "timed-signal",
      position: [0, 2.7, core08.doorZ - 0.55],
      openAt: core08.openAt,
      closeAt: core08.closeAt,
    },
    {
      id: "door-01",
      type: "door",
      position: [0, 0, core08.doorZ],
      linkedTo: ["switch-01", "timer-01"],
    },
    {
      id: "exit-01",
      type: "exit-zone",
      position: [0, 1.1, core08.exitZ],
      halfExtents: [1.3, 1.4, 0.7],
    },
  ],
};
