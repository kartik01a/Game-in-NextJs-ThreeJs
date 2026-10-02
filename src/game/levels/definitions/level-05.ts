import type { LevelDefinition } from "../types";

/** The west bay is a detour. The center path is the one that beats the shutter. */
export const fork05 = {
  spawnZ: -6.5,
  shutterZ: 1.05,
  doorZ: 2.55,
  releaseAt: 2.25,
  raised: 2.975,
  lowered: 1.075,
  speed: 3.4,
  switch: [-4.05, 0, -0.15] as [number, number, number],
};

/**
 * Two Timelines.
 * Arming the west switch opens the gate, but the trip back is longer than
 * the shutter's timer. The switch is not rewound. Holding Q returns the
 * player and the shutter, and the new branch is a sprint down the center.
 */
export const level05: LevelDefinition = {
  id: "level-05",
  number: 5,
  name: "Two Timelines",
  description: "Branch the timeline on purpose.",
  objective: "Arm the switch in the amber bay, rewind to the center path, then sprint through before the shutter drops.",
  hints: [
    "The switch in the amber bay opens the gate and stays armed. The shutter still falls on its own timer.",
    "Going to the switch and then to the gate takes too long. The shutter wins that route.",
    "Arm the switch, then hold Q until you are back near the start and the shutter is up. Sprint down the center.",
  ],
  spawn: [0, 0.86, fork05.spawnZ],
  spawnYaw: Math.PI,
  rewindPlayer: true,
  requiredAbilities: ["rewind"],
  requiredEntities: ["player", "switch-01", "shutter-01", "door-01"],
  playable: true,
  nextLevelId: "level-06",
  entities: [
    {
      id: "switch-01",
      type: "switch",
      position: fork05.switch,
      rewindable: false,
    },
    {
      id: "shutter-01",
      type: "timed-shutter",
      position: [0, fork05.lowered, fork05.shutterZ],
      size: [1.08, 2.15, 0.24],
      raised: fork05.raised,
      lowered: fork05.lowered,
      releaseAt: fork05.releaseAt,
      speed: fork05.speed,
    },
    {
      id: "door-01",
      type: "door",
      position: [0, 0, fork05.doorZ],
      linkedTo: ["switch-01"],
    },
    {
      id: "exit-01",
      type: "exit-zone",
      position: [0, 1.1, 4.15],
      halfExtents: [1.15, 1.3, 0.6],
    },
  ],
};
