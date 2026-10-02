import type { EntityState } from "@/game/time/types";

export interface SimEntity {
  readonly id: string;
  readonly kind: string;
  rewindable: boolean;
  captureState(): EntityState;
  restoreState(state: EntityState, visual: boolean): void;
  reset(): void;
  setActive(active: boolean): void;
  getPosition?(): [number, number, number];
  getInteractPosition?(): [number, number, number];
  interactPrompt?(): string | null;
  interact?(): void;
  signal?(): boolean;
  prePhysics?(dt: number): void;
  postPhysics?(dt: number): void;
  onRewindStart?(): void;
  onRewindEnd?(state: EntityState | undefined): void;
}

export interface DoorControl extends SimEntity {
  kind: "door";
  linkedTo: readonly string[];
  setOpenTarget(open: boolean): void;
}

export function isDoor(entity: SimEntity): entity is DoorControl {
  return entity.kind === "door";
}
