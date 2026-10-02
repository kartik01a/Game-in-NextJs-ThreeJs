import { level01 } from "./definitions/level-01";
import { level02 } from "./definitions/level-02";
import type { LevelDefinition } from "./types";

export const levelCatalog: readonly LevelDefinition[] = [
  level01,
  level02,
  lockedLevel(3, "level-03", "Broken Bridge", "Break a path, then restore it by rewinding."),
  lockedLevel(4, "level-04", "Frozen Moment", "Pause a hazard without freezing yourself."),
  lockedLevel(5, "level-05", "Two Timelines", "Branch the timeline on purpose."),
  lockedLevel(6, "level-06", "Accelerate", "Speed up one mechanism and leave another alone."),
  lockedLevel(7, "level-07", "Temporal Failure", "Order every ability against a failing chamber."),
  lockedLevel(8, "level-08", "The Meridian Core", "Stabilize the facility's temporal core."),
];

function lockedLevel(
  number: number,
  id: string,
  name: string,
  description: string,
): LevelDefinition {
  return {
    id,
    number,
    name,
    description,
    objective: "",
    hints: [],
    spawn: [0, 1, 0],
    spawnYaw: 0,
    rewindPlayer: true,
    requiredAbilities: ["rewind"],
    requiredEntities: [],
    playable: false,
    entities: [],
  };
}

export function getLevel(id: string): LevelDefinition | undefined {
  return levelCatalog.find((level) => level.id === id);
}
