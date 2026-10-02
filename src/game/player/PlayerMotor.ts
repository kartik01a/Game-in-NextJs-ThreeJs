import { jumpSpeed, playerConfig } from "@/game/core/GameConfig";

export interface VerticalState {
  vy: number;
  coyote: number;
  grounded: boolean;
}

/**
 * Grounded motion sticks with a small downward bias so the character
 * controller keeps detecting the floor. Airborne motion integrates gravity.
 * Jump consumes coyote time so a late press at a ledge still leaves the ground.
 */
export function stepVertical(
  state: VerticalState,
  jump: boolean,
  dt: number,
): { vy: number; coyote: number; jumped: boolean } {
  let { vy, coyote } = state;
  if (state.grounded) coyote = playerConfig.coyoteTime;
  else coyote = Math.max(0, coyote - dt);

  let jumped = false;
  const canJump = state.grounded || coyote > 0;
  if (jump && canJump && vy <= jumpSpeed * 0.25) {
    vy = jumpSpeed;
    coyote = 0;
    jumped = true;
  } else if (state.grounded && vy <= 0) {
    vy = -2;
  } else {
    vy += playerConfig.gravity * dt;
    vy = Math.max(vy, -30);
  }

  return { vy, coyote, jumped };
}

export function accelerateSpeed(current: number, target: number, dt: number): number {
  const delta = target - current;
  if (Math.abs(delta) < 1e-4) return target;
  const rate = delta > 0 ? playerConfig.acceleration : playerConfig.deceleration;
  const step = Math.min(Math.abs(delta), rate * dt);
  return current + Math.sign(delta) * step;
}

export type PlayerAnim = "idle" | "walk" | "run" | "jump" | "fall";

export function animationFor(speed: number, grounded: boolean, vy: number): PlayerAnim {
  if (!grounded && vy > 1) return "jump";
  if (!grounded) return "fall";
  if (speed > playerConfig.walkSpeed + 0.8) return "run";
  if (speed > 0.35) return "walk";
  return "idle";
}
