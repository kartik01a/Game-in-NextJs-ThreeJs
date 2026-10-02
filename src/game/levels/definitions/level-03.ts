import type { LevelDefinition } from "../types";

/** Walkable deck. The chasm on either side is too wide to jump. */
export const bridge03 = {
  position: [0, -0.09, 1.8] as [number, number, number],
  size: [1.7, 0.18, 6.7] as [number, number, number],
  collapseAt: 0.55,
  drop: 2.8,
  /** A thin line in front of the spawn. The amber mark is well past it. */
  armZone: [-5.2, -4.85] as [number, number],
};

/**
 * Broken Bridge.
 * Crossing the approach band collapses the span before the player can finish it.
 * This chamber does not rewind the player, so waiting on the amber mark and
 * holding Q restores the span beneath the moment they armed it. They are then
 * past the band, so the restored span stays up and they can walk across.
 */
export const level03: LevelDefinition = {
  id: "level-03",
  number: 3,
  name: "Broken Bridge",
  description: "Break a path, then restore it by rewinding.",
  objective: "Let the span fall, restore it from the amber mark, then cross.",
  hints: [
    "Walking toward the span makes it collapse. You will not get across the first time.",
    "This chamber does not rewind you. Stand on the amber mark and hold Q until the span is whole.",
    "Release Q and walk across. It stays up. If it will not rebuild, press R, return to the mark, and rewind again.",
  ],
  spawn: [0, 0.86, -5.8],
  spawnYaw: Math.PI,
  rewindPlayer: false,
  requiredAbilities: ["rewind"],
  requiredEntities: ["player", "bridge-01"],
  playable: true,
  nextLevelId: "level-04",
  entities: [
    {
      id: "bridge-01",
      type: "breakable-bridge",
      position: bridge03.position,
      size: bridge03.size,
      collapseAt: bridge03.collapseAt,
      drop: bridge03.drop,
      armZone: bridge03.armZone,
    },
    {
      id: "exit-01",
      type: "exit-zone",
      position: [0, 1.1, 7.05],
      halfExtents: [1.5, 1.3, 0.9],
    },
  ],
};
