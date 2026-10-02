export interface SettingsData {
  mouseSensitivity: number;
  invertY: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  quality: "low" | "medium" | "high";
  shadows: boolean;
  reduceMotion: boolean;
  reduceCameraShake: boolean;
  reduceTemporalDistortion: boolean;
}

export interface SaveData {
  version: number;
  unlockedLevels: string[];
  completedLevels: string[];
  bestTimes: Record<string, number>;
  settings: SettingsData;
}

export const SAVE_VERSION = 1;
export const SAVE_KEY = "chrono.save.v1";

export const defaultSettings = (): SettingsData => ({
  mouseSensitivity: 1,
  invertY: false,
  masterVolume: 0.8,
  musicVolume: 0.45,
  sfxVolume: 0.85,
  quality: "high",
  shadows: true,
  reduceMotion: false,
  reduceCameraShake: false,
  reduceTemporalDistortion: false,
});

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  unlockedLevels: ["level-01"],
  completedLevels: [],
  bestTimes: {},
  settings: defaultSettings(),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function bestTimes(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const times: Record<string, number> = {};
  for (const [key, time] of Object.entries(value)) {
    if (typeof time === "number" && Number.isFinite(time) && time >= 0) times[key] = time;
  }
  return times;
}

function clamp01(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

export function sanitizeSettings(value: unknown): SettingsData {
  const base = defaultSettings();
  if (!isRecord(value)) return base;
  const quality = value.quality;
  return {
    mouseSensitivity:
      typeof value.mouseSensitivity === "number" && value.mouseSensitivity > 0
        ? Math.min(3, value.mouseSensitivity)
        : base.mouseSensitivity,
    invertY: value.invertY === true,
    masterVolume: clamp01(value.masterVolume, base.masterVolume),
    musicVolume: clamp01(value.musicVolume, base.musicVolume),
    sfxVolume: clamp01(value.sfxVolume, base.sfxVolume),
    quality: quality === "low" || quality === "medium" || quality === "high" ? quality : base.quality,
    shadows: value.shadows !== false,
    reduceMotion: value.reduceMotion === true,
    reduceCameraShake: value.reduceCameraShake === true,
    reduceTemporalDistortion: value.reduceTemporalDistortion === true,
  };
}

export function sanitizeSave(value: unknown): SaveData {
  const base = defaultSave();
  if (!isRecord(value)) return base;
  const unlocked = new Set(["level-01", ...stringArray(value.unlockedLevels)]);
  return {
    version: SAVE_VERSION,
    unlockedLevels: [...unlocked],
    completedLevels: stringArray(value.completedLevels),
    bestTimes: bestTimes(value.bestTimes),
    settings: sanitizeSettings(value.settings),
  };
}

/** Corrupt, empty, or unknown versions fall back to a valid save. */
export function parseSave(raw: string | null): SaveData {
  if (!raw) return defaultSave();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return defaultSave();
    if (parsed.version !== SAVE_VERSION) return sanitizeSave(parsed);
    return sanitizeSave(parsed);
  } catch {
    return defaultSave();
  }
}
