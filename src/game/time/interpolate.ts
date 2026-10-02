import { lerp, lerpVec3, slerpQuat } from "@/lib/math";
import { cloneEntityState, type CustomValue, type EntityState } from "./types";

function interpolateCustom(
  a: CustomValue,
  b: CustomValue,
  alpha: number,
): CustomValue {
  if (typeof a === "number" && typeof b === "number") return lerp(a, b, alpha);
  return alpha < 0.5 ? a : b;
}

export function interpolateEntity(a: EntityState, b: EntityState, alpha: number): EntityState {
  const custom: Record<string, CustomValue> = {};
  const keys = new Set([...Object.keys(a.custom), ...Object.keys(b.custom)]);
  for (const key of keys) {
    const av = a.custom[key];
    const bv = b.custom[key];
    if (av === undefined) custom[key] = bv as CustomValue;
    else if (bv === undefined) custom[key] = av;
    else custom[key] = interpolateCustom(av, bv, alpha);
  }

  return {
    position: lerpVec3(a.position, b.position, alpha),
    rotation: slerpQuat(a.rotation, b.rotation, alpha),
    linearVelocity: lerpVec3(a.linearVelocity, b.linearVelocity, alpha),
    angularVelocity: lerpVec3(a.angularVelocity, b.angularVelocity, alpha),
    custom,
  };
}

function inactiveCopy(state: EntityState): EntityState {
  const copy = cloneEntityState(state);
  copy.custom.active = false;
  return copy;
}

/**
 * Discrete presence flips at the midpoint. Continuous transforms blend.
 * An entity missing from one side is treated as inactive on that side so
 * rewind-before-spawn can hide it.
 */
export function interpolateEntityMap(
  older: Record<string, EntityState>,
  newer: Record<string, EntityState>,
  alpha: number,
): Record<string, EntityState> {
  const ids = new Set([...Object.keys(older), ...Object.keys(newer)]);
  const entities: Record<string, EntityState> = {};
  for (const id of ids) {
    const a = older[id];
    const b = newer[id];
    if (a && b) entities[id] = interpolateEntity(a, b, alpha);
    else if (b) entities[id] = alpha < 0.5 ? inactiveCopy(b) : cloneEntityState(b);
    else if (a) entities[id] = alpha < 0.5 ? cloneEntityState(a) : inactiveCopy(a);
  }
  return entities;
}
