/**
 * Application flow. Rewind is a time mode, not a second game state, so the
 * two machines cannot both claim to be authoritative.
 */
export type GameState =
  | "BOOT"
  | "MENU"
  | "LOADING_LEVEL"
  | "PLAYING"
  | "PAUSED"
  | "LEVEL_COMPLETE"
  | "LEVEL_FAILED";

export type AbilityId = "rewind" | "local-pause" | "fast-forward";
