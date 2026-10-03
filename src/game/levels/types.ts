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
      type: "laser-gate";
      position: Vec3;
      size: [number, number, number];
      amplitude: number;
      omega: number;
      reach: number;
    }
    | {
      id: string;
      type: "shuttle";
      position: Vec3;
      size: [number, number, number];
      south: number;
      north: number;
      speed: number;
      dwell: number;
      /** When true, holding fast-forward multiplies this ferry's authored clock. */
      fast?: boolean;
    }
    | {
      id: string;
      type: "timed-signal";
      position: Vec3;
      openAt: number;
      closeAt: number;
    }
    | {
      id: string;
      type: "breakable-bridge";
      position: Vec3;
      size: [number, number, number];
      /** Seconds after the player crosses the arm zone before the span collapses. */
      collapseAt: number;
      drop: number;
      /** Player Z range that arms the collapse. The waiting mark sits past this zone. */
      armZone: [number, number];
    }
  | {
      id: string;
      type: "switch";
      position: Vec3;
      /** When false, rewinding the room leaves this switch where the player set it. */
      rewindable?: boolean;
    }
    | {
      id: string;
      type: "timed-shutter";
      position: Vec3;
      size: [number, number, number];
      raised: number;
      lowered: number;
      releaseAt: number;
      speed: number;
    }
  | {
      id: string;
      type: "pressure-plate";
      position: Vec3;
      size: [number, number];
      /** "body" uses physics pairs. "player" uses the capsule position, for kinematic riders. */
      detect?: "body" | "player";
      /** Stays pressed after the first detection until rewind or reset. */
      latch?: boolean;
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
