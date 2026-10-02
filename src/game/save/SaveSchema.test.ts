import { describe, expect, it } from "vitest";
import { parseSave } from "./SaveSchema";

describe("save schema", () => {
  it("returns a playable default when storage is empty", () => {
    const save = parseSave(null);
    expect(save.version).toBe(1);
    expect(save.unlockedLevels).toContain("level-01");
    expect(save.completedLevels).toEqual([]);
  });

  it("rejects corrupt payloads without throwing", () => {
    const save = parseSave("{not json");
    expect(save.unlockedLevels).toContain("level-01");
  });

  it("keeps valid progress and drops invalid fields", () => {
    const save = parseSave(
      JSON.stringify({
        version: 1,
        unlockedLevels: ["level-01", "level-02", 4],
        completedLevels: ["level-01"],
        bestTimes: { "level-01": 42, "level-02": -5, nope: "fast" },
        settings: { masterVolume: 2, quality: "ultra", reduceMotion: true },
      }),
    );
    expect(save.unlockedLevels).toEqual(["level-01", "level-02"]);
    expect(save.completedLevels).toEqual(["level-01"]);
    expect(save.bestTimes).toEqual({ "level-01": 42 });
    expect(save.settings.masterVolume).toBe(1);
    expect(save.settings.quality).toBe("high");
    expect(save.settings.reduceMotion).toBe(true);
  });

  it("migrates an unknown version by sanitizing instead of crashing", () => {
    const save = parseSave(JSON.stringify({ version: 99, unlockedLevels: ["level-03"] }));
    expect(save.version).toBe(1);
    expect(save.unlockedLevels).toContain("level-01");
    expect(save.unlockedLevels).toContain("level-03");
  });
});
