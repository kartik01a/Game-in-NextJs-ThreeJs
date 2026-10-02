import type { EntityState, WorldSnapshot } from "@/game/time/types";
import type { SimEntity } from "./RewindableEntity";

export class EntityRegistry {
  private readonly entities = new Map<string, SimEntity>();

  register(entity: SimEntity): void {
    this.entities.set(entity.id, entity);
  }

  unregister(id: string): void {
    this.entities.delete(id);
  }

  get(id: string): SimEntity | undefined {
    return this.entities.get(id);
  }

  hasAll(ids: readonly string[]): boolean {
    return ids.every((id) => this.entities.has(id));
  }

  all(): SimEntity[] {
    return [...this.entities.values()];
  }

  get size(): number {
    return this.entities.size;
  }

  signal(id: string): boolean {
    return this.entities.get(id)?.signal?.() ?? false;
  }

  capture(simulationTime: number): WorldSnapshot {
    const entities: Record<string, EntityState> = {};
    for (const entity of this.entities.values()) {
      entities[entity.id] = entity.captureState();
    }
    return { simulationTime, entities };
  }

  restore(states: Record<string, EntityState>, visual: boolean): void {
    for (const entity of this.entities.values()) {
      if (!entity.rewindable) continue;
      const state = states[entity.id];
      if (!state || state.custom.active === false) {
        entity.setActive(false);
        continue;
      }
      entity.setActive(true);
      entity.restoreState(state, visual);
    }
  }

  resetAll(): void {
    for (const entity of this.entities.values()) entity.reset();
  }

  prePhysics(dt: number): void {
    for (const entity of this.entities.values()) entity.prePhysics?.(dt);
  }

  postPhysics(dt: number): void {
    for (const entity of this.entities.values()) entity.postPhysics?.(dt);
  }

  onRewindStart(): void {
    for (const entity of this.entities.values()) {
      if (entity.rewindable) entity.onRewindStart?.();
    }
  }

  onRewindEnd(states: Record<string, EntityState> | undefined): void {
    for (const entity of this.entities.values()) {
      if (!entity.rewindable) continue;
      entity.onRewindEnd?.(states?.[entity.id]);
    }
  }

  clear(): void {
    this.entities.clear();
  }
}
