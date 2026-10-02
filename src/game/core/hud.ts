import type { GameState } from "./GameState";
import type { TimeMode } from "@/game/time/TimeMode";

export interface CompletionStats {
  elapsed: number;
  rewindUsed: number;
}

export interface HudModel {
  gameState: GameState;
  timeMode: TimeMode;
  rewindEnergy: number;
  prompt: string | null;
  hint: string | null;
  objective: string;
  showObjective: boolean;
  levelId: string;
  levelName: string;
  levelNumber: number;
  completion: CompletionStats | null;
  debugOpen: boolean;
}

export interface DebugStats {
  fps: number;
  frameMs: number;
  snapshots: number;
  entities: number;
  time: number;
  mode: TimeMode;
  energy: number;
  colliders: boolean;
}
