import type { Vec3 } from "@/game/time/types";
import { isInsideAabb } from "@/lib/math";

export function doorShouldOpen(signals: readonly boolean[]): boolean {
  return signals.length > 0 && signals.every(Boolean);
}

export function doorPanelSpread(progress: number, closed: number, open: number): number {
  const t = Math.min(1, Math.max(0, progress));
  return closed + (open - closed) * t;
}

export function approach(current: number, target: number, speed: number, dt: number): number {
  const delta = target - current;
  if (Math.abs(delta) <= 1e-4) return target;
  const step = Math.sign(delta) * Math.min(Math.abs(delta), speed * dt);
  return current + step;
}

export interface InteractCandidate {
  id: string;
  position: Vec3;
  prompt: string;
  enabled: boolean;
}

export function pickInteractable(
  playerPosition: Vec3,
  viewOrigin: Vec3,
  viewDirection: Vec3,
  candidates: readonly InteractCandidate[],
  maxDistance: number,
  raySlop: number,
): InteractCandidate | null {
  const length = Math.hypot(viewDirection[0], viewDirection[1], viewDirection[2]) || 1;
  const dx = viewDirection[0] / length;
  const dy = viewDirection[1] / length;
  const dz = viewDirection[2] / length;
  let best: InteractCandidate | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (!candidate.enabled) continue;
    const ox = candidate.position[0] - playerPosition[0];
    const oy = candidate.position[1] - playerPosition[1];
    const oz = candidate.position[2] - playerPosition[2];
    const playerDistance = Math.hypot(ox, oy, oz);
    if (playerDistance > maxDistance) continue;

    const vx = candidate.position[0] - viewOrigin[0];
    const vy = candidate.position[1] - viewOrigin[1];
    const vz = candidate.position[2] - viewOrigin[2];
    const along = vx * dx + vy * dy + vz * dz;
    if (along < 0.2) continue;
    const closestX = viewOrigin[0] + dx * along;
    const closestY = viewOrigin[1] + dy * along;
    const closestZ = viewOrigin[2] + dz * along;
    const rayDistance = Math.hypot(
      candidate.position[0] - closestX,
      candidate.position[1] - closestY,
      candidate.position[2] - closestZ,
    );
    if (rayDistance > raySlop) continue;
    const score = rayDistance + playerDistance * 0.05;
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

export function playerInZone(position: Vec3, center: Vec3, halfExtents: Vec3): boolean {
  return isInsideAabb(position, center, halfExtents);
}
