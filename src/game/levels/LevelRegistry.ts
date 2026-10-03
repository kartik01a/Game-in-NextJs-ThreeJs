import { level01 } from "./definitions/level-01";
import { level02 } from "./definitions/level-02";
import { level03 } from "./definitions/level-03";
import { level04 } from "./definitions/level-04";
import { level05 } from "./definitions/level-05";
import { level06 } from "./definitions/level-06";
import type { LevelDefinition } from "./types";

export const levelCatalog: readonly LevelDefinition[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
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
