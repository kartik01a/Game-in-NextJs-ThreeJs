import type { RapierRigidBody } from "@react-three/rapier";
import type { Object3D } from "three";
import { IDENTITY_QUAT, type Quat, type Vec3 } from "@/game/time/types";

export interface BodyBridge {
  body: RapierRigidBody | null;
  object: Object3D | null;
}

export function createBridge(): BodyBridge {
  return { body: null, object: null };
}

export interface BodyPose {
  position: Vec3;
  rotation: Quat;
  linear: Vec3;
  angular: Vec3;
}

export function readBody(body: RapierRigidBody): BodyPose {
  const translation = body.translation();
  const rotation = body.rotation();
  const linear = body.linvel();
  const angular = body.angvel();
  return {
    position: [translation.x, translation.y, translation.z],
    rotation: [rotation.x, rotation.y, rotation.z, rotation.w],
    linear: [linear.x, linear.y, linear.z],
    angular: [angular.x, angular.y, angular.z],
  };
}

export function writeBody(
  bridge: BodyBridge,
  position: Vec3,
  rotation: Quat,
  visual: boolean,
  kinematic: boolean,
): void {
  const body = bridge.body;
  if (!body) return;
  const translation = { x: position[0], y: position[1], z: position[2] };
  const quat = { x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3] };
  body.setTranslation(translation, true);
  body.setRotation(quat, true);
  if (kinematic) {
    body.setNextKinematicTranslation(translation);
    body.setNextKinematicRotation(quat);
  }
  if (visual && bridge.object) {
    bridge.object.position.set(translation.x, translation.y, translation.z);
    bridge.object.quaternion.set(quat.x, quat.y, quat.z, quat.w);
  }
}

export function zeroVelocity(body: RapierRigidBody): void {
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
}

export function spawnRotation(): Quat {
  return [IDENTITY_QUAT[0], IDENTITY_QUAT[1], IDENTITY_QUAT[2], IDENTITY_QUAT[3]];
}
