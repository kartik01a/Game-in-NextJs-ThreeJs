import { level01 } from "./definitions/level-01";
import { level02 } from "./definitions/level-02";
import { level03 } from "./definitions/level-03";
import { level04 } from "./definitions/level-04";
import { level05 } from "./definitions/level-05";
import { level06 } from "./definitions/level-06";
import { level07 } from "./definitions/level-07";
import { level08 } from "./definitions/level-08";
import type { LevelDefinition } from "./types";

export const levelCatalog: readonly LevelDefinition[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
];

export function getLevel(id: string): LevelDefinition | undefined {
  return levelCatalog.find((level) => level.id === id);
}
