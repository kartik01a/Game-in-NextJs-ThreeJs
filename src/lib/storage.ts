import { SAVE_KEY, defaultSave, parseSave, type SaveData } from "@/game/save/SaveSchema";

export function readSave(): SaveData {
  if (typeof window === "undefined") return parseSave(null);
  try {
    return parseSave(window.localStorage.getItem(SAVE_KEY));
  } catch {
    return parseSave(null);
  }
}

export function writeSave(data: SaveData): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be unavailable in private modes. Gameplay continues.
  }
}

const serverSave = defaultSave();
let cachedRaw: string | null | undefined;
let cachedSave = serverSave;

export function readSaveSnapshot(): SaveData {
  if (typeof window === "undefined") return serverSave;
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (raw === cachedRaw) return cachedSave;
  cachedRaw = raw;
  cachedSave = parseSave(raw);
  return cachedSave;
}

export function subscribeSave(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function completeLevel(levelId: string, elapsed: number, nextLevelId?: string): SaveData {
  const save = readSave();
  if (!save.completedLevels.includes(levelId)) save.completedLevels.push(levelId);
  const previous = save.bestTimes[levelId];
  if (previous === undefined || elapsed < previous) save.bestTimes[levelId] = elapsed;
  if (nextLevelId && !save.unlockedLevels.includes(nextLevelId)) {
    save.unlockedLevels.push(nextLevelId);
  }
  writeSave(save);
  cachedRaw = JSON.stringify(save);
  cachedSave = save;
  return save;
}
