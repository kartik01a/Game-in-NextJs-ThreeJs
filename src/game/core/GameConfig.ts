/**
 * Tunable gameplay constants. Levels and systems read these instead of
 * scattering magic numbers through components.
 */
export const gameConfig = {
  title: "CHRONO",
  subtitle: "Break the rules of time.",
  snapshotRate: 20,
  rewindDuration: 12,
  maxSnapshots: 240,
  rewindEnergyMax: 100,
  rewindEnergyDrainPerSecond: 8,
  /** Seconds of recorded time played back per second of holding rewind. */
  rewindPlaybackRate: 1,
  /** How long a local pause holds tagged hazards. */
  localPauseDuration: 4.8,
  minDelta: 0,
  /** Tab suspension must not become a multi-second physics jump. */
  maxDelta: 0.05,
  interactionDistance: 2.6,
  interactionRaySlop: 0.8,
  pixelRatioCap: 1.75,
} as const;

export const playerConfig = {
  walkSpeed: 4.6,
  sprintMultiplier: 1.55,
  acceleration: 42,
  deceleration: 30,
  jumpHeight: 1.5,
  gravity: -22,
  capsuleRadius: 0.32,
  capsuleHalfHeight: 0.46,
  coyoteTime: 0.08,
  cameraDistance: 4.2,
  cameraPitch: 0.34,
  cameraPitchMin: 0.16,
  cameraPitchMax: 1.02,
  cameraSensitivity: 0.0022,
  cameraLag: 9,
  lookHeight: 1.15,
} as const;

export const jumpSpeed = Math.sqrt(
  2 * Math.abs(playerConfig.gravity) * playerConfig.jumpHeight,
);

export const theme = {
  background: "#07080c",
  floor: "#1c2636",
  wall: "#2a3548",
  wallTrim: "#242c3a",
  metal: "#9aa6b8",
  crate: "#2a3344",
  cyan: "#3ce0ff",
  cyanDeep: "#14788a",
  amber: "#ff9b3d",
  danger: "#ff4d6a",
  temporal: "#9b8cff",
  ink: "#e8eef6",
} as const;
