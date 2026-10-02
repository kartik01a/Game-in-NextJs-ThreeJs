export type SoundId =
  | "ui"
  | "jump"
  | "land"
  | "step"
  | "switch"
  | "door"
  | "plate"
  | "rewind-start"
  | "rewind-stop"
  | "success";

export interface AudioSink {
  play(id: SoundId): void;
  setRewindActive(active: boolean): void;
  startMusic(): void;
  stopMusic(): void;
  resume(): void;
}

export const noopAudio: AudioSink = {
  play() {},
  setRewindActive() {},
  startMusic() {},
  stopMusic() {},
  resume() {},
};
