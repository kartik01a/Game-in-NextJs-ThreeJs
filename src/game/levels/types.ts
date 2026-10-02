import type { AbilityId } from "@/game/core/GameState";
import type { Vec3 } from "@/game/time/types";

export type EntityDefinition =
    | {
      id: string;
      type: "pushable-box";
      position: Vec3;
      size: number;
      appearance?: "crate" | "key";
    }
    | {
      id: string;
      type: "drop-shelf";
      position: Vec3;
      size: [number, number, number];
      /** Seconds after the level starts before the shelf slides away. */
      releaseAt: number;
      slide: number;
    }
  | {
      id: string;
      type: "switch";
      position: Vec3;
    }
  | {
      id: string;
      type: "pressure-plate";
      position: Vec3;
      size: [number, number];
    }
  | {
      id: string;
      type: "door";
      position: Vec3;
      linkedTo: string[];
    }
  | {
      id: string;
      type: "exit-zone";
      position: Vec3;
      halfExtents: Vec3;
    };

export interface LevelDefinition {
  id: string;
  number: number;
  name: string;
  description: string;
  objective: string;
  hints: readonly string[];
  spawn: Vec3;
  spawnYaw: number;
  rewindPlayer: boolean;
  requiredAbilities: readonly AbilityId[];
  requiredEntities: readonly string[];
  playable: boolean;
  nextLevelId?: string;
  entities: readonly EntityDefinition[];
}

export function findEntity<T extends EntityDefinition["type"]>(
  level: LevelDefinition,
  type: T,
): Extract<EntityDefinition, { type: T }> | undefined {
  return level.entities.find((entity) => entity.type === type) as
    | Extract<EntityDefinition, { type: T }>
    | undefined;
}
