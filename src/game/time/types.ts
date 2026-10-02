export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

/** Numbers lerp. Booleans and strings flip at the midpoint between snapshots. */
export type CustomValue = number | boolean | string;

export interface EntityState {
  position: Vec3;
  rotation: Quat;
  linearVelocity: Vec3;
  angularVelocity: Vec3;
  custom: Record<string, CustomValue>;
}

export interface WorldSnapshot {
  simulationTime: number;
  entities: Record<string, EntityState>;
}

export interface InterpolatedWorld {
  time: number;
  entities: Record<string, EntityState>;
  atOldest: boolean;
}

export const IDENTITY_QUAT: Quat = [0, 0, 0, 1];

export function makeEntityState(
  position: Vec3,
  custom: Record<string, CustomValue> = {},
  rotation: Quat = IDENTITY_QUAT,
  linearVelocity: Vec3 = [0, 0, 0],
  angularVelocity: Vec3 = [0, 0, 0],
): EntityState {
  return {
    position: [position[0], position[1], position[2]],
    rotation: [rotation[0], rotation[1], rotation[2], rotation[3]],
    linearVelocity: [linearVelocity[0], linearVelocity[1], linearVelocity[2]],
    angularVelocity: [angularVelocity[0], angularVelocity[1], angularVelocity[2]],
    custom: { active: true, ...custom },
  };
}

export function cloneEntityState(state: EntityState): EntityState {
  return {
    position: [state.position[0], state.position[1], state.position[2]],
    rotation: [state.rotation[0], state.rotation[1], state.rotation[2], state.rotation[3]],
    linearVelocity: [
      state.linearVelocity[0],
      state.linearVelocity[1],
      state.linearVelocity[2],
    ],
    angularVelocity: [
      state.angularVelocity[0],
      state.angularVelocity[1],
      state.angularVelocity[2],
    ],
    custom: { ...state.custom },
  };
}

export function cloneSnapshot(snapshot: WorldSnapshot): WorldSnapshot {
  const entities: Record<string, EntityState> = {};
  for (const [id, state] of Object.entries(snapshot.entities)) {
    entities[id] = cloneEntityState(state);
  }
  return { simulationTime: snapshot.simulationTime, entities };
}
