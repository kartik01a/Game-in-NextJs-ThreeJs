import type { Quat, Vec3 } from "@/game/time/types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampDelta(dt: number, min = 0, max = 0.05): number {
  if (!Number.isFinite(dt)) return min;
  return clamp(dt, min, max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function slerpQuat(a: Quat, b: Quat, t: number): Quat {
  let bx = b[0];
  let by = b[1];
  let bz = b[2];
  let bw = b[3];
  let cos = a[0] * bx + a[1] * by + a[2] * bz + a[3] * bw;
  if (cos < 0) {
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
    cos = -cos;
  }

  if (cos > 0.9995) {
    const x = a[0] + t * (bx - a[0]);
    const y = a[1] + t * (by - a[1]);
    const z = a[2] + t * (bz - a[2]);
    const w = a[3] + t * (bw - a[3]);
    const length = Math.hypot(x, y, z, w) || 1;
    return [x / length, y / length, z / length, w / length];
  }

  const theta = Math.acos(clamp(cos, -1, 1));
  const sin = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / sin;
  const w2 = Math.sin(t * theta) / sin;
  return [a[0] * w1 + bx * w2, a[1] * w1 + by * w2, a[2] * w1 + bz * w2, a[3] * w1 + bw * w2];
}

/** yaw 0 faces -Z. Positive yaw turns toward +X. */
export function facingVector(yaw: number): { x: number; z: number } {
  return { x: Math.sin(yaw), z: -Math.cos(yaw) };
}

export function rightVector(yaw: number): { x: number; z: number } {
  return { x: Math.cos(yaw), z: Math.sin(yaw) };
}

export function wishVector(
  moveX: number,
  moveZ: number,
  yaw: number,
): { x: number; z: number } {
  const facing = facingVector(yaw);
  const right = rightVector(yaw);
  const x = right.x * moveX + facing.x * moveZ;
  const z = right.z * moveX + facing.z * moveZ;
  const length = Math.hypot(x, z);
  if (length < 1e-5) return { x: 0, z: 0 };
  return { x: x / length, z: z / length };
}

export function cameraOffset(
  yaw: number,
  pitch: number,
  distance: number,
): { x: number; y: number; z: number } {
  const horizontal = distance * Math.cos(pitch);
  const facing = facingVector(yaw);
  return {
    x: -facing.x * horizontal,
    y: distance * Math.sin(pitch),
    z: -facing.z * horizontal,
  };
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remain = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

export function isInsideAabb(
  point: Vec3,
  center: Vec3,
  halfExtents: Vec3,
): boolean {
  return (
    Math.abs(point[0] - center[0]) <= halfExtents[0] &&
    Math.abs(point[1] - center[1]) <= halfExtents[1] &&
    Math.abs(point[2] - center[2]) <= halfExtents[2]
  );
}
